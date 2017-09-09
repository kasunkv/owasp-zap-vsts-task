/* ZAP Report interfaces */
export interface ScanReport {
    OWASPZAPReport: OwaspZapReport;
}

export interface OwaspZapReport {
    site: Array<Site>;
    $: { version: string, generated: string };
}

export interface Site {
    $: {
        name: string,
        host: string,
        port: string,
        ssl: string,
    };
    alerts: Alerts;
}

export interface Alerts {
    alertitem: Array<AlertItem>;
}

export interface AlertItem {
    pluginid: string;
    alert: string;
    name: string;
    riskcode: string;
    confidence: string;
    riskdesc: string;
    desc: string;
    instances: InstanceList;
    count: string;
    solution: string;
    reference: string;
    cweid: string;
    wascid: string;
    sourceid: string;
    otherinfo: string;
}

export interface InstanceList {
    instance: Array<Instance>;
}

export interface Instance {
    uri: string;
    method: string;
    evidence: string;
    param: string;
    attack: string;
}