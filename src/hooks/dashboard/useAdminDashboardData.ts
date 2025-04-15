
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { AdminDashboardStats, TimeFrame } from "@/utils/dashboard/types";
import { fetchAdminDashboardStats } from "@/utils/dashboard/adminDashboard";
import { supabase } from "@/integrations/supabase/client";

interface UseAdminDashboardDataProps {
  timeFrame: TimeFrame;
  dateRange: DateRange | undefined;
  regionId?: string;
  engineerId?: string;
}

export function useAdminDashboardData({
  timeFrame,
  dateRange,
  regionId,
  engineerId
}: UseAdminDashboardDataProps) {
  const [stats, setStats] = useState<AdminDashboardStats>({
    workerCount: 0,
    equipmentCount: 0,
    operatorCount: 0,
    fuelByType: [],
    incidentsByType: [],
    recentReports: [],
    recentIncidents: [],
    regionsData: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      
      try {
        const data = await fetchAdminDashboardStats({
          timeFrame,
          dateRange,
          regionId,
          engineerId
        });
        setStats(data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching admin dashboard stats:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
    
    // Set up realtime subscriptions for all relevant tables
    const reportsChannel = supabase
      .channel('public:reports:admin')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports'
      }, () => {
        console.log('Reports changed, refreshing dashboard data');
        fetchDashboardStats();
      })
      .subscribe();
      
    const incidentsChannel = supabase
      .channel('public:incidents:admin')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'incidents'
      }, () => {
        console.log('Incidents changed, refreshing dashboard data');
        fetchDashboardStats();
      })
      .subscribe();
      
    const workersChannel = supabase
      .channel('public:workers:admin')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'workers'
      }, () => {
        console.log('Workers changed, refreshing dashboard data');
        fetchDashboardStats();
      })
      .subscribe();
      
    const equipmentChannel = supabase
      .channel('public:equipment:admin')
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'equipment'
      }, () => {
        console.log('Equipment changed, refreshing dashboard data');
        fetchDashboardStats();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(incidentsChannel);
      supabase.removeChannel(workersChannel);
      supabase.removeChannel(equipmentChannel);
    };
  }, [timeFrame, dateRange, regionId, engineerId]);

  return { stats, isLoading, error, setStats };
}
