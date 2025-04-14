
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Truck, AlertTriangle, FileText, BarChart3, ListFilter, Briefcase, Tractor } from "lucide-react";
import { DateRange } from "react-day-picker";
import { 
  AdminDashboardStats, 
  fetchAdminDashboardStats, 
  TimeFrame 
} from "@/utils/dashboard";
import { DashboardFilters } from '@/components/dashboard/filters/DashboardFilters';
import { StatsCard } from '@/components/dashboard/stats/StatsCard';
import { RecentReportsTable } from '@/components/dashboard/tables/RecentReportsTable';
import { RecentIncidentsTable } from '@/components/dashboard/tables/RecentIncidentsTable';
import { Link } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AdminDashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");
  const [regionId, setRegionId] = useState<string | undefined>();
  const [engineerId, setEngineerId] = useState<string | undefined>();
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
    const fetchStats = async () => {
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

    fetchStats();
    
    // Set up realtime subscriptions to update stats when data changes
    const reportsChannel = supabase
      .channel('public:reports')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports'
      }, () => {
        fetchStats();
      })
      .subscribe();
      
    const incidentsChannel = supabase
      .channel('public:incidents')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'incidents'
      }, () => {
        fetchStats();
      })
      .subscribe();
      
    const workersChannel = supabase
      .channel('public:workers')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'workers'
      }, () => {
        fetchStats();
      })
      .subscribe();
      
    const equipmentChannel = supabase
      .channel('public:equipment')
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'equipment'
      }, () => {
        fetchStats();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(incidentsChannel);
      supabase.removeChannel(workersChannel);
      supabase.removeChannel(equipmentChannel);
    };
  }, [timeFrame, dateRange, regionId, engineerId]);

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sky-900">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            Administrator Dashboard
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <DashboardFilters
            timeFrame={timeFrame}
            dateRange={dateRange}
            onTimeFrameChange={setTimeFrame}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="secondary" className="bg-sky-50 hover:bg-sky-100 text-sky-700">
          <Link to="/workers">
            <Briefcase className="mr-2 h-4 w-4" />
            Manage Workers
          </Link>
        </Button>
        <Button asChild variant="secondary" className="bg-sky-50 hover:bg-sky-100 text-sky-700">
          <Link to="/equipment">
            <Tractor className="mr-2 h-4 w-4" />
            Manage Equipment
          </Link>
        </Button>
        <Button asChild variant="secondary" className="bg-sky-50 hover:bg-sky-100 text-sky-700">
          <Link to="/reports">
            <FileText className="mr-2 h-4 w-4" />
            View Reports
          </Link>
        </Button>
        <Button asChild variant="secondary" className="bg-sky-50 hover:bg-sky-100 text-sky-700">
          <Link to="/incidents">
            <AlertTriangle className="mr-2 h-4 w-4" />
            View Incidents
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
          onClick={handleCleanTestData}
        >
          Clean Test Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Workers"
          value={stats.workerCount}
          description="Registered workers"
          icon={Users}
          href="/workers"
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Equipment"
          value={stats.equipmentCount}
          description="Total equipment"
          icon={Truck}
          href="/equipment"
          iconColor="text-green-500"
        />
        <StatsCard
          title="Operators"
          value={stats.operatorCount}
          description="Active operators"
          icon={Users}
          href="/equipment"
          iconColor="text-purple-500"
        />
        <StatsCard
          title="Incidents"
          value={stats.incidentsByType.reduce((acc, item) => acc + item.count, 0)}
          description={`For ${timeFrame === 'day' ? 'today' : timeFrame === 'week' ? 'this week' : 'this month'}`}
          icon={AlertTriangle}
          href="/incidents"
          iconColor="text-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fuel Usage by Type</CardTitle>
            <CardDescription>Liters consumed per fuel type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading fuel data...
              </div>
            ) : stats.fuelByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.fuelByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="type"
                    label={({ type, amount }) => `${type}: ${amount} L`}
                  >
                    {stats.fuelByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} L`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No fuel data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidents by Type</CardTitle>
            <CardDescription>
              Incident breakdown for{' '}
              {timeFrame === 'day' ? 'today' : 
               timeFrame === 'week' ? 'this week' : 
               timeFrame === 'month' ? 'this month' : 
               'selected period'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading incidents data...
              </div>
            ) : stats.incidentsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.incidentsByType}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Incidents" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No incidents data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
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
