import { ZapActiveScanOptions } from './ZapClientOptions';

import task = require('vsts-task-lib');
import path = require('path');
import request = require('request');

task.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    let zapBaseUrl: string = 'http://zap.k2vsoftware.com/';
    let apiKey: string = '8rs46ftps4st59970at65d7qim';
    let targetUrl: string = 'http://k2vowasptestsite.azurewebsites.net/';

    let activeScanOptions: ZapActiveScanOptions = {
        zapapiformat: 'JSON',
        apikey: apiKey,
        formMethod: 'GET',
        url: targetUrl
    };
    
    let requestOptions: request.CoreOptions = {
        qs: activeScanOptions
    };

    request
        .get(`${zapBaseUrl}JSON/ascan/action/scan/`, requestOptions, (err, res, body) => {
            if (err) {
                throw new Error('Error initiating active scan');
            }

            console.log(body);
        });
}

run();

