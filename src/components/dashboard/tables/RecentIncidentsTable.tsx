
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
import { Incident } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/utils/auth";

interface RecentIncidentsTableProps {
  incidents?: Incident[];
  isLoading?: boolean;
}

export function RecentIncidentsTable({ incidents: externalIncidents, isLoading: externalLoading = false }: RecentIncidentsTableProps) {
  const [engineerIncidents, setEngineerIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);
  
  // Fetch incidents if not provided externally
  useEffect(() => {
    if (externalIncidents) {
      setEngineerIncidents(externalIncidents);
      setIsLoading(false);
      return;
    }
    
    const fetchIncidents = async () => {
      setIsLoading(true);
      try {
        if (!user?.id) return;
        
        let query = supabase
          .from('incidents')
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
          console.error('Error fetching incidents:', error);
          toast({
            title: "Error loading incidents",
            description: "Could not load recent incidents.",
            variant: "destructive",
          });
          return;
        }
        
        // Transform data
        const processedIncidents = data.map(incident => ({
          ...incident,
          id: incident.id,
          date: incident.date,
          type: incident.type as any,
          imageUrl: incident.image_url || '',
          regionId: incident.region_id,
          regions: incident.regions,
          engineerId: incident.engineer_id,
          location: {
            latitude: incident.latitude || 0,
            longitude: incident.longitude || 0
          }
        }));
        
        setEngineerIncidents(processedIncidents);
      } catch (err) {
        console.error('Error in fetchIncidents:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchIncidents();
    }
  }, [externalIncidents, toast, user, userIsAdmin]);

  // Function to determine badge color based on incident type
  const getBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case "cut": return "destructive";
      case "damage": return "destructive";
      case "parallel": return "secondary";
      case "node": return "outline";
      case "hydrant": return "secondary";
      case "chamber": return "default";
      default: return "outline";
    }
  };

  const isLoadingIncidents = externalLoading || isLoading;
  const incidents = externalIncidents || engineerIncidents;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
        <CardDescription>Latest reported incidents</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingIncidents ? (
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
            {incidents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map(incident => (
                      <TableRow key={incident.id}>
                        <TableCell>{new Date(incident.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(incident.type)}>
                            {incident.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{incident.regions?.name || "Unknown"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/incidents/${incident.id}`}>
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
              <p className="text-muted-foreground text-center py-4">No recent incidents</p>
            )}
            
            {incidents.length > 0 && (
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/incidents">View All Incidents</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
