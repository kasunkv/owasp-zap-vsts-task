import * as path from 'path';
import * as Task from 'vsts-task-lib';

import { ScanResult } from './interfaces/types/ScanResult';
import { IZapScan } from './interfaces/contracts/IZapScan';
import { ActiveScan } from './classes/ActiveScan';
import { SpiderScan } from './classes/SpiderScan';
import { Report } from './classes/Report';
import { Verify } from './classes/Verify';
import { TaskInputs } from './interfaces/types/TaskInputs';
import { Helper } from './classes/Helper';


Task.setResourcePath(path.join(__dirname, 'task.json'));

async function run(): Promise<void> {

    const taskInputs: TaskInputs = {
        /* Get the required inputs */
        ZapApiUrl: Task.getInput('ZapApiUrl', true),
        ZapApiKey: Task.getInput('ZapApiKey', true),
        TargetUrl: Task.getInput('TargetUrl', true),

        /* Spider Scan Options */
        ExecuteSpiderScan: Task.getBoolInput('ExecuteSpiderScan'),
        RecurseSpider: Task.getBoolInput('RecurseSpider'),
        SubTreeOnly: Task.getBoolInput('SubtreeOnly'),
        MaxChildrenToCrawl: Task.getInput('MaxChildrenToCrawl'),
        ContextName: Task.getInput('ContextName'),

        /* Active Scan Options inputs */
        ExecuteActiveScan: Task.getBoolInput('ExecuteActiveScan'),
        ContextId: Task.getInput('ContextId'),
        Recurse: Task.getBoolInput('Recurse'),
        InScopeOnly: Task.getBoolInput('InScopeOnly'),
        ScanPolicyName: Task.getInput('ScanPolicyName'),
        Method: Task.getInput('Method'),
        PostData: Task.getInput('PostData'),

        /* Reporting options */
        ReportType: Task.getInput('ReportType'),
        ReportFileDestination: Task.getPathInput('ReportFileDestination'),
        ReportFileName: Task.getInput('ReportFileName'),
        ProjectName: Task.getVariable('Build.Repository.Name'),
        BuildDefinitionName: Task.getVariable('Build.DefinitionName'),

        /* Verification Options */
        EnableVerifications: Task.getBoolInput('EnableVerifications'),
        MaxHighRiskAlerts: parseInt(Task.getInput('MaxHighRiskAlerts'), 10),
        MaxMediumRiskAlerts: parseInt(Task.getInput('MaxMediumRiskAlerts'), 10),
        MaxLowRiskAlerts: parseInt(Task.getInput('MaxLowRiskAlerts'), 10)
    };

    const helpers: Helpers = new Helpers();
    const reports: Report = new Report(helpers, taskInputs);
    const selectedScans: Array<IZapScan> = new Array<IZapScan>();
    let scanStatus: ScanResult = { Success: false };
    let hasIssues: boolean = false;

    /* Add Spider Scan is selected */
    if (taskInputs.ExecuteSpiderScan) {
        const spiderScan: SpiderScan = new SpiderScan(taskInputs);
        selectedScans.push(spiderScan);
    }

    /* Add the Active Scan */
    if (taskInputs.ExecuteActiveScan) {
        const activeScan: ActiveScan = new ActiveScan(taskInputs);
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
        const isSuccess: boolean = await report.GenerateReport();
        
        if (!isSuccess) {
            hasIssues = isSuccess;
        }

        /* Perform the Verifications and Print the report */
        const verify: Verify = new Verify(helper, report, taskInputs);
        verify.Assert();

        Task.setResult(hasIssues ? Task.TaskResult.SucceededWithIssues : Task.TaskResult.Succeeded, 'OWASP ZAP Active Scan Complete. Result is within the expected thresholds.');
    } else {
        Task.error('A scan failed to complete.');
    }
}   

run().catch((err: any) => {
    Task.setResult(Task.TaskResult.Failed, `Failed to initiate the active scan. Error: ${err.message || err}`);
});
