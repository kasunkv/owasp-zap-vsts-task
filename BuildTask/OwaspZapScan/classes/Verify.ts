import * as Task from 'vsts-task-lib';

import { ReportType } from './../enums/Enums';
import { Report } from './../classes/Reports';
import { Helpers } from './../classes/Helper';
import { AlertResult } from './../interfaces/types/AlertResult';
import { TaskInputs } from './../interfaces/types/TaskInputs';

export class Verify {    
    private _reports: Report;
    private _helpers: Helpers;
    private _taskInputs: TaskInputs;

    constructor(helpers: Helpers, report: Report, configInputs: TaskInputs) {
        this._taskInputs = configInputs;
        this._helpers = helpers;
        this._reports = report;        
    }

    async Assert(): Promise<void> {
        /* Get the Scan Result */
        const xmlReport: string = await this._reports.GetScanResults(ReportType.XML);
        /* Sort and Count the Alerts */
        const alertResult: AlertResult = this._helpers.ProcessAlerts(xmlReport, this._taskInputs.TargetUrl);

        Task.debug(`
            Scan Result: 
              High Risk Alerts: ${alertResult.HighAlerts}
              Medium Risk Alerts: ${alertResult.MediumAlerts}
              Low Risk Alerts: ${alertResult.LowAlerts}
              Informational Risk Alerts: ${alertResult.InformationalAlerts}`);
        
        /* Print the Scan Report */
        this._reports.PrintResult(alertResult.HighAlerts, alertResult.MediumAlerts, alertResult.LowAlerts, alertResult.InformationalAlerts);
        
        /* If Verifications are enabled. */
        if (this._taskInputs.EnableVerifications) {           

            /* Verify alerts with in the limit */
            if (this._taskInputs.MaxHighRiskAlerts < alertResult.HighAlerts) {
                Task.setResult(Task.TaskResult.Failed, `High Risk Alert Threshold Exceeded. Threshold: ${this._taskInputs.MaxHighRiskAlerts}, Actual: ${alertResult.HighAlerts}`);
            }

            if (this._taskInputs.MaxMediumRiskAlerts < alertResult.MediumAlerts) {
                Task.setResult(Task.TaskResult.Failed, `Medium Risk Alert Threshold Exceeded. Threshold: ${this._taskInputs.MaxMediumRiskAlerts}, Actual: ${alertResult.MediumAlerts}`);
            }

            if (this._taskInputs.MaxLowRiskAlerts < alertResult.LowAlerts) {
                Task.setResult(Task.TaskResult.Failed, `Low Alert Risk Threshold Exceeded. Threshold: ${this._taskInputs.MaxLowRiskAlerts}, Actual: ${alertResult.LowAlerts}`);
            }
        }
    }
}