
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { TimeFrame } from "@/utils/dashboard/types";
import { DashboardFilters } from './filters/DashboardFilters';
import { DashboardStatsOverview } from './stats/DashboardStatsOverview';
import { DashboardCharts } from './charts/DashboardCharts';
import { DashboardQuickActions } from './actions/DashboardQuickActions';
import { DashboardHeader } from './header/DashboardHeader';
import { RecentReportsTable } from './tables/RecentReportsTable';
import { RecentIncidentsTable } from './tables/RecentIncidentsTable';
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAdminDashboardData } from "@/hooks/dashboard/useAdminDashboardData";
import { supabase } from "@/integrations/supabase/client";

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");
  const [regionId, setRegionId] = useState<string | undefined>();
  const [engineerId, setEngineerId] = useState<string | undefined>();

  const { stats, isLoading } = useAdminDashboardData({
    timeFrame,
    dateRange,
    regionId,
    engineerId
  });

  const handleCleanTestData = async () => {
    try {
      const { error } = await supabase.rpc('clean_test_data');
      
      if (error) throw error;
      
      setStats({
        workerCount: 0,
        equipmentCount: 0,
        operatorCount: 0,
        fuelByType: [],
        incidentsByType: [],
        recentReports: [],
        recentIncidents: [],
        regionsData: stats.regionsData
      });
      
      toast({
        title: "Test Data Cleaned",
        description: "All test data has been successfully removed"
      });
    } catch (error: any) {
      toast({
        title: "Error Cleaning Data",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <DashboardHeader user={user} />
        <div className="flex flex-wrap gap-4">
          <DashboardFilters
            timeFrame={timeFrame}
            dateRange={dateRange}
            onTimeFrameChange={(value: TimeFrame) => setTimeFrame(value)}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      <DashboardQuickActions onCleanTestData={handleCleanTestData} />
      
      <DashboardStatsOverview stats={stats} timeFrame={timeFrame} />
      
      <DashboardCharts stats={stats} isLoading={isLoading} timeFrame={timeFrame} />

      <div className="grid gap-4 md:grid-cols-2">
        <RecentReportsTable reports={stats.recentReports} />
        <RecentIncidentsTable incidents={stats.recentIncidents} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link to="/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Detailed Analytics
          </Link>
        </Button>
      </div>
    </div>
  );
}
