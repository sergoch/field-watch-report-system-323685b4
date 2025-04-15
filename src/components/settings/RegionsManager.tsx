
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function RegionsManager() {
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingRegion, setIsAddingRegion] = useState(false);
  const [isEditingRegion, setIsEditingRegion] = useState(false);
  const [newRegionName, setNewRegionName] = useState("");
  const [editRegion, setEditRegion] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingRegion, setIsDeletingRegion] = useState(false);
  const [deleteRegion, setDeleteRegion] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
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
  }, []);

  const fetchRegions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name');

      if (error) throw error;

      setRegions(data || []);
    } catch (error: any) {
      console.error('Error fetching regions:', error);
      toast({
        title: "Error",
        description: "Failed to load regions. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRegion = async () => {
    if (!newRegionName.trim()) {
      toast({
        title: "Validation Error",
        description: "Region name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('regions')
        .insert({ name: newRegionName.trim() })
        .select();

      if (error) throw error;

      toast({
        title: "Region Added",
        description: `${newRegionName} has been added successfully.`
      });
      
      setNewRegionName("");
      setIsAddingRegion(false);
      
      // Realtime will update the list, but let's fetch again just to be sure
      await fetchRegions();
    } catch (error: any) {
      console.error('Error adding region:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add region. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditRegion = async () => {
    if (!editRegion || !editRegion.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Region name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('regions')
        .update({ name: editRegion.name.trim() })
        .eq('id', editRegion.id);

      if (error) throw error;

      toast({
        title: "Region Updated",
        description: `Region has been updated successfully.`
      });
      
      setIsEditingRegion(false);
      setEditRegion(null);
      
      // Realtime will update the list, but let's fetch again just to be sure
      await fetchRegions();
    } catch (error: any) {
      console.error('Error editing region:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update region. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRegion = async () => {
    if (!deleteRegion) return;

    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', deleteRegion.id);

      if (error) throw error;

      toast({
        title: "Region Deleted",
        description: `${deleteRegion.name} has been removed.`
      });
      
      setIsDeletingRegion(false);
      setDeleteRegion(null);
      
      // Realtime will update the list, but let's fetch again just to be sure
      await fetchRegions();
    } catch (error: any) {
      console.error('Error deleting region:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete region. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Regions</CardTitle>
        <Button onClick={() => setIsAddingRegion(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Region
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading regions...</div>
        ) : regions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No regions found. Add your first region.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region Name</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.map((region) => (
                <TableRow key={region.id}>
                  <TableCell>{region.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditRegion({ ...region });
                        setIsEditingRegion(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        setDeleteRegion(region);
                        setIsDeletingRegion(true);
                      }}
                    >
                      <Trash className="w-4 h-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Add Region Dialog */}
        <Dialog open={isAddingRegion} onOpenChange={setIsAddingRegion}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Region</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="region-name" className="text-sm font-medium">Region Name</label>
                <Input
                  id="region-name"
                  placeholder="Enter region name"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingRegion(false)}>Cancel</Button>
              <Button onClick={handleAddRegion}>Add Region</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Region Dialog */}
        <Dialog open={isEditingRegion} onOpenChange={setIsEditingRegion}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Region</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-region-name" className="text-sm font-medium">Region Name</label>
                <Input
                  id="edit-region-name"
                  placeholder="Enter region name"
                  value={editRegion?.name || ""}
                  onChange={(e) => setEditRegion(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingRegion(false)}>Cancel</Button>
              <Button onClick={handleEditRegion}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Region Confirmation Dialog */}
        <Dialog open={isDeletingRegion} onOpenChange={setIsDeletingRegion}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete region "{deleteRegion?.name}"?</p>
              <p className="text-destructive mt-2">This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeletingRegion(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteRegion}>Delete Region</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
