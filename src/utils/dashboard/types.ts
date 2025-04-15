
import { DateRange } from "react-day-picker";
import { Worker, Equipment, Report, Incident, Region } from "@/types";

export type TimeFrame = "day" | "week" | "month" | "year" | "7days" | "30days" | "90days" | "custom";

export interface FilterParams {
  timeFrame: TimeFrame;
  dateRange?: DateRange;
  regionId?: string;
  engineerId?: string;
}

export interface EngineerDashboardStats {
  totalReports: number;
  totalIncidents: number;
  totalWorkers: Worker[];
  totalEquipment: Equipment[];
  totalOperators: number;
  totalFuel: number;
  recentReports: Report[];
  recentIncidents: Incident[];
}

export interface AdminDashboardStats {
  workerCount: number;
  equipmentCount: number;
  operatorCount: number;
  fuelByType: { type: string; amount: number }[];
  incidentsByType: { type: string; count: number }[];
  recentReports: Report[];
  recentIncidents: Incident[];
  regionsData: Region[];
}
