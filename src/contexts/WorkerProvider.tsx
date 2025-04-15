
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { Worker } from "@/types";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { isAdmin } from "@/utils/auth";

export interface WorkerFormData {
  fullName: string;
  personalId: string;
  dailySalary: number;
  region_id?: string;
}

interface WorkerContextType {
  workers: Worker[];
  loading: boolean;
  error: Error | null;
  regions: { id: string, name: string }[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewWorker: Worker | null;
  setViewWorker: (worker: Worker | null) => void;
  editWorker: Worker | null;
  setEditWorker: (worker: Worker | null) => void;
  deleteWorker: Worker | null;
  setDeleteWorker: (worker: Worker | null) => void;
  isDeleting: boolean;
  isSaving: boolean;
  isCreating: boolean;
  setIsCreating: (isCreating: boolean) => void;
  handleSaveEdit: (formData: WorkerFormData) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleCreateNew: (formData: WorkerFormData) => Promise<void>;
  handleExportToExcel: () => void;
  refetch: () => Promise<void>;
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export function WorkerProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const [viewWorker, setViewWorker] = useState<Worker | null>(null);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [deleteWorker, setDeleteWorker] = useState<Worker | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [regions, setRegions] = useState<{ id: string, name: string }[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const userIsAdmin = isAdmin(user);
  
  let filter: string | Record<string, any> | undefined;
  
  if (!userIsAdmin) {
    if (user?.assignedRegions && user.assignedRegions.length > 0) {
      filter = { region_id: user.assignedRegions };
    }
  } else if (selectedRegion && selectedRegion !== "all") {
    filter = { region_id: selectedRegion };
  }
  
  const { 
    data: workers, 
    loading, 
    error,
    add: addWorker,
    update: updateWorker,
    remove: removeWorker,
    refetch
  } = useSupabaseRealtime<Worker>({ 
    tableName: 'workers',
    filter: filter
  });

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        let query = supabase.from('regions').select('id, name').order('name');
        
        if (!userIsAdmin && user?.assignedRegions && user.assignedRegions.length > 0) {
          query = query.in('id', user.assignedRegions);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching regions:', error);
          toast({
            title: "Error fetching regions",
            description: error.message,
            variant: "destructive"
          });
        } else if (data) {
          setRegions(data);
          
          if (!userIsAdmin && user?.regionId && !selectedRegion) {
            setSelectedRegion(user.regionId);
          }
        }
      } catch (err: any) {
        console.error('Exception when fetching regions:', err);
        toast({
          title: "Error",
          description: err.message || "Failed to load regions",
          variant: "destructive"
        });
      }
    };
    
    if (user) {
      fetchRegions();
    }
  }, [toast, user, userIsAdmin, selectedRegion]);

  // Filter workers and handle null/undefined values safely
  const filteredWorkers = workers.filter(worker => {
    // Check if worker exists and has required properties
    if (!worker || typeof worker.fullName !== 'string' || typeof worker.personalId !== 'string') {
      return false;
    }
    
    return (
      worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.personalId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSaveEdit = async (formData: WorkerFormData) => {
    if (!editWorker) return;

    if (!validateForm(formData)) return;

    setIsSaving(true);
    try {
      if (!userIsAdmin && formData.region_id && user?.assignedRegions) {
        if (!user.assignedRegions.includes(formData.region_id)) {
          throw new Error("You don't have permission to assign workers to this region");
        }
      }
      
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
      if (!userIsAdmin && deleteWorker.region_id) {
        if (user?.assignedRegions && !user.assignedRegions.includes(deleteWorker.region_id)) {
          throw new Error("You don't have permission to delete workers from this region");
        }
      }
      
      await removeWorker(deleteWorker.id);
      
      toast({
        title: "Worker Deleted",
        description: `${deleteWorker.fullName} has been removed.`
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

  const handleCreateNew = async (formData: WorkerFormData) => {
    if (!validateForm(formData)) return;
    
    setIsSaving(true);
    try {
      let regionId = formData.region_id;
      if (!userIsAdmin && !regionId && user?.regionId) {
        regionId = user.regionId;
      }
      
      if (!userIsAdmin && regionId && user?.assignedRegions) {
        if (!user.assignedRegions.includes(regionId)) {
          throw new Error("You don't have permission to add workers to this region");
        }
      }
      
      // Fix the field name mismatch - use dailysalary instead of dailySalary
      await addWorker({
        full_name: formData.fullName,
        personal_id: formData.personalId,
        dailysalary: formData.dailySalary,
        region_id: regionId || null
      } as any);
      
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

  const validateForm = (formData: WorkerFormData): boolean => {
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
    
    if (!userIsAdmin && !formData.region_id && !user?.regionId) {
      toast({
        title: "Validation Error",
        description: "Please select a region for this worker",
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
          "ID": worker.personalId,
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
        description: "Worker data exported to Excel successfully."
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Could not export data to Excel.",
        variant: "destructive"
      });
    }
  };

  const value = {
    workers: filteredWorkers,
    loading,
    error,
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
    handleExportToExcel,
    refetch,
    selectedRegion,
    setSelectedRegion
  };

  return <WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>;
}

export function useWorkerContext() {
  const context = useContext(WorkerContext);
  if (context === undefined) {
    throw new Error('useWorkerContext must be used within a WorkerProvider');
  }
  return context;
}
