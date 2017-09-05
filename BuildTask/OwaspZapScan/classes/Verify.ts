import * as Task from 'vsts-task-lib';

import { ReportType } from './../enums/Enums';
import { Report } from './../classes/Reports';
import { Helpers } from './../classes/Helper';
import { AlertResult } from './../interfaces/types/AlertResult';

export class Verify {
    private _enableVerifications: boolean;
    private _targetUrl: string;

    private _reports: Report;
    private _helper: Helpers;

    constructor(public zapApiUrl: string, public zapApiKey: string, enableVerifications: boolean, targetUrl: string) {
        this._enableVerifications = enableVerifications;
        this._targetUrl = targetUrl;

        this._reports = new Report(zapApiUrl, zapApiKey, targetUrl);
        this._helper = new Helpers();
    }

    async Assert(highAlertThreshold: number, mediumAlertThreshold: number, lowAlertThreshold: number): Promise<void> {
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

            /* Verify alerts with in the limit */
            if (highAlertThreshold < alertResult.HighAlerts) {
                Task.setResult(Task.TaskResult.Failed, `High Risk Alert Threshold Exceeded. Threshold: ${highAlertThreshold}, Actual: ${alertResult.HighAlerts}`);
            }

            if (mediumAlertThreshold < alertResult.MediumAlerts) {
                Task.setResult(Task.TaskResult.Failed, `Medium Risk Alert Threshold Exceeded. Threshold: ${mediumAlertThreshold}, Actual: ${alertResult.MediumAlerts}`);
            }

            if (lowAlertThreshold < alertResult.LowAlerts) {
                Task.setResult(Task.TaskResult.Failed, `Low Alert Risk Threshold Exceeded. Threshold: ${lowAlertThreshold}, Actual: ${alertResult.LowAlerts}`);
            }
        }
    }
}