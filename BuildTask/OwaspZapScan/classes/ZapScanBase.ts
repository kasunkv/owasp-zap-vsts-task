import * as Task from 'vsts-task-lib';
import * as Request from 'request';
import * as RequestPromise from 'request-promise';
// tslint:disable-next-line:no-require-imports
import sleep =  require('thread-sleep');

import { IZapScan } from './../interfaces/contracts/IZapScan';
import { ScanResult } from '../interfaces/types/ScanResult';
import { ZapScanResult, ZapScanStatus, ZapActiveScanOptions, ZapScanStatusOptions } from '../interfaces/types/ZapScan';
import { ZapScanType } from './../enums/Enums';

export abstract class ZapScanBase implements IZapScan {
    zapScanType: ZapScanType;
    scanType: string;    
    requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions;

    constructor(public zapApiUrl: string, public zapApiKey: string) { }

    ExecuteScan(): Promise<ScanResult> {
        throw new Error('Not implemented yet.');
    }

    protected CheckScanStatus(scanId: number, scanType: ZapScanType): Promise<boolean> {
        let previousScanStatus: number = 0;
        let scanCompleted: boolean = false;

        return new Promise<boolean>(async (resolve, reject) => {
            try {
                // tslint:disable-next-line:no-constant-condition
                while (true) {
                    sleep(10000);
                    const scanStatus: number = await this.GetScanStatus(scanId, scanType);

                    if (scanStatus < 0) {
                        throw new Error(`Failed to get ${this.scanType} status.`);
                    }

                    if (scanStatus >= 100) {
                        console.log(`${this.scanType} In Progress: ${scanStatus}%`);
                        console.log(`${this.scanType} Complete.`);
                        console.log('---------------------------------------');
                        scanCompleted = true;
                        break;
                    }

                    if (previousScanStatus !== scanStatus) {
                        console.log(`${this.scanType} In Progress: ${scanStatus}%`);
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

    protected GetScanStatus(scanId: number, scanType: ZapScanType): Promise<number> {
        let zapScanType: string = '';
        const statusOptions: ZapScanStatusOptions = {
            zapapiformat: 'JSON',
            apikey: this.zapApiKey,
            formMethod: 'GET',
            scanId: scanId
        };
        
        if (scanType === ZapScanType.Active) { zapScanType = 'ascan'; }
        else if (scanType === ZapScanType.Spider) { zapScanType = 'spider'; }
        else if (scanType === ZapScanType.AjaxSpider) { zapScanType = 'ajaxSpider'; }

        const requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
            // tslint:disable-next-line:no-http-string
            uri: `http://${this.zapApiUrl}/JSON/${zapScanType}/view/status/`,
            qs: statusOptions
        };

        Task.debug(`${this.scanType} | ZAP API Call: ${this.requestOptions.uri} | Request Options: ${JSON.stringify(statusOptions)}`);

        return new Promise<number>((resolve, reject) => {
            RequestPromise(requestOptions)
                .then((res: any) => {
                    const result: ZapScanStatus = JSON.parse(res);
                    Task.debug(`${this.scanType} | Status Result: ${JSON.stringify(res)}`);                    
                    resolve(result.status);
                })
                .error((err: any) => {
                    reject(err);
                });
        });
    }    
}