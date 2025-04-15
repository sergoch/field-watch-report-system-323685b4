
import { DateRange } from "react-day-picker";
import { Worker, Equipment, Report, Incident } from "@/types";

export type TimeFrame = "day" | "week" | "month" | "year" | "7days" | "30days" | "90days" | "custom";

export interface FilterParams {
  timeFrame: TimeFrame;
  dateRange?: DateRange;
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
