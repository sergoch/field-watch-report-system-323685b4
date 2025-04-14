
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Worker {
  id: string;
  fullName: string;
  personalId: string;
}

interface WorkersTableProps {
  workers: Worker[];
}

export function WorkersTable({ workers }: WorkersTableProps) {
  return (
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
              {workers.map(worker => (
                <tr key={worker.id} className="border-b hover:bg-muted/20">
                  <td className="p-3">{worker.fullName}</td>
                  <td className="p-3">{worker.personalId}</td>
                </tr>
              ))}
              {workers.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-3 text-center text-muted-foreground">No workers assigned</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
