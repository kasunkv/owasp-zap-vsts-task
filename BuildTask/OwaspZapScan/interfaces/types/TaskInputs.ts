export interface TaskInputs {
    /* Required */
    ZapApiUrl: string;
    ZapApiKey: string;
    TargetUrl: string;
    /* Spider Scan */
    ExecuteSpiderScan: boolean;
    RecurseSpider: boolean;
    SubTreeOnly: boolean;
    MaxChildrenToCrawl: string;
    ContextName: string;
    /* Active Scan */
    ExecuteActiveScan: boolean;
    ContextId: string;
    Recurse: boolean;
    InScopeOnly: boolean;
    ScanPolicyName: string;
    Method: string;
    PostData: string;
    /* Reporting */
    ReportType: string;
    ReportFileDestination: string;
    ReportFileName: string;
    ProjectName: string;
    BuildDefinitionName: string;
    /* Verification */
    EnableVerifications: boolean;
    MaxHighRiskAlerts: number;
    MaxMediumRiskAlerts: number;
    MaxLowRiskAlerts: number;
}