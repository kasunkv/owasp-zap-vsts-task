import * as Task from 'vsts-task-lib';
import * as Request from 'request';
import * as RequestPromise from 'request-promise';
// tslint:disable-next-line:no-require-imports
import sleep =  require('thread-sleep');
// tslint:disable-next-line:no-require-imports
import escapeStringRegexp = require('escape-string-regexp');

import { IZapScan } from './../interfaces/contracts/IZapScan';
import { ScanResult } from '../interfaces/types/ScanResult';
import { ZapScanResult, ZapScanStatus, ZapActiveScanOptions, ZapScanStatusOptions } from '../interfaces/types/ZapScan';
import { ZapScanType } from './../enums/Enums';
import { TaskInput } from './TaskInput';
import { RequestService } from './RequestService';
import { ZapApiHelper } from './ZapApiHelper';

export abstract class ZapScanBase implements IZapScan {
    zapScanType: ZapScanType;
    scanType: string;
    apiScanType: string;
    requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions;
    protected taskInputs: TaskInput;
    protected apiHelper: ZapApiHelper;

    constructor(taskInputs: TaskInput) {
        this.taskInputs = taskInputs;
        this.apiHelper = new ZapApiHelper(taskInputs);
    }

    ExecuteScan(): Promise<ScanResult> {
        return new Promise<ScanResult>(async (resolve, reject) => {
            let scanResult: ScanResult = { Success: false };
            
            if (this.taskInputs.FilterScans) {
                await this.AddScanFilter();
            }

            scanResult = await this.ExecuteScanPromise();
            
            if (this.taskInputs.FilterScans) {
                await this.ClearScanFilter();
            }

            console.log('---------------------------------------');
            resolve(scanResult);
        });
    }

    ExecuteScanPromise(): Promise<ScanResult> {
        Task.debug(`${this.scanType} | Target URL: ${this.requestOptions.uri} | Scan Options: ${JSON.stringify(this.requestOptions.qs)}`);
        
        const scanResult: ScanResult = { Success: false };
        
        return new Promise<ScanResult>((resolve, reject) => {
            RequestPromise(this.requestOptions)
                .then(async (res: any) => {
                    const result: ZapScanResult = JSON.parse(res);
                    console.log(`OWASP ZAP ${this.scanType} Initiated. ID: ${result.scan}`);

                    scanResult.Success = await this.CheckScanStatus(result.scan, this.zapScanType);
                    if (!scanResult.Success) {
                        scanResult.Message = `${this.scanType} status check failed.`;
                        reject(scanResult);
                    }                    
                    resolve(scanResult);
                })
                .catch((err: any) => {
                    scanResult.Success = false;
                    scanResult.Message = err.message || err;
                    reject(scanResult);
                }); 
        });
    }

    AddScanFilter(): Promise<number> {
        const statusOptions  = {
            apikey: this.taskInputs.ZapApiKey,
            regex: '^((?!' + escapeStringRegexp(this.taskInputs.TargetUrl) + ').)*$'
        };

       const requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
            // tslint:disable-next-line:no-http-string
            uri: `http://${this.taskInputs.ZapApiUrl}/JSON/${this.apiScanType}/action/excludeFromScan`,
            qs: statusOptions
        };

       console.log(`Setting ${this.scanType} filter to target url`);
       Task.debug(`Regex: ${statusOptions.regex}`);
       Task.debug(`ZAP API Call: ${requestOptions.uri} | Request Options: ${JSON.stringify(statusOptions)}`);
       return this.apiHelper.MakeZapRequest(requestOptions, 'Successfully set scan filter');
    }

    ClearScanFilter(): Promise<number> {
        const statusOptions  = {
            apikey: this.taskInputs.ZapApiKey
        };

       const requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
            // tslint:disable-next-line:no-http-string
            uri: `http://${this.taskInputs.ZapApiUrl}/JSON/${this.apiScanType}/action/clearExcludedFromScan/`,
            qs: statusOptions
        };

       console.log(`Resetting scan filter for ${this.scanType}`);
       Task.debug(`ZAP API Call: ${requestOptions.uri} | Request Options: ${JSON.stringify(statusOptions)}`);
       return this.apiHelper.MakeZapRequest(requestOptions, 'Successfully reset scan filter');
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
            apikey: this.taskInputs.ZapApiKey,
            formMethod: 'GET',
            scanId: scanId
        };
        
        if (scanType === ZapScanType.Active) { zapScanType = 'ascan'; }
        else if (scanType === ZapScanType.Spider) { zapScanType = 'spider'; }
        else if (scanType === ZapScanType.AjaxSpider) { zapScanType = 'ajaxSpider'; }

        const requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
            // tslint:disable-next-line:no-http-string
            uri: `http://${this.taskInputs.ZapApiUrl}/JSON/${zapScanType}/view/status/`,
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
                .catch((err: any) => {
                    reject(err.message || err);
                });
        });
    }    
}