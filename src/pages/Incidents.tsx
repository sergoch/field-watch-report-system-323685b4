import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { IncidentType, Incident } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { ViewDetailsDialog } from "@/components/crud/ViewDetailsDialog";
import { EditDialog } from "@/components/crud/EditDialog";
import { DeleteConfirmDialog } from "@/components/crud/DeleteConfirmDialog";
import { IncidentsTable } from "@/components/incidents/IncidentsTable";
import { IncidentsFilter } from "@/components/incidents/IncidentsFilter";
import { IncidentDetails } from "@/components/incidents/IncidentDetails";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/utils/auth";

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<IncidentType | "All">("All");
  const { toast } = useToast();
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);
  
  const [viewIncident, setViewIncident] = useState<Incident | null>(null);
  const [editIncident, setEditIncident] = useState<Incident | null>(null);
  const [deleteIncident, setDeleteIncident] = useState<Incident | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [regionNames, setRegionNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  
  useEffect(() => {
    const fetchIncidents = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        let query = supabase.from('incidents').select(`
          *,
          regions (
            name
          )
        `);
        
        if (!userIsAdmin && user.id) {
          const engineerId = typeof user.id === 'string' ? user.id : String(user.id);
          query = query.eq('engineer_id', engineerId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching incidents:', error);
          toast({
            title: "Error loading incidents",
            description: error.message,
            variant: "destructive"
          });
        } else if (data) {
          const processedData = data.map(incident => ({
            ...incident,
            id: incident.id,
            date: incident.date,
            type: incident.type,
            description: incident.description,
            imageUrl: incident.image_url,
            engineerId: incident.engineer_id,
            regionId: incident.region_id,
            location: {
              latitude: incident.latitude || 0,
              longitude: incident.longitude || 0
            },
            regions: incident.regions
          }));
          setIncidents(processedData);
        }
      } catch (err) {
        console.error('Exception when fetching incidents:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchIncidents();
    }
    
    const channel = supabase
      .channel('incidents_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'incidents'
      }, () => {
        if (user) {
          fetchIncidents();
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userIsAdmin, toast]);

  useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabase.from('regions').select('id, name');
      
      if (error) {
        console.error('Error fetching regions:', error);
        toast({
          title: "Error fetching regions",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        const regions: Record<string, string> = {};
        data.forEach(region => {
          regions[region.id] = region.name;
        });
        setRegionNames(regions);
      }
    };
    
    fetchRegions();
  }, [toast]);

  const incidentTypes: IncidentType[] = [
    'cut', 'parallel', 'damage', 'node', 'hydrant', 'chamber', 'other'
  ];
  
  const filteredIncidents = incidents.filter(incident => 
    (activeTab === "All" || incident.type.toLowerCase() === activeTab) &&
    (regionNames[incident.region_id || ""]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     incident.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCounts = () => {
    const counts: Record<string, number> = { All: incidents.length };
    incidentTypes.forEach(type => {
      counts[type] = incidents.filter(incident => incident.type === type).length;
    });
    return counts;
  };
  
  const counts = getCounts();

  const handleDeleteIncident = async () => {
    if (!deleteIncident) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', deleteIncident.id);
        
      if (error) throw error;
      
      toast({
        title: "Incident Deleted",
        description: `${deleteIncident.type} incident has been deleted successfully.`
      });
      
      setIncidents(prev => prev.filter(incident => incident.id !== deleteIncident.id));
      setDeleteIncident(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete the incident: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportToExcel = (type: IncidentType | "All") => {
    try {
      const dataToExport = incidents.filter(incident => 
        type === "All" || incident.type === type
      ).map(incident => ({
        "Date": new Date(incident.date || "").toLocaleDateString(),
        "Type": incident.type,
        "Region": regionNames[incident.region_id || ""] || "Unknown",
        "Location": `${incident.latitude?.toString() || ""}, ${incident.longitude?.toString() || ""}`,
        "Description": incident.description || ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${type} Incidents`);
      XLSX.writeFile(workbook, `amradzi_${type.toLowerCase()}_incidents_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: `${type} Incidents exported to Excel`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export incidents to Excel",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">View and manage site incidents and issues</p>
        </div>
        <Button asChild>
          <Link to="/incidents/new">
            <Plus className="mr-2 h-4 w-4" />
            Report Incident
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Incidents List</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentsFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab as (value: string) => void}
            onExport={handleExportToExcel}
            counts={counts}
            incidentTypes={incidentTypes}
            filteredCount={filteredIncidents.length}
          />
          
          <IncidentsTable
            incidents={filteredIncidents}
            loading={isLoading}
            regionNames={regionNames}
            onView={setViewIncident}
            onEdit={setEditIncident}
            onDelete={setDeleteIncident}
          />
        </CardContent>
      </Card>

      <ViewDetailsDialog
        isOpen={!!viewIncident}
        onClose={() => setViewIncident(null)}
        title={`${viewIncident?.type} Incident Details`}
        description="Complete incident information"
      >
        {viewIncident && (
          <IncidentDetails
            incident={viewIncident}
            regionNames={regionNames}
            onEdit={(incident) => {
              setViewIncident(null);
              setEditIncident(incident);
            }}
          />
        )}
      </ViewDetailsDialog>

      <EditDialog
        isOpen={!!editIncident}
        onClose={() => setEditIncident(null)}
        title="Edit Incident"
        description="Update incident details"
        isSaving={isUpdating}
        onSave={() => {
          setIsUpdating(true);
          toast({
            title: "Not Implemented",
            description: "Editing incidents requires a more complex form. Use the incident form page instead.",
            variant: "destructive"
          });
          setIsUpdating(false);
          setEditIncident(null);
        }}
      >
        {editIncident && (
          <div className="py-4 text-center">
            <p>For editing incidents, please use the full incident form.</p>
            <div className="mt-4">
              <Button asChild>
                <Link to={`/incidents/${editIncident?.id}`}>
                  Go to Incident Form
                </Link>
              </Button>
            </div>
          </div>
        )}
      </EditDialog>

      <DeleteConfirmDialog
        isOpen={!!deleteIncident}
        onClose={() => setDeleteIncident(null)}
        onConfirm={handleDeleteIncident}
        title="Delete Incident"
        description={`Are you sure you want to delete this ${deleteIncident?.type} incident from ${regionNames[deleteIncident?.region_id || ""] || "unknown region"}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
