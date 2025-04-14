
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Incident {
  id: string;
  type: string;
  date: string;
  regions?: {
    name: string;
  };
}

interface RecentIncidentsTableProps {
  incidents: Incident[];
}

export function RecentIncidentsTable({ incidents }: RecentIncidentsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
        <CardDescription>Latest reported incidents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {incidents.map(incident => (
            <div key={incident.id} className="flex justify-between py-2 border-b">
              <span>{incident.type} - {incident.regions?.name}</span>
              <span className="text-muted-foreground">
                {new Date(incident.date).toLocaleDateString()}
              </span>
            </div>
          ))}
          {incidents.length === 0 && (
            <p className="text-muted-foreground">No recent incidents</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
