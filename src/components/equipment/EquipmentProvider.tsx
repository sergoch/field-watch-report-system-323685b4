
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { Equipment } from "@/types";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

export interface EquipmentContextData {
  equipment: Equipment[];
  loading: boolean;
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
}

interface EquipmentFormData {
  type: string;
  licensePlate: string;
  operatorName: string;
  operatorId: string;
  dailySalary: number;
  fuelType: 'diesel' | 'gasoline';
  region_id: string;
}

export function useEquipmentProvider() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [viewEquipment, setViewEquipment] = useState<Equipment | null>(null);
  const [editEquipment, setEditEquipment] = useState<Equipment | null>(null);
  const [deleteEquipment, setDeleteEquipment] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [regions, setRegions] = useState<{ id: string, name: string }[]>([]);
  
  const { 
    data: equipment, 
    loading, 
    add: addEquipment,
    update: updateEquipment,
    remove: removeEquipment 
  } = useSupabaseRealtime<Equipment>({ 
    tableName: 'equipment' 
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
      await updateEquipment(editEquipment.id, {
        type: formData.type,
        licensePlate: formData.licensePlate,
        operatorName: formData.operatorName,
        operatorId: formData.operatorId,
        dailysalary: formData.dailySalary, // Map dailySalary to dailysalary
        fuelType: formData.fuelType,
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
      await addEquipment({
        type: formData.type,
        licensePlate: formData.licensePlate,
        operatorName: formData.operatorName,
        operatorId: formData.operatorId,
        dailysalary: formData.dailySalary, // Changed from dailySalary to dailysalary to match the required type
        fuelType: formData.fuelType,
        region_id: formData.region_id || null
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

  const validateForm = (formData: EquipmentFormData) => {
    if (!formData.type) {
      toast({
        title: "Validation Error",
        description: "Equipment type is required",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.licensePlate) {
      toast({
        title: "Validation Error",
        description: "License plate is required",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.operatorName) {
      toast({
        title: "Validation Error",
        description: "Operator name is required",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.operatorId) {
      toast({
        title: "Validation Error",
        description: "Operator ID is required",
        variant: "destructive"
      });
      return false;
    }
    if (formData.dailySalary <= 0) {
      toast({
        title: "Validation Error",
        description: "Daily salary must be greater than 0",
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
          "Daily Salary (GEL)": equip.dailySalary,
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

  return {
    equipment: filteredEquipment,
    loading,
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
    handleExportToExcel
  };
}
