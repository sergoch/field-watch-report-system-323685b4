
import { Incident, Report, Worker, Equipment } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subWeeks, subMonths, isAfter } from "date-fns";

export type TimeFrame = "day" | "week" | "month" | "year" | "all" | "custom";

interface DashboardFilterOptions {
  timeFrame: TimeFrame;
  dateRange?: {
    from: Date;
    to: Date;
  };
  regionId?: string;
}

interface DashboardStats {
  totalReports: number;
  totalIncidents: number;
  totalWorkers: Worker[];
  totalEquipment: Equipment[];
  totalOperators: number;
  totalFuel: number;
  recentReports: Report[];
  recentIncidents: Incident[];
}

// Calculate start date based on time frame
function getStartDate(timeFrame: TimeFrame, dateRange?: { from: Date; to: Date }): Date | null {
  if (timeFrame === "custom" && dateRange) {
    return dateRange.from;
  }
  
  const now = new Date();
  
  switch (timeFrame) {
    case "day":
      return subDays(now, 1);
    case "week":
      return subDays(now, 7);
    case "month":
      return subMonths(now, 1);
    case "year":
      return subMonths(now, 12);
    case "all":
      return null;
    default:
      return subDays(now, 7); // Default to week
  }
}

// Calculate end date based on time frame
function getEndDate(timeFrame: TimeFrame, dateRange?: { from: Date; to: Date }): Date {
  if (timeFrame === "custom" && dateRange) {
    return dateRange.to;
  }
  
  return new Date();
}

// Format date for database queries
function formatDateForDb(date: Date | null): string | null {
  if (!date) return null;
  return format(date, "yyyy-MM-dd");
}

// Fetch engineer dashboard statistics
export async function fetchEngineerDashboardStats(
  engineerId: string,
  options: DashboardFilterOptions
): Promise<DashboardStats> {
  const startDate = getStartDate(options.timeFrame, options.dateRange);
  const endDate = getEndDate(options.timeFrame, options.dateRange);
  
  // Fetch engineer's regions
  const { data: engineerRegions } = await supabase
    .from('engineer_regions')
    .select('region_id')
    .eq('engineer_id', engineerId);
  
  const regionIds = engineerRegions?.map(record => record.region_id) || [];
  
  // Build filter for date range
  const dateFilter = startDate 
    ? `date >= ${formatDateForDb(startDate)} and date <= ${formatDateForDb(endDate)}`
    : '';
  
  // Fetch reports
  const reportsQuery = supabase
    .from('reports')
    .select(`
      *,
      regions (
        name
      )
    `)
    .eq('engineer_id', engineerId)
    .order('date', { ascending: false });
  
  if (dateFilter) {
    reportsQuery.filter('date', 'gte', formatDateForDb(startDate)!);
    reportsQuery.filter('date', 'lte', formatDateForDb(endDate));
  }
  
  const { data: reports } = await reportsQuery;
  
  // Fetch incidents
  const incidentsQuery = supabase
    .from('incidents')
    .select(`
      *,
      regions (
        name
      )
    `)
    .eq('engineer_id', engineerId)
    .order('date', { ascending: false });
  
  if (dateFilter) {
    incidentsQuery.filter('date', 'gte', formatDateForDb(startDate)!);
    incidentsQuery.filter('date', 'lte', formatDateForDb(endDate));
  }
  
  const { data: incidents } = await incidentsQuery;
  
  // Fetch workers
  let workersQuery = supabase
    .from('workers')
    .select('*');
  
  if (regionIds.length > 0) {
    workersQuery = workersQuery.in('region_id', regionIds);
  }
  
  const { data: workers } = await workersQuery;
  
  // Fetch equipment
  let equipmentQuery = supabase
    .from('equipment')
    .select('*');
  
  if (regionIds.length > 0) {
    equipmentQuery = equipmentQuery.in('region_id', regionIds);
  }
  
  const { data: equipment } = await equipmentQuery;
  
  // Process data
  const totalReports = reports?.length || 0;
  const totalIncidents = incidents?.length || 0;
  const totalWorkers = workers || [];
  const totalEquipment = equipment || [];
  const totalOperators = equipment?.filter(item => item.operatorName).length || 0;
  const totalFuel = reports?.reduce((sum, report) => sum + (report.total_fuel || 0), 0) || 0;
  
  // Get recent reports and incidents (limited to 5 each)
  const recentReports = (reports || []).slice(0, 5).map(report => ({
    id: report.id,
    date: report.date,
    description: report.description || '',
    regionId: report.region_id || '',
    engineerId: report.engineer_id,
    materialsUsed: report.materials_used || '',
    materialsReceived: report.materials_received || '',
    totalFuel: report.total_fuel || 0,
    totalWorkerSalary: report.total_worker_salary || 0,
    workers: [],
    equipment: [],
    regions: report.regions
  }));
  
  const recentIncidents = (incidents || []).slice(0, 5).map(incident => ({
    id: incident.id,
    date: incident.date,
    type: incident.type as any,
    imageUrl: incident.image_url || '',
    location: {
      latitude: incident.latitude || 0,
      longitude: incident.longitude || 0
    },
    description: incident.description || '',
    engineerId: incident.engineer_id,
    regionId: incident.region_id || '',
    regions: incident.regions,
    latitude: incident.latitude,
    longitude: incident.longitude
  }));
  
  return {
    totalReports,
    totalIncidents,
    totalWorkers,
    totalEquipment,
    totalOperators,
    totalFuel,
    recentReports,
    recentIncidents
  };
}

