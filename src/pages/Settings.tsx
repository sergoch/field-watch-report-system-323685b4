
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { EditDialog } from "@/components/crud/EditDialog";
import { DeleteConfirmDialog } from "@/components/crud/DeleteConfirmDialog";
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { Region } from '@/types';
import { Edit, Trash2 } from 'lucide-react';

type FieldLabels = {
  workers: string;
  equipment: string;
  fuel: string;
  materials: string;
  incidents: string;
  reports: string;
};

export default function SettingsPage() {
  const [fieldLabels, setFieldLabels] = useState<FieldLabels>({
    workers: 'Workers',
    equipment: 'Equipment',
    fuel: 'Fuel',
    materials: 'Materials',
    incidents: 'Incidents',
    reports: 'Reports'
  });

  const [newRegion, setNewRegion] = useState('');
  const [editRegion, setEditRegion] = useState<Region | null>(null);
  const [deleteRegion, setDeleteRegion] = useState<Region | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editRegionName, setEditRegionName] = useState('');

  const { 
    data: regions, 
    add: addRegion, 
    update: updateRegion, 
    remove: deleteRegionById,
    refetch: refetchRegions 
  } = useSupabaseRealtime<Region>({
    tableName: 'regions'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'field_labels')
      .single();

    if (data) {
      setFieldLabels(data.value);
    }
  };

  const updateFieldLabels = async () => {
    const { error } = await supabase
      .from('settings')
      .update({ value: fieldLabels })
      .eq('key', 'field_labels');

    if (error) {
      toast({
        title: "Error updating labels",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Labels Updated",
        description: "Field labels have been successfully updated"
      });
    }
  };

  const handleAddRegion = async () => {
    if (!newRegion.trim()) {
      toast({
        title: "Validation Error",
        description: "Region name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    try {
      await addRegion({ name: newRegion });
      
      toast({
        title: "Region Added",
        description: `Region "${newRegion}" has been created`
      });
      
      setNewRegion('');
    } catch (error: any) {
      toast({
        title: "Error adding region",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateRegion = async () => {
    if (!editRegion) return;
    
    if (!editRegionName.trim()) {
      toast({
        title: "Validation Error",
        description: "Region name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    setIsEditing(true);
    try {
      await updateRegion(editRegion.id, { name: editRegionName });
      
      toast({
        title: "Region Updated",
        description: `Region has been renamed to "${editRegionName}"`
      });
      
      setEditRegion(null);
    } catch (error: any) {
      toast({
        title: "Error updating region",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteRegion = async () => {
    if (!deleteRegion) return;
    
    setIsDeleting(true);
    try {
      await deleteRegionById(deleteRegion.id);
      
      toast({
        title: "Region Deleted",
        description: `Region "${deleteRegion.name}" has been removed`
      });
      
      setDeleteRegion(null);
    } catch (error: any) {
      toast({
        title: "Error deleting region",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Field Labels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(fieldLabels).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <Input
                  value={fieldLabels[key as keyof FieldLabels]}
                  onChange={(e) => 
                    setFieldLabels(prev => ({ 
                      ...prev, 
                      [key]: e.target.value 
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <Button onClick={updateFieldLabels} className="mt-4">
            Save Field Labels
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regions Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <Input
              placeholder="New Region Name"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
            />
            <Button onClick={handleAddRegion}>Add Region</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {regions.map(region => (
              <div 
                key={region.id} 
                className="flex justify-between items-center p-3 border rounded"
              >
                <span>{region.name}</span>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setEditRegion(region);
                      setEditRegionName(region.name);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setDeleteRegion(region)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {regions.length === 0 && (
              <div className="col-span-2 text-center p-4 text-muted-foreground">
                No regions found. Add a region to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditDialog
        isOpen={!!editRegion}
        onClose={() => setEditRegion(null)}
        title="Edit Region"
        description="Update region name"
        onSave={handleUpdateRegion}
        isSaving={isEditing}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Region Name
            </label>
            <Input
              value={editRegionName}
              onChange={(e) => setEditRegionName(e.target.value)}
            />
          </div>
        </div>
      </EditDialog>

      <DeleteConfirmDialog
        isOpen={!!deleteRegion}
        onClose={() => setDeleteRegion(null)}
        onConfirm={handleDeleteRegion}
        title="Delete Region"
        description={`Are you sure you want to delete the region "${deleteRegion?.name}"? This action cannot be undone and may affect reports and incidents assigned to this region.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
