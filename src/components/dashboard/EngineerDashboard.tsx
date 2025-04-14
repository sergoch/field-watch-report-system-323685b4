
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, AlertTriangle, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { TimeFrame } from "@/utils/dashboard";
import { StatsCard } from "./stats/StatsCard";
import { WorkersTable } from "./tables/WorkersTable";
import { EquipmentTable } from "./tables/EquipmentTable";
import { RecentReportsTable } from "./tables/RecentReportsTable";
import { RecentIncidentsTable } from "./tables/RecentIncidentsTable";
import { DashboardFilters } from "./filters/DashboardFilters";
import { supabase } from "@/integrations/supabase/client";
import { Report, Incident, Worker, Equipment } from "@/types";
import { formatDateForQuery } from "@/utils/dashboard/dateUtils";
import { getDateRangeFromTimeFrame } from "@/utils/dashboard/dateUtils";

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
        // Get date range for filtering
        const range = getDateRangeFromTimeFrame(timeFrame, dateRange);
        const fromDate = formatDateForQuery(range.from);
        const toDate = formatDateForQuery(range.to);

        // Fetch reports count
        const { count: totalReports } = await supabase
          .from('reports')
          .select('*', { count: 'exact' })
          .eq('engineer_id', user.id)
          .gte('date', fromDate)
          .lte('date', toDate);

        // Fetch incidents count
        const { count: totalIncidents } = await supabase
          .from('incidents')
          .select('*', { count: 'exact' })
          .eq('engineer_id', user.id)
          .gte('date', fromDate)
          .lte('date', toDate);

        // Fetch recent reports
        const { data: recentReportsData } = await supabase
          .from('reports')
          .select(`
            *,
            regions (
              name
            )
          `)
          .eq('engineer_id', user.id)
          .gte('date', fromDate)
          .lte('date', toDate)
          .order('date', { ascending: false })
          .limit(5);
          
        // Fetch recent incidents
        const { data: recentIncidentsData } = await supabase
          .from('incidents')
          .select(`
            *,
            regions (
              name
            )
          `)
          .eq('engineer_id', user.id)
          .gte('date', fromDate)
          .lte('date', toDate)
          .order('date', { ascending: false })
          .limit(5);

        // Transform data from snake_case to camelCase
        const recentReports = recentReportsData ? recentReportsData.map(report => ({
          ...report,
          id: report.id,
          date: report.date,
          description: report.description,
          regionId: report.region_id,
          engineerId: report.engineer_id,
          materialsUsed: report.materials_used,
          materialsReceived: report.materials_received,
          totalFuel: report.total_fuel,
          totalWorkerSalary: report.total_worker_salary,
          regions: report.regions
        })) : [];

        const recentIncidents = recentIncidentsData ? recentIncidentsData.map(incident => ({
          ...incident,
          id: incident.id,
          date: incident.date,
          type: incident.type,
          imageUrl: incident.image_url,
          description: incident.description,
          engineerId: incident.engineer_id,
          regionId: incident.region_id,
          location: {
            latitude: incident.latitude,
            longitude: incident.longitude
          },
          regions: incident.regions
        })) : [];

        // Get all report IDs to fetch related data
        const reportIds = recentReports.map(report => report.id);

        // Fetch workers data
        const { data: reportWorkersData } = await supabase
          .from('report_workers')
          .select(`
            workers:worker_id (
              id, 
              full_name, 
              personal_id
            )
          `)
          .in('report_id', reportIds);

        // Collect unique workers
        const workersSet = new Set<string>();
        const workers: Worker[] = [];
        
        if (reportWorkersData) {
          reportWorkersData.forEach(rw => {
            if (rw.workers) {
              const worker = rw.workers as any;
              if (worker.id && !workersSet.has(worker.id)) {
                workersSet.add(worker.id);
                workers.push({
                  id: worker.id,
                  fullName: worker.full_name,
                  personalId: worker.personal_id,
                  dailySalary: 0 // Default value as it might not be available in this context
                });
              }
            }
          });
        }

        // Fetch equipment data
        const { data: reportEquipmentData } = await supabase
          .from('report_equipment')
          .select(`
            fuel_amount,
            equipment:equipment_id (
              id,
              type,
              license_plate,
              operator_id,
              fuel_type,
              operator_name
            )
          `)
          .in('report_id', reportIds);

        // Collect unique equipment and calculate fuel
        const equipmentSet = new Set<string>();
        const equipment: Equipment[] = [];
        let totalFuel = 0;
        const operatorIds = new Set<string>();
        
        if (reportEquipmentData) {
          reportEquipmentData.forEach(re => {
            if (re.equipment) {
              const equip = re.equipment as any;
              if (equip.id && !equipmentSet.has(equip.id)) {
                equipmentSet.add(equip.id);
                equipment.push({
                  id: equip.id,
                  type: equip.type,
                  licensePlate: equip.license_plate,
                  fuelType: equip.fuel_type,
                  operatorName: equip.operator_name,
                  operatorId: equip.operator_id,
                  dailySalary: 0 // Default value
                });
              }
              // Track operators
              if (equip.operator_id) {
                operatorIds.add(equip.operator_id);
              }
            }
            // Sum fuel amounts
            totalFuel += Number(re.fuel_amount || 0);
          });
        }

        // Update the dashboard stats
        setStats({
          totalReports: totalReports || 0,
          totalIncidents: totalIncidents || 0,
          totalWorkers: workers,
          totalEquipment: equipment,
          totalOperators: operatorIds.size,
          totalFuel,
          recentReports: recentReports,
          recentIncidents: recentIncidents
        });
      } catch (error) {
        console.error('Error fetching engineer dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Set up realtime subscriptions for reports and incidents
    const reportsChannel = supabase
      .channel('reports-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports',
        filter: `engineer_id=eq.${user?.id}`
      }, () => {
        fetchStats();
      })
      .subscribe();
      
    const incidentsChannel = supabase
      .channel('incidents-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'incidents',
        filter: `engineer_id=eq.${user?.id}`
      }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(incidentsChannel);
    };
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
            Engineer Dashboard - {user?.regionId ? 'Assigned Region' : 'All Regions'}
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
        </>
      )}
    </div>
  );
}
