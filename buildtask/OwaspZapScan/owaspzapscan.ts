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
    /* Get the required inputs */
    let zapApiUrl: string = Task.getInput('ZapApiUrl', true);
    let zapApiKey: string = Task.getInput('ZapApiKey', true);
    let targetUrl: string = Task.getInput('TargetUrl', true);

    /* Spider Scan Options */
    let executeSpiderScan: boolean = Task.getBoolInput('ExecuteSpiderScan');
    let recurseSpider: boolean = Task.getBoolInput('RecurseSpider');
    let subtreeOnly: boolean = Task.getBoolInput('SubtreeOnly');
    let maxChildrenToCrawl: string = Task.getInput('MaxChildrenToCrawl');
    let contextName: string = Task.getInput('ContextName');

    /* Active Scan Options inputs */
    let contextId: string = Task.getInput('ContextId');
    let recurse: boolean = Task.getBoolInput('Recurse');
    let inScopeOnly: boolean = Task.getBoolInput('InScopeOnly');
    let scanPolicyName: string = Task.getInput('ScanPolicyName');
    let method: string = Task.getInput('Method');
    let postData: string = Task.getInput('PostData');
    
    /* Reporting options */
    let reportType: string = Task.getInput('ReportType');
    let destinationFolder: string = Task.getPathInput('ReportFileDestination');
    let reportFileName: string = Task.getInput('ReportFileName');

    
    let reports: Report = new Report(zapApiUrl, zapApiKey);
    let selectedScans: Array<IZapScan> = new Array<IZapScan>();
    let scanStatus: ScanResult = { Success: false };
    let hasIssues: boolean = false;

    /* Add Spider Scan is selected */
    if (executeSpiderScan) {
        let spiderScan: SpiderScan = new SpiderScan(zapApiUrl, zapApiKey, targetUrl, subtreeOnly, recurseSpider, maxChildrenToCrawl, contextName);
        selectedScans.push(spiderScan);
    }

    /* Add the Active Scan */
    let activeScan: ActiveScan = new ActiveScan(zapApiUrl, zapApiKey, targetUrl, contextId, recurse, inScopeOnly, scanPolicyName, method, postData);
    selectedScans.push(activeScan);

    /* Execute the Scans */
    for (let i: number = 0; i < selectedScans.length; i++) {
        let scan: IZapScan = selectedScans[i];
        scanStatus = await scan.ExecuteScan();
        
        if (!scanStatus.Success) {
            let message: string = `The ${scan.ScanType} failed with the Error: ${scanStatus.Success}`;
            Task.error(message)
            throw new Error(message)
        }
    }

    /* If all scans are successful: 1). Generate the Report 2). Perform the Verifications */
    if (scanStatus.Success) {

        /* Generate the report */
        console.log('Generating the report...');
        let isSuccess: boolean = await reports.GenerateReport(reportType, destinationFolder, reportFileName);
        
        if (!isSuccess) {
            hasIssues = isSuccess;
        }

        /* Perform the Verifications and Print the report */
        let verify: Verify = new Verify(zapApiUrl, zapApiKey);
        verify.Assert();

        Task.setResult(hasIssues ? Task.TaskResult.SucceededWithIssues : Task.TaskResult.Succeeded, 'OWASP ZAP Active Scan Complete. Result is within the expected thresholds.');
    } else {
        Task.error('A scan failed to complete.');
    }
}   

run().catch((err: any) => {
    Task.setResult(Task.TaskResult.Failed, `Failed to initiate the active scan. Error: ${err.message || err}`);
});
