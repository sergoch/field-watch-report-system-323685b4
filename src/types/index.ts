
// User-related types
export type UserRole = "engineer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  regionId?: string;
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
}

export interface Equipment {
  id: string;
  type: string;
  licensePlate: string;
  fuelType: "diesel" | "gasoline";
  operatorName: string;
  operatorId: string;
  dailySalary: number;
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
}
