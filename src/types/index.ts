
export interface Equipment {
  id: string;
  type: string;
  licensePlate: string;
  fuelType: "diesel" | "gasoline";
  operatorName: string;
  operatorId: string;
  dailysalary: number;
  region_id?: string;
}

export interface Worker {
  id: string;
  fullName: string;
  personalId: string;
  dailysalary: number;
  region_id?: string;
  regionId?: string;
  region?: Region;
  created_at?: string;
  updated_at?: string;
}

export interface Region {
  id: string;
  name: string;
  created_at?: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  role?: "admin" | "engineer";
  regionId?: string;
  assignedRegions?: string[];
  created_at?: string;
  avatar_url?: string;
}

export type IncidentType = "Cut" | "Parallel" | "Damage" | "Node" | "Hydrant" | "Chamber" | "Other";

export interface Incident {
  id: string;
  type: IncidentType;
  date: string;
  description?: string;
  imageUrl?: string;
  image_url?: string;
  engineerId?: string;
  regionId?: string;
  region_id?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  regions?: Region;
  created_at?: string;
  updated_at?: string;
}

export interface Report {
  id: string;
  date: string;
  regionId?: string;
  region_id?: string;
  engineerId?: string;
  totalFuel?: number;
  total_fuel?: number;
  materialsUsed?: string;
  materials_used?: string;
  materials_received?: string;
  image_url?: string;
  description?: string;
  workers?: Worker[];
  equipment?: Equipment[];
  totalWorkerSalary?: number;
  total_worker_salary?: number;
  created_at?: string;
  updated_at?: string;
  region?: Region;
  regions?: Region;
}
