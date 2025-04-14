
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  href: string;
  iconColor: string;
}

export function StatsCard({ title, value, description, icon: Icon, href, iconColor }: StatsCardProps) {
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
