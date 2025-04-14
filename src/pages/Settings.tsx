
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

  const [regions, setRegions] = useState<{id: string, name: string}[]>([]);
  const [newRegion, setNewRegion] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchRegions();
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

  const fetchRegions = async () => {
    const { data, error } = await supabase
      .from('regions')
      .select('*');

    if (data) {
      setRegions(data);
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

  const addRegion = async () => {
    const { error } = await supabase
      .from('regions')
      .insert({ name: newRegion });

    if (error) {
      toast({
        title: "Error adding region",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Region Added",
        description: `Region "${newRegion}" has been created`
      });
      setNewRegion('');
      fetchRegions();
    }
  };

  const deleteRegion = async (id: string) => {
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting region",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Region Deleted",
        description: "The selected region has been removed"
      });
      fetchRegions();
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
            <Button onClick={addRegion}>Add Region</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {regions.map(region => (
              <div 
                key={region.id} 
                className="flex justify-between items-center p-3 border rounded"
              >
                <span>{region.name}</span>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteRegion(region.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
