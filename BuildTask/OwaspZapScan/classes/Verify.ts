import * as Task from 'vsts-task-lib';

import { ReportType } from './../enums/Enums';
import { Report } from './../classes/Reports';
import { Helpers } from './../classes/Helper';
import { AlertResult } from './../interfaces/types/AlertResult';

export class Verify {
    private _highAlertThreshold: number;
    private _mediumAlertThreshold: number;
    private _lowAlertThreshold: number;
    private _enableVerifications: boolean;
    private _targetUrl: string;

    private _reports: Report;
    private _helper: Helpers;

    constructor(public zapApiUrl: string, public zapApiKey: string) {
        this._enableVerifications = Task.getBoolInput('EnableVerifications');
        this._targetUrl = Task.getInput('TargetUrl', true);

        this._reports = new Report(zapApiUrl, zapApiKey);
        this._helper = new Helpers();
    }

    async Assert(): Promise<void> {
        /* Get the Scan Result */
        const xmlReport: string = await this._reports.GetScanResults(ReportType.XML);
        /* Sort and Count the Alerts */
        const alertResult: AlertResult = this._helper.ProcessAlerts(xmlReport, this._targetUrl);

        Task.debug(`
            Scan Result: 
              High Risk Alerts: ${alertResult.HighAlerts}
              Medium Risk Alerts: ${alertResult.MediumAlerts}
              Low Risk Alerts: ${alertResult.LowAlerts}
              Informational Risk Alerts: ${alertResult.InformationalAlerts}`);
        
        /* Print the Scan Report */
        this._reports.PrintResult(alertResult.HighAlerts, alertResult.MediumAlerts, alertResult.LowAlerts, alertResult.InformationalAlerts);
        
        /* If Verifications are enabled. */
        if (this._enableVerifications) {

            /* Get the threshold values */
            this._highAlertThreshold = parseInt(Task.getInput('MaxHighRiskAlerts'), 10);
            this._mediumAlertThreshold = parseInt(Task.getInput('MaxMediumRiskAlerts'), 10);
            this._lowAlertThreshold = parseInt(Task.getInput('MaxLowRiskAlerts'), 10);

            /* Verify alerts with in the limit */
            if (this._highAlertThreshold < alertResult.HighAlerts) {
                Task.setResult(Task.TaskResult.Failed, `High Risk Alert Threshold Exceeded. Threshold: ${this._highAlertThreshold}, Actual: ${alertResult.HighAlerts}`);
            }

            if (this._mediumAlertThreshold < alertResult.MediumAlerts) {
                Task.setResult(Task.TaskResult.Failed, `Medium Risk Alert Threshold Exceeded. Threshold: ${this._mediumAlertThreshold}, Actual: ${alertResult.MediumAlerts}`);
            }

            if (this._lowAlertThreshold < alertResult.LowAlerts) {
                Task.setResult(Task.TaskResult.Failed, `Low Alert Risk Threshold Exceeded. Threshold: ${this._lowAlertThreshold}, Actual: ${alertResult.LowAlerts}`);
            }
        }
    }
}