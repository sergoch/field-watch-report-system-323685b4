
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface Report {
  id: string;
  date: string;
  regions?: {
    name: string;
  };
}

interface RecentReportsTableProps {
  reports: Report[];
}

export function RecentReportsTable({ reports }: RecentReportsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
        <CardDescription>Latest daily reports submitted</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reports.length > 0 ? (
            reports.map(report => (
              <div key={report.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <span className="font-medium">{new Date(report.date).toLocaleDateString()}</span>
                  <span className="text-muted-foreground ml-2">
                    {report.regions?.name || "Unknown Region"}
                  </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/reports/${report.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View Report</span>
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No recent reports</p>
          )}
        </div>
        
        {reports.length > 0 && (
          <div className="mt-4">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link to="/reports">View All Reports</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
