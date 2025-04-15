
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
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
    
    // Set up realtime subscriptions
    const reportsChannel = supabase
      .channel('public:reports')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports'
      }, () => {
        fetchDashboardStats();
      })
      .subscribe();
      
    const incidentsChannel = supabase
      .channel('public:incidents')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'incidents'
      }, () => {
        fetchDashboardStats();
      })
      .subscribe();
      
    const workersChannel = supabase
      .channel('public:workers')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'workers'
      }, () => {
        fetchDashboardStats();
      })
      .subscribe();
      
    const equipmentChannel = supabase
      .channel('public:equipment')
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'equipment'
      }, () => {
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

  return { stats, isLoading };
}
