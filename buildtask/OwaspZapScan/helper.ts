import * as fs from 'fs';
import * as path from 'path';
import * as Task from 'vsts-task-lib';
import * as Request from 'request';
import * as RequestPromise from 'request-promise';
import * as sleep from 'thread-sleep';

import { ReportType } from './enums';
import { Constants } from './constants';
import * as ZapRequest from './zapRequest';


export function getActiveScanStatus(scanId: number, apiKey: string, zapApiUrl: string): Promise<number> {
    let statusOptions: ZapRequest.ZapActiveScanStatusOptions = {
        zapapiformat: 'JSON',
        apikey: apiKey,
        formMethod: 'GET',
        scanId: scanId
    };

    let requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
        uri: `http://${zapApiUrl}/JSON/ascan/view/status/`,
        qs: statusOptions
    };

    Task.debug('*** Get Active Scan Status ***');
    Task.debug(`ZAP API Call: http://${zapApiUrl}/JSON/ascan/view/status/`);
    Task.debug(`Request Options: ${JSON.stringify(statusOptions)}`);

    return new Promise<number>((resolve, reject) => {
        RequestPromise(requestOptions)
            .then((res: any) => {
                let result: ZapRequest.ZapActiveScanStatus = JSON.parse(res);
                Task.debug(`Scan Status Result: ${JSON.stringify(result)}`);
                
                resolve(result.status);
            })
            .error((err: any) => {
                reject(-1);
            });
    });
}

export async function checkActiveScanStatus(scanId: number, apiKey: string, zapApiUrl: string): Promise<boolean>{
    let previousScanStatus: number = 0;
    let scanCompleted: boolean = false;

    return new Promise<boolean>(async (resolve, reject) => {
        try {
            while (true) {
                sleep(10000);
                let scanStatus: number = await getActiveScanStatus(scanId, apiKey, zapApiUrl);

                if(scanStatus >= 100) {
                    console.log(`Scan In Progress: ${scanStatus}%`);
                    console.log('Active scan complete...');
                    scanCompleted = true;
                    break;
                }

                if (previousScanStatus != scanStatus) {
                    console.log(`Scan In Progress: ${scanStatus}%`);
                    scanCompleted = false;
                }

                previousScanStatus = scanStatus;
            }

            resolve(scanCompleted);

        } catch (error) {
            reject(scanCompleted);
        }
    });

    
}

export function getActiveScanResults(apiKey: string, zapApiUrl: string, type: ReportType = ReportType.XML): Promise<string> {

    let reportType: string = 'xmlreport';

    if (type == ReportType.XML) { reportType = Constants.XmlReport; }
    if (type == ReportType.HTML) { reportType = Constants.HtmlReport; } 
    if (type == ReportType.MD) { reportType = Constants.MdReport; } 

    let reportOptions: ZapRequest.ZapScanReportOptions = {
        apikey: apiKey,
        formMethod: 'GET'
    };

    let requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
        uri: `http://${zapApiUrl}/OTHER/core/other/${reportType}/`,
        qs: reportOptions
    };

    Task.debug('*** Get Active Scan Results ***');
    Task.debug(`ZAP API Call: http://${zapApiUrl}/OTHER/core/other/${reportType}/`);
    Task.debug(`Request Options: ${JSON.stringify(requestOptions)}`);

    return new Promise<string>((resolve, reject) => {
        RequestPromise(requestOptions)
            .then((res: any) => {
                resolve(res);
            })
            .error((err: any) => {
                reject("");
            });
    });
}

export async function generateReport(zapApiKey: string, zapApiUrl: string, reportType: string, destination: string, fileName: string): Promise<boolean> {
    let type: ReportType;
    let ext: string;

    fileName = fileName == '' ? 'OWASP-ZAP-Report' :  fileName;
    destination = destination == '' ? './' : destination;

    if (reportType == Constants.Xml) {
        type = ReportType.XML;
        ext = Constants.Xml;
    } else if (reportType == Constants.Markdown) {
        type = ReportType.MD;
        ext = Constants.Markdown;
    } else {
        type = ReportType.HTML;
        ext = Constants.Html;
    }
    
    let fullFilePath: string = path.normalize(`${destination}/${fileName}.${ext}`);
    Task.debug(`Report Filename: ${fullFilePath}`);

    let scanReport: string = await getActiveScanResults(zapApiKey, zapApiUrl, type);
    
    return new Promise<boolean>((resolve, reject) => {
        fs.writeFile(fullFilePath, scanReport, (err: any) => {
            if (err) {
                Task.error('Failed to generate the HTML report');
                reject(false);
            }
            resolve(true);
        });
    });    
}

export function printResult(highAlerts: number, mediumAlerts: number, lowAlerts: number): void {
    console.log();
    console.log('**************************');
    console.log('*   Active Scan Result   *');
    console.log('**************************');
    console.log();
    console.log('--------------------------');
    console.log('| Alert Type   | Count   |');
    console.log('--------------------------');
    console.log(`  High Risk    | ${highAlerts}`);
    console.log(`  Medium Risk  | ${mediumAlerts}`);
    console.log(`  Low Risk     | ${lowAlerts}`);
    console.log('__________________________');
}