// Fetch admin dashboard statistics (all regions, all engineers)
export async function fetchAdminDashboardStats(
  options: DashboardFilterOptions
): Promise<DashboardStats> {
  const startDate = getStartDate(options.timeFrame, options.dateRange);
  const endDate = getEndDate(options.timeFrame, options.dateRange);
  
  // Build filter for date range
  const dateFilter = startDate 
    ? `date >= ${formatDateForDb(startDate)} and date <= ${formatDateForDb(endDate)}`
    : '';
  
  // Filter by region if specified
  const regionFilter = options.regionId ? `region_id = '${options.regionId}'` : '';
  
  // Fetch reports
  const reportsQuery = supabase
    .from('reports')
    .select(`
      *,
      regions (
        name
      )
    `)
    .order('date', { ascending: false });
  
  if (dateFilter) {
    reportsQuery.filter('date', 'gte', formatDateForDb(startDate)!);
    reportsQuery.filter('date', 'lte', formatDateForDb(endDate));
  }
  
  if (regionFilter) {
    reportsQuery.eq('region_id', options.regionId!);
  }
  
  const { data: reports } = await reportsQuery;
  
  // Fetch incidents
  const incidentsQuery = supabase
    .from('incidents')
    .select(`
      *,
      regions (
        name
      )
    `)
    .order('date', { ascending: false });
  
  if (dateFilter) {
    incidentsQuery.filter('date', 'gte', formatDateForDb(startDate)!);
    incidentsQuery.filter('date', 'lte', formatDateForDb(endDate));
  }
  
  if (regionFilter) {
    incidentsQuery.eq('region_id', options.regionId!);
  }
  
  const { data: incidents } = await incidentsQuery;
  
  // Fetch workers
  let workersQuery = supabase
    .from('workers')
    .select('*');
  
  if (regionFilter) {
    workersQuery.eq('region_id', options.regionId!);
  }
  
  const { data: workers } = await workersQuery;
  
  // Fetch equipment
  let equipmentQuery = supabase
    .from('equipment')
    .select('*');
  
  if (regionFilter) {
    equipmentQuery.eq('region_id', options.regionId!);
  }
  
  const { data: equipment } = await equipmentQuery;
  
  // Process data
  const totalReports = reports?.length || 0;
  const totalIncidents = incidents?.length || 0;
  const totalWorkers = workers || [];
  const totalEquipment = equipment || [];
  const totalOperators = equipment?.filter(item => item.operatorName).length || 0;
  const totalFuel = reports?.reduce((sum, report) => sum + (report.total_fuel || 0), 0) || 0;
  
  // Get recent reports and incidents (limited to 5 each)
  const recentReports = (reports || []).slice(0, 5).map(report => ({
    id: report.id,
    date: report.date,
    description: report.description || '',
    regionId: report.region_id || '',
    engineerId: report.engineer_id,
    materialsUsed: report.materials_used || '',
    materialsReceived: report.materials_received || '',
    totalFuel: report.total_fuel || 0,
    totalWorkerSalary: report.total_worker_salary || 0,
    workers: [],
    equipment: [],
    regions: report.regions
  }));
  
  const recentIncidents = (incidents || []).slice(0, 5).map(incident => ({
    id: incident.id,
    date: incident.date,
    type: incident.type as any,
    imageUrl: incident.image_url || '',
    location: {
      latitude: incident.latitude || 0,
      longitude: incident.longitude || 0
    },
    description: incident.description || '',
    engineerId: incident.engineer_id,
    regionId: incident.region_id || '',
    regions: incident.regions,
    latitude: incident.latitude,
    longitude: incident.longitude
  }));
  
  return {
    totalReports,
    totalIncidents,
    totalWorkers,
    totalEquipment,
    totalOperators,
    totalFuel,
    recentReports,
    recentIncidents
  };
}
