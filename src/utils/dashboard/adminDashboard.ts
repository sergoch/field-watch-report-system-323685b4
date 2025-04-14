
import { supabase } from "@/integrations/supabase/client";
import { FilterParams, AdminDashboardStats } from "./types";
import { formatDateForQuery, getDateRangeFromTimeFrame } from "./dateUtils";

export const fetchAdminDashboardStats = async (
  filter: FilterParams
): Promise<AdminDashboardStats> => {
  try {
    const dateRange = getDateRangeFromTimeFrame(filter.timeFrame, filter.dateRange);
    const fromDate = formatDateForQuery(dateRange.from);
    const toDate = formatDateForQuery(dateRange.to);
    
    // Fetch regions data
    const { data: regionsData } = await supabase
      .from('regions')
      .select('*')
      .order('name');
    
    // Fetch workers count with region filter
    let workersQuery = supabase
      .from('workers')
      .select('*', { count: 'exact' });
    
    if (filter.regionId) {
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
    if (equipmentData) {
      equipmentData.forEach(eq => {
        if (eq.operator_id) {
          operatorIds.add(eq.operator_id);
        }
      });
    }
    
    // Fetch and filter reports
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
    
    // Calculate fuel usage by type
    const { data: reportEquipmentData } = await supabase
      .from('report_equipment')
      .select(`
        fuel_amount,
        equipment:equipment_id(fuel_type)
      `)
      .in('report_id', (reports || []).map(r => r.id));
    
    const fuelMap = new Map<string, number>();
    if (reportEquipmentData) {
      reportEquipmentData.forEach(item => {
        if (item.equipment?.fuel_type) {
          const fuelType = item.equipment.fuel_type;
          const currentAmount = fuelMap.get(fuelType) || 0;
          fuelMap.set(fuelType, currentAmount + (item.fuel_amount || 0));
        }
      });
    }
    
    const fuelByType = Array.from(fuelMap.entries()).map(([type, amount]) => ({
      type,
      amount
    }));
    
    // Fetch and analyze incidents
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
    if (incidents) {
      incidents.forEach(incident => {
        const type = incident.type;
        const currentCount = incidentMap.get(type) || 0;
        incidentMap.set(type, currentCount + 1);
      });
    }
    
    const incidentsByType = Array.from(incidentMap.entries()).map(([type, count]) => ({
      type,
      count
    }));
    
    const recentReports = (reports || []).slice(0, 5);
    const recentIncidents = (incidents || []).slice(0, 5);
    
    return {
      workerCount: workerCount || 0,
      equipmentCount: equipmentCount || 0,
      operatorCount: operatorIds.size,
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
