import * as fs from 'fs';
import * as path from 'path';
import * as Task from 'vsts-task-lib';
import * as Request from 'request';
import * as RequestPromise from 'request-promise';
import * as XmlParser from 'xmljson';

import { AlertItem } from './../interfaces/types/ZapReport';
import { AlertRowType, ReportType } from './../enums/Enums';
import { Constants } from './Constants';
import { Helpers } from './../classes/Helper';
import { AlertResult } from './../interfaces/types/AlertResult';
import { ZapScanReportOptions } from './../interfaces/types/ZapScan';
import { TaskInputs } from './../interfaces/types/TaskInputs';

export class Report {
    private _reportOptions: ZapScanReportOptions;
    private _requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions;  

    private _helpers: Helpers;    
    private _taskInputs: TaskInputs;

    constructor(helpers: Helpers, configInputs: TaskInputs) {
        this._helpers = helpers;
        this._taskInputs = configInputs;

        /* Report Options */
        this._reportOptions = {
            apikey: this._taskInputs.ZapApiKey,
            formMethod: 'GET'
        };

        /* Report Request Options */
        this._requestOptions = {
            // tslint:disable-next-line:no-http-string
            uri: `http://${this._taskInputs.ZapApiUrl}/OTHER/core/other`,
            qs: this._reportOptions
        };
    }

    GetScanResults(type: ReportType): Promise<string> {
        let reportType: string = 'xmlreport';

        /* Set report type */
        if (type === ReportType.XML) { reportType = Constants.XML_REPORT; }
        if (type === ReportType.HTML) { reportType = Constants.HTML_REPORT; } 
        if (type === ReportType.MD) { reportType = Constants.MD_REPORT; }

        this._requestOptions.uri = `${this._requestOptions.uri}/${reportType}/`;

        Task.debug(`Active Scan Results | ZAP API Call: ${this._requestOptions.uri} | Request Options: ${JSON.stringify(this._requestOptions)}`);

        return new Promise<string>((resolve, reject) => {
            RequestPromise(this._requestOptions)
                .then((res: any) => {
                    resolve(res);
                })
                .error((err: any) => {
                    reject(err.message || err);
                });
        });
    }

