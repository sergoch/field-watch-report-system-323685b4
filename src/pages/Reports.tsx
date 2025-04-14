
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Search, Download } from "lucide-react";

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for reports
  const mockReports = [
    { id: "1", date: "2023-08-15", region: "North", workers: 8, equipment: 3, fuel: 125, materials: "Concrete, steel" },
    { id: "2", date: "2023-08-14", region: "East", workers: 12, equipment: 5, fuel: 180, materials: "Bricks, cement" },
    { id: "3", date: "2023-08-13", region: "South", workers: 6, equipment: 2, fuel: 90, materials: "Pipes, valves" },
    { id: "4", date: "2023-08-12", region: "West", workers: 10, equipment: 4, fuel: 155, materials: "Sand, gravel" },
    { id: "5", date: "2023-08-11", region: "Central", workers: 15, equipment: 7, fuel: 210, materials: "Wood, metal sheets" },
  ];
  
  // Filter reports based on search query
  const filteredReports = mockReports.filter(report => 
    report.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.materials.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Reports</h1>
          <p className="text-muted-foreground">View and manage construction site daily reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link to="/reports/new">
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Reports List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by region or materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
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
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.region}</TableCell>
                      <TableCell>{report.workers}</TableCell>
                      <TableCell>{report.equipment}</TableCell>
                      <TableCell>{report.fuel}</TableCell>
                      <TableCell>{report.materials}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/reports/${report.id}`}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
