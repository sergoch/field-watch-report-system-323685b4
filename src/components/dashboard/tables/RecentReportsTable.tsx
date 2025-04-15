
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Report } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/utils/auth";

interface RecentReportsTableProps {
  reports?: Report[];
  isLoading?: boolean;
}

export function RecentReportsTable({ reports: externalReports, isLoading: externalLoading = false }: RecentReportsTableProps) {
  const [engineerReports, setEngineerReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);
  
  // Fetch reports if not provided externally
  useEffect(() => {
    if (externalReports) {
      setEngineerReports(externalReports);
      setIsLoading(false);
      return;
    }
    
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        if (!user?.id) return;
        
        let query = supabase
          .from('reports')
          .select(`
            *,
            regions (
              name
            )
          `)
          .order('date', { ascending: false })
          .limit(5);
          
        // Filter by engineer ID if not admin
        if (!userIsAdmin) {
          query = query.eq('engineer_id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching reports:', error);
          toast({
            title: "Error loading reports",
            description: "Could not load recent reports.",
            variant: "destructive",
          });
          return;
        }
        
        // Transform data
        const processedReports = data.map(report => ({
          ...report,
          id: report.id,
          date: report.date,
          totalFuel: report.total_fuel,
          regions: report.regions,
          regionId: report.region_id
        }));
        
        setEngineerReports(processedReports);
      } catch (err) {
        console.error('Error in fetchReports:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchReports();
    }
    
    // Set up realtime subscription
    const channel = supabase
      .channel('reports_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reports'
      }, (payload) => {
        if (user) {
          fetchReports();
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [externalReports, toast, user, userIsAdmin]);
  
  const isLoadingReports = externalLoading || isLoading;
  const reports = externalReports || engineerReports;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
        <CardDescription>Latest daily reports submitted</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingReports ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {reports.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Fuel</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                        <TableCell>{report.regions?.name || "Unknown"}</TableCell>
                        <TableCell>{report.totalFuel || report.total_fuel || 0} L</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/reports/${report.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent reports</p>
            )}
            
            {reports.length > 0 && (
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/reports">View All Reports</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
