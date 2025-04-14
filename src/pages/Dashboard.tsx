import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle, FileText, Users, Truck, Calendar } from "lucide-react";
import { DateRangePicker } from "@/components/datepicker/DateRangePicker";

interface DashboardStats {
  workerCount: number;
  operatorCount: number;
  equipmentCount: number;
  totalFuel: number;
  recentReports: any[];
  recentIncidents: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [stats, setStats] = useState<DashboardStats>({
    workerCount: 0,
    operatorCount: 0,
    equipmentCount: 0,
    totalFuel: 0,
    recentReports: [],
    recentIncidents: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch workers count
        const { count: workersCount } = await supabase
          .from('workers')
          .select('*', { count: 'exact' });

        // Fetch equipment and operators count
        const { data: equipment } = await supabase
          .from('equipment')
          .select('*');

        // Fetch recent reports
        const { data: recentReports } = await supabase
          .from('reports')
          .select('*, regions(name)')
          .order('date', { ascending: false })
          .limit(5);

        // Fetch recent incidents
        const { data: recentIncidents } = await supabase
          .from('incidents')
          .select('*, regions(name)')
          .order('date', { ascending: false })
          .limit(5);

        const totalFuel = equipment?.reduce((acc, eq) => acc + (eq.fuel_amount || 0), 0) || 0;
        
        setStats({
          workerCount: workersCount || 0,
          operatorCount: equipment?.filter(eq => eq.operator_id)?.length || 0,
          equipmentCount: equipment?.length || 0,
          totalFuel,
          recentReports: recentReports || [],
          recentIncidents: recentIncidents || []
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Administrator Dashboard" : `Engineer Dashboard - Region: ${user?.regionId}`}
          </p>
        </div>
        <DateRangePicker 
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>

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
          title="Total Fuel"
          value={stats.totalFuel}
          description="Liters consumed"
          icon={Calendar}
          href="/reports"
          iconColor="text-yellow-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Latest daily reports submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentReports.map(report => (
                <div key={report.id} className="flex justify-between py-2 border-b">
                  <span>Report for {report.regions?.name}</span>
                  <span className="text-muted-foreground">
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {stats.recentReports.length === 0 && (
                <p className="text-muted-foreground">No recent reports</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Latest reported incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentIncidents.map(incident => (
                <div key={incident.id} className="flex justify-between py-2 border-b">
                  <span>{incident.type} - {incident.regions?.name}</span>
                  <span className="text-muted-foreground">
                    {new Date(incident.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {stats.recentIncidents.length === 0 && (
                <p className="text-muted-foreground">No recent incidents</p>
              )}
            </div>
          </CardContent>
        </Card>
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

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  href: string;
  iconColor: string;
}

function StatsCard({ title, value, description, icon: Icon, href, iconColor }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Link 
          to={href}
          className="text-xs text-amradzi-blue hover:underline mt-2 block"
        >
          View details →
        </Link>
      </CardContent>
    </Card>
  );
}
