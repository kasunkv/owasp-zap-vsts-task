import * as Task from 'vsts-task-lib';

import { ReportType } from './../enums/Enums';
import { Report } from './../classes/Report';
import { Helper } from './../classes/Helper';
import { AlertResult } from './../interfaces/types/AlertResult';
import { TaskInput } from './TaskInput';

export class Verify {    
    private _reports: Report;
    private _helper: Helper;
    private _taskInputs: TaskInput;

    constructor(helper: Helper, report: Report, taskInputs: TaskInput) {
        this._taskInputs = taskInputs;
        this._helper = helper;
        this._reports = report;        
    }

    async Assert(): Promise<void> {
        /* Get the Scan Result */
        const xmlReport: string = await this._reports.GetScanResults(ReportType.XML);
        /* Sort and Count the Alerts */
        const alertResult: AlertResult = this._helper.ProcessAlerts(xmlReport, this._taskInputs.TargetUrl);

        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {
            Task.debug(`
                Scan Result: 
                High Risk Alerts: ${alertResult.HighAlerts}
                Medium Risk Alerts: ${alertResult.MediumAlerts}
                Low Risk Alerts: ${alertResult.LowAlerts}
                Informational Risk Alerts: ${alertResult.InformationalAlerts}`);
        }        
        
        /* Print the Scan Report */
        this._reports.PrintResult(alertResult.HighAlerts, alertResult.MediumAlerts, alertResult.LowAlerts, alertResult.InformationalAlerts);
        
        /* If Verifications are enabled. */
        if (this._taskInputs.EnableVerifications) {           

            /* Verify alerts with in the limit */
            if (this._taskInputs.MaxHighRiskAlerts < alertResult.HighAlerts) {
                /* istanbul ignore if  */
                if (process.env.NODE_ENV !== 'test') {
                    Task.setResult(Task.TaskResult.Failed, `High Risk Alert Threshold Exceeded. Threshold: ${this._taskInputs.MaxHighRiskAlerts}, Actual: ${alertResult.HighAlerts}`);
                }
            }

            if (this._taskInputs.MaxMediumRiskAlerts < alertResult.MediumAlerts) {
                /* istanbul ignore if  */
                if (process.env.NODE_ENV !== 'test') {
                    Task.setResult(Task.TaskResult.Failed, `Medium Risk Alert Threshold Exceeded. Threshold: ${this._taskInputs.MaxMediumRiskAlerts}, Actual: ${alertResult.MediumAlerts}`);
                }
            }

            if (this._taskInputs.MaxLowRiskAlerts < alertResult.LowAlerts) {
                /* istanbul ignore if  */
                if (process.env.NODE_ENV !== 'test') {
                    Task.setResult(Task.TaskResult.Failed, `Low Alert Risk Threshold Exceeded. Threshold: ${this._taskInputs.MaxLowRiskAlerts}, Actual: ${alertResult.LowAlerts}`);
                }
            }
        }
    }
}