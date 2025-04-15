
export interface Equipment {
  id: string;
  type: string;
  licensePlate: string;
  fuelType: "diesel" | "gasoline";
  operatorName: string;
  operatorId: string;
  dailySalary?: number; 
  dailysalary: number;
  region_id?: string;
}
