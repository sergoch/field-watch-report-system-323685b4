
import { DateRange } from "react-day-picker";

export type TimeFrame = "day" | "week" | "month" | "custom";

export interface FilterParams {
  timeFrame: TimeFrame;
  dateRange?: DateRange;
  regionId?: string;
  engineerId?: string;
}

export interface EngineerDashboardStats {
  totalReports: number;
  totalIncidents: number;
  totalWorkers: { id: string; fullName: string; personalId: string }[];
  totalEquipment: { id: string; type: string; licensePlate: string }[];
  totalOperators: number;
  totalFuel: number;
  recentReports: any[];
  recentIncidents: any[];
}

export interface AdminDashboardStats {
  workerCount: number;
  equipmentCount: number;
  operatorCount: number;
  fuelByType: { type: string; amount: number }[];
  incidentsByType: { type: string; count: number }[];
  recentReports: any[];
  recentIncidents: any[];
  regionsData: any[];
}
