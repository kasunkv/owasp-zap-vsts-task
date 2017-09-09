import * as XmlParser from 'xmljson';

import { AlertResult } from './../interfaces/types/AlertResult';
import { AlertItem, ScanReport, Site } from './../interfaces/types/ZapReport';
import { Constants } from './Constants';

export class Helper {
    constructor () {}

    ProcessAlerts(xmlResult: string, targetUrl: string): AlertResult {
        const high: Array<AlertItem> = new Array<AlertItem>();
        const mid: Array<AlertItem> = new Array<AlertItem>();
        const low: Array<AlertItem> = new Array<AlertItem>();
        const info: Array<AlertItem> = new Array<AlertItem>();

        let alerts: AlertItem[];
        const alertResult: AlertResult = {
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

            const reportJson: ScanReport = res;
            const sites: Site[] = reportJson.OWASPZAPReport.site;

            for (const idx in sites) {
                if (sites[idx].$.name === targetUrl) {
                    alerts = sites[idx].alerts.alertitem;
                }
            }

            if (!alerts) {
                return;
            }

            for (const idx of Object.keys(alerts)) {
                const i: number = Number(idx);

                if (alerts[i].riskcode === Constants.HIGH_RISK) {
                    high.push(alerts[i]); 
                    alertResult.HighAlerts++; 
                }

                if (alerts[i].riskcode === Constants.MEDIUM_RISK) {
                    mid.push(alerts[i]);
                    alertResult.MediumAlerts++;
                }

                if (alerts[i].riskcode === Constants.LOW_RISK) {
                    low.push(alerts[i]);
                    alertResult.LowAlerts++;
                }

                if (alerts[i].riskcode === Constants.INFO_RISK) {
                    info.push(alerts[i]);
                    alertResult.InformationalAlerts++;
                }
            }

            const sorted: Array<AlertItem> = high.concat(mid).concat(low).concat(info);
            alertResult.Alerts = sorted;
        });

        return alertResult;
    }

}