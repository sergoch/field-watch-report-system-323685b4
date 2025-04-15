
export interface Report {
  id: string;
  date: string;
  region_id: string;
  region?: Region;
  created_at?: string;
  materials_used?: string;
  materialsUsed?: string;
  materials_received?: string;
  materialsReceived?: string;
  total_fuel?: number;
  totalFuel?: number;
  workers?: ReportWorker[];
  equipment?: ReportEquipment[];
  description?: string;
  image_url?: string;
  imageUrl?: string;
  engineer_id?: string;
  engineerId?: string;
  total_worker_salary?: number;
  totalWorkerSalary?: number;
  updated_at?: string;
  regions?: { name: string }; // For compatibility with some components
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
  regionId?: string;
  region?: Region;
  description: string;
  created_at?: string;
  type: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  image_url?: string;
  updated_at?: string;
  engineer_id?: string;
  engineerId?: string;
  regions?: { name: string };
}

export type IncidentType = 'safety' | 'environmental' | 'quality' | 'other' | 'cut' | 'damage' | 'parallel' | 'node' | 'hydrant' | 'chamber';

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
  assignedRegions?: string[];
  regionId?: string; // Add for compatibility
}

export interface Worker {
  id: string;
  full_name: string;
  fullName?: string;
  personal_id: string;
  personalId?: string;
  dailysalary: number;
  dailySalary?: number;
  region_id?: string;
  region?: Region;
  created_at?: string;
  createdAt?: string;
  status?: string;
  position?: string;
}

export interface Equipment {
  id: string;
  name?: string; // Add missing properties required by type
  type: string;
  status?: string; // Add missing properties required by type
  licensePlate?: string;
  license_plate?: string;
  operatorName?: string; // Add new fields
  operatorId?: string; // Add new fields
  status?: string;
  dailysalary: number;
  dailySalary?: number;
  region_id?: string;
  region?: Region;
  created_at?: string;
  fuelType?: 'diesel' | 'gasoline';
}
