import * as fs from 'fs';
import * as path from 'path';
import * as Task from 'vsts-task-lib';
import * as Request from 'request';
import * as RequestPromise from 'request-promise';
import * as sleep from 'thread-sleep';

import * as ZapRequest from './zapRequest';
import * as ZapReport from './zapReporting';
import { ReportType } from './enums';
import { Constants } from './constants';

export class Report {
    reportOptions: ZapRequest.ZapScanReportOptions;
    requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions;

    constructor(public zapApiUrl: string, public zapApiKey: string) {
        // Report Options
        this.reportOptions = {
            apikey: zapApiKey,
            formMethod: 'GET'
        };

        // Report Request Options
        this.requestOptions = {
            uri: `http://${this.zapApiUrl}/OTHER/core/other`,
            qs: this.reportOptions
        };
    }

    GetScanResults(type: ReportType): Promise<string> {
        let reportType: string = 'xmlreport';

        // Set report type
        if (type == ReportType.XML) { reportType = Constants.XmlReport; }
        if (type == ReportType.HTML) { reportType = Constants.HtmlReport; } 
        if (type == ReportType.MD) { reportType = Constants.MdReport; }

        this.requestOptions.uri = `${this.requestOptions.uri}/${reportType}/`;

        Task.debug(`Active Scan Results | ZAP API Call: ${this.requestOptions.uri} | Request Options: ${JSON.stringify(this.requestOptions)}`);

        return new Promise<string>((resolve, reject) => {
            RequestPromise(this.requestOptions)
                .then((res: any) => {
                    resolve(res);
                })
                .error((err: any) => {
                    reject("");
                });
        });
    }

    async GenerateReport(reportType: string, destination: string, fileName: string): Promise<boolean> {
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

        let scanReport: string = await this.GetScanResults(type);
        
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

    PrintResult(highAlerts: number, mediumAlerts: number, lowAlerts: number): void {
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
}
