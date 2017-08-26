import { alertitem } from './zapReporting';

// ZAP Request Interfaces
export interface ZapScanOptionsBase {
    zapapiformat: string;
    formMethod: string;
    apikey: string;
}

export interface ZapActiveScanOptions extends ZapScanOptionsBase {    
    url: string;
    recurse?: string;
    inScopeOnly?: string;
    scanPolicyName?: string;
    method?: string;
    postData?: string;
    contextId?: string;
}

export interface ZapActiveScanStatusOptions extends ZapScanOptionsBase {
    scanId: number;
}

export interface ZapSpiderScanOptions extends ZapScanOptionsBase {
    url: string;
    maxChildren?: string;
    recurse?: string;
    contextName?: string;
    subtreeOnly?: string;
}

export interface ZapSpiderScanStatusOptions extends ZapScanOptionsBase {
    scanId: number;
}

export interface ZapScanReportOptions {
    formMethod: string;
    apikey: string;
}

export interface ZapActiveScanResult {
    scan: number;
}

export interface ZapActiveScanStatus {
    status: number;
}

export interface ZapScanStatus {
    status: number;
}

export interface ZapScanResult {
    scan: number;
}

export interface AlertResult {
    HighAlerts: number;
    MediumAlerts: number;
    LowAlerts: number;
    InformationalAlerts: number;
    Alerts: alertitem[];
}