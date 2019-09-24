import { ZapScanBase } from './ZapScanBase';
import { ScanResult } from './../interfaces/types/ScanResult';
import { ZapSpiderScanOptions } from '../interfaces/types/ZapScan';
import { ZapScanType } from '../enums/Enums';
import { TaskInput } from './TaskInput';

export class SpiderScan extends ZapScanBase {
    zapScanType: ZapScanType = ZapScanType.Spider;
    private _scanOptions: ZapSpiderScanOptions;    

    constructor(taskInputs: TaskInput) {
        super(taskInputs);

        /* Set Scan Type for Logging */
        this.scanType = 'Spider Scan';
        this.apiScanType = 'spider';

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
        return super.ExecuteScan();
    }
}