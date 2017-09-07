import * as RequestPromise from 'request-promise';
import * as Task from 'vsts-task-lib';

import { ZapScanBase } from './ZapScanBase';
import { IZapScan } from './../interfaces/contracts/IZapScan';
import { ScanResult } from './../interfaces/types/ScanResult';
import { ZapSpiderScanOptions, ZapScanResult, ZapScanStatus } from '../interfaces/types/ZapScan';
import { ZapScanType } from '../enums/Enums';
import { TaskInputs } from './../interfaces/types/TaskInputs';

export class SpiderScan extends ZapScanBase {
    zapScanType: ZapScanType = ZapScanType.Spider;
    private _scanOptions: ZapSpiderScanOptions;    

    constructor(taskInputs: TaskInputs) {
        super(taskInputs);

        /* Set Scan Type for Logging */
        this.scanType = 'Spider Scan';

        /* Spider Scan Options */
        this._scanOptions = {
            apikey: this.taskInputs.ZapApiKey,
            url: this.taskInputs.TargetUrl,        
            maxChildren: this.taskInputs.MaxChildrenToCrawl,
            recurse: String(this.taskInputs.RecurseSpider),
            subtreeOnly: String(this.taskInputs.SubTreeOnly),
            contextName: this.taskInputs.ContextName,
            formMethod: 'GET',
            zapapiformat: 'JSON'
        };

        /* Scan Request Options */
        this.requestOptions = {
            // tslint:disable-next-line:no-http-string
            uri: `http://${this.taskInputs.ZapApiUrl}/JSON/spider/action/scan/`,
            qs: this._scanOptions
        };   
    }
    
    ExecuteScan(): Promise<ScanResult> {
        const scanResult: ScanResult = { Success: false };

        Task.debug(`${this.scanType} | Target URL: ${this.requestOptions.uri} | Scan Options: ${JSON.stringify(this._scanOptions)}`);

        return new Promise<ScanResult>((resolve, reject) => {
            RequestPromise(this.requestOptions)
                .then(async (res: any) => {

                    const result: ZapScanResult = JSON.parse(res);
                    console.log(`OWASP ZAP Spider Scan Initiated. ID: ${result.scan}`);

                    scanResult.Success = await this.CheckScanStatus(result.scan, this.zapScanType);
                    if (!scanResult.Success) {
                        scanResult.Message = 'Spider Scan status check failed.';
                        reject(scanResult);
                    }
                    
                    resolve(scanResult);
                })
                .error((err: any) => {
                    scanResult.Success = false;
                    scanResult.Message = err.message || err;

                    reject(scanResult);
                }); 
        });        
    }
}