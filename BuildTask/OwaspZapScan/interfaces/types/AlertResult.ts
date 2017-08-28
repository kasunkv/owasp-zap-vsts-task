import { AlertItem } from "./ZapReport";

export interface AlertResult {
    HighAlerts: number;
    MediumAlerts: number;
    LowAlerts: number;
    InformationalAlerts: number;
    Alerts: AlertItem[];
}