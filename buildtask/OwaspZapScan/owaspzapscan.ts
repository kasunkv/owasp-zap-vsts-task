import { ZapActiveScanOptions } from './ZapClientOptions';

import task = require('vsts-task-lib');
import path = require('path');
import request = require('request');
import requestPromise = require('request-promise');
import sleep = require('thread-sleep');
import xmlParser = require('xmljson');
import fs = require('fs');

task.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    // Get the required inputs
    let zapApiUrl: string = task.getInput('zapApiUrl', true);
    let zapApiKey: string = task.getInput('zapApiKey', true);
    let targetUrl: string = task.getInput('targetUrl', true);

    // Get the optional inputs
    let contextId: string = task.getInput('contextId');
    let recurse: boolean = task.getBoolInput('recurse');
    let inScopeOnly: boolean = task.getBoolInput('inScopeOnly');
    let scanPolicyName: string = task.getInput('scanPolicyName');
    let method: string = task.getInput('method');
    let postData: string = task.getInput('postData');

    let highAlertThreshold: number = parseInt(task.getInput('maxHighRiskAlerts'));
    let mediumAlertThreshold: number = parseInt(task.getInput('maxMediumRiskAlerts'));
    let lowAlertThreshold: number = parseInt(task.getInput('maxLowRiskAlerts'));
   
}

run();


// ZAP Request Interfaces
interface ZapScanOptionsBase {
    zapapiformat: string;
    formMethod: string;
    apikey: string;
}

interface ZapActiveScanOptions extends ZapScanOptionsBase {    
    url: string;
    recurse?: string;
    inScopeOnly?: string;
    scanPolicyName?: string;
    method?: string;
    postData?: string;
    contextId?: string;
}

interface ZapActiveScanStatusOptions extends ZapScanOptionsBase {
    scanId: number;
}

interface ZapScanReportOptions {
    formMethod: string;
    apikey: string;
}

interface ZapActiveScanResult {
    scan: number;
}

interface ZapActiveScanStatus {
    status: number;
}
