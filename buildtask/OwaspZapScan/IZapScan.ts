import { ScanResult } from './scanResult';

export interface IZapScan {
    ScanType: string;
    ExecuteScan(): Promise<ScanResult>;
}