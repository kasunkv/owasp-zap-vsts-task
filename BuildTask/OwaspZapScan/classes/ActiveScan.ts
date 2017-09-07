import * as RequestPromise from 'request-promise';
import * as Task from 'vsts-task-lib';

import { ZapScanBase } from './ZapScanBase';
import { ScanResult } from './../interfaces/types/ScanResult';
import { ZapActiveScanOptions, ZapScanResult, ZapScanStatus } from './../interfaces/types/ZapScan';
import { IZapScan } from './../interfaces/contracts/IZapScan';
import { ZapScanType } from '../enums/Enums';
import { TaskInputs } from './../interfaces/types/TaskInputs';

export class ActiveScan extends ZapScanBase {
    zapScanType: ZapScanType = ZapScanType.Active;    
    private _scanOptions: ZapActiveScanOptions;    

    constructor(taskInputs: TaskInputs) {
        super(taskInputs);
        
        /* Set Scan Type for Logging */
        this.scanType = 'Active Scan';

        /* Active Scan Options */
        this._scanOptions = {
            apikey: this.taskInputs.ZapApiKey,
            url: this.taskInputs.TargetUrl,
            contextId: this.taskInputs.ContextId,
            method: this.taskInputs.Method,
            inScopeOnly: String(this.taskInputs.InScopeOnly),
            recurse: String(this.taskInputs.Recurse),
            scanPolicyName: this.taskInputs.ScanPolicyName,
            postData: this.taskInputs.PostData,
            zapapiformat: 'JSON',
            formMethod: 'GET'
        };

        /* Scan Request Options */
        this.requestOptions = {
            // tslint:disable-next-line:no-http-string
            uri: `http://${this.taskInputs.ZapApiUrl}/JSON/ascan/action/scan/`,
            qs: this._scanOptions
        };
    }

    ExecuteScan(): Promise<ScanResult> {
        const scanResult: ScanResult = { Success: false };

        Task.debug('*** Initiate the Active Scan ***');
        Task.debug(`Target URL: ${this.requestOptions.uri}`);
        Task.debug(`Scan Options: ${JSON.stringify(this._scanOptions)}`);

        return new Promise<ScanResult> ((resolve, reject) => {
            RequestPromise(this.requestOptions)
                .then(async (res: any) => {

                    const result: ZapScanResult = JSON.parse(res);
                    console.log(`OWASP ZAP Active Scan Initiated. ID: ${result.scan}`);
                    
                    scanResult.Success = await this.CheckScanStatus(result.scan, this.zapScanType);
                    if (!scanResult.Success) {
                        scanResult.Message = 'Active Scan status check failed.';
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