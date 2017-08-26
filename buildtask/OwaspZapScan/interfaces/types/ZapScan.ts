/* ZAP Scan/Result Request Interfaces */
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

export interface ZapSpiderScanOptions extends ZapScanOptionsBase {
    url: string;
    maxChildren?: string;
    recurse?: string;
    contextName?: string;
    subtreeOnly?: string;
}

export interface ZapScanStatusOptions extends ZapScanOptionsBase {
    scanId: number;
}

export interface ZapScanReportOptions {
    formMethod: string;
    apikey: string;
}

export interface ZapScanStatus {
    status: number;
}

export interface ZapScanResult {
    scan: number;
}
