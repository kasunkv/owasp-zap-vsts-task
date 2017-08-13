import * as fs from 'fs';
import * as path from 'path';
import * as Task from 'vsts-task-lib';
import * as Request from 'request';
import * as RequestPromise from 'request-promise';
import { sleep } from 'thread-sleep';
import * as XmlParser from 'xmljson';


Task.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    // Get the required inputs
    let zapApiUrl: string = Task.getInput('zapApiUrl', true);
    let zapApiKey: string = Task.getInput('zapApiKey', true);
    let targetUrl: string = Task.getInput('targetUrl', true);

    // Get the optional inputs
    let contextId: string = Task.getInput('contextId');
    let recurse: boolean = Task.getBoolInput('recurse');
    let inScopeOnly: boolean = Task.getBoolInput('inScopeOnly');
    let scanPolicyName: string = Task.getInput('scanPolicyName');
    let method: string = Task.getInput('method');
    let postData: string = Task.getInput('postData');
    
    // Verification options
    let enableVerifications: boolean = Task.getBoolInput('enableVerifications');    

    // Reporting options
    let reportType: string = Task.getInput('reportType');
    let destinationFolder: string = Task.getPathInput('reportFileDestination');
    let reportFileName: string = Task.getInput('reportFileName');



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

    let requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
        uri: `http://${zapApiUrl}/JSON/ascan/action/scan/`,
        qs: scanOptions
    };

    Task.debug('*** Initiate the Active Scan ***');
    Task.debug(`Target URL: http://${zapApiUrl}/JSON/ascan/action/scan/`);
    Task.debug(`Scan Options: ${JSON.stringify(scanOptions)}`);


    RequestPromise(requestOptions)
        .then(async (res: any) => {
            let hasIssues: boolean = false;
            let actualHighAlerts: number = 0;
            let actualMediumAlerts: number = 0;
            let actualLowAlerts: number = 0;

            let result: ZapActiveScanResult = JSON.parse(res);
            console.log(`OWASP ZAP Active Scan Initiated. ID: ${result.scan}`);
            
            while (true) {
                sleep(10000);
                let scanStatus: number = await getActiveScanStatus(result.scan, zapApiKey, zapApiUrl);
                
                if(scanStatus >= 100) {
                    console.log(`Scan In Progress: ${scanStatus}%`);
                    console.log('Active scan complete...');
                    break;
                }
                console.log(`Scan In Progress: ${scanStatus}%`);
            }

            // Generate the Scan Report
            hasIssues = !await generateReport(zapApiKey, zapApiUrl, reportType, destinationFolder, reportFileName);

            // Get the XML Report
            let xmlReport: string = await getActiveScanResults(zapApiKey, zapApiUrl, ReportType.XML);
            XmlParser.to_json(xmlReport, (err: any, res: any) => {
                if (err) {
                    Task.error('Could not parse the XML report');
                    Task.error(`Error: ${err}`);
                    Task.setResult(Task.TaskResult.Failed, 'Could not parse the XML report');
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

                Task.debug(`Scan Result: High Risk Alerts: ${actualHighAlerts}, Medium Risk Alerts: ${actualMediumAlerts}, Low Risk Alerts: ${actualLowAlerts}`);
                
                if(enableVerifications) {
                    // Gather the thresholds
                    let highAlertThreshold: number = parseInt(Task.getInput('maxHighRiskAlerts'));
                    let mediumAlertThreshold: number = parseInt(Task.getInput('maxMediumRiskAlerts'));
                    let lowAlertThreshold: number = parseInt(Task.getInput('maxLowRiskAlerts'));

                    // Verify alerts with in the limit
                    if (highAlertThreshold < actualHighAlerts) {
                        Task.setResult(Task.TaskResult.Failed, `High Risk Alert Threshold Exceeded. Threshold: ${highAlertThreshold}, Actual: ${actualHighAlerts}`);
                    }

                    if (mediumAlertThreshold < actualMediumAlerts) {
                        Task.setResult(Task.TaskResult.Failed, `Medium Risk Alert Threshold Exceeded. Threshold: ${mediumAlertThreshold}, Actual: ${actualMediumAlerts}`);
                    }

                    if (lowAlertThreshold < actualLowAlerts) {
                        Task.setResult(Task.TaskResult.Failed, `Low Alert Risk Threshold Exceeded. Threshold: ${lowAlertThreshold}, Actual: ${actualLowAlerts}`);
                    }
                }
                
            });

            Task.setResult(hasIssues ? Task.TaskResult.SucceededWithIssues : Task.TaskResult.Succeeded, 'OWASP ZAP Active Scan Complete. Result is within the expected thresholds.');
            console.log(`Active Scan Result: High Risk Alerts: ${actualHighAlerts}, Medium Risk Alerts: ${actualMediumAlerts}, Low Risk Alerts: ${actualLowAlerts}`)

        })
        .error((err: any) => {
            Task.warning('Failed to initiate the active scan.');
            Task.setResult(Task.TaskResult.Failed, `Failed to initiate the active scan. Error: ${err}`);
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

    let requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
        uri: `http://${zapApiUrl}/JSON/ascan/view/status/`,
        qs: statusOptions
    };

    Task.debug('*** Get Active Scan Status ***');
    Task.debug(`ZAP API Call: http://${zapApiUrl}/JSON/ascan/view/status/`);
    Task.debug(`Request Options: ${JSON.stringify(statusOptions)}`);

    return new Promise<number>((resolve, reject) => {
        RequestPromise(requestOptions)
            .then(res => {
                let result: ZapActiveScanStatus = JSON.parse(res);
                Task.debug(`Scan Status Result: ${JSON.stringify(result)}`);
                
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

    let requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
        uri: `http://${zapApiUrl}/OTHER/core/other/${reportType}/`,
        qs: reportOptions
    };

    Task.debug('*** Get Active Scan Results ***');
    Task.debug(`ZAP API Call: http://${zapApiUrl}/OTHER/core/other/${reportType}/`);
    Task.debug(`Request Options: ${JSON.stringify(requestOptions)}`);

    return new Promise<string>((resolve, reject) => {
        RequestPromise(requestOptions)
            .then(res => {
                resolve(res);
            })
            .error(err => {
                reject("");
            });
    });
}

async function generateReport(zapApiKey: string, zapApiUrl: string, reportType: string, destination: string, fileName: string): Promise<boolean> {
    let type: ReportType;
    let ext: string;

    fileName = fileName == '' ? 'OWASP-ZAP-Report' :  fileName;
    destination = destination == '' ? './' : destination;

    if (reportType == Constants.Xml) {
        type = ReportType.XML;
        ext = Constants.Xml;
    } else if (reportType == Constants.Markdown) {
        type = ReportType.MD;
        ext = Constants.Markdown;
    } else {
        type = ReportType.HTML;
        ext = Constants.Html;
    }
    
    let fullFilePath: string = path.normalize(`${destination}/${fileName}.${ext}`);
    Task.debug(`Report Filename: ${fullFilePath}`);

    let scanReport: string = await getActiveScanResults(zapApiKey, zapApiUrl, type);
    
    return new Promise<boolean>((resolve, reject) => {
        fs.writeFile(fullFilePath, scanReport, (err) => {
            if (err) {
                Task.error('Failed to generate the HTML report');
                reject(false);
            }
            resolve(true);
        });
    });    
}


class Constants {
    // Report Endpoints
    static HtmlReport: string = 'htmlreport';
    static XmlReport: string = 'xmlreport';
    static MdReport: string = 'mdreport';

    // Report Types
    static Html: string = 'html';
    static Xml: string = 'xml';
    static Markdown: string = 'md';

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