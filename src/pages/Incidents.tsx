
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Plus, Search, Download, Eye } from "lucide-react";
import { IncidentType } from "@/types";

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Incident types
  const incidentTypes: IncidentType[] = [
    "Cut", "Parallel", "Damage", "Node", "Hydrant", "Chamber", "Other"
  ];
  
  // Mock data for incidents
  const mockIncidents = [
    { id: "1", date: "2023-08-15", type: "Cut" as IncidentType, region: "North", location: "41.7128, 44.0060", description: "Cut in main line" },
    { id: "2", date: "2023-08-14", type: "Damage" as IncidentType, region: "East", location: "41.7456, 44.1289", description: "Damage to insulation" },
    { id: "3", date: "2023-08-13", type: "Hydrant" as IncidentType, region: "South", location: "41.6987, 44.0345", description: "Hydrant malfunction" },
    { id: "4", date: "2023-08-12", type: "Parallel" as IncidentType, region: "West", location: "41.7234, 44.0789", description: "Parallel line issue" },
    { id: "5", date: "2023-08-11", type: "Node" as IncidentType, region: "Central", location: "41.7678, 44.0478", description: "Node connection failure" },
    { id: "6", date: "2023-08-10", type: "Chamber" as IncidentType, region: "North", location: "41.7129, 44.0062", description: "Chamber access blocked" },
    { id: "7", date: "2023-08-09", type: "Other" as IncidentType, region: "East", location: "41.7458, 44.1291", description: "Unknown issue" },
    { id: "8", date: "2023-08-08", type: "Cut" as IncidentType, region: "South", location: "41.6989, 44.0347", description: "Secondary line cut" },
  ];
  
  // Filter incidents based on search query and active tab
  const getFilteredIncidents = (type: IncidentType | "All") => {
    return mockIncidents.filter(incident => 
      (type === "All" || incident.type === type) &&
      (incident.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
       incident.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };
  
  // Count incidents by type
  const getCounts = () => {
    const counts: Record<string, number> = { All: mockIncidents.length };
    
    incidentTypes.forEach(type => {
      counts[type] = mockIncidents.filter(incident => incident.type === type).length;
    });
    
    return counts;
  };
  
  const counts = getCounts();

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
          <Button variant="outline">
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
          
          <Tabs defaultValue="All" className="w-full">
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
            
            {/* All Incidents Tab */}
            <TabsContent value="All" className="pt-2">
              <IncidentTable incidents={getFilteredIncidents("All")} />
            </TabsContent>
            
            {/* Type-specific Tabs */}
            {incidentTypes.map((type) => (
              <TabsContent key={type} value={type} className="pt-2">
                <IncidentTable incidents={getFilteredIncidents(type)} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface IncidentTableProps {
  incidents: Array<{
    id: string;
    date: string;
    type: IncidentType;
    region: string;
    location: string;
    description: string;
  }>;
}

function IncidentTable({ incidents }: IncidentTableProps) {
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
          {incidents.length > 0 ? (
            incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{incident.date}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {incident.type}
                  </span>
                </TableCell>
                <TableCell>{incident.region}</TableCell>
                <TableCell>
                  <span className="text-xs font-mono">{incident.location}</span>
                </TableCell>
                <TableCell className="max-w-md truncate">{incident.description}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/incidents/${incident.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Link>
                  </Button>
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
