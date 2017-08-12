import task = require('vsts-task-lib');
import path = require('path');
import request = require('request');
import requestPromise = require('request-promise');
import sleep = require('thread-sleep');
import xmlParser = require('xmljson');
import fs = require('fs');

task.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    // Get the required inputs
    let zapApiUrl: string = task.getInput('zapApiUrl', true);
    let zapApiKey: string = task.getInput('zapApiKey', true);
    let targetUrl: string = task.getInput('targetUrl', true);

    // Get the optional inputs
    let contextId: string = task.getInput('contextId');
    let recurse: boolean = task.getBoolInput('recurse');
    let inScopeOnly: boolean = task.getBoolInput('inScopeOnly');
    let scanPolicyName: string = task.getInput('scanPolicyName');
    let method: string = task.getInput('method');
    let postData: string = task.getInput('postData');

    let highAlertThreshold: number = parseInt(task.getInput('maxHighRiskAlerts'));
    let mediumAlertThreshold: number = parseInt(task.getInput('maxMediumRiskAlerts'));
    let lowAlertThreshold: number = parseInt(task.getInput('maxLowRiskAlerts'));

    let scanOptions: ZapActiveScanOptions = {
        zapapiformat: 'JSON',
        apikey: zapApiKey,
        formMethod: 'GET',        
        url: targetUrl,
        recurse: String(recurse),
        inScopeOnly: String(inScopeOnly),
        scanPolicyName: scanPolicyName,
        method: method,
        postData: postData,
        contextId: contextId
    };

    let requestOptions: request.UriOptions & requestPromise.RequestPromiseOptions = {
        uri: `http://${zapApiUrl}/JSON/ascan/action/scan/`,
        qs: scanOptions
    };

    task.debug('*** Initiate the Active Scan ***');
    task.debug(`Target URL: http://${zapApiUrl}/JSON/ascan/action/scan/`);
    task.debug(`Scan Options: ${JSON.stringify(scanOptions)}`);


    requestPromise(requestOptions)
        .then(async res => {
            let hasIssues: boolean = false;
            let actualHighAlerts: number = 0;
            let actualMediumAlerts: number = 0;
            let actualLowAlerts: number = 0;

            let result: ZapActiveScanResult = JSON.parse(res);
            console.log(`OWASP ZAP Active Scan Initiated. ID: ${result.scan}`);
            
            while (true) {
                sleep(8000);
                let scanStatus: number = await getActiveScanStatus(result.scan, zapApiKey, zapApiUrl);
                
                if(scanStatus >= 100) {
                    console.log(`Scan In Progress: ${scanStatus}%`);
                    console.log('Active scan complete...');
                    break;
                }
                console.log(`Scan In Progress: ${scanStatus}%`);
            }

            // Write the HTML report
            let htmlReport: string = await getActiveScanResults(zapApiKey, zapApiUrl, ReportType.HTML);
            fs.writeFile('./report.html', htmlReport, (err) => {
                if (err) {
                    task.warning('Failed to generate the HTML report');
                    hasIssues = true;
                }
            });

            // Get the XML Report
            let xmlReport: string = await getActiveScanResults(zapApiKey, zapApiUrl, ReportType.XML);
            xmlParser.to_json(xmlReport, (err: any, res: any) => {
                if (err) {
                    task.error('Could not parse the XML report');
                    task.error(`Error: ${err}`);
                    task.setResult(task.TaskResult.Failed, 'Could not parse the XML report');
                }               
                
                let reportJson: ScanReport = res;
                let alerts: Array<alertitem> = reportJson.OWASPZAPReport.site.alerts.alertitem;

                // Get the number of alert types                
                for(let idx in alerts) {
                    if (alerts[idx].riskcode == Constants.HighRisk) {
                        actualHighAlerts++; 
                    }

                    if (alerts[idx].riskcode == Constants.MediumRisk) {
                        actualMediumAlerts++;
                    }

                    if (alerts[idx].riskcode == Constants.LowRisk) {
                        actualLowAlerts++;
                    }
                }

                task.debug(`Scan Result: High Risk Alerts: ${actualHighAlerts}, Medium Risk Alerts: ${actualMediumAlerts}, Low Risk Alerts: ${actualLowAlerts}`);
                
                // Verify alerts with in the limit
                if (highAlertThreshold < actualHighAlerts) {
                    task.error(`High Alert Threshold Exceeded. Threshold: ${highAlertThreshold}, Actual: ${actualHighAlerts}`);
                    task.setResult(task.TaskResult.Failed, `High Alert Threshold Exceeded. Threshold: ${highAlertThreshold}, Actual: ${actualHighAlerts}`);
                }

                if (mediumAlertThreshold < actualMediumAlerts) {
                    task.error(`High Alert Threshold Exceeded. Threshold: ${mediumAlertThreshold}, Actual: ${actualMediumAlerts}`);
                    task.setResult(task.TaskResult.Failed, `High Alert Threshold Exceeded. Threshold: ${mediumAlertThreshold}, Actual: ${actualMediumAlerts}`);
                }

                if (lowAlertThreshold < actualLowAlerts) {
                    task.error(`High Alert Threshold Exceeded. Threshold: ${lowAlertThreshold}, Actual: ${actualLowAlerts}`);
                    task.setResult(task.TaskResult.Failed, `High Alert Threshold Exceeded. Threshold: ${lowAlertThreshold}, Actual: ${actualLowAlerts}`);
                }
            });

            task.setResult(hasIssues ? task.TaskResult.SucceededWithIssues : task.TaskResult.Succeeded, 'OWASP ZAP Active Scan Complete. Result is within the expected thresholds.');

        })
        .error(err => {
            task.warning('Failed to initiate the active scan.');
            task.setResult(task.TaskResult.Failed, `Failed to initiate the active scan. Error: ${err}`);
        });
   
}   

