import * as dotenv from 'dotenv';
//dotenv.config();

import * as path from 'path';
import * as Task from 'vsts-task-lib';

import { RequestService } from './classes/RequestService';
import { ScanResult } from './interfaces/types/ScanResult';
import { IZapScan } from './interfaces/contracts/IZapScan';
import { ActiveScan } from './classes/ActiveScan';
import { SpiderScan } from './classes/SpiderScan';
import { Report } from './classes/Report';
import { Verify } from './classes/Verify';
import { Helper } from './classes/Helper';
import { TaskInput } from './classes/TaskInput';

Task.setResourcePath(path.join(__dirname, 'task.json'));

async function run(): Promise<string> {

    const promise = new Promise<string>(async (resolve, reject) => {

       try {
            const taskInputs: TaskInput = new TaskInput();
            /* Get the required inputs */
            taskInputs.ZapApiUrl = Task.getInput('ZapApiUrl', true);
            taskInputs.ZapApiKey = Task.getInput('ZapApiKey', true);
            taskInputs.TargetUrl = Task.getInput('TargetUrl', true);

            /* Spider Scan Options */
            taskInputs.ExecuteSpiderScan = Task.getBoolInput('ExecuteSpiderScan');
            taskInputs.RecurseSpider = Task.getBoolInput('RecurseSpider');
            taskInputs.SubTreeOnly = Task.getBoolInput('SubtreeOnly');
            taskInputs.MaxChildrenToCrawl = Task.getInput('MaxChildrenToCrawl');
            taskInputs.ContextName = Task.getInput('ContextName');

            /* Active Scan Options inputs */
            taskInputs.ExecuteActiveScan = Task.getBoolInput('ExecuteActiveScan');
            taskInputs.ContextId = Task.getInput('ContextId');
            taskInputs.Recurse = Task.getBoolInput('Recurse');
            taskInputs.InScopeOnly = Task.getBoolInput('InScopeOnly');
            taskInputs.ScanPolicyName = Task.getInput('ScanPolicyName');
            taskInputs.Method = Task.getInput('Method');
            taskInputs.PostData = Task.getInput('PostData');

            /* Reporting options */
            taskInputs.ReportType = Task.getInput('ReportType');
            taskInputs.ReportFileDestination = Task.getPathInput('ReportFileDestination');
            taskInputs.ReportFileName = Task.getInput('ReportFileName');
            taskInputs.ProjectName = Task.getVariable('Build.Repository.Name');
            taskInputs.BuildDefinitionName = Task.getVariable('Build.DefinitionName');

            /* Verification Options */
            taskInputs.EnableVerifications = Task.getBoolInput('EnableVerifications');
            taskInputs.MaxHighRiskAlerts = parseInt(Task.getInput('MaxHighRiskAlerts'), 10);
            taskInputs.MaxMediumRiskAlerts = parseInt(Task.getInput('MaxMediumRiskAlerts'), 10);
            taskInputs.MaxLowRiskAlerts = parseInt(Task.getInput('MaxLowRiskAlerts'), 10);


            const requestService: RequestService = new RequestService();
            const helper: Helper = new Helper();    
            const report: Report = new Report(helper, requestService, taskInputs);

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
                    reject(message);
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

                resolve(`OWASP ZAP Active Scan ${hasIssues ? 'Partially' : '' } Completed. Result is within the expected thresholds.`);
            } else {
                reject('A scan failed to complete.');
            }
        } catch (err) {
            reject(err.message || err);
       }
    });

    return promise;   
}   

run()
    .then((result: string) => {
        Task.setResult(Task.TaskResult.Succeeded, result);
    })
    .catch((err: any) => {
        Task.setResult(Task.TaskResult.Failed, `Task Failed. Error: ${JSON.stringify(err)}`);
    });
