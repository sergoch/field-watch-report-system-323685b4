
import { StatsCard } from './StatsCard';
import { Users, Truck, AlertTriangle } from 'lucide-react';
import { AdminDashboardStats } from "@/utils/dashboard/types";

interface DashboardStatsOverviewProps {
  stats: AdminDashboardStats;
  timeFrame: string;
}

export function DashboardStatsOverview({ stats, timeFrame }: DashboardStatsOverviewProps) {
  return (
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
  );
}
