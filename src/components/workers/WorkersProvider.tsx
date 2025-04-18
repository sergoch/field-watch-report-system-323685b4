
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Worker } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export function useWorkersProvider() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewWorker, setViewWorker] = useState<Worker | null>(null);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [deleteWorker, setDeleteWorker] = useState<Worker | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [regions, setRegions] = useState<{ id: string, name: string }[]>([]);
  const { toast } = useToast();

  const { 
    data: workersData, 
    loading, 
    add: addWorker,
    update: updateWorker,
    remove: removeWorker 
  } = useSupabaseRealtime<Worker>({ 
    tableName: 'workers' 
  });

  // Normalize worker data to handle field name inconsistencies
  const workers = workersData.map(worker => {
    return {
      ...worker,
      // Ensure both naming formats are available
      fullName: worker.fullName || worker.full_name || '',
      full_name: worker.full_name || worker.fullName || '',
      personalId: worker.personalId || worker.personal_id || '',
      personal_id: worker.personal_id || worker.personalId || '',
      dailySalary: worker.dailySalary || worker.dailysalary || 0,
      dailysalary: worker.dailysalary || worker.dailySalary || 0
    };
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

  const filteredWorkers = workers.filter(worker => {
    const fullName = worker.fullName || worker.full_name || '';
    const personalId = worker.personalId || worker.personal_id || '';
    
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           personalId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSaveEdit = async (formData: {
    fullName: string;
    personalId: string;
    dailysalary: number;
    region_id: string;
  }) => {
    if (!editWorker) return;

    if (!validateForm(formData)) return;

    setIsSaving(true);
    try {
      await updateWorker(editWorker.id, {
        full_name: formData.fullName,
        personal_id: formData.personalId,
        dailysalary: formData.dailysalary,
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
        description: `${deleteWorker.fullName || deleteWorker.full_name} has been removed from the registry.`
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
    dailysalary: number;
    region_id: string;
  }) => {
    if (!validateForm(formData)) return;
    
    setIsSaving(true);
    try {
      await addWorker({
        full_name: formData.fullName,
        personal_id: formData.personalId,
        dailysalary: formData.dailysalary,
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
    dailysalary: number;
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
    if (formData.dailysalary <= 0) {
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
          "Full Name": worker.fullName || worker.full_name,
          "Personal ID": worker.personalId || worker.personal_id,
          "Daily Salary (GEL)": worker.dailySalary || worker.dailysalary,
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

  return {
    workers: filteredWorkers,
    loading,
    regions,
    searchQuery,
    setSearchQuery,
    viewWorker,
    setViewWorker,
    editWorker,
    setEditWorker,
    deleteWorker,
    setDeleteWorker,
    isDeleting,
    isSaving,
    isCreating,
    setIsCreating,
    handleSaveEdit,
    handleDelete,
    handleCreateNew,
    handleExportToExcel
  };
}
