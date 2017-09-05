import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import * as mock from 'vsts-task-lib/mock-test';
import * as expect from 'expect';

import { Helpers } from '../OwaspZapScan/classes/Helper';
import { AlertResult } from './../OwaspZapScan/interfaces/types/AlertResult';

describe('OWASP Zap Scan Helpers', function() {
    describe('When a valid xmlReport and a url is passed, the return value', () => {
        let helper: Helpers;
        let xmlString: string;
        let result: AlertResult;
        const validTargetUrl: string = 'http://k2vowasptestsite.azurewebsites.net';
        const invalidTargetUrl: string = 'http://k2vowasptestsite-invalid.azurewebsites.net';
    
        before(() => {
            helper = new Helpers();
            let xmlPath = path.join(__dirname, 'report.xml');
            xmlString = fs.readFileSync(xmlPath, 'utf8');
            result = helper.ProcessAlerts(xmlString, validTargetUrl);
        });
    
        it('Should not be undefined', () => {            
            expect(result).toNotBe(undefined);
        });

        it('Should not be null', () => {
            expect(result).toNotBe(null);
        });

        it('Should contain an array of alerts',  () => {
            expect(result.Alerts).toBeAn(Array);
        });

        it('Should contain one or many alerts',  () => {
            expect(result.Alerts.length).toBeGreaterThan(0);
        });

        it('Should have 0 high risk alerts', () => {
            expect(result.HighAlerts).toBe(0);
        });

        it('Should have 2 medium risk alerts', () => {
            expect(result.MediumAlerts).toBe(2);
        });

        it('Should have 3 low risk alerts', () => {
            expect(result.LowAlerts).toBe(3);
        });

        it('Should have 0 info risk alerts', () => {
            expect(result.InformationalAlerts).toBe(0);
        });
    });

    describe('When a valid xmlReport and an invalid url is passed, the return value', () => {
        let helper: Helpers;
        let xmlString: string;
        let result: AlertResult;
        const invalidTargetUrl: string = 'http://k2vowasptestsite-invalid.azurewebsites.net';
    
        before(() => {
            helper = new Helpers();
            let xmlPath = path.join(__dirname, 'report.xml');
            xmlString = fs.readFileSync(xmlPath, 'utf8');
            result = helper.ProcessAlerts(xmlString, invalidTargetUrl);
        });
    
        it('Should throw an exception', () => {            
            expect(result).toNotBe(undefined);
        });

        it('Should not be null', () => {
            expect(result).toNotBe(null);
        });

        it('Should contain an array of alerts',  () => {
            expect(result.Alerts).toBeAn(Array);
        });

        it('Should not contain any alerts',  () => {
            expect(result.Alerts.length).toBe(0);
        });

        it('Should have 0 high risk alerts', () => {
            expect(result.HighAlerts).toBe(0);
        });

        it('Should have 0 medium risk alerts', () => {
            expect(result.MediumAlerts).toBe(0);
        });

        it('Should have 0 low risk alerts', () => {
            expect(result.LowAlerts).toBe(0);
        });

        it('Should have 0 info risk alerts', () => {
            expect(result.InformationalAlerts).toBe(0);
        });
    });

    describe('When an invalid xmlReport and a valid url is passed, the return value', () => {
        let helper: Helpers;
        let xmlString: string;
        let result: AlertResult;
        const validTargetUrl: string = 'http://k2vowasptestsite.azurewebsites.net';
    
        before(() => {
            helper = new Helpers();
            let xmlPath = path.join(__dirname, 'invalid.xml');
            xmlString = fs.readFileSync(xmlPath, 'utf8');
            result = helper.ProcessAlerts(xmlString, validTargetUrl);
        });
    
        it('Should not be undefined', () => {            
            expect(result).toNotBe(undefined);
        });

        it('Should not be null', () => {
            expect(result).toNotBe(null);
        });

        it('Should contain an array of alerts',  () => {
            expect(result.Alerts).toBeAn(Array);
        });

        it('Should not contain any alerts',  () => {
            expect(result.Alerts.length).toBe(0);
        });

        it('Should have 0 high risk alerts', () => {
            expect(result.HighAlerts).toBe(0);
        });

        it('Should have 0 medium risk alerts', () => {
            expect(result.MediumAlerts).toBe(0);
        });

        it('Should have 0 low risk alerts', () => {
            expect(result.LowAlerts).toBe(0);
        });

        it('Should have 0 info risk alerts', () => {
            expect(result.InformationalAlerts).toBe(0);
        });
    });
    
});


describe('OWASP ZAP Scan Task Tests', function () {
    before(() => {});

    after(() => {});

    it('Simple Test', (done: MochaDone) => {
        this.timeout(1000);

        done();                
    });
});