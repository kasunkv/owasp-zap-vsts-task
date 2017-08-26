import * as fs from 'fs';
import * as path from 'path';
import * as Task from 'vsts-task-lib';
import * as Request from 'request';
import * as RequestPromise from 'request-promise';
import * as sleep from 'thread-sleep';
import * as XmlParser from 'xmljson';

import { AlertItem } from './../interfaces/types/ZapReport';
import { AlertRowType, ReportType } from './../enums/Enums';
import { Constants } from './constants';
import { Helpers } from './../classes/Helper';
import { AlertResult } from './../interfaces/types/AlertResult';
import { ZapScanReportOptions } from './../interfaces/types/ZapScan';

export class Report {
    reportOptions: ZapScanReportOptions;
    requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions;
    private _targetUrl: string;
    private _projectName: string;
    private _buildDefinitionName: string;
    private _helper: Helpers;


    constructor(public zapApiUrl: string, public zapApiKey: string) {
        this._targetUrl = Task.getInput('TargetUrl', true);
        this._projectName = Task.getVariable('Build.Repository.Name');
        this._buildDefinitionName = Task.getVariable('Build.DefinitionName');

        this._helper = new Helpers();

        /* Report Options */
        this.reportOptions = {
            apikey: zapApiKey,
            formMethod: 'GET'
        };

        /* Report Request Options */
        this.requestOptions = {
            uri: `http://${this.zapApiUrl}/OTHER/core/other`,
            qs: this.reportOptions
        };
    }

    GetScanResults(type: ReportType): Promise<string> {
        let reportType: string = 'xmlreport';

        /* Set report type */
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
        let scanReport: string;

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

        if (type == ReportType.HTML) {
            let xmlResult: string = await this.GetScanResults(ReportType.XML);
            let processedAlerts: AlertResult = this._helper.ProcessAlerts(xmlResult, this._targetUrl);
            scanReport = this.createCustomHtmlReport(processedAlerts);

        } else {
            scanReport = await this.GetScanResults(type);
        }        
        
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

        for (let idx in alertResult.Alerts) {
            alertHtmlTables += `
                ${this.createAlertTable(alertResult.Alerts[idx])}

            `;
        }

        let htmlLayout: string = `
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
                </style>
            </head>
            
            <body class="container-fluid" style="padding: 0 3em">
                <div style="padding: 32px 0;">
                    <h1 class="display-3">ZAP Scanning Report</h1>
                    <p class="lead" >Project : <em>${this._projectName}</em></p>
                    <p class="lead" >Build Definition : <em>${this._buildDefinitionName}</em></p>
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
                                <td><a href="#high">High</a></td>
                                <td>${alertResult.HighAlerts}</td>
                            </tr>
                            <tr class="bg-warning legend">
                                <td><a href="#medium">Medium</a></td>
                                <td>${alertResult.MediumAlerts}</td>
                            </tr>
                            <tr class="bg-info legend">
                                <td><a href="#low">Low</a></td>
                                <td>${alertResult.LowAlerts}</td>
                            </tr>
                            <tr class="bg-success legend">
                                <td><a href="#info">Informational</a></td>
                                <td>${alertResult.InformationalAlerts}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <br><br>
                <div class="row">
                    <div class="col-md-12">
                        <h2>Alert Detail</h2>
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
        let collapseId: string = String(Math.floor(Math.random() * 10000));
        let tableRows: string = '';
        let instanceRows: string = '';

        switch (alert.riskcode) {
            case Constants.HighRisk:
                cssClass = 'bg-danger';
                break;
            case Constants.MediumRisk:
                cssClass = 'bg-warning';
                break;
            case Constants.LowRisk:
                cssClass = 'bg-info';
                break;
        
            case Constants.InfoRisk:
                cssClass = 'bg-danger';
                break;
        }

        for(let idx in alert.instances.instance) {
            instanceRows += `
                ${this.createAlertRow('URL', alert.instances.instance[idx].uri, AlertRowType.InstanceRow)}
                ${this.createAlertRow('&nbsp;&nbsp;&nbsp;&nbsp;Method', alert.instances.instance[idx].method, AlertRowType.InstanceRow)}
                ${this.createAlertRow('&nbsp;&nbsp;&nbsp;&nbsp;Evidence', alert.instances.instance[idx].evidence, AlertRowType.InstanceRow)}
            `; 
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

        let htmlString: string = `
        <table class="table">
            <tr class="${cssClass}" height="24">
                <td width="20%"><p class="alert-header"><a name="medium" class="alert-header-link" data-toggle="collapse" href="#collapseBlock${collapseId}" aria-expanded="false" aria-controls="collapseExample" >${alert.riskdesc}</a></p></td>
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

        if (rowType == AlertRowType.InstanceRow) {
            cssClass = 'font-italic';
        }

        let htmlString: string = `
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
