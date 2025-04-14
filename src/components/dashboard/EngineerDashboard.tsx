
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle, FileText, Users, Truck, Calendar, Fuel, Database } from "lucide-react";
import { DatePickerWithRange } from "@/components/datepicker/DateRangePicker";
import { DateRange } from "react-day-picker";
import { EngineerDashboardStats, fetchEngineerDashboardStats, TimeFrame } from "@/utils/dashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs defaultValue={timeFrame} onValueChange={(v) => handleTimeFrameChange(v as TimeFrame)} className="w-[240px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          <DatePickerWithRange 
            dateRange={dateRange} 
            setDateRange={(range) => {
              setDateRange(range);
              if (range) {
                setTimeFrame("custom");
              }
            }}
          />
        </div>
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
        <Card className="overflow-hidden">
          <CardHeader className="bg-sky-50">
            <CardTitle>Workers Involved</CardTitle>
            <CardDescription>Workers in your recent reports</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Full Name</th>
                    <th className="text-left p-3">Personal ID</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.totalWorkers.map(worker => (
                    <tr key={worker.id} className="border-b hover:bg-muted/20">
                      <td className="p-3">{worker.fullName}</td>
                      <td className="p-3">{worker.personalId}</td>
                    </tr>
                  ))}
                  {stats.totalWorkers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-3 text-center text-muted-foreground">No workers assigned</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="bg-sky-50">
            <CardTitle>Equipment Used</CardTitle>
            <CardDescription>Equipment in your recent reports</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">License Plate</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.totalEquipment.map(equip => (
                    <tr key={equip.id} className="border-b hover:bg-muted/20">
                      <td className="p-3">{equip.type}</td>
                      <td className="p-3">{equip.licensePlate}</td>
                    </tr>
                  ))}
                  {stats.totalEquipment.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-3 text-center text-muted-foreground">No equipment used</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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
    <Card className="shadow-sm border-sky-100 hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Link 
          to={href}
          className="text-xs text-sky-600 hover:underline mt-2 block"
        >
          View details →
        </Link>
      </CardContent>
    </Card>
  );
}
