require('dotenv').config();
import * as expect from 'expect'

import { TaskInput } from './../OwaspZapScan/classes/TaskInput';

describe('OWASP Zap Scan Inputs', () => {
    describe('When invalid/no inputs are provided', () => {
        let taskInput: TaskInput;

        beforeEach(() => {
            taskInput = new TaskInput();
        });

        xit('Should throw an exception when ZapApiUrl is called', () => {
            expect(taskInput.ZapApiUrl).toThrow(new Error('The ZAP API URL is required but not set.'));
        });

        xit('Should throw an exception when ZapApiKey is called', () => {
            expect(taskInput.ZapApiKey).toThrow(new Error('The ZAP API Key is required but not set.'));
        });

        xit('Should throw an exception when ZapApiUrl is called', () => {
            expect(taskInput.TargetUrl).toThrow(new Error('The Target URL is required but not set.'));
        });

        it('Should return false when ClearSession is called', () => {
            expect(taskInput.ClearSession).toBeFalsy();
        });

        it('Should return false when FilterScans is called', () => {
            expect(taskInput.FilterScans).toBeFalsy();
        });

        it('Should return false when ExecuteSpiderScan is called', () => {
            expect(taskInput.ExecuteSpiderScan).toBeFalsy();
        });

        it('Should return false when RecurseSpider is called', () => {
            expect(taskInput.RecurseSpider).toBeFalsy();
        });

        it('Should return false when SubTreeOnly is called', () => {
            expect(taskInput.SubTreeOnly).toBeFalsy();
        });

        it('Should return empty string when MaxChildrenToCrawl is called', () => {
            expect(taskInput.MaxChildrenToCrawl).toEqual('');
        });

        it('Should return empty string when ContextName is called', () => {
            expect(taskInput.ContextName).toEqual('');
        });

        it('Should return false when ExecuteActiveScan is called', () => {
            expect(taskInput.ExecuteActiveScan).toBeFalsy();
        });

        it('Should return empty string when ContextId is called', () => {
            expect(taskInput.ContextId).toEqual('');
        });

        it('Should return false when Recurse is called', () => {
            expect(taskInput.Recurse).toBeFalsy();
        });

        it('Should return false when InScopeOnly is called', () => {
            expect(taskInput.InScopeOnly).toBeFalsy();
        });

        it('Should return empty string when ScanPolicyName is called', () => {
            expect(taskInput.ScanPolicyName).toEqual('');
        });

        it('Should return empty string when Method is called', () => {
            expect(taskInput.Method).toEqual('');
        });

        it('Should return empty string when PostData is called', () => {
            expect(taskInput.PostData).toEqual('');
        });

        it('Should return empty string when ReportType is called', () => {
            expect(taskInput.ReportType).toEqual('');
        });

        it('Should return empty string when ReportFileDestination is called', () => {
            expect(taskInput.ReportFileDestination).toEqual('');
        });

        it('Should return empty string when ReportFileName is called', () => {
            expect(taskInput.ReportFileName).toEqual('');
        });

        it('Should return empty string when ProjectName is called', () => {
            expect(taskInput.ProjectName).toEqual('');
        });

        it('Should return empty string when BuildDefinitionName is called', () => {
            expect(taskInput.BuildDefinitionName).toEqual('');
        });

        it('Should return false when EnableVerifications is called', () => {
            expect(taskInput.EnableVerifications).toBeFalsy();
        });
        
        it('Should return 0 when MaxHighRiskAlerts is called', () => {
            expect(taskInput.MaxHighRiskAlerts).toEqual(0);
        });

        it('Should return 0 when MaxMediumRiskAlerts is called', () => {
            expect(taskInput.MaxMediumRiskAlerts).toEqual(0);
        });

        it('Should return 0 when MaxLowRiskAlerts is called', () => {
            expect(taskInput.MaxLowRiskAlerts).toEqual(0);
        });
    });


    describe('When valid inputs are provided', () => {
        let taskInput: TaskInput;

        beforeEach(() => {
            taskInput = new TaskInput();
            taskInput.ZapApiUrl = 'zap.k2vsoftware.com';
            taskInput.ZapApiKey = 'xxxxxxxxxxxxx';
            taskInput.TargetUrl = 'http://example.com';
            taskInput.ClearSession = true;
            taskInput.FilterScans = true;
        
            /* Spider Scan Options */
            taskInput.ExecuteSpiderScan = true;
            taskInput.RecurseSpider = true;
            taskInput.SubTreeOnly = true;
            taskInput.MaxChildrenToCrawl = '5';
            taskInput.ContextName = 'text-context';
            
            /* Active Scan Options inputs */
            taskInput.ExecuteActiveScan = true;
            taskInput.ContextId = '1';
            taskInput.Recurse = true;
            taskInput.InScopeOnly = true;
            taskInput.ScanPolicyName = 'policy-name';
            taskInput.Method = 'method';
            taskInput.PostData = 'post-data';
            
            /* Reporting options */
            taskInput.ReportType = 'xml';
            taskInput.ReportFileDestination = 'path/to/report';
            taskInput.ReportFileName = 'scan-report';
            taskInput.ProjectName = 'project-name';
            taskInput.BuildDefinitionName = 'build-name';
            
            /* Verification Options */
            taskInput.EnableVerifications = true;
            taskInput.MaxHighRiskAlerts = 1;
            taskInput.MaxMediumRiskAlerts = 1;
            taskInput.MaxLowRiskAlerts = 1;
        });

        it('Should return zap.k2vsoftware.com ZapApiUrl is called', () => {
            expect(taskInput.ZapApiUrl).toEqual('zap.k2vsoftware.com');
        });

        it('Should return xxxxxxxxxxxxx when ZapApiKey is called', () => {
            expect(taskInput.ZapApiKey).toEqual('xxxxxxxxxxxxx');
        });

        it('Should return when ZapApiUrl is called', () => {
            expect(taskInput.TargetUrl).toEqual('http://example.com');
        });

        it('Should return true when ClearSession is called', () => {
            expect(taskInput.ClearSession).toBeTruthy();
        });

        it('Should return true when FilterScans is called', () => {
            expect(taskInput.FilterScans).toBeTruthy();
        });

        it('Should return true when ExecuteSpiderScan is called', () => {
            expect(taskInput.ExecuteSpiderScan).toBeTruthy();
        });

        it('Should return true when RecurseSpider is called', () => {
            expect(taskInput.RecurseSpider).toBeTruthy();
        });

        it('Should return true when SubTreeOnly is called', () => {
            expect(taskInput.SubTreeOnly).toBeTruthy();
        });

        it('Should return empty string when MaxChildrenToCrawl is called', () => {
            expect(taskInput.MaxChildrenToCrawl).toEqual('5');
        });

        it('Should return empty string when ContextName is called', () => {
            expect(taskInput.ContextName).toEqual('text-context');
        });

        it('Should return true when ExecuteActiveScan is called', () => {
            expect(taskInput.ExecuteActiveScan).toBeTruthy();
        });

        it('Should return empty string when ContextId is called', () => {
            expect(taskInput.ContextId).toEqual('1');
        });

        it('Should return true when Recurse is called', () => {
            expect(taskInput.Recurse).toBeTruthy();
        });

        it('Should return true when InScopeOnly is called', () => {
            expect(taskInput.InScopeOnly).toBeTruthy();
        });

        it('Should return empty string when ScanPolicyName is called', () => {
            expect(taskInput.ScanPolicyName).toEqual('policy-name');
        });

        it('Should return empty string when Method is called', () => {
            expect(taskInput.Method).toEqual('method');
        });

        it('Should return empty string when PostData is called', () => {
            expect(taskInput.PostData).toEqual('post-data');
        });

        it('Should return empty string when ReportType is called', () => {
            expect(taskInput.ReportType).toEqual('xml');
        });

        it('Should return empty string when ReportFileDestination is called', () => {
            expect(taskInput.ReportFileDestination).toEqual('path/to/report');
        });

        it('Should return empty string when ReportFileName is called', () => {
            expect(taskInput.ReportFileName).toEqual('scan-report');
        });

        it('Should return empty string when ProjectName is called', () => {
            expect(taskInput.ProjectName).toEqual('project-name');
        });

        it('Should return empty string when BuildDefinitionName is called', () => {
            expect(taskInput.BuildDefinitionName).toEqual('build-name');
        });

        it('Should return true when EnableVerifications is called', () => {
            expect(taskInput.EnableVerifications).toBeTruthy();
        });
        
        it('Should return 1 when MaxHighRiskAlerts is called', () => {
            expect(taskInput.MaxHighRiskAlerts).toEqual(1);
        });

        it('Should return 1 when MaxMediumRiskAlerts is called', () => {
            expect(taskInput.MaxMediumRiskAlerts).toEqual(1);
        });

        it('Should return 1 when MaxLowRiskAlerts is called', () => {
            expect(taskInput.MaxLowRiskAlerts).toEqual(1);
        });

    });
});