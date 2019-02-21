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
            let cleanedTargetUrl = ''; 
            
            for (const idx in sites) {
                if (targetUrl.includes(sites[idx].$.host)) {
                    alerts = sites[idx].alerts.alertitem;
                    
                    //clean to remove basic auth creds from URI 
                    const protocol = targetUrl.split('/')[0] + '//'; 
                    cleanedTargetUrl = protocol + targetUrl.substr(targetUrl.indexOf(sites[idx].$.host)); 
                }
            }

            if (!alerts) {
                return;
            }

            for (const idx of Object.keys(alerts)) {
                const i: number = Number(idx);
                const _alert: AlertItem = alerts[i];
                
                const instances: Array<Instance> = [];
                for (const _idx of Object.keys(_alert.instances.instance)) {
                    const _i = Number(_idx);
                    const _instance: Instance = _alert.instances.instance[_i];
                    if (_instance && _instance.uri.startsWith(cleanedTargetUrl)) {
                        instances[_i] = _instance;
                    }
                }
                
                _alert.instances.instance = instances;
                if (Object.keys(_alert.instances.instance).length === 0) {
                    continue;
                }
                                
                const riskcode = _alert.riskcode;
                if (riskcode === Constants.HIGH_RISK) {
                    high.push(_alert);
                    alertResult.HighAlerts++;
                }

                if (riskcode === Constants.MEDIUM_RISK) {
                    mid.push(_alert);
                    alertResult.MediumAlerts++;
                }

                if (riskcode === Constants.LOW_RISK) {
                    low.push(_alert);
                    alertResult.LowAlerts++;
                }

                if (riskcode === Constants.INFO_RISK) {
                    info.push(_alert);
                    alertResult.InformationalAlerts++;
                }
            }

            const sorted: Array<AlertItem> = high.concat(mid).concat(low).concat(info);
            alertResult.Alerts = sorted;
        });

        return alertResult;
    }

}