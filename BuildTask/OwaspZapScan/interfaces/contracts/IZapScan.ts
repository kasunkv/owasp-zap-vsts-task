import { ScanResult } from "../types/ScanResult";
import { ZapScanType } from "../../enums/Enums";

export interface IZapScan {
    ScanType: string;
    ZapScanType: ZapScanType;
    ExecuteScan(): Promise<ScanResult>;
}