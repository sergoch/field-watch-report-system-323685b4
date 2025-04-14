
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, AlertTriangle, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { EngineerDashboardStats, fetchEngineerDashboardStats, TimeFrame } from "@/utils/dashboard";
import { StatsCard } from "./stats/StatsCard";
import { WorkersTable } from "./tables/WorkersTable";
import { EquipmentTable } from "./tables/EquipmentTable";
import { RecentReportsTable } from "./tables/RecentReportsTable";
import { RecentIncidentsTable } from "./tables/RecentIncidentsTable";
import { DashboardFilters } from "./filters/DashboardFilters";

export function EngineerDashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");
  const [stats, setStats] = useState<EngineerDashboardStats>({
    totalReports: 0,
    totalIncidents: 0,
    totalWorkers: [],
    totalEquipment: [],
    totalOperators: 0,
    totalFuel: 0,
    recentReports: [],
    recentIncidents: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      
      try {
        const data = await fetchEngineerDashboardStats(user.id, {
          timeFrame,
          dateRange
        });
        setStats(data);
      } catch (error) {
        console.error('Error fetching engineer dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user?.id, timeFrame, dateRange]);

  const handleTimeFrameChange = (value: TimeFrame) => {
    setTimeFrame(value);
    if (value !== "custom") {
      setDateRange(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sky-900">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            Engineer Dashboard - Region: {user?.regionId}
          </p>
        </div>
        <DashboardFilters
          timeFrame={timeFrame}
          dateRange={dateRange}
          onTimeFrameChange={handleTimeFrameChange}
          onDateRangeChange={(range) => {
            setDateRange(range);
            if (range) {
              setTimeFrame("custom");
            }
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Reports"
          value={stats.totalReports}
          description="Reports submitted"
          icon={FileText}
          href="/reports"
          iconColor="text-blue-500"
        />
        <StatsCard
          title="My Incidents"
          value={stats.totalIncidents}
          description="Incidents reported"
          icon={AlertTriangle}
          href="/incidents"
          iconColor="text-orange-500"
        />
        <StatsCard
          title="Workers & Operators"
          value={stats.totalWorkers.length}
          description={`${stats.totalOperators} operators assigned`}
          icon={Users}
          href="/workers"
          iconColor="text-purple-500"
        />
        <StatsCard
          title="Total Fuel"
          value={stats.totalFuel}
          description="Liters consumed"
          icon={Calendar}
          href="/reports"
          iconColor="text-green-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WorkersTable workers={stats.totalWorkers} />
        <EquipmentTable equipment={stats.totalEquipment} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecentReportsTable reports={stats.recentReports} />
        <RecentIncidentsTable incidents={stats.recentIncidents} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link to="/reports/new">
            <FileText className="mr-2 h-4 w-4" />
            Create Daily Report
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/incidents/new">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report Incident
          </Link>
        </Button>
      </div>
    </div>
  );
}
