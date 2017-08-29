import { ScanResult } from '../types/ScanResult';
import { ZapScanType } from '../../enums/Enums';

export interface IZapScan {
    scanType: string;
    zapScanType: ZapScanType;
    ExecuteScan(): Promise<ScanResult>;
}