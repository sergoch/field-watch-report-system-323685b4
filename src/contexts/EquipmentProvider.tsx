import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { Equipment } from "@/types";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { isAdmin } from "@/utils/auth";

export interface EquipmentFormData {
  type: string;
  licensePlate: string;
  operatorName: string;
  operatorId: string;
  dailysalary: number;
  fuelType: 'diesel' | 'gasoline';
  region_id?: string;
}

interface EquipmentContextType {
  equipment: Equipment[];
  loading: boolean;
  error: Error | null;
  regions: { id: string, name: string }[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewEquipment: Equipment | null;
  setViewEquipment: (equipment: Equipment | null) => void;
  editEquipment: Equipment | null;
  setEditEquipment: (equipment: Equipment | null) => void;
  deleteEquipment: Equipment | null;
  setDeleteEquipment: (equipment: Equipment | null) => void;
  isDeleting: boolean;
  isSaving: boolean;
  isCreating: boolean;
  setIsCreating: (isCreating: boolean) => void;
  handleSaveEdit: (formData: EquipmentFormData) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleCreateNew: (formData: EquipmentFormData) => Promise<void>;
  handleExportToExcel: () => void;
  refetch: () => Promise<void>;
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const [viewEquipment, setViewEquipment] = useState<Equipment | null>(null);
  const [editEquipment, setEditEquipment] = useState<Equipment | null>(null);
  const [deleteEquipment, setDeleteEquipment] = useState<Equipment | null>(null);
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
  } else if (selectedRegion) {
    filter = { region_id: selectedRegion };
  }
  
  const { 
    data: equipment, 
    loading, 
    error,
    add: addEquipment,
    update: updateEquipment,
    remove: removeEquipment,
    refetch
  } = useSupabaseRealtime<Equipment>({ 
    tableName: 'equipment',
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

  const filteredEquipment = equipment.filter(equip => 
    equip.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    equip.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    equip.operatorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveEdit = async (formData: EquipmentFormData) => {
    if (!editEquipment) return;

    if (!validateForm(formData)) return;

    setIsSaving(true);
    try {
      if (!userIsAdmin && formData.region_id && user?.assignedRegions) {
        if (!user.assignedRegions.includes(formData.region_id)) {
          throw new Error("You don't have permission to assign equipment to this region");
        }
      }
      
      await updateEquipment(editEquipment.id, {
        type: formData.type,
        license_plate: formData.licensePlate,
        operator_name: formData.operatorName,
        operator_id: formData.operatorId,
        dailysalary: formData.dailysalary,
        fuel_type: formData.fuelType,
        region_id: formData.region_id || null
      });
      
      toast({
        title: "Equipment Updated",
        description: `${formData.type} (${formData.licensePlate}) has been updated successfully.`
      });
      
      setEditEquipment(null);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the equipment.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEquipment) return;
    
    setIsDeleting(true);
    try {
      if (!userIsAdmin && deleteEquipment.region_id) {
        if (user?.assignedRegions && !user.assignedRegions.includes(deleteEquipment.region_id)) {
          throw new Error("You don't have permission to delete equipment from this region");
        }
      }
      
      await removeEquipment(deleteEquipment.id);
      
      toast({
        title: "Equipment Deleted",
        description: `${deleteEquipment.type} (${deleteEquipment.licensePlate}) has been removed.`
      });
      
      setDeleteEquipment(null);
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "There was an error removing the equipment.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateNew = async (formData: EquipmentFormData) => {
    if (!validateForm(formData)) return;
    
    setIsSaving(true);
    try {
      let regionId = formData.region_id;
      if (!userIsAdmin && !regionId && user?.regionId) {
        regionId = user.regionId;
      }
      
      if (!userIsAdmin && regionId && user?.assignedRegions) {
        if (!user.assignedRegions.includes(regionId)) {
          throw new Error("You don't have permission to add equipment to this region");
        }
      }
      
      await addEquipment({
        type: formData.type,
        licensePlate: formData.licensePlate,
        operatorName: formData.operatorName,
        operatorId: formData.operatorId,
        dailysalary: formData.dailysalary,
        fuelType: formData.fuelType,
        region_id: regionId || null
      });
      
      toast({
        title: "Equipment Added",
        description: `${formData.type} (${formData.licensePlate}) has been added successfully.`
      });
      
      setIsCreating(false);
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "There was an error adding the equipment.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = (formData: EquipmentFormData): boolean => {
    if (!formData.type.trim()) {
      toast({
        title: "Validation Error",
        description: "Equipment type is required",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.licensePlate.trim()) {
      toast({
        title: "Validation Error",
        description: "License plate is required",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.operatorName.trim()) {
      toast({
        title: "Validation Error",
        description: "Operator name is required",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.operatorId.trim()) {
      toast({
        title: "Validation Error",
        description: "Operator ID is required",
        variant: "destructive"
      });
      return false;
    }
    if (formData.dailysalary <= 0) {
      toast({
        title: "Validation Error",
        description: "Daily salary must be greater than 0",
        variant: "destructive"
      });
      return false;
    }
    
    if (!userIsAdmin && !formData.region_id && !user?.regionId) {
      toast({
        title: "Validation Error",
        description: "Please select a region for this equipment",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleExportToExcel = () => {
    try {
      const exportData = filteredEquipment.map(equip => {
        const region = regions.find(r => r.id === equip.region_id);
        
        return {
          "Type": equip.type,
          "License Plate": equip.licensePlate,
          "Operator Name": equip.operatorName,
          "Operator ID": equip.operatorId,
          "Fuel Type": equip.fuelType,
          "Daily Salary (GEL)": equip.dailysalary,
          "Region": region?.name || "Unassigned"
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment");
      
      XLSX.writeFile(workbook, `amradzi_equipment_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: "Equipment data exported to Excel successfully."
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
    equipment: filteredEquipment,
    loading,
    error,
    regions,
    searchQuery,
    setSearchQuery,
    viewEquipment,
    setViewEquipment,
    editEquipment,
    setEditEquipment,
    deleteEquipment,
    setDeleteEquipment,
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

  return <EquipmentContext.Provider value={value}>{children}</EquipmentContext.Provider>;
}

export function useEquipmentContext() {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error('useEquipmentContext must be used within an EquipmentProvider');
  }
  return context;
}
