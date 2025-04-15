
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Region } from "@/types";
import { PlusCircle, Edit, Trash, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/utils/auth";
import { RegionDialog } from "@/components/regions/RegionDialog";
import { DeleteRegionDialog } from "@/components/regions/DeleteRegionDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editRegion, setEditRegion] = useState<Region | null>(null);
  const [deleteRegion, setDeleteRegion] = useState<Region | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  
  const userIsAdmin = isAdmin(user);

  useEffect(() => {
    if (!userIsAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage regions",
        variant: "destructive"
      });
      return;
    }
    
    const fetchRegions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        setRegions(data || []);
      } catch (error: any) {
        console.error('Error fetching regions:', error);
        toast({
          title: "Error",
          description: error.message || "Could not fetch regions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegions();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('regions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'regions'
      }, () => {
        fetchRegions();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIsAdmin, toast]);

  const filteredRegions = regions.filter(region => 
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRegion = async (name: string) => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Region name is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert({ name: name.trim() })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Region Created",
        description: `${name} has been created successfully.`
      });
      
      setIsCreating(false);
      setRegions([...regions, data]);
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Could not create region",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRegion = async (id: string, name: string) => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Region name is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('regions')
        .update({ name: name.trim() })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Region Updated",
        description: `Region has been updated to ${name}.`
      });
      
      setEditRegion(null);
      setRegions(regions.map(r => r.id === id ? { ...r, name } : r));
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update region",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRegion = async () => {
    if (!deleteRegion) return;
    
    setIsDeleting(true);
    try {
      // First check if any resources are using this region
      const [equipmentCheck, workersCheck, reportsCheck, incidentsCheck] = await Promise.all([
        supabase.from('equipment').select('count').eq('region_id', deleteRegion.id).single(),
        supabase.from('workers').select('count').eq('region_id', deleteRegion.id).single(),
        supabase.from('reports').select('count').eq('region_id', deleteRegion.id).single(),
        supabase.from('incidents').select('count').eq('region_id', deleteRegion.id).single(),
      ]);
      
      const totalCount = 
        (equipmentCheck.count || 0) + 
        (workersCheck.count || 0) + 
        (reportsCheck.count || 0) + 
        (incidentsCheck.count || 0);
      
      if (totalCount > 0) {
        toast({
          title: "Cannot Delete Region",
          description: `This region is currently used by ${totalCount} resource(s). Please reassign them before deleting.`,
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', deleteRegion.id);
        
      if (error) throw error;
      
      toast({
        title: "Region Deleted",
        description: `${deleteRegion.name} has been deleted successfully.`
      });
      
      setDeleteRegion(null);
      setRegions(regions.filter(r => r.id !== deleteRegion.id));
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Could not delete region",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!userIsAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to manage regions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Regions</h1>
          <p className="text-muted-foreground">Manage geographical regions for operations</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Region
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Regions List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region Name</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-[250px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredRegions.length > 0 ? (
                  filteredRegions.map((region) => (
                    <TableRow key={region.id}>
                      <TableCell>{region.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditRegion(region)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteRegion(region)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No regions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <RegionDialog 
        region={editRegion}
        isOpen={!!editRegion || isCreating}
        onClose={() => {
          setEditRegion(null);
          setIsCreating(false);
        }}
        onSave={editRegion ? 
          (name) => handleUpdateRegion(editRegion.id, name) : 
          handleCreateRegion
        }
        isSaving={isSaving}
        isCreating={!editRegion}
      />
      
      <DeleteRegionDialog
        region={deleteRegion}
        isOpen={!!deleteRegion}
        onClose={() => setDeleteRegion(null)}
        onConfirm={handleDeleteRegion}
        isDeleting={isDeleting}
      />
    </div>
  );
}
