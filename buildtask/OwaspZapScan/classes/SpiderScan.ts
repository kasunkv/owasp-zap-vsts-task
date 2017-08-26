import * as Request from 'request';
import * as RequestPromise from 'request-promise';
import * as Task from 'vsts-task-lib';
import * as sleep from 'thread-sleep';

import { ZapScanBase } from './ZapScanBase';
import { IZapScan } from './../interfaces/contracts/IZapScan';
import { ScanResult } from './../interfaces/types/ScanResult';
import { ZapSpiderScanOptions, ZapScanResult, ZapScanStatus } from "../interfaces/types/ZapScan";
import { ZapScanType } from "../enums/Enums";

export class SpiderScan extends ZapScanBase {
    private zapScanType: ZapScanType = ZapScanType.Spider;
    private scanOptions: ZapSpiderScanOptions;

    constructor(
        public zapApiUrl: string,
        public zapApiKey: string,
        public targetUrl: string,
        public subTreeOnly: boolean, 
        public recurse: boolean, 
        public maxChildrenToCrawl: string,
        public contextName: string
    ) {
        super(zapApiUrl, zapApiKey);

        /* Set Scan Type for Logging */
        this.ScanType = 'Spider Scan';

        /* Spider Scan Options */
        this.scanOptions = {
            apikey: zapApiKey,
            url: targetUrl,        
            maxChildren: maxChildrenToCrawl,
            recurse: String(recurse),
            subtreeOnly: String(subTreeOnly),
            contextName: contextName,
            formMethod: 'GET',
            zapapiformat: 'JSON'
        };

        /* Scan Request Options */
        this.requestOptions = {
            uri: `http://${zapApiUrl}/JSON/spider/action/scan/`,
            qs: this.scanOptions
        };   
    }
    
    ExecuteScan(): Promise<ScanResult> {
        let scanResult: ScanResult = { Success: false };

        Task.debug(`${this.ScanType} | Target URL: ${this.requestOptions.uri} | Scan Options: ${JSON.stringify(this.scanOptions)}`);

        return new Promise<ScanResult>((resolve, reject) => {
            RequestPromise(this.requestOptions)
                .then(async (res: any) => {

                    let result: ZapScanResult = JSON.parse(res);
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