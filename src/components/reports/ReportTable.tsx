
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface Report {
  id: string;
  date: string;
  region: string;
  workers: number;
  equipment: number;
  fuel: number;
  materials: string;
}

interface ReportTableProps {
  reports: Report[];
  onViewReport: (report: Report) => void;
}

export function ReportTable({ reports, onViewReport }: ReportTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Workers</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead>Fuel (L)</TableHead>
            <TableHead>Materials</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length > 0 ? (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.date}</TableCell>
                <TableCell>{report.region}</TableCell>
                <TableCell>{report.workers}</TableCell>
                <TableCell>{report.equipment}</TableCell>
                <TableCell>{report.fuel}</TableCell>
                <TableCell className="max-w-[200px] truncate">{report.materials}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewReport(report)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View Details</span>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/reports/${report.id}`}>
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No reports found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
