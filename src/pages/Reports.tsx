import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Download, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import { DatePickerWithRange } from "@/components/datepicker/DateRangePicker";
import { DateRange } from "react-day-picker";
import { ReportTable } from "@/components/reports/ReportTable";
import { ReportDetails } from "@/components/reports/ReportDetails";
import { supabase } from "@/integrations/supabase/client";
import { Report } from "@/types";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { DeleteConfirmDialog } from "@/components/crud/DeleteConfirmDialog";
import { formatDateForQuery } from "@/utils/dashboard/dateUtils";
import { useAuth } from "@/contexts/AuthContext";

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deleteReport, setDeleteReport] = useState<Report | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [regionNames, setRegionNames] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { 
    data: allReports, 
    loading,
    refetch,
    remove: removeReport
  } = useSupabaseRealtime<Report>({ 
    tableName: 'reports',
    initialFetch: false
  });

  useEffect(() => {
    const fetchReports = async () => {
      let query = supabase.from('reports').select(`
        *,
        regions (
          name
        )
      `);
      
      if (!isAdmin && user?.id) {
        query = query.eq('engineer_id', user.id);
      }
      
      if (dateRange?.from && dateRange?.to) {
        const fromDate = formatDateForQuery(dateRange.from);
        const toDate = formatDateForQuery(dateRange.to);
        query = query.gte('date', fromDate).lte('date', toDate);
      }
      
      query = query.order('date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching reports:', error);
      } else {
        refetch();
      }
    };
    
    fetchReports();
  }, [dateRange, user, isAdmin]);

  useEffect(() => {
    const fetchRegions = async () => {
      const { data } = await supabase.from('regions').select('id, name');
      if (data) {
        const regions: Record<string, string> = {};
        data.forEach(region => {
          regions[region.id] = region.name;
        });
        setRegionNames(regions);
      }
    };
    
    fetchRegions();
  }, []);

  const filteredReports = allReports.filter(report => {
    const matchesSearch = (
      (report.region?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.materials_used || report.materialsUsed || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.materials_received || report.materialsReceived || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (!dateRange?.from || !dateRange?.to) return matchesSearch;
    
    const reportDate = new Date(report.date);
    return matchesSearch && 
      reportDate >= dateRange.from && 
      reportDate <= dateRange.to;
  });

  const handleDeleteReport = async () => {
    if (!deleteReport) return;
    
    setIsDeleting(true);
    try {
      await removeReport(deleteReport.id);
      
      toast({
        title: "Report Deleted",
        description: `Report for ${deleteReport.date} has been deleted successfully.`
      });
      
      setDeleteReport(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the report.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      const exportData = filteredReports.map(report => {
        return {
          "Date": new Date(report.date).toLocaleDateString(),
          "Region": report.region?.name || "Unknown",
          "Workers Count": report.workers?.length || 0,
          "Equipment Count": report.equipment?.length || 0,
          "Total Fuel (L)": report.totalFuel || report.total_fuel || 0,
          "Materials Used": report.materials_used || report.materialsUsed || "",
          "Materials Received": report.materials_received || report.materialsReceived || "",
          "Description": report.description || ""
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
      
      const columnWidths = [
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 40 },
        { wch: 40 },
        { wch: 40 }
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
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading reports data...
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Date</th>
                    <th className="p-2 text-left font-medium">Region</th>
                    <th className="p-2 text-left font-medium">Workers</th>
                    <th className="p-2 text-left font-medium">Equipment</th>
                    <th className="p-2 text-left font-medium">Fuel (L)</th>
                    <th className="p-2 text-left font-medium">Materials</th>
                    <th className="p-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{new Date(report.date).toLocaleDateString()}</td>
                        <td className="p-2">{report.region?.name}</td>
                        <td className="p-2">{report.workers?.length || "0"}</td>
                        <td className="p-2">{report.equipment?.length || "0"}</td>
                        <td className="p-2">{report.totalFuel}</td>
                        <td className="p-2 max-w-xs truncate">{report.materialsUsed}</td>
                        <td className="p-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              asChild
                            >
                              <Link to={`/reports/${report.id}/edit`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDeleteReport(report)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="h-32 text-center text-muted-foreground">
                        No reports found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ReportDetails
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteReport}
        onClose={() => setDeleteReport(null)}
        onConfirm={handleDeleteReport}
        title="Delete Report"
        description={`Are you sure you want to delete the report from ${deleteReport ? new Date(deleteReport.date).toLocaleDateString() : ""}? This action cannot be undone and will permanently remove the report and all associated data.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
