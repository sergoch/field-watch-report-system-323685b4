
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Region } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { DeleteConfirmDialog } from '@/components/crud/DeleteConfirmDialog';
import { EditDialog } from '@/components/crud/EditDialog';
import { Label } from '@/components/ui/label';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';

export default function SettingsPage() {
  const { toast } = useToast();
  const [newRegionName, setNewRegionName] = useState('');
  const [isAddingRegion, setIsAddingRegion] = useState(false);
  const [editRegion, setEditRegion] = useState<Region | null>(null);
  const [deleteRegion, setDeleteRegion] = useState<Region | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { 
    data: regions,
    add: addRegion,
    update: updateRegion,
    remove: removeRegion
  } = useSupabaseRealtime<Region>({ 
    tableName: 'regions' 
  });

  const handleAddRegion = async () => {
    if (!newRegionName.trim()) {
      toast({
        title: "Validation Error",
        description: "Region name is required",
        variant: "destructive"
      });
      return;
    }

    setIsAddingRegion(true);
    try {
      await addRegion({
        name: newRegionName.trim()
      });
      
      toast({
        title: "Region Added",
        description: `${newRegionName} has been added successfully`
      });
      
      setNewRegionName('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not add region",
        variant: "destructive"
      });
    } finally {
      setIsAddingRegion(false);
    }
  };

  const handleUpdateRegion = async () => {
    if (!editRegion) return;
    
    if (!editRegion.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Region name is required",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateRegion(editRegion.id, {
        name: editRegion.name.trim()
      });
      
      toast({
        title: "Region Updated",
        description: `Region has been updated successfully`
      });
      
      setEditRegion(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not update region",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRegion = async () => {
    if (!deleteRegion) return;
    
    setIsDeleting(true);
    try {
      await removeRegion(deleteRegion.id);
      
      toast({
        title: "Region Deleted",
        description: `${deleteRegion.name} has been removed`
      });
      
      setDeleteRegion(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not delete region",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage regions and system settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Regions</CardTitle>
          <CardDescription>Manage construction site regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Input
              placeholder="New region name"
              value={newRegionName}
              onChange={(e) => setNewRegionName(e.target.value)}
              className="sm:max-w-xs"
            />
            <Button onClick={handleAddRegion} disabled={isAddingRegion}>
              <Plus className="mr-2 h-4 w-4" />
              Add Region
            </Button>
          </div>
          
          <div className="space-y-2">
            {regions.length > 0 ? (
              regions.map((region) => (
                <div key={region.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    {region.name}
                  </div>
                  <div className="flex space-x-2">
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
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                No regions found. Add a new region above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditDialog
        isOpen={!!editRegion}
        onClose={() => setEditRegion(null)}
        title="Edit Region"
        description="Update region details"
        onSave={handleUpdateRegion}
        isSaving={isUpdating}
      >
        <div>
          <Label htmlFor="regionName">Region Name</Label>
          <Input
            id="regionName"
            value={editRegion?.name || ''}
            onChange={(e) => setEditRegion(prev => prev ? { ...prev, name: e.target.value } : null)}
            className="mt-1"
          />
        </div>
      </EditDialog>

      <DeleteConfirmDialog
        isOpen={!!deleteRegion}
        onClose={() => setDeleteRegion(null)}
        onConfirm={handleDeleteRegion}
        title="Delete Region"
        description={`Are you sure you want to delete ${deleteRegion?.name}? This will affect all reports, incidents, and other data associated with this region.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
