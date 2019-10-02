import * as XmlParser from 'xmljson';

import { AlertResult } from './../interfaces/types/AlertResult';
import { AlertItem, ScanReport, Site, Instance } from './../interfaces/types/ZapReport';
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
            const siteCollection: any = reportJson.OWASPZAPReport.site;
            const sites: Site[] = Object.keys(siteCollection)[0] === '0' ? siteCollection : [siteCollection as Site];
            
            for (const idx in sites) {
                if (targetUrl.includes(sites[idx].$.host)) {
                    alerts = sites[idx].alerts.alertitem;
                }
            }

            if (!alerts) {
                return;
            }

            const _alerts: any = alerts;
            alerts = Object.keys(_alerts)[0] === '0' ? _alerts : [_alerts as AlertItem];
            
            for (const idx of Object.keys(alerts)) {
                const i: number = Number(idx);
                const alert = alerts[i];

                //convert instances to proper array instead of a dictionary
                const _instances: any = alert.instances.instance;
                alert.instances.instance = Object.keys(_instances)[0] === '0' ? _instances : [_instances as Instance];

                if (alert.riskcode === Constants.HIGH_RISK) {
                    high.push(alert); 
                    alertResult.HighAlerts++; 
                }

                if (alert.riskcode === Constants.MEDIUM_RISK) {
                    mid.push(alert);
                    alertResult.MediumAlerts++;
                }

                if (alert.riskcode === Constants.LOW_RISK) {
                    low.push(alert);
                    alertResult.LowAlerts++;
                }

                if (alert.riskcode === Constants.INFO_RISK) {
                    info.push(alert);
                    alertResult.InformationalAlerts++;
                }
            }

            const sorted: Array<AlertItem> = high.concat(mid).concat(low).concat(info);
            alertResult.Alerts = sorted;
        });

        return alertResult;
    }

}