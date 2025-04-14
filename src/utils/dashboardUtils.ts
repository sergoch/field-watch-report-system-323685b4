
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export type TimeFrame = "day" | "week" | "month" | "custom";

export interface FilterParams {
  timeFrame: TimeFrame;
  dateRange?: DateRange;
  regionId?: string;
  engineerId?: string;
}

export interface EngineerDashboardStats {
  totalReports: number;
  totalIncidents: number;
  totalWorkers: { id: string; fullName: string; personalId: string }[];
  totalEquipment: { id: string; type: string; licensePlate: string }[];
  totalOperators: number;
  totalFuel: number;
  recentReports: any[];
  recentIncidents: any[];
}

export interface AdminDashboardStats {
  workerCount: number;
  equipmentCount: number;
  operatorCount: number;
  fuelByType: { type: string; amount: number }[];
  incidentsByType: { type: string; count: number }[];
  recentReports: any[];
  recentIncidents: any[];
  regionsData: any[];
}

// Function to get date range based on timeframe
export const getDateRangeFromTimeFrame = (timeFrame: TimeFrame, customDateRange?: DateRange): DateRange => {
  const today = new Date();
  
  switch (timeFrame) {
    case "day":
      return {
        from: startOfDay(today),
        to: endOfDay(today)
      };
    case "week":
      return {
        from: startOfWeek(today),
        to: endOfWeek(today)
      };
    case "month":
      return {
        from: startOfMonth(today),
        to: endOfMonth(today)
      };
    case "custom":
      return customDateRange || { from: undefined, to: undefined };
    default:
      return { from: undefined, to: undefined };
  }
};

// Helper to format date for Supabase queries
const formatDateForQuery = (date: Date | undefined): string | null => {
  if (!date) return null;
  return format(date, "yyyy-MM-dd");
};

