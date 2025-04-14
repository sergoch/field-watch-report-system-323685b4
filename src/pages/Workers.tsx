
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { Worker } from "@/types";
import { WorkersTable } from "@/components/workers/WorkersTable";
import { EditWorkerDialog } from "@/components/workers/EditWorkerDialog";
import { DeleteWorkerDialog } from "@/components/workers/DeleteWorkerDialog";
import { ViewWorkerDialog } from "@/components/workers/ViewWorkerDialog";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

interface WorkerWithMeta extends Worker {
  createdAt?: string;
  region_id?: string;
}

export default function WorkersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [viewWorker, setViewWorker] = useState<WorkerWithMeta | null>(null);
  const [editWorker, setEditWorker] = useState<WorkerWithMeta | null>(null);
  const [deleteWorker, setDeleteWorker] = useState<WorkerWithMeta | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [regions, setRegions] = useState<{ id: string, name: string }[]>([]);
  
  const { 
    data: workers, 
    loading, 
    add: addWorker,
    update: updateWorker,
    remove: removeWorker 
  } = useSupabaseRealtime<WorkerWithMeta>({ 
    tableName: 'workers' 
  });

  useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name');
        
      if (error) {
        console.error('Error fetching regions:', error);
      } else if (data) {
        setRegions(data);
      }
    };
    
    fetchRegions();
  }, []);

  const filteredWorkers = workers.filter(worker => 
    worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.personalId.includes(searchQuery)
  );

  const handleSaveEdit = async (formData: {
    fullName: string;
    personalId: string;
    dailySalary: number;
    region_id: string;
  }) => {
    if (!editWorker) return;

    if (!validateForm(formData)) return;

    setIsSaving(true);
    try {
      await updateWorker(editWorker.id, {
        fullName: formData.fullName,
        personalId: formData.personalId,
        dailySalary: formData.dailySalary,
        region_id: formData.region_id || null
      });
      
      toast({
        title: "Worker Updated",
        description: `${formData.fullName} has been updated successfully.`
      });
      
      setEditWorker(null);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the worker.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteWorker) return;
    
    setIsDeleting(true);
    try {
      await removeWorker(deleteWorker.id);
      
      toast({
        title: "Worker Deleted",
        description: `${deleteWorker.fullName} has been removed from the registry.`
      });
      
      setDeleteWorker(null);
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "There was an error removing the worker.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateNew = async (formData: {
    fullName: string;
    personalId: string;
    dailySalary: number;
    region_id: string;
  }) => {
    if (!validateForm(formData)) return;
    
    setIsSaving(true);
    try {
      await addWorker({
        fullName: formData.fullName,
        personalId: formData.personalId,
        dailySalary: formData.dailySalary,
        region_id: formData.region_id || null
      });
      
      toast({
        title: "Worker Added",
        description: `${formData.fullName} has been added successfully.`
      });
      
      setIsCreating(false);
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "There was an error adding the worker.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = (formData: {
    fullName: string;
    personalId: string;
    dailySalary: number;
    region_id: string;
  }) => {
    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Worker's full name is required",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.personalId.trim()) {
      toast({
        title: "Validation Error",
        description: "Worker's personal ID is required",
        variant: "destructive"
      });
      return false;
    }
    if (formData.dailySalary <= 0) {
      toast({
        title: "Validation Error",
        description: "Daily salary must be greater than zero",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleExportToExcel = () => {
    try {
      const exportData = filteredWorkers.map(worker => {
        const region = regions.find(r => r.id === worker.region_id);
        
        return {
          "Full Name": worker.fullName,
          "Personal ID": worker.personalId,
          "Daily Salary (GEL)": worker.dailySalary,
          "Region": region?.name || "Unassigned"
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Workers");
      
      XLSX.writeFile(workbook, `amradzi_workers_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: "Workers data exported to Excel successfully."
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Could not export data to Excel.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workers Registry</h1>
          <p className="text-muted-foreground">Manage construction site workers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Worker
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportToExcel}
            disabled={filteredWorkers.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Workers List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <WorkersTable 
            workers={filteredWorkers}
            regions={regions}
            loading={loading}
            onView={setViewWorker}
            onEdit={setEditWorker}
            onDelete={setDeleteWorker}
          />
        </CardContent>
      </Card>

      <ViewWorkerDialog 
        worker={viewWorker}
        isOpen={!!viewWorker}
        onClose={() => setViewWorker(null)}
        regions={regions}
      />

      <EditWorkerDialog
        worker={editWorker}
        isOpen={!!editWorker}
        onClose={() => setEditWorker(null)}
        onSave={handleSaveEdit}
        isSaving={isSaving}
        regions={regions}
      />

      <EditWorkerDialog
        worker={null}
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSave={handleCreateNew}
        isSaving={isSaving}
        regions={regions}
        isCreating={true}
      />

      <DeleteWorkerDialog
        worker={deleteWorker}
        isOpen={!!deleteWorker}
        onClose={() => setDeleteWorker(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
