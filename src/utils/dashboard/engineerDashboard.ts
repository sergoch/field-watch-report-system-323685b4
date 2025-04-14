
import { supabase } from "@/integrations/supabase/client";
import { FilterParams, EngineerDashboardStats } from "./types";
import { formatDateForQuery, getDateRangeFromTimeFrame } from "./dateUtils";

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
          id, full_name, personal_id
        )
      `)
      .in('report_id', (recentReports || []).map(r => r.id));
    
    const workersSet = new Set<string>();
    const workers: { id: string; fullName: string; personalId: string }[] = [];
    
    if (reportWorkersData) {
      reportWorkersData.forEach(rw => {
        if (rw.workers && !workersSet.has(rw.workers.id)) {
          workersSet.add(rw.workers.id);
          workers.push({
            id: rw.workers.id,
            fullName: rw.workers.full_name,
            personalId: rw.workers.personal_id
          });
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
          id, type, license_plate, operator_id, fuel_type
        )
      `)
      .in('report_id', (recentReports || []).map(r => r.id));
    
    const equipmentSet = new Set<string>();
    const equipment: { id: string; type: string; licensePlate: string }[] = [];
    
    if (reportEquipmentData) {
      reportEquipmentData.forEach(re => {
        if (re.equipment && !equipmentSet.has(re.equipment.id)) {
          equipmentSet.add(re.equipment.id);
          equipment.push({
            id: re.equipment.id,
            type: re.equipment.type,
            licensePlate: re.equipment.license_plate
          });
        }
      });
    }
    
    // Calculate operators
    const operatorIds = new Set<string>();
    if (reportEquipmentData) {
      reportEquipmentData.forEach(re => {
        if (re.equipment?.operator_id) {
          operatorIds.add(re.equipment.operator_id);
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
