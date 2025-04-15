
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

interface RecentReportsTableProps {
  reports?: Report[];
  isLoading?: boolean;
}

export function RecentReportsTable({ reports: externalReports, isLoading: externalLoading = false }: RecentReportsTableProps) {
  const [engineerReports, setEngineerReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch engineer-specific reports if not provided externally
  useEffect(() => {
    if (externalReports) {
      setEngineerReports(externalReports);
      return;
    }
    
    const fetchEngineerReports = async () => {
      setIsLoading(true);
      try {
        // Get the authenticated user
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error when fetching reports:', authError);
          toast({
            title: "Authentication Error",
            description: "Could not verify your authentication status.",
            variant: "destructive",
          });
          return;
        }
        
        if (!authData.user) {
          console.error('No authenticated user found');
          return;
        }
        
        console.log('Fetching reports for engineer:', authData.user.id);
        
        const { data, error } = await supabase
          .from('reports')
          .select(`
            *,
            regions (
              name
            )
          `)
          .eq('engineer_id', authData.user.id)
          .order('date', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('Error fetching engineer reports:', error);
          toast({
            title: "Error loading reports",
            description: "Could not load your recent reports.",
            variant: "destructive",
          });
          return;
        }
        
        console.log('Fetched reports:', data);
        
        // Transform data
        const processedReports = data.map(report => ({
          ...report,
          id: report.id,
          date: report.date,
          totalFuel: report.total_fuel,
          regions: report.regions
        }));
        
        setEngineerReports(processedReports);
      } catch (err) {
        console.error('Error in fetchEngineerReports:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEngineerReports();
  }, [externalReports, toast, user]);
  
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
