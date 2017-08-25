import * as Task from 'vsts-task-lib';
import * as XmlParser from 'xmljson';

import * as ZapReport from './zapReporting';
import { ReportType } from './enums';
import { Constants } from './constants';
import { Report } from './Reports';

export class Verify {
    private _highAlertThreshold: number;
    private _mediumAlertThreshold: number;
    private _lowAlertThreshold: number;
    private _enableVerifications: boolean;
    private _targetUrl: string;

    private _reports: Report;

    constructor(public zapApiUrl: string, public zapApiKey: string) {
        this._reports = new Report(zapApiUrl, zapApiKey);
        this._enableVerifications = Task.getBoolInput('EnableVerifications');
        this._targetUrl = Task.getInput('TargetUrl', true);
    }


    async Assert(): Promise<void> {
        let actualHighAlerts: number = 0;
        let actualMediumAlerts: number = 0;
        let actualLowAlerts: number = 0;
        let alerts: ZapReport.alertitem[];

        let xmlReport: string = await this._reports.GetScanResults(ReportType.XML);

        XmlParser.to_json(xmlReport, (err: any, res: any) => {
            if (err) {
                Task.error('Could not parse the XML report');
                Task.error(`Error: ${err.message || err}`);
                Task.setResult(Task.TaskResult.Failed, 'Could not parse the XML report');
                return;
            }               
            
            let reportJson: ZapReport.ScanReport = res;
            let sites: ZapReport.site[] = reportJson.OWASPZAPReport.site;

            for(let idx in sites) {
                if (sites[idx].$.host == this._targetUrl) {
                    alerts = sites[idx].alerts.alertitem;
                }
            }

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
            
            // Print the Scan Report
            this._reports.PrintResult(actualHighAlerts, actualMediumAlerts, actualLowAlerts);
            
            // If Verifications are enabled.
            if(this._enableVerifications) {

                // Get the threshold values
                this._highAlertThreshold = parseInt(Task.getInput('MaxHighRiskAlerts'));
                this._mediumAlertThreshold = parseInt(Task.getInput('MaxMediumRiskAlerts'));
                this._lowAlertThreshold = parseInt(Task.getInput('MaxLowRiskAlerts'));

                // Verify alerts with in the limit
                if (this._highAlertThreshold < actualHighAlerts) {
                    Task.setResult(Task.TaskResult.Failed, `High Risk Alert Threshold Exceeded. Threshold: ${this._highAlertThreshold}, Actual: ${actualHighAlerts}`);
                }

                if (this._mediumAlertThreshold < actualMediumAlerts) {
                    Task.setResult(Task.TaskResult.Failed, `Medium Risk Alert Threshold Exceeded. Threshold: ${this._mediumAlertThreshold}, Actual: ${actualMediumAlerts}`);
                }

                if (this._lowAlertThreshold < actualLowAlerts) {
                    Task.setResult(Task.TaskResult.Failed, `Low Alert Risk Threshold Exceeded. Threshold: ${this._lowAlertThreshold}, Actual: ${actualLowAlerts}`);
                }
            }
            
        });
    }
}