// Function to fetch dashboard data for engineers
export const fetchEngineerDashboardStats = async (
  userId: string,
  filter: FilterParams
): Promise<EngineerDashboardStats> => {
  try {
    const dateRange = getDateRangeFromTimeFrame(filter.timeFrame, filter.dateRange);
    const fromDate = formatDateForQuery(dateRange.from);
    const toDate = formatDateForQuery(dateRange.to);
    
    // Build date filters
    const dateFilter = (fromDate && toDate) 
      ? `date >= '${fromDate}' AND date <= '${toDate}'` 
      : undefined;
    
    // Fetch reports count for this engineer
    let reportsQuery = supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .eq('engineer_id', userId);
    
    if (dateFilter) {
      reportsQuery = reportsQuery.filter('date', 'gte', fromDate).filter('date', 'lte', toDate);
    }
    
    const { count: totalReports } = await reportsQuery;
    
    // Fetch incidents count for this engineer
    let incidentsQuery = supabase
      .from('incidents')
      .select('*', { count: 'exact' })
      .eq('engineer_id', userId);
    
    if (fromDate && toDate) {
      incidentsQuery = incidentsQuery.filter('date', 'gte', fromDate).filter('date', 'lte', toDate);
    }
    
    const { count: totalIncidents } = await incidentsQuery;
    
    // Fetch recent reports and their related data
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
    
    // Fetch workers involved in engineer's reports
    const { data: reportWorkers } = await supabase
      .from('report_workers')
      .select(`
        report_id, 
        workers:worker_id(
          id, full_name, personal_id
        )
      `)
      .in('report_id', (recentReports || []).map(r => r.id));
    
    // Fetch equipment involved in engineer's reports
    const { data: reportEquipment } = await supabase
      .from('report_equipment')
      .select(`
        report_id, 
        fuel_amount,
        equipment:equipment_id(
          id, type, license_plate, operator_id, fuel_type
        )
      `)
      .in('report_id', (recentReports || []).map(r => r.id));
    
    // Extract unique workers and equipment
    const workersSet = new Set<string>();
    const workers: { id: string; fullName: string; personalId: string }[] = [];
    
    reportWorkers?.forEach(rw => {
      if (rw.workers && !workersSet.has(rw.workers.id)) {
        workersSet.add(rw.workers.id);
        workers.push({
          id: rw.workers.id,
          fullName: rw.workers.full_name,
          personalId: rw.workers.personal_id
        });
      }
    });
    
    const equipmentSet = new Set<string>();
    const equipment: { id: string; type: string; licensePlate: string }[] = [];
    
    reportEquipment?.forEach(re => {
      if (re.equipment && !equipmentSet.has(re.equipment.id)) {
        equipmentSet.add(re.equipment.id);
        equipment.push({
          id: re.equipment.id,
          type: re.equipment.type,
          licensePlate: re.equipment.license_plate
        });
      }
    });
    
    // Count operators (unique operator_ids from equipment)
    const operatorIds = new Set<string>();
    reportEquipment?.forEach(re => {
      if (re.equipment?.operator_id) {
        operatorIds.add(re.equipment.operator_id);
      }
    });
    
    // Calculate total fuel used
    const totalFuel = reportEquipment
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

// Function to fetch dashboard data for admins
export const fetchAdminDashboardStats = async (
  filter: FilterParams
): Promise<AdminDashboardStats> => {
  try {
    const dateRange = getDateRangeFromTimeFrame(filter.timeFrame, filter.dateRange);
    const fromDate = formatDateForQuery(dateRange.from);
    const toDate = formatDateForQuery(dateRange.to);
    
    // Common filter parameters for date-based queries
    const dateFilter = (fromDate && toDate) ? { 
      dateFrom: fromDate, 
      dateTo: toDate 
    } : undefined;
    
    // Fetch all regions for the filter
    const { data: regionsData } = await supabase
      .from('regions')
      .select('*')
      .order('name');
    
    // Fetch workers count
    let workersQuery = supabase
      .from('workers')
      .select('*', { count: 'exact' });
    
    if (filter.regionId) {
      // We'd need to join with reports to filter by region
      // This is a simplified approach
      workersQuery = workersQuery.eq('region_id', filter.regionId);
    }
    
    const { count: workerCount } = await workersQuery;
    
    // Fetch equipment count
    let equipmentQuery = supabase
      .from('equipment')
      .select('*', { count: 'exact' });
    
    const { count: equipmentCount, data: equipmentData } = await equipmentQuery;
    
    // Count unique operators
    const operatorIds = new Set<string>();
    equipmentData?.forEach(eq => {
      if (eq.operator_id) {
        operatorIds.add(eq.operator_id);
      }
    });
    const operatorCount = operatorIds.size;
    
    // Fetch reports for fuel calculation, filtered by region/engineer/date if provided
    let reportsQuery = supabase
      .from('reports')
      .select(`
        id,
        date,
        region_id,
        engineer_id,
        total_fuel,
        regions(name)
      `);
    
    if (filter.regionId) {
      reportsQuery = reportsQuery.eq('region_id', filter.regionId);
    }
    
    if (filter.engineerId) {
      reportsQuery = reportsQuery.eq('engineer_id', filter.engineerId);
    }
    
    if (fromDate && toDate) {
      reportsQuery = reportsQuery.filter('date', 'gte', fromDate).filter('date', 'lte', toDate);
    }
    
    const { data: reports } = await reportsQuery;
    
    // Fetch report_equipment to calculate fuel by type
    const { data: reportEquipment } = await supabase
      .from('report_equipment')
      .select(`
        fuel_amount,
        equipment:equipment_id(fuel_type)
      `)
      .in('report_id', (reports || []).map(r => r.id));
    
    // Calculate fuel by type
    const fuelMap = new Map<string, number>();
    reportEquipment?.forEach(item => {
      if (item.equipment?.fuel_type) {
        const fuelType = item.equipment.fuel_type;
        const currentAmount = fuelMap.get(fuelType) || 0;
        fuelMap.set(fuelType, currentAmount + (item.fuel_amount || 0));
      }
    });
    
    const fuelByType = Array.from(fuelMap.entries()).map(([type, amount]) => ({
      type,
      amount
    }));
    
    // Fetch incidents, filtered by region/engineer/date if provided
    let incidentsQuery = supabase
      .from('incidents')
      .select(`
        *,
        regions(name)
      `);
    
    if (filter.regionId) {
      incidentsQuery = incidentsQuery.eq('region_id', filter.regionId);
    }
    
    if (filter.engineerId) {
      incidentsQuery = incidentsQuery.eq('engineer_id', filter.engineerId);
    }
    
    if (fromDate && toDate) {
      incidentsQuery = incidentsQuery.filter('date', 'gte', fromDate).filter('date', 'lte', toDate);
    }
    
    incidentsQuery = incidentsQuery.order('date', { ascending: false });
    
    const { data: incidents } = await incidentsQuery;
    
    // Calculate incidents by type
    const incidentMap = new Map<string, number>();
    incidents?.forEach(incident => {
      const type = incident.type;
      const currentCount = incidentMap.get(type) || 0;
      incidentMap.set(type, currentCount + 1);
    });
    
    const incidentsByType = Array.from(incidentMap.entries()).map(([type, count]) => ({
      type,
      count
    }));
    
    // Get recent reports and incidents for display
    const recentReports = (reports || []).slice(0, 5);
    const recentIncidents = (incidents || []).slice(0, 5);
    
    return {
      workerCount: workerCount || 0,
      equipmentCount: equipmentCount || 0,
      operatorCount,
      fuelByType,
      incidentsByType,
      recentReports,
      recentIncidents,
      regionsData: regionsData || []
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return {
      workerCount: 0,
      equipmentCount: 0,
      operatorCount: 0,
      fuelByType: [],
      incidentsByType: [],
      recentReports: [],
      recentIncidents: [],
      regionsData: []
    };
  }
};
