import * as Request from 'request';
import * as RequestPromise from 'request-promise';
import * as Task from 'vsts-task-lib';
import * as sleep from 'thread-sleep';

import * as ZapRequest from './zapRequest';
import { IZapScan } from './IZapScan';
import { ScanResult } from './scanResult';

export class ActiveScan implements IZapScan {    
    public ScanType: string = 'Active Scan';
    requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions;
    scanOptions: ZapRequest.ZapActiveScanOptions;

    constructor(
        public zapApiUrl: string,
        public zapApiKey: string,
        public targetUrl: string,
        public contextId: string,
        public recurse: boolean,
        public inScopeOnly: boolean,
        public scanPolicyName: string,
        public method: string,
        public postData: string
    ) {
        // Active Scan Options
        this.scanOptions = {
            apikey: zapApiKey,
            url: targetUrl,
            contextId: contextId,
            method: method,
            inScopeOnly: String(inScopeOnly),
            recurse: String(recurse),
            scanPolicyName: scanPolicyName,
            postData: postData,
            zapapiformat: 'JSON',
            formMethod: 'GET'
        };

        // Scan Request Options
        this.requestOptions = {
            uri: `http://${zapApiUrl}/JSON/ascan/action/scan/`,
            qs: this.scanOptions
        };
    }

    ExecuteScan(): Promise<ScanResult> {
        let scanResult: ScanResult = { Success: false };

        Task.debug('*** Initiate the Active Scan ***');
        Task.debug(`Target URL: ${this.requestOptions.uri}`);
        Task.debug(`Scan Options: ${JSON.stringify(this.scanOptions)}`);

        return new Promise<ScanResult> ((resolve, reject) => {
            RequestPromise(this.requestOptions)
                .then(async (res: any) => {

                    let result: ZapRequest.ZapScanResult = JSON.parse(res);
                    console.log(`OWASP ZAP Active Scan Initiated. ID: ${result.scan}`);
                    
                    scanResult.Success = await this.checkSpiderScanStatus(result.scan);
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

    private checkSpiderScanStatus(scanId: number): Promise<boolean> {
        let previousScanStatus: number = 0;
        let scanCompleted: boolean = false;

        return new Promise<boolean>(async (resolve, reject) => {
            try {
                while (true) {
                    sleep(10000);
                    let scanStatus: number = await this.getActiveScanStatus(scanId);

                    if (scanStatus < 0) {
                        throw new Error('Failed to get active scan status.');
                    }

                    if(scanStatus >= 100) {
                        console.log(`Active Scan In Progress: ${scanStatus}%`);
                        console.log('Active Scan Complete.');
                        console.log('---------------------------------------');
                        scanCompleted = true;
                        break;
                    }

                    if (previousScanStatus != scanStatus) {
                        console.log(`Active Scan In Progress: ${scanStatus}%`);
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

    private getActiveScanStatus(scanId: number): Promise<number> {
        let statusOptions: ZapRequest.ZapActiveScanStatusOptions = {
            zapapiformat: 'JSON',
            apikey: this.zapApiKey,
            formMethod: 'GET',
            scanId: scanId
        };

        let requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
            uri: `http://${this.zapApiUrl}/JSON/ascan/view/status/`,
            qs: statusOptions
        };

        Task.debug(`${this.ScanType} | ZAP API Call: ${this.requestOptions.uri} | Request Options: ${JSON.stringify(statusOptions)}`);

        return new Promise<number>((resolve, reject) => {
            RequestPromise(requestOptions)
                .then((res: any) => {
                    let result: ZapRequest.ZapScanStatus = JSON.parse(res);
                    Task.debug(`${this.ScanType} | Status Result: ${JSON.stringify(res)}`);                    
                    resolve(result.status);
                })
                .error((err: any) => {
                    reject(-1);
                });
        });
    }
}