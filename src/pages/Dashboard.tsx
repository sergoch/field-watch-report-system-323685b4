
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle, FileText, Users, Truck, Wrench } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [stats, setStats] = useState({
    reports: 0,
    incidents: 0,
    workers: 0,
    equipment: 0,
  });

  useEffect(() => {
    // In a real app, fetch stats from API
    // For now, use mock data
    if (isAdmin) {
      setStats({
        reports: 128,
        incidents: 42,
        workers: 75,
        equipment: 33,
      });
    } else {
      setStats({
        reports: 23,
        incidents: 7,
        workers: 15,
        equipment: 8,
      });
    }
  }, [isAdmin]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">
          {isAdmin ? "Administrator Dashboard" : `Engineer Dashboard - Region: ${user?.regionId}`}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Daily Reports"
          value={stats.reports}
          description={isAdmin ? "All regions" : "Your region"}
          icon={FileText}
          href="/reports"
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Incidents"
          value={stats.incidents}
          description={isAdmin ? "All regions" : "Your region"}
          icon={AlertTriangle}
          href="/incidents"
          iconColor="text-yellow-500"
        />
        {isAdmin && (
          <>
            <StatsCard
              title="Workers"
              value={stats.workers}
              description="Registered workers"
              icon={Users}
              href="/workers"
              iconColor="text-green-500"
            />
            <StatsCard
              title="Equipment"
              value={stats.equipment}
              description="Registered units"
              icon={Truck}
              href="/equipment"
              iconColor="text-purple-500"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link to="/reports/new">
                <FileText className="mr-2 h-4 w-4" />
                Create Daily Report
              </Link>
            </Button>
            <Button asChild className="w-full justify-start">
              <Link to="/incidents/new">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Incident
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest reports and incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span>Daily Report</span>
                <span className="text-muted-foreground">Today</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Reported Incident: Damage</span>
                <span className="text-muted-foreground">Yesterday</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Daily Report</span>
                <span className="text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
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
