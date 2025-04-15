
import { supabase } from "@/integrations/supabase/client";
import { FilterParams, EngineerDashboardStats } from "./types";
import { formatDateForQuery, getDateRangeFromTimeFrame } from "./dateUtils";
import { Worker, Equipment, Report, Incident } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { randomSalary, randomPosition } from "@/utils/random";
import { mockRegions } from "@/utils/mockData";
import { subDays } from "date-fns";

export const fetchEngineerDashboardStats = async (
  userId: string,
  filter: FilterParams
): Promise<EngineerDashboardStats> => {
  try {
    const dateRange = getDateRangeFromTimeFrame(filter.timeFrame, filter.dateRange);
    const fromDate = formatDateForQuery(dateRange.from);
    const toDate = formatDateForQuery(dateRange.to);
    
    const dateFilter = (fromDate && toDate) 
      ? `date >= '${fromDate}' AND date <= '${toDate}'` 
      : undefined;
    
    // Fetch reports count
    let reportsQuery = supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('engineer_id', userId);
    
    if (dateFilter) {
      reportsQuery = reportsQuery.filter('date', 'gte', fromDate).filter('date', 'lte', toDate);
    }
    
    const { count: totalReports } = await reportsQuery;
    
    // Fetch incidents count
    let incidentsQuery = supabase
      .from('incidents')
      .select('*', { count: 'exact' })
      .eq('engineer_id', userId);
    
    if (fromDate && toDate) {
      incidentsQuery = incidentsQuery.filter('date', 'gte', fromDate).filter('date', 'lte', toDate);
    }
    
    const { count: totalIncidents } = await incidentsQuery;
    
    // Fetch recent reports
    let recentReportsQuery = supabase
      .from('reports')
      .select(`
        *,
        regions(name)
      `)
      .eq('engineer_id', userId)
      .order('date', { ascending: false })
      .limit(5);
    
    if (dateFilter) {
      recentReportsQuery = recentReportsQuery.filter('date', 'gte', fromDate).filter('date', 'lte', toDate);
    }
    
    const { data: recentReports } = await recentReportsQuery;
    
    // Fetch recent incidents
    let recentIncidentsQuery = supabase
      .from('incidents')
      .select(`
        *,
        regions(name)
      `)
      .eq('engineer_id', userId)
      .order('date', { ascending: false })
      .limit(5);
    
    if (fromDate && toDate) {
      recentIncidentsQuery = recentIncidentsQuery.filter('date', 'gte', fromDate).filter('date', 'lte', toDate);
    }
    
    const { data: recentIncidents } = await recentIncidentsQuery;
    
    // Fetch workers data
    const { data: reportWorkersData } = await supabase
      .from('report_workers')
      .select(`
        report_id, 
        workers:worker_id(
          id, full_name, personal_id, dailysalary
        )
      `)
      .in('report_id', (recentReports || []).map(r => r.id));
    
    const workersSet = new Set<string>();
    const workers: Worker[] = [];
    
    if (reportWorkersData) {
      reportWorkersData.forEach(rw => {
        if (rw.workers && typeof rw.workers === 'object' && 'id' in rw.workers) {
          const workerId = rw.workers.id as string;
          if (!workersSet.has(workerId)) {
            workersSet.add(workerId);
            // Cast the workers object properly to access its properties
            const worker = rw.workers as unknown as { id: string; full_name: string; personal_id: string; dailysalary: number };
            workers.push({
              id: workerId,
              full_name: worker.full_name || '',
              personal_id: worker.personal_id || '',
              dailysalary: worker.dailysalary || 0,
              // Add compatibility fields
              fullName: worker.full_name || '',
              personalId: worker.personal_id || '',
              dailySalary: worker.dailysalary || 0
            } as Worker);
          }
        }
      });
    }
    
    // Fetch equipment data
    const { data: reportEquipmentData } = await supabase
      .from('report_equipment')
      .select(`
        report_id, 
        fuel_amount,
        equipment:equipment_id(
          id, type, license_plate, operator_id, operator_name, fuel_type, dailysalary
        )
      `)
      .in('report_id', (recentReports || []).map(r => r.id));
    
    const equipmentSet = new Set<string>();
    const equipment: Equipment[] = [];
    
    if (reportEquipmentData) {
      reportEquipmentData.forEach(re => {
        if (re.equipment && typeof re.equipment === 'object' && 'id' in re.equipment) {
          const equipId = re.equipment.id as string;
          if (!equipmentSet.has(equipId)) {
            equipmentSet.add(equipId);
            // Cast the equipment object properly to access its properties
            const equip = re.equipment as unknown as { 
              id: string; 
              type: string; 
              license_plate: string; 
              operator_id: string;
              operator_name: string;
              fuel_type: string;
              dailysalary: number;
            };
            
            equipment.push({
              id: equipId,
              name: equip.type || '',
              type: equip.type || '',
              license_plate: equip.license_plate || '',
              licensePlate: equip.license_plate || '',
              operatorId: equip.operator_id || '',
              operatorName: equip.operator_name || '',
              fuelType: equip.fuel_type as "diesel" | "gasoline" || 'diesel',
              dailysalary: equip.dailysalary || 0,
              dailySalary: equip.dailysalary || 0,
              status: 'active' // Default status
            } as Equipment);
          }
        }
      });
    }
    
    // Calculate operators
    const operatorIds = new Set<string>();
    if (reportEquipmentData) {
      reportEquipmentData.forEach(re => {
        if (re.equipment && typeof re.equipment === 'object' && 'operator_id' in re.equipment) {
          // Cast the equipment object properly to access its properties
          const equip = re.equipment as unknown as { operator_id: string };
          const operatorId = equip.operator_id;
          if (operatorId) {
            operatorIds.add(operatorId);
          }
        }
      });
    }
    
    // Calculate total fuel
    const totalFuel = reportEquipmentData
      ?.reduce((sum, item) => sum + (item.fuel_amount || 0), 0) || 0;
    
    return {
      totalReports: totalReports || 0,
      totalIncidents: totalIncidents || 0,
      totalWorkers: workers,
      totalEquipment: equipment,
      totalOperators: operatorIds.size,
      totalFuel,
      recentReports: recentReports || [],
      recentIncidents: recentIncidents || []
    };
  } catch (error) {
    console.error('Error fetching engineer dashboard stats:', error);
    return {
      totalReports: 0,
      totalIncidents: 0,
      totalWorkers: [],
      totalEquipment: [],
      totalOperators: 0,
      totalFuel: 0,
      recentReports: [],
      recentIncidents: []
    };
  }
};

export const createMockWorkerData = (count: number): Worker[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    full_name: `Worker ${i + 1}`,
    personal_id: `PID${100000 + i}`,
    dailysalary: randomSalary(),
    region_id: mockRegions[Math.floor(Math.random() * mockRegions.length)].id,
    status: Math.random() > 0.2 ? 'active' : 'inactive',
    position: randomPosition(),
    created_at: subDays(new Date(), Math.floor(Math.random() * 365)).toISOString(),
    // Compatibility fields
    fullName: `Worker ${i + 1}`,
    personalId: `PID${100000 + i}`,
    dailySalary: randomSalary()
  }));
};
