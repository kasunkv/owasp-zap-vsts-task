import * as XmlParser from 'xmljson';

import { AlertResult } from './../interfaces/types/AlertResult';
import { AlertItem, ScanReport, Site } from './../interfaces/types/ZapReport';
import { Constants } from './constants';

export class Helpers {
    constructor () {}

    ProcessAlerts(xmlResult: string, targetUrl: string): AlertResult {
        let high: Array<AlertItem> = new Array<AlertItem>();
        let mid: Array<AlertItem> = new Array<AlertItem>();
        let low: Array<AlertItem> = new Array<AlertItem>();
        let info: Array<AlertItem> = new Array<AlertItem>();

        let alerts: AlertItem[];
        let alertResult: AlertResult = {
            HighAlerts: 0,
            MediumAlerts: 0,
            LowAlerts: 0,
            InformationalAlerts: 0,
            Alerts: new Array<AlertItem>()
        };

        XmlParser.to_json(xmlResult, (err: any, res: any) => {
            if (err) {
                return;
            }

            let reportJson: ScanReport = res;
            let sites: Site[] = reportJson.OWASPZAPReport.site;

            for(let idx in sites) {
                if (sites[idx].$.name == targetUrl) {
                    alerts = sites[idx].alerts.alertitem;
                }
            }

            for(let idx in alerts) {
                if (alerts[idx].riskcode == Constants.HighRisk) {
                    high.push(alerts[idx]); 
                    alertResult.HighAlerts++; 
                }

                if (alerts[idx].riskcode == Constants.MediumRisk) {
                    mid.push(alerts[idx]);
                    alertResult.MediumAlerts++;
                }

                if (alerts[idx].riskcode == Constants.LowRisk) {
                    low.push(alerts[idx]);
                    alertResult.LowAlerts++;
                }

                if (alerts[idx].riskcode == Constants.InfoRisk) {
                    info.push(alerts[idx]);
                    alertResult.InformationalAlerts++;
                }
            }

            let sorted: Array<AlertItem> = high.concat(mid).concat(low).concat(info);
            alertResult.Alerts = sorted;
        });

        return alertResult;
    }

}