import * as path from 'path';
import * as Task from 'vsts-task-lib';

import { ScanResult } from './scanResult';
import { IZapScan } from './IZapScan';
import { ActiveScan } from './ActiveScan';
import { SpiderScan } from './SpiderScan';
import { Report } from './Reports';
import { Verify } from './Verify';


Task.setResourcePath(path.join(__dirname, 'task.json'));

async function run(): Promise<void> {
    // Get the required inputs
    let zapApiUrl: string = Task.getInput('ZapApiUrl', true);
    let zapApiKey: string = Task.getInput('ZapApiKey', true);
    let targetUrl: string = Task.getInput('TargetUrl', true);

    // Spider Scan Options
    let executeSpiderScan: boolean = Task.getBoolInput('ExecuteSpiderScan');
    let recurseSpider: boolean = Task.getBoolInput('RecurseSpider');
    let subtreeOnly: boolean = Task.getBoolInput('SubtreeOnly');
    let maxChildrenToCrawl: string = Task.getInput('MaxChildrenToCrawl');
    let contextName: string = Task.getInput('ContextName');

    // Active Scan Options inputs
    let contextId: string = Task.getInput('ContextId');
    let recurse: boolean = Task.getBoolInput('Recurse');
    let inScopeOnly: boolean = Task.getBoolInput('InScopeOnly');
    let scanPolicyName: string = Task.getInput('ScanPolicyName');
    let method: string = Task.getInput('Method');
    let postData: string = Task.getInput('PostData');
    
    // Verification options
    //let enableVerifications: boolean = Task.getBoolInput('EnableVerifications');    

    // Reporting options
    let reportType: string = Task.getInput('ReportType');
    let destinationFolder: string = Task.getPathInput('ReportFileDestination');
    let reportFileName: string = Task.getInput('ReportFileName');

    let scanStatus: ScanResult = { Success: false };
    let reports: Report = new Report(zapApiUrl, zapApiKey);

    let selectedScans: Array<IZapScan> = new Array<IZapScan>();

    if (executeSpiderScan) {
        let spiderScan: SpiderScan = new SpiderScan(zapApiUrl, zapApiKey, targetUrl, subtreeOnly, recurseSpider, maxChildrenToCrawl, contextName);
        selectedScans.push(spiderScan);
    }

    let activeScan: ActiveScan = new ActiveScan(zapApiUrl, zapApiKey, targetUrl, contextId, recurse, inScopeOnly, scanPolicyName, method, postData);
    selectedScans.push(activeScan);

    for (let i: number = 0; i < selectedScans.length; i++) {
        let scan: IZapScan = selectedScans[i];
        scanStatus = await scan.ExecuteScan();
        
        if (!scanStatus.Success) {
            throw new Error(`The ${scan.ScanType} failed with the Error: ${scanStatus.Success}`)
        }
    }

    // If all scans are successful: 1). Generate the Report 2). Perform the Verifications
    if (scanStatus.Success) {

        // Generate the report
        console.log('Generating the report...');
        let reportFileCreated: boolean = await reports.GenerateReport(reportType, destinationFolder, reportFileName);

        // Perform the Verifications and Print the report
        let verify: Verify = new Verify(zapApiUrl, zapApiKey);
        verify.Assert();

    } else {
        console.log('Can not generate the report');
    }

    /*
    let scanOptions: ZapRequest.ZapActiveScanOptions = {
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
    
    RequestPromise(requestOptions)
        .then(async (res: any) => {
            let hasIssues: boolean = false;
            let actualHighAlerts: number = 0;
            let actualMediumAlerts: number = 0;
            let actualLowAlerts: number = 0;

            let result: ZapRequest.ZapActiveScanResult = JSON.parse(res);
            console.log(`OWASP ZAP Active Scan Initiated. ID: ${result.scan}`);

            // Check active scan status.
            let activeScanComplete: boolean = await Helper.checkActiveScanStatus(result.scan, zapApiKey, zapApiUrl);
            
            if (!activeScanComplete) {
                Task.warning('Active Scan did not complete.');
                Task.setResult(Task.TaskResult.Failed, `Failed to confirm if active scan was completed.`);
                return;
            }

            // Generate the Scan Report
            hasIssues = !await Helper.generateReport(zapApiKey, zapApiUrl, reportType, destinationFolder, reportFileName);

            // Get the XML Report
            let xmlReport: string = await Helper.getActiveScanResults(zapApiKey, zapApiUrl, ReportType.XML);
            XmlParser.to_json(xmlReport, (err: any, res: any) => {
                if (err) {
                    Task.error('Could not parse the XML report');
                    Task.error(`Error: ${err}`);
                    Task.setResult(Task.TaskResult.Failed, 'Could not parse the XML report');
                }               
                
                let reportJson: ZapReport.ScanReport = res;
                let alerts: Array<ZapReport.alertitem> = reportJson.OWASPZAPReport.site.alerts.alertitem;

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
                    let highAlertThreshold: number = parseInt(Task.getInput('MaxHighRiskAlerts'));
                    let mediumAlertThreshold: number = parseInt(Task.getInput('MaxMediumRiskAlerts'));
                    let lowAlertThreshold: number = parseInt(Task.getInput('MaxLowRiskAlerts'));

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
            Helper.printResult(actualHighAlerts, actualMediumAlerts, actualLowAlerts);
        })
        .error((err: any) => {
            Task.warning('Failed to initiate the active scan.');
            Task.setResult(Task.TaskResult.Failed, `Failed to initiate the active scan. Error: ${err}`);
        });
        
        */
}   

run().catch((err: any) => {
    Task.setResult(Task.TaskResult.Failed, err.message || err);
});
