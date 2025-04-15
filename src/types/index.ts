export interface Report {
  id: string;
  date: string;
  region_id: string;
  region?: Region;
  created_at?: string;
}

export interface ReportWithDetails extends Report {
  report_workers: ReportWorker[];
  report_equipment: ReportEquipment[];
}

export interface ReportWorker {
  id: string;
  report_id: string;
  worker_id: string;
  worker?: Worker;
  hours_worked: number;
  description?: string;
  created_at?: string;
}

export interface ReportEquipment {
  id: string;
  report_id: string;
  equipment_id: string;
  equipment?: Equipment;
  hours_used: number;
  description?: string;
  created_at?: string;
}

export interface Incident {
  id: string;
  date: string;
  region_id: string;
  region?: Region;
  description: string;
  created_at?: string;
}

export interface Region {
  id: string;
  name: string;
  created_at?: string;
}

export interface Settings {
  id: string;
  name: string;
  value: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at?: string;
}

export interface Worker {
  id: string;
  full_name: string;
  personal_id: string;
  dailysalary: number;
  region_id?: string;
  region?: Region;
  created_at?: string;
  status?: string;
  position?: string;
}

export interface Equipment {
  id: string;
  name: string;
  licensePlate?: string;
  type: string;
  status: string;
  dailysalary: number;
  region_id?: string;
  region?: Region;
  created_at?: string;
}
