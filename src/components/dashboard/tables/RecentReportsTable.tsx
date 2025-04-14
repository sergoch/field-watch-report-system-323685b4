
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
          {reports.map(report => (
            <div key={report.id} className="flex justify-between py-2 border-b">
              <span>Report for {report.regions?.name}</span>
              <span className="text-muted-foreground">
                {new Date(report.date).toLocaleDateString()}
              </span>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-muted-foreground">No recent reports</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
