
/**
 * Utilities for converting between snake_case database fields and camelCase TypeScript types
 */

/**
 * Convert snake_case object keys to camelCase
 */
export const snakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
};

/**
 * Convert camelCase object keys to snake_case
 */
export const camelToSnake = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
};

/**
 * Transform Report data from database to TypeScript type
 */
export const transformReport = (report: any) => {
  if (!report) return null;
  return {
    id: report.id,
    date: report.date,
    description: report.description,
    regionId: report.region_id,
    engineerId: report.engineer_id,
    materialsUsed: report.materials_used,
    materialsReceived: report.materials_received,
    totalFuel: report.total_fuel,
    totalWorkerSalary: report.total_worker_salary,
    workers: report.workers || [],
    equipment: report.equipment || [],
    regions: report.regions
  };
};

/**
 * Transform Incident data from database to TypeScript type
 */
export const transformIncident = (incident: any) => {
  if (!incident) return null;
  return {
    id: incident.id,
    date: incident.date,
    type: incident.type,
    imageUrl: incident.image_url,
    location: {
      latitude: incident.latitude,
      longitude: incident.longitude
    },
    description: incident.description,
    engineerId: incident.engineer_id,
    regionId: incident.region_id,
    regions: incident.regions
  };
};

/**
 * Transform Worker data from database to TypeScript type
 */
export const transformWorker = (worker: any) => {
  if (!worker) return null;
  return {
    id: worker.id,
    fullName: worker.full_name,
    personalId: worker.personal_id,
    dailySalary: worker.daily_salary,
    createdAt: worker.created_at
  };
};

/**
 * Transform Equipment data from database to TypeScript type
 */
export const transformEquipment = (equipment: any) => {
  if (!equipment) return null;
  return {
    id: equipment.id,
    type: equipment.type,
    licensePlate: equipment.license_plate,
    fuelType: equipment.fuel_type,
    operatorName: equipment.operator_name,
    operatorId: equipment.operator_id,
    dailySalary: equipment.daily_salary
  };
};
