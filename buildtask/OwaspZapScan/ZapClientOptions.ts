export interface ZapActiveScanOptions {
    zapapiformat: string;
    formMethod: string;
    apikey: string;
    url: string;
    recurse?: string;
    inScopeOnly?: string;
    scanPolicyName?: string;
    method?: string;
    postData?: string;
    contextId?: string;
}