    async GenerateReport(): Promise<boolean> {
        let type: ReportType;
        let ext: string;
        let scanReport: string;

        const fileName = this._taskInputs.ReportFileName === '' ? 'OWASP-ZAP-Report' :  this._taskInputs.ReportFileName;
        const destination = this._taskInputs.ReportFileDestination === '' ? './' : this._taskInputs.ReportFileDestination;

        if (this._taskInputs.ReportType === Constants.XML) {
            type = ReportType.XML;
            ext = Constants.XML;
        } else if (this._taskInputs.ReportType === Constants.MARKDOWN) {
            type = ReportType.MD;
            ext = Constants.MARKDOWN;
        } else {
            type = ReportType.HTML;
            ext = Constants.HTML;
        }
        
        const fullFilePath: string = path.normalize(`${destination}/${fileName}.${ext}`);
        Task.debug(`Report Filename: ${fullFilePath}`);

        if (type === ReportType.HTML) {
            /* Get the Scan Result */
            const xmlResult: string = await this.GetScanResults(ReportType.XML);
            /* Sort and Count the Alerts */
            const processedAlerts: AlertResult = this._helpers.ProcessAlerts(xmlResult, this._taskInputs.TargetUrl);
            /* Generate the Custom HTML Report */
            scanReport = this.createCustomHtmlReport(processedAlerts);

        } else {
            scanReport = await this.GetScanResults(type);
        }        
        
        /* Write the File */
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

    PrintResult(highAlerts: number, mediumAlerts: number, lowAlerts: number, infoAlerts: number): void {
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
        console.log(`  Info Risk    | ${infoAlerts}`);
        console.log('__________________________');
    }

    private createCustomHtmlReport(alertResult: AlertResult): string {
        let alertHtmlTables: string = '';

        for (const idx of Object.keys(alertResult.Alerts)) {
            alertHtmlTables += `
                ${this.createAlertTable(alertResult.Alerts[Number(idx)])}

            `;
        }

        const htmlLayout: string = `
            <html>
            <head>
                <META http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <title>ZAP Scanning Report</title>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous" />
                <script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
                <style>
                    p {
                        margin-bottom: 0;
                    }

                    .legend {
                        font-size: 1.0em; 
                        color: #fff
                    }
                    
                    .legend a, .alert-header-link {
                        text-decoration: none;
                        color: #fff;
                    }
            
                    .legend a:hover, .alert-header-link:hover {
                        color: #222222;
                        text-decoration: none;
                    }
            
                    .attribute {
                        font-weight: bold;
                        font-size: 1.3em;
                    }
            
                    .alert-header {
                        font-size: 1.4em;
                        font-weight: 100;
                        color: #fff;
                    }

                    .bg-low {
                        background-color: #d8c226!important;
                    }
                </style>
            </head>
            
            <body class="container-fluid" style="padding: 0 3em">
                <div style="padding: 32px 0;">
                    <h1 class="display-3">ZAP Scanning Report</h1>
                    <p class="lead" >Project : <em>${this._taskInputs.BuildDefinitionName || ''}</em></p>
                    <p class="lead" >Completed on : <em>${new Date().toUTCString()}</em></p>
                    <hr class="my-4">
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <h2>Summary of Alerts</h2>
                        <hr>
                        <table class="table">
                            <thead class="thead-inverse">
                                <tr>
                                    <th>Risk Level</th>
                                    <th>Number of Alerts</th>
                                </tr>
                            </thead>
                            <tr class="bg-danger legend">
                                <td><a href="#3">High</a></td>
                                <td>${alertResult.HighAlerts}</td>
                            </tr>
                            <tr class="bg-warning legend">
                                <td><a href="#2">Medium</a></td>
                                <td>${alertResult.MediumAlerts}</td>
                            </tr>
                            <tr class="bg-low legend">
                                <td><a href="#1">Low</a></td>
                                <td>${alertResult.LowAlerts}</td>
                            </tr>
                            <tr class="bg-success legend">
                                <td><a href="#0">Informational</a></td>
                                <td>${alertResult.InformationalAlerts}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <br><br>
                <div class="row">
                    <div class="col-md-12">
                        <h2>Alert Detail</h2>
                        <p class="lead">Click on the risk type header to expand the details panel for the risk</p>
                        <hr>                
                        ${alertHtmlTables}
                    </div>
                </div>
            </body>
            </html>            
        `;

        return htmlLayout;
    }

    private createAlertTable(alert: AlertItem): string {
        let cssClass: string = 'bg-success';
        // tslint:disable-next-line:insecure-random
        const collapseId: string = String(Math.floor(Math.random() * 10000));
        let tableRows: string = '';
        let instanceRows: string = '';

        switch (alert.riskcode) {
            case Constants.HIGH_RISK:
                cssClass = 'bg-danger';
                break;
            case Constants.MEDIUM_RISK:
                cssClass = 'bg-warning';
                break;
            case Constants.LOW_RISK:
                cssClass = 'bg-low';
                break;        
            case Constants.INFO_RISK:
                cssClass = 'bg-success';
                break;
        }

        for (const idx of Object.keys(alert.instances.instance)) {
            const i: number = Number(idx);

            if (alert.instances.instance[i]) {
                instanceRows += `
                    ${alert.instances.instance[i].uri ? this.createAlertRow('URL', alert.instances.instance[i].uri, AlertRowType.InstanceRow) : ''}
                    ${alert.instances.instance[i].method ? this.createAlertRow('&nbsp;&nbsp;&nbsp;&nbsp;Method', alert.instances.instance[i].method, AlertRowType.InstanceRow) : ''}
                    ${alert.instances.instance[i].evidence ? this.createAlertRow('&nbsp;&nbsp;&nbsp;&nbsp;Evidence', alert.instances.instance[i].evidence, AlertRowType.InstanceRow) : ''}
                    ${alert.instances.instance[i].param ? this.createAlertRow('&nbsp;&nbsp;&nbsp;&nbsp;Parameters', alert.instances.instance[i].param, AlertRowType.InstanceRow) : ''}
                    ${alert.instances.instance[i].attack ? this.createAlertRow('&nbsp;&nbsp;&nbsp;&nbsp;Attack', alert.instances.instance[i].attack, AlertRowType.InstanceRow) : ''}
                `; 
            }            
        }

        tableRows = `
            ${this.createAlertRow('Description', alert.desc)}
            ${instanceRows}
            ${this.createAlertRow('Instances', alert.count)}
            ${this.createAlertRow('Solution', alert.solution)}
            ${this.createAlertRow('Confidence', alert.confidence)}
            ${this.createAlertRow('Reference', alert.reference)}
            ${this.createAlertRow('CWE ID', alert.cweid)}
            ${this.createAlertRow('WASC ID', alert.wascid)}
            ${this.createAlertRow('Source ID', alert.sourceid)}
        `;

        const htmlString: string = `
        <table class="table">
            <tr class="${cssClass}" height="24">
                <td width="20%"><p class="alert-header"><a name="${alert.riskcode}" class="alert-header-link" data-toggle="collapse" href="#collapseBlock${collapseId}" aria-expanded="false" aria-controls="collapseExample" >${alert.riskdesc}</a></p></td>
                <td width="80%"><p class="alert-header">${alert.name}</p></td>
            </tr>
            <tbody class="collapse" id="collapseBlock${collapseId}">
                ${tableRows}
            </tbody>
        </table>
        `;

        return htmlString;
    }

    private createAlertRow(header: string, value: string, rowType: AlertRowType = AlertRowType.AlertRow): string {
        let cssClass: string = 'attribute';

        if (rowType === AlertRowType.InstanceRow) {
            cssClass = 'font-italic';
        }

        const htmlString: string = `
        <tr>
            <td width="20%">
                <p class="lead ${cssClass}" style="font-size: 1.1em;">${header}</p>
            </td>
            <td width="80%">
                <p class="lead">${value}</p>
            </td>
        </tr>
        `;
        return htmlString;
    }
}
