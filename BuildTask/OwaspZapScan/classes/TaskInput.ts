export class TaskInput {
    /* Required */
    private _zapApiKey: string;
    set ZapApiKey(value: string) {
        this._zapApiKey = value;
    }

    get ZapApiKey(): string {
        if (this._zapApiKey) {
            return this._zapApiKey;
        }
        throw new Error('The ZAP API Key is required but not set.');
    }


    private _zapApiUrl: string;
    set ZapApiUrl(value: string) {
        this._zapApiUrl = value;
    }
    
    get ZapApiUrl(): string {
        if (this._zapApiUrl) {
            return this._zapApiUrl;
        }
        throw new Error('The ZAP API URL is required but not set.');
    }

    
    private _targetUrl: string;
    set TargetUrl(value: string) {
        this._targetUrl = value;
    }

    get TargetUrl(): string {
        if (this._targetUrl) {
            return this._targetUrl;
        }
        throw new Error('The Target URL is required but not set.');
    }


    /* Spider Scan */
    private _executeSpiderScan: boolean;
    set ExecuteSpiderScan(value: boolean) {
        this._executeSpiderScan = value;
    }

    get ExecuteSpiderScan(): boolean {
        if (this._executeSpiderScan) {
            return this._executeSpiderScan;
        }
        return false;
    }


    private _recurseSpider: boolean;
    set RecurseSpider(value: boolean) {
        this._recurseSpider = value;
    }

    get RecurseSpider(): boolean {
        if (this._recurseSpider) {
            return this._recurseSpider;
        }
        return false;
    }
    
    
    private _subTreeOnly: boolean;
    set SubTreeOnly(value: boolean) {
        this._subTreeOnly = value;
    }

    get SubTreeOnly(): boolean {
        if (this._subTreeOnly) {
            return this._subTreeOnly;
        }
        return false;
    }
    
    
    private _maxChildrenToCrawl: string;
    set MaxChildrenToCrawl(value: string) {
        this._maxChildrenToCrawl = value;
    }

    get MaxChildrenToCrawl(): string {
        if (this._maxChildrenToCrawl) {
            return this._maxChildrenToCrawl;
        }
        return '';
    }


    private _contextName: string;
    set ContextName(value: string) {
        this._contextName = value;
    }

    get ContextName(): string {
        if (this._contextName) {
            return this._contextName;
        }
        return '';
    }


    /* Active Scan */
    private _executeActiveScan: boolean;
    set ExecuteActiveScan(value: boolean) {
        this._executeActiveScan = value;
    }

    get ExecuteActiveScan(): boolean {
        if (this._executeActiveScan) {
            return this._executeActiveScan;
        }
        return false;
    }


    private _contextId: string;
    set ContextId(value: string) {
        this._contextId = value;
    }

    get ContextId(): string {
        if (this._contextId) {
            return this._contextId;
        }
        return '';
    }


    private _recurse: boolean;
    set Recurse(value: boolean) {
        this._recurse = value;
    }

    get Recurse(): boolean {
        if (this._recurse) {
            return this._recurse;
        }
        return false;
    }


    private _inScopeOnly: boolean;
    set InScopeOnly(value: boolean) {
        this._inScopeOnly = value;
    }

    get InScopeOnly(): boolean {
        if (this._inScopeOnly) {
            return this._inScopeOnly;
        }
        return false;
    }


    private _scanPolicyName: string;
    set ScanPolicyName(value: string) {
        this._scanPolicyName = value;
    }

    get ScanPolicyName(): string {
        if (this._scanPolicyName) {
            return this._scanPolicyName;
        }
        return '';
    }


    private _method: string;
    set Method(value: string) {
        this._method = value;
    }

    get Method(): string {
        if (this._method) {
            return this._method;
        }
        return '';
    }


    private _postData: string;
    set PostData(value: string) {
        this._postData = value;
    }

    get PostData(): string {
        if (this._postData) {
            return this._postData;
        }
        return '';
    }


    
    /* Reporting */
    private _reportType: string;
    set ReportType(value: string) {
        this._reportType = value;
    }

    get ReportType(): string {
        if (this._reportType) {
            return this._reportType;
        }
        return '';
    }


    private _reportFileDestination: string;
    set ReportFileDestination(value: string) {
        this._reportFileDestination = value;
    }

    get ReportFileDestination(): string {
        if (this._reportFileDestination) {
            return this._reportFileDestination;
        }
        return '';
    }


    private _reportFileName: string;
    set ReportFileName(value: string) {
        this._reportFileName = value;
    }

    get ReportFileName(): string {
        if (this._reportFileName) {
            return this._reportFileName;
        }
        return '';
    }


    private _projectName: string;
    set ProjectName(value: string) {
        this._projectName = value;
    }

    get ProjectName(): string {
        if (this._projectName) {
            return this._projectName;
        }
        return '';
    }


    private _buildDefinitionName: string;
    set BuildDefinitionName(value: string) {
        this._buildDefinitionName = value;
    }

    get BuildDefinitionName(): string {
        if (this._buildDefinitionName) {
            return this._buildDefinitionName;
        }
        return '';
    }



    /* Verification */
    private _enableVerifications: boolean;
    set EnableVerifications(value: boolean) {
        this._enableVerifications = value;
    }

    get EnableVerifications(): boolean {
        if (this._enableVerifications) {
            return this._enableVerifications;
        }
        return false;
    }


    private _maxHighRiskAlerts: number;
    set MaxHighRiskAlerts(value: number) {
        this._maxHighRiskAlerts = value;
    }

    get MaxHighRiskAlerts(): number {
        if (this._maxHighRiskAlerts) {
            return this._maxHighRiskAlerts;
        }
        return 0;
    }


    private _maxMediumRiskAlerts: number;
    set MaxMediumRiskAlerts(value: number) {
        this._maxMediumRiskAlerts = value;
    }

    get MaxMediumRiskAlerts(): number {
        if (this._maxMediumRiskAlerts) {
            return this._maxMediumRiskAlerts;
        }
        return 0;
    }


    private _maxLowRiskAlerts: number;
    set MaxLowRiskAlerts(value: number) {
        this._maxLowRiskAlerts = value;
    }

    get MaxLowRiskAlerts(): number {
        if (this._maxLowRiskAlerts) {
            return this._maxLowRiskAlerts;
        }
        return 0;
    }
}