require('dotenv').config();
import * as path from 'path';
import * as fs from 'fs';
import * as expect from 'expect';
import * as sinon from 'sinon';

import { RequestService } from './../OwaspZapScan/classes/RequestService';
import { Helper } from './../OwaspZapScan/classes/Helper';
import { Report } from './../OwaspZapScan/classes/Report';
import { TaskInput } from './../OwaspZapScan/classes/TaskInput';
import { Verify } from './../OwaspZapScan/classes/Verify';
import { AlertItem } from './../OwaspZapScan/interfaces/types/ZapReport';
import { AlertResult } from './../OwaspZapScan/interfaces/types/AlertResult';


describe('OWASP Zap Scan Verify ', () => {
    describe('When verifying scan results', () => {
        let taskInput: TaskInput = new TaskInput();
        taskInput.ZapApiKey = 'empty';
        taskInput.ZapApiUrl = 'empty';
        taskInput.TargetUrl = 'empty';

        let report: Report;
        let helper: Helper;
        let requestService: RequestService;
        let verify: Verify;

        let xmlString: string;

        beforeEach(() => {
            // Stub Helper
            helper = new Helper();
            const alertResults: AlertResult = {
                HighAlerts: 3,
                MediumAlerts: 3,
                LowAlerts: 3,
                InformationalAlerts: 3,
                Alerts: Array<AlertItem>()
            };
            sinon.stub(helper, 'ProcessAlerts').returns(alertResults);

            // Stub RequestService
            requestService = new RequestService();                
            sinon.stub(requestService, 'ExecuteScanResultQuery').returns('');

            // Stub Report
            report = new Report(helper, requestService, taskInput);
            let mdPath = path.join(__dirname, 'valid.xml');
            xmlString = fs.readFileSync(mdPath, 'utf8');
            sinon.stub(report, 'GetScanResults').returns(xmlString);
            sinon.stub(report, 'PrintResult');

        });
        
        describe('When Assert is called', () => {           

            beforeEach(() => {
                                
            });

            it('Should not run verification when its not enabled', () => {
                taskInput.EnableVerifications = true;                
                verify = new Verify(helper, report, taskInput);
                expect(verify.Assert());
            });

            it('Should run verification when its enabled and fail', () => {
                taskInput.EnableVerifications = true;
                taskInput.MaxHighRiskAlerts = 2;
                taskInput.MaxMediumRiskAlerts = 2;
                taskInput.MaxLowRiskAlerts = 2;                

                verify = new Verify(helper, report, taskInput);
                expect(verify.Assert());
            });

            it('Should run verification when its enabled and pass', () => {
                taskInput.EnableVerifications = true;
                taskInput.MaxHighRiskAlerts = 5;
                taskInput.MaxMediumRiskAlerts = 5;
                taskInput.MaxLowRiskAlerts = 5;                

                verify = new Verify(helper, report, taskInput);
                expect(verify.Assert());
            });

        });

    });
});