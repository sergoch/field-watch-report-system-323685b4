import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Plus, Search, Download, Eye, Edit, Trash2 } from "lucide-react";
import { IncidentType, Incident } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { ViewDetailsDialog } from "@/components/crud/ViewDetailsDialog";
import { EditDialog } from "@/components/crud/EditDialog";
import { DeleteConfirmDialog } from "@/components/crud/DeleteConfirmDialog";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<IncidentType | "All">("All");
  const { toast } = useToast();
  
  const [viewIncident, setViewIncident] = useState<Incident | null>(null);
  const [editIncident, setEditIncident] = useState<Incident | null>(null);
  const [deleteIncident, setDeleteIncident] = useState<Incident | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [regionNames, setRegionNames] = useState<Record<string, string>>({});
  
  const { 
    data: incidents, 
    loading,
    remove: removeIncident 
  } = useSupabaseRealtime<Incident>({
    tableName: 'incidents'
  });

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
  
  const incidentTypes: IncidentType[] = [
    "Cut", "Parallel", "Damage", "Node", "Hydrant", "Chamber", "Other"
  ];
  
  const filteredIncidents = incidents.filter(incident => 
    (activeTab === "All" || incident.type === activeTab) &&
    (regionNames[incident.regionId || ""]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleViewIncident = (incident: Incident) => {
    setViewIncident(incident);
  };

  const handleDeleteIncident = async () => {
    if (!deleteIncident) return;
    
    setIsDeleting(true);
    try {
      await removeIncident(deleteIncident.id);
      
      toast({
        title: "Incident Deleted",
        description: `${deleteIncident.type} incident has been deleted successfully.`
      });
      
      setDeleteIncident(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the incident.",
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
        "Region": regionNames[incident.regionId || ""] || "Unknown",
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
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link to="/incidents/new">
              <Plus className="mr-2 h-4 w-4" />
              Report Incident
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExportToExcel(activeTab)}
            disabled={filteredIncidents.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Incidents List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by region or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void} className="w-full">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="All" className="relative">
                All
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                  {counts["All"]}
                </span>
              </TabsTrigger>
              {incidentTypes.map((type) => (
                <TabsTrigger key={type} value={type} className="relative">
                  {type}
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                    {counts[type]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="All" className="pt-2">
              <div className="flex justify-end mb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExportToExcel("All")}
                  disabled={filteredIncidents.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <IncidentTable 
                incidents={filteredIncidents} 
                loading={loading}
                regionNames={regionNames}
                onView={handleViewIncident}
                onEdit={(incident) => setEditIncident(incident)}
                onDelete={(incident) => setDeleteIncident(incident)}
              />
            </TabsContent>
            
            {incidentTypes.map((type) => (
              <TabsContent key={type} value={type} className="pt-2">
                <div className="flex justify-end mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleExportToExcel(type)}
                    disabled={filteredIncidents.filter(i => i.type === type).length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
                <IncidentTable 
                  incidents={filteredIncidents.filter(i => i.type === type)}
                  loading={loading}
                  regionNames={regionNames}
                  onView={handleViewIncident}
                  onEdit={(incident) => setEditIncident(incident)}
                  onDelete={(incident) => setDeleteIncident(incident)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <ViewDetailsDialog
        isOpen={!!viewIncident}
        onClose={() => setViewIncident(null)}
        title={`${viewIncident?.type} Incident Details`}
        description="Complete incident information"
      >
        {viewIncident && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Date</Label>
                <p>{new Date(viewIncident.date || "").toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="font-semibold">Type</Label>
                <p className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {viewIncident.type}
                </p>
              </div>
              <div>
                <Label className="font-semibold">Region</Label>
                <p>{regionNames[viewIncident.regionId || ""] || "Unknown"}</p>
              </div>
              <div>
                <Label className="font-semibold">Location</Label>
                <p className="flex items-center text-xs font-mono">
                  <MapPin className="h-4 w-4 mr-1" />
                  {viewIncident.latitude}, {viewIncident.longitude}
                </p>
              </div>
            </div>

            <div>
              <Label className="font-semibold">Description</Label>
              <p className="mt-1 whitespace-pre-wrap">{viewIncident.description}</p>
            </div>

            {viewIncident.imageUrl && (
              <div>
                <Label className="font-semibold">Incident Photo</Label>
                <div className="mt-2 border rounded-md overflow-hidden">
                  <img 
                    src={viewIncident.imageUrl} 
                    alt="Incident" 
                    className="w-full h-auto max-h-60 object-contain"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setViewIncident(null);
                  setEditIncident(viewIncident);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Incident
              </Button>
            </div>
          </div>
        )}
      </ViewDetailsDialog>

      <DeleteConfirmDialog
        isOpen={!!deleteIncident}
        onClose={() => setDeleteIncident(null)}
        onConfirm={handleDeleteIncident}
        title="Delete Incident"
        description={`Are you sure you want to delete this ${deleteIncident?.type} incident from ${regionNames[deleteIncident?.regionId || ""] || "unknown region"}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />

      <EditDialog
        isOpen={!!editIncident}
        onClose={() => setEditIncident(null)}
        title="Edit Incident"
        description="Update incident details"
        onSave={() => {
          toast({
            title: "Not Implemented",
            description: "Editing incidents requires a more complex form. Use the incident form page instead.",
            variant: "destructive"
          });
          setEditIncident(null);
        }}
      >
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
      </EditDialog>
    </div>
  );
}

interface IncidentTableProps {
  incidents: Incident[];
  loading: boolean;
  regionNames: Record<string, string>;
  onView: (incident: Incident) => void;
  onEdit: (incident: Incident) => void;
  onDelete: (incident: Incident) => void;
}

function IncidentTable({ 
  incidents, 
  loading,
  regionNames,
  onView,
  onEdit,
  onDelete
}: IncidentTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Loading incidents data...
              </TableCell>
            </TableRow>
          ) : incidents.length > 0 ? (
            incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{new Date(incident.date || "").toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {incident.type}
                  </span>
                </TableCell>
                <TableCell>{regionNames[incident.regionId || ""] || "Unknown"}</TableCell>
                <TableCell>
                  <span className="text-xs font-mono">
                    {incident.latitude?.toFixed(6) || "N/A"}, {incident.longitude?.toFixed(6) || "N/A"}
                  </span>
                </TableCell>
                <TableCell className="max-w-md truncate">{incident.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(incident)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(incident)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(incident)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No incidents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
