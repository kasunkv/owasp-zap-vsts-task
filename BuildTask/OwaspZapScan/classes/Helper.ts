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
            const siteCollection: any = reportJson.OWASPZAPReport.site;
            const sites: Site[] = Object.keys(siteCollection)[0] === '0' ? siteCollection : [siteCollection as Site];
            var cleanedTargetUrl = ""; 
            
            for (const idx in sites) {
                if (targetUrl.includes(sites[idx].$.host)) {
                    alerts = sites[idx].alerts.alertitem;
                    
                    //clean to remove basic auth creds from URI 
                    var protocol = targetUrl.split("/")[0] + "//"; 
                    cleanedTargetUrl = protocol + targetUrl.substr(targetUrl.indexOf(sites[idx].$.host)); 
                }
            }

            if (!alerts) {
                return;
            }

            for (const idx of Object.keys(alerts)) {
                const i: number = Number(idx);

                var instances = {}; 
                for (const idx of Object.keys(alerts[i].instances.instance)) { 
                    const j = Number(idx); 
                    var _instance = _alert.instances.instance[j]; 
                    
                    //filter down to just the context root being tested
                    if (_instance && _instance.uri.startsWith(cleanedTargetUrl)) { 
                        instances[idx] = _instance; 
                    } 
                } 
                alerts[i].instances.instance = instances; 
                if (Object.keys(alerts[i].instances.instance).length === 0) { 
                    continue; 
                } 

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