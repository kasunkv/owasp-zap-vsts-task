// ZAP Report interfaces
export interface ScanReport {
    OWASPZAPReport: OWASPZAPReport
}

export interface OWASPZAPReport {
    site: Array<site>;
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
    instances: instanceList;
    count: string;
    solution: string;
    reference: string;
    cweid: string;
    wascid: string;
    sourceid: string;
    otherinfo: string;
}

export interface instanceList {
    instance: Array<instance>;
}

// export interface instances {
//     instance: Array<instance>
// }

export interface instance {
    uri: string;
    method: string;
    evidence: string;
    param: string;
}