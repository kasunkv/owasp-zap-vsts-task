import { ScanResult } from "../types/ScanResult";

export interface IZapScan {
    ScanType: string;
    ExecuteScan(): Promise<ScanResult>;
}