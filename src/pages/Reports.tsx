
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Download, Calendar } from "lucide-react";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import { DatePickerWithRange } from "@/components/datepicker/DateRangePicker";
import { DateRange } from "react-day-picker";
import { ReportTable } from "@/components/reports/ReportTable";
import { ReportDetails } from "@/components/reports/ReportDetails";

interface Report {
  id: string;
  date: string;
  region: string;
  workers: number;
  equipment: number;
  fuel: number;
  materials: string;
}

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { toast } = useToast();

  // Mock data for reports (replace with actual data fetching later)
  const mockReports = [
    { id: "1", date: "2023-08-15", region: "North", workers: 8, equipment: 3, fuel: 125, materials: "Concrete, steel" },
    { id: "2", date: "2023-08-14", region: "East", workers: 12, equipment: 5, fuel: 180, materials: "Bricks, cement" },
    { id: "3", date: "2023-08-13", region: "South", workers: 6, equipment: 2, fuel: 90, materials: "Pipes, valves" },
    { id: "4", date: "2023-08-12", region: "West", workers: 10, equipment: 4, fuel: 155, materials: "Sand, gravel" },
    { id: "5", date: "2023-08-11", region: "Central", workers: 15, equipment: 7, fuel: 210, materials: "Wood, metal sheets" },
  ];

  // Filter reports based on search query and date range
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.materials.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!dateRange?.from || !dateRange?.to) return matchesSearch;
    
    const reportDate = new Date(report.date);
    return matchesSearch && 
      reportDate >= dateRange.from && 
      reportDate <= dateRange.to;
  });

  const handleExportToExcel = () => {
    try {
      const exportData = filteredReports.map(report => ({
        Date: report.date,
        Region: report.region,
        "Number of Workers": report.workers,
        "Equipment Used": report.equipment,
        "Fuel Used (L)": report.fuel,
        "Materials": report.materials,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
      
      // Format columns
      const columnWidths = [
        { wch: 12 }, // Date
        { wch: 15 }, // Region
        { wch: 15 }, // Workers
        { wch: 15 }, // Equipment
        { wch: 12 }, // Fuel
        { wch: 40 }, // Materials
      ];
      worksheet["!cols"] = columnWidths;
      
      XLSX.writeFile(workbook, `amradzi_reports_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: "Reports exported to Excel",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export reports to Excel",
        variant: "destructive"
      });
    }
  };

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
          <Button 
            variant="outline" 
            onClick={handleExportToExcel}
            disabled={filteredReports.length === 0}
          >
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
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by region or materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <DatePickerWithRange
                dateRange={dateRange}
                setDateRange={setDateRange}
              />
            </div>
          </div>
          
          <ReportTable 
            reports={filteredReports}
            onViewReport={setSelectedReport}
          />
        </CardContent>
      </Card>

      <ReportDetails
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
