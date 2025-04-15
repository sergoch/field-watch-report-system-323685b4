
// User-related types
export type UserRole = "engineer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  engineerId?: string;
  regionId?: string;
  assignedRegions?: string[]; // Added for multi-region support
  region?: Region; // Added region relation
}

export interface Region {
  id: string;
  name: string;
}

export interface Worker {
  id: string;
  fullName: string;
  personalId: string;
  dailySalary: number;
  region_id?: string;
  createdAt?: string; // Added createdAt field
}

export interface Equipment {
  id: string;
  type: string;
  licensePlate: string; // Frontend camelCase
  license_plate?: string; // Database snake_case
  fuelType: "diesel" | "gasoline"; // Frontend camelCase
  fuel_type?: string; // Database snake_case
  operatorName: string; // Frontend camelCase
  operator_name?: string; // Database snake_case
  operatorId: string; // Frontend camelCase
  operator_id?: string; // Database snake_case
  dailySalary: number; // Frontend camelCase
  dailysalary?: number; // Database snake_case
  region_id?: string;
}

export interface ReportWorker {
  workerId: string;
  worker?: Worker;
}

export interface ReportEquipment {
  equipmentId: string;
  fuelAmount: number;
  equipment?: Equipment;
}

export interface Report {
  id: string;
  date: string;
  description: string;
  regionId: string;
  engineerId: string;
  materialsUsed: string;
  materialsReceived: string;
  totalFuel: number;
  totalWorkerSalary: number;
  workers: ReportWorker[];
  equipment: ReportEquipment[];
  region?: Region; // Added region relation

  // Database naming compatibility
  region_id?: string;
  materials_used?: string;
  materials_received?: string;
  total_fuel?: number;
  regions?: { name: string };
}

export type IncidentType = "Cut" | "Parallel" | "Damage" | "Node" | "Hydrant" | "Chamber" | "Other";

export interface Incident {
  id: string;
  date: string;
  type: IncidentType;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  engineerId: string;
  regionId: string;
  region?: Region; // Added region relation
  
  // Add direct access to location properties for convenience
  latitude?: number;
  longitude?: number;
  
  // Database naming compatibility
  region_id?: string;
  image_url?: string;
  regions?: { name: string };
}
