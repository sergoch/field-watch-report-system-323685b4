
import { supabase } from "@/integrations/supabase/client";
import { FilterParams, AdminDashboardStats } from "./types";
import { formatDateForQuery, getDateRangeFromTimeFrame } from "./dateUtils";
import { convertToCamelCase } from "@/utils/supabase/typeAdapter";

export const fetchAdminDashboardStats = async (
  filter: FilterParams
): Promise<AdminDashboardStats> => {
  try {
    const dateRange = getDateRangeFromTimeFrame(filter.timeFrame, filter.dateRange);
    const fromDate = formatDateForQuery(dateRange.from);
    const toDate = formatDateForQuery(dateRange.to);
    
    console.log('Fetching dashboard stats with date range:', { fromDate, toDate });
    
    // Fetch regions data
    const { data: regionsData } = await supabase
      .from('regions')
      .select('*')
      .order('name');
    
    // Fetch workers count
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
    
    if (filter.regionId) {
      equipmentQuery = equipmentQuery.eq('region_id', filter.regionId);
    }
    
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
    
    // Build reports query with filters - Admin should see all reports
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
    
    // Apply date filter only if a date range is specified
    if (fromDate && toDate) {
      reportsQuery = reportsQuery
        .gte('date', fromDate)
        .lte('date', toDate);
    }
    
    reportsQuery = reportsQuery.order('date', { ascending: false });
    const { data: reports } = await reportsQuery;
    
    console.log('Filtered reports:', reports ? reports.length : 0);
    
    // Calculate fuel usage by type for the filtered reports
    const reportIds = (reports || []).map(r => r.id);
    
    if (reportIds.length === 0) {
      return {
        workerCount: workerCount || 0,
        equipmentCount: equipmentCount || 0,
        operatorCount: operatorIds.size,
        fuelByType: [],
        incidentsByType: [],
        recentReports: [],
        recentIncidents: [],
        regionsData: regionsData ? convertToCamelCase(regionsData) : []
      };
    }
    
    const { data: reportEquipmentData } = await supabase
      .from('report_equipment')
      .select(`
        fuel_amount,
        equipment_id,
        report_id
      `)
      .in('report_id', reportIds);
      
    const equipmentIds = reportEquipmentData?.map(re => re.equipment_id) || [];
    
    // Get equipment fuel types
    const { data: equipmentWithFuelTypes } = await supabase
      .from('equipment')
      .select('id, fuel_type')
      .in('id', equipmentIds);
      
    // Map equipment IDs to their fuel types
    const equipmentFuelMap: Record<string, string> = {};
    equipmentWithFuelTypes?.forEach(eq => {
      equipmentFuelMap[eq.id] = eq.fuel_type;
    });
    
    // Calculate fuel by type
    const fuelMap = new Map<string, number>();
    if (reportEquipmentData) {
      reportEquipmentData.forEach(item => {
        const fuelType = equipmentFuelMap[item.equipment_id] || 'Unknown';
        const currentAmount = fuelMap.get(fuelType) || 0;
        fuelMap.set(fuelType, currentAmount + (item.fuel_amount || 0));
      });
    }
    
    const fuelByType = Array.from(fuelMap.entries()).map(([type, amount]) => ({
      type,
      amount
    }));
    
    // Fetch and analyze incidents for the same period - Admin should see all incidents
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
    
    // Apply date filter only if a date range is specified
    if (fromDate && toDate) {
      incidentsQuery = incidentsQuery
        .gte('date', fromDate)
        .lte('date', toDate);
    }
    
    incidentsQuery = incidentsQuery.order('date', { ascending: false });
    const { data: incidents } = await incidentsQuery;
    
    console.log('Filtered incidents:', incidents ? incidents.length : 0);
    
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
    
    // Get recent reports and incidents for display
    const recentReports = reports ? reports.slice(0, 5) : [];
    const recentIncidents = incidents ? incidents.slice(0, 5) : [];
    
    return {
      workerCount: workerCount || 0,
      equipmentCount: equipmentCount || 0,
      operatorCount: operatorIds.size,
      fuelByType,
      incidentsByType,
      recentReports: recentReports ? convertToCamelCase(recentReports) : [],
      recentIncidents: recentIncidents ? convertToCamelCase(recentIncidents) : [],
      regionsData: regionsData ? convertToCamelCase(regionsData) : []
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
