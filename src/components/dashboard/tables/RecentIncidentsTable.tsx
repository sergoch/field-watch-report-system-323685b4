
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye } from "lucide-react";
import { Link } from "react-router-dom";

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
          {incidents.length > 0 ? (
            incidents.map(incident => (
              <div key={incident.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <span className="inline-flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{incident.type}</span>
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {incident.regions?.name || "Unknown"} - {new Date(incident.date).toLocaleDateString()}
                  </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/incidents/${incident.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View Incident</span>
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No recent incidents</p>
          )}
        </div>
        
        {incidents.length > 0 && (
          <div className="mt-4">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/incidents">View All Incidents</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