run();

function getActiveScanStatus(scanId: number, apiKey: string, zapApiUrl: string): Promise<number> {
    let statusOptions: ZapActiveScanStatusOptions = {
        zapapiformat: 'JSON',
        apikey: apiKey,
        formMethod: 'GET',
        scanId: scanId
    };

    let requestOptions: request.UriOptions & requestPromise.RequestPromiseOptions = {
        uri: `http://${zapApiUrl}/JSON/ascan/view/status/`,
        qs: statusOptions
    };

    task.debug('*** Get Active Scan Status ***');
    task.debug(`ZAP API Call: http://${zapApiUrl}/JSON/ascan/view/status/`);
    task.debug(`Request Options: ${JSON.stringify(statusOptions)}`);

    return new Promise<number>((resolve, reject) => {
        requestPromise(requestOptions)
            .then(res => {
                let result: ZapActiveScanStatus = JSON.parse(res);
                task.debug(`Scan Status Result: ${JSON.stringify(result)}`);
                
                resolve(result.status);
            })
            .error(err => {
                reject(-1);
            });
    });
}

function getActiveScanResults(apiKey: string, zapApiUrl: string, type: ReportType = ReportType.XML): Promise<string> {

    let reportType: string = 'xmlreport';

    if (type == ReportType.XML) { reportType = Constants.XmlReport; }
    if (type == ReportType.HTML) { reportType = Constants.HtmlReport; } 
    if (type == ReportType.MD) { reportType = Constants.MdReport; } 

    let reportOptions: ZapScanReportOptions = {
        apikey: apiKey,
        formMethod: 'GET'
    };

    let requestOptions: request.UriOptions & requestPromise.RequestPromiseOptions = {
        uri: `http://${zapApiUrl}/OTHER/core/other/${reportType}/`,
        qs: reportOptions
    };

    task.debug('*** Get Active Scan Results ***');
    task.debug(`ZAP API Call: http://${zapApiUrl}/OTHER/core/other/${reportType}/`);
    task.debug(`Request Options: ${JSON.stringify(requestOptions)}`);

    return new Promise<string>((resolve, reject) => {
        requestPromise(requestOptions)
            .then(res => {
                resolve(res);
            })
            .error(err => {
                reject("");
            });
    });
}

class Constants {
    // Report Type
    static HtmlReport: string = 'htmlreport';
    static XmlReport: string = 'xmlreport';
    static MdReport: string = 'mdreport';

    // Risk Code
    static HighRisk: string = '3';
    static MediumRisk: string = '2';
    static LowRisk: string = '1';
}

enum ReportType {
    XML,
    HTML,
    MD
}

// ZAP Request Interfaces
interface ZapScanOptionsBase {
    zapapiformat: string;
    formMethod: string;
    apikey: string;
}

interface ZapActiveScanOptions extends ZapScanOptionsBase {    
    url: string;
    recurse?: string;
    inScopeOnly?: string;
    scanPolicyName?: string;
    method?: string;
    postData?: string;
    contextId?: string;
}

interface ZapActiveScanStatusOptions extends ZapScanOptionsBase {
    scanId: number;
}

interface ZapScanReportOptions {
    formMethod: string;
    apikey: string;
}

interface ZapActiveScanResult {
    scan: number;
}

interface ZapActiveScanStatus {
    status: number;
}

// ZAP Report interfaces
interface ScanReport {
    OWASPZAPReport: OWASPZAPReport
}

interface OWASPZAPReport {
    site: site;
    $: { version: string, generated: string };
}

interface site {
    $: {
        name: string,
        host: string,
        port: string,
        ssl: string,
    };
    alerts: alerts;
}

interface alerts {
    alertitem: Array<alertitem>;
}

interface alertitem {
    pluginid: string;
    alert: string;
    name: string;
    riskcode: string;
    confidence: string;
    riskdesc: string;
    desc: string;
    instances: instances;
    count: string;
    solution: string;
    reference: string;
    cweid: string;
    wascid: string;
    sourceid: string;
    otherinfo: string;
}

interface instances {
    instance: Array<instance>
}

interface instance {
    uri: string;
    method: string;
    evidence: string;
    param: string;
}