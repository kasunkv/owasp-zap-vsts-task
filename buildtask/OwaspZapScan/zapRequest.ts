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