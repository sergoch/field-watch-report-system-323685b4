import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Truck, AlertTriangle, FileText, BarChart3 } from "lucide-react";
import { DatePickerWithRange } from "@/components/datepicker/DateRangePicker";
import { DateRange } from "react-day-picker";
import { 
  AdminDashboardStats, 
  fetchAdminDashboardStats, 
  TimeFrame 
} from "@/utils/dashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

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
  }, [timeFrame, dateRange, regionId, engineerId]);

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
            Administrator Dashboard
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Tabs defaultValue={timeFrame} onValueChange={(v) => handleTimeFrameChange(v as TimeFrame)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
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
          
          <Select value={regionId} onValueChange={setRegionId}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Regions</SelectItem>
              {stats.regionsData.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          title="Incidents"
          value={stats.incidentsByType.reduce((acc, item) => acc + item.count, 0)}
          description="Total incidents"
          icon={AlertTriangle}
          href="/incidents"
          iconColor="text-orange-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fuel Usage by Type</CardTitle>
            <CardDescription>Liters consumed per fuel type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.fuelByType.length > 0 ? (
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
                No fuel data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidents by Type</CardTitle>
            <CardDescription>Incident breakdown by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.incidentsByType.length > 0 ? (
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
                No incidents data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Latest submitted reports</CardDescription>
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
          <a href="/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Detailed Analytics
          </a>
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
        <a 
          href={href}
          className="text-xs text-sky-600 hover:underline mt-2 block"
        >
          View details →
        </a>
      </CardContent>
    </Card>
  );
}
