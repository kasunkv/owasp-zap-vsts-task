// ZAP Report interfaces
export interface ScanReport {
    OWASPZAPReport: OWASPZAPReport
}

export interface OWASPZAPReport {
    site: site;
    $: { version: string, generated: string };
}

export interface site {
    $: {
        name: string,
        host: string,
        port: string,
        ssl: string,
    };
    alerts: alerts;
}

export interface alerts {
    alertitem: Array<alertitem>;
}

export interface alertitem {
    pluginid: string;
    alert: string;
    name: string;
    riskcode: string;
    confidence: string;
    riskdesc: string;
    desc: string;
    instances: instances;
    count: string;
    solution: string;
    reference: string;
    cweid: string;
    wascid: string;
    sourceid: string;
    otherinfo: string;
}

export interface instances {
    instance: Array<instance>
}

export interface instance {
    uri: string;
    method: string;
    evidence: string;
    param: string;
}