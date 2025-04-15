
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, AlertTriangle, Users, Calendar, Truck, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { TimeFrame, fetchEngineerDashboardStats } from "@/utils/dashboard";
import { StatsCard } from "./stats/StatsCard";
import { WorkersTable } from "./tables/WorkersTable";
import { EquipmentTable } from "./tables/EquipmentTable";
import { RecentReportsTable } from "./tables/RecentReportsTable";
import { RecentIncidentsTable } from "./tables/RecentIncidentsTable";
import { DashboardFilters } from "./filters/DashboardFilters";
import { Report, Incident, Worker, Equipment } from "@/types";
import { useToast } from "@/hooks/use-toast";

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

export function EngineerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");
  const [stats, setStats] = useState<DashboardStats>({
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
        // Fetch dashboard stats using our utility function
        const dashboardStats = await fetchEngineerDashboardStats(user.id, {
          timeFrame,
          dateRange,
          regionId: user.regionId
        });
        
        setStats(dashboardStats);
      } catch (error: any) {
        console.error('Error fetching engineer dashboard stats:', error);
        toast({
          title: "Error loading dashboard",
          description: error.message || "Could not load dashboard information. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, timeFrame, dateRange, toast]);

  const handleTimeFrameChange = (value: TimeFrame) => {
    setTimeFrame(value);
    if (value !== "custom") {
      setDateRange(undefined);
    }
  };

  const regionInfo = user?.assignedRegions?.length 
    ? (user.assignedRegions.length === 1 ? 'Assigned Region' : `${user.assignedRegions.length} Assigned Regions`)
    : 'No Assigned Regions';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sky-900">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            Engineer Dashboard - {regionInfo}
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

      {isLoading ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          Loading dashboard data...
        </div>
      ) : (
        <>
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
            <RecentReportsTable reports={stats.recentReports} isLoading={isLoading} />
            <RecentIncidentsTable incidents={stats.recentIncidents} isLoading={isLoading} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
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
            <Button asChild variant="secondary">
              <Link to="/workers">
                <Briefcase className="mr-2 h-4 w-4" />
                Manage Workers
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/equipment">
                <Truck className="mr-2 h-4 w-4" />
                Manage Equipment
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
