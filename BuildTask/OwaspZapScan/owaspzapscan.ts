import * as path from 'path';
import * as Task from 'vsts-task-lib';

import { ScanResult } from './interfaces/types/ScanResult';
import { IZapScan } from './interfaces/contracts/IZapScan';
import { ActiveScan } from './classes/ActiveScan';
import { SpiderScan } from './classes/SpiderScan';
import { Report } from './classes/Reports';
import { Verify } from './classes/Verify';


Task.setResourcePath(path.join(__dirname, '../task.json'));

async function run(): Promise<void> {
    /* Get the required inputs */
    const zapApiUrl: string = Task.getInput('ZapApiUrl', true);
    const zapApiKey: string = Task.getInput('ZapApiKey', true);
    const targetUrl: string = Task.getInput('TargetUrl', true);

    /* Spider Scan Options */
    const executeSpiderScan: boolean = Task.getBoolInput('ExecuteSpiderScan');
    const recurseSpider: boolean = Task.getBoolInput('RecurseSpider');
    const subtreeOnly: boolean = Task.getBoolInput('SubtreeOnly');
    const maxChildrenToCrawl: string = Task.getInput('MaxChildrenToCrawl');
    const contextName: string = Task.getInput('ContextName');

    /* Active Scan Options inputs */
    const executeActiveScan: boolean = Task.getBoolInput('ExecuteActiveScan');
    const contextId: string = Task.getInput('ContextId');
    const recurse: boolean = Task.getBoolInput('Recurse');
    const inScopeOnly: boolean = Task.getBoolInput('InScopeOnly');
    const scanPolicyName: string = Task.getInput('ScanPolicyName');
    const method: string = Task.getInput('Method');
    const postData: string = Task.getInput('PostData');
    
    /* Reporting options */
    const reportType: string = Task.getInput('ReportType');
    const destinationFolder: string = Task.getPathInput('ReportFileDestination');
    const reportFileName: string = Task.getInput('ReportFileName');

    
    const reports: Report = new Report(zapApiUrl, zapApiKey);
    const selectedScans: Array<IZapScan> = new Array<IZapScan>();
    let scanStatus: ScanResult = { Success: false };
    let hasIssues: boolean = false;

    /* Add Spider Scan is selected */
    if (executeSpiderScan) {
        const spiderScan: SpiderScan = new SpiderScan(zapApiUrl, zapApiKey, targetUrl, subtreeOnly, recurseSpider, maxChildrenToCrawl, contextName);
        selectedScans.push(spiderScan);
    }

    /* Add the Active Scan */
    if (executeActiveScan) {
        const activeScan: ActiveScan = new ActiveScan(zapApiUrl, zapApiKey, targetUrl, contextId, recurse, inScopeOnly, scanPolicyName, method, postData);
        selectedScans.push(activeScan);
    }    

    /* Execute the Scans */
    for (let i: number = 0; i < selectedScans.length; i++) {
        const scan: IZapScan = selectedScans[i];
        scanStatus = await scan.ExecuteScan();
        
        if (!scanStatus.Success) {
            const message: string = `The ${scan.scanType} failed with the Error: ${scanStatus.Success}`;
            Task.error(message);
            throw new Error(message);
        }
    }

    /* If all scans are successful: 1). Generate the Report 2). Perform the Verifications */
    if (scanStatus.Success) {

        /* Generate the report */
        console.log('Generating the report...');
        const isSuccess: boolean = await reports.GenerateReport(reportType, destinationFolder, reportFileName);
        
        if (!isSuccess) {
            hasIssues = isSuccess;
        }

        /* Perform the Verifications and Print the report */
        const verify: Verify = new Verify(zapApiUrl, zapApiKey);
        verify.Assert();

        Task.setResult(hasIssues ? Task.TaskResult.SucceededWithIssues : Task.TaskResult.Succeeded, 'OWASP ZAP Active Scan Complete. Result is within the expected thresholds.');
    } else {
        Task.error('A scan failed to complete.');
    }
}   

run().catch((err: any) => {
    Task.setResult(Task.TaskResult.Failed, `Failed to initiate the active scan. Error: ${err.message || err}`);
});
