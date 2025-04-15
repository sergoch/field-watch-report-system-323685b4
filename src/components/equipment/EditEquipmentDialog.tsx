
import { useState, useEffect } from "react";
import { EditDialog } from "@/components/crud/EditDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Equipment } from "@/types";

interface EquipmentFormData {
  type: string;
  licensePlate: string;
  operatorName: string;
  operatorId: string;
  dailySalary: number;
  dailysalary: number; // Add this to match EquipmentProvider interface
  fuelType: 'diesel' | 'gasoline';
  region_id: string;
}

interface EditEquipmentDialogProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EquipmentFormData) => Promise<void>;
  isSaving: boolean;
  regions: { id: string, name: string }[];
  isCreating?: boolean;
}

export function EditEquipmentDialog({
  equipment,
  isOpen,
  onClose,
  onSave,
  isSaving,
  regions,
  isCreating = false
}: EditEquipmentDialogProps) {
  const [formData, setFormData] = useState<EquipmentFormData>({
    type: equipment?.type || '',
    licensePlate: equipment?.licensePlate || equipment?.license_plate || '',
    operatorName: equipment?.operatorName || '',
    operatorId: equipment?.operatorId || '',
    dailySalary: equipment?.dailySalary || equipment?.dailysalary || 0,
    dailysalary: equipment?.dailysalary || equipment?.dailySalary || 0,
    fuelType: equipment?.fuelType || 'diesel',
    region_id: equipment?.region_id || ''
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        type: equipment.type,
        licensePlate: equipment.licensePlate || equipment.license_plate || '',
        operatorName: equipment.operatorName || '',
        operatorId: equipment.operatorId || '',
        dailySalary: equipment.dailySalary || equipment.dailysalary || 0,
        dailysalary: equipment.dailysalary || equipment.dailySalary || 0,
        fuelType: equipment.fuelType || 'diesel',
        region_id: equipment.region_id || ''
      });
    } else if (isCreating) {
      setFormData({
        type: '',
        licensePlate: '',
        operatorName: '',
        operatorId: '',
        dailySalary: 0,
        dailysalary: 0,
        fuelType: 'diesel',
        region_id: regions.length > 0 ? regions[0].id : ''
      });
    }
  }, [equipment, isCreating, regions]);

  const handleSubmit = async () => {
    await onSave(formData);
  };

  return (
    <EditDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? "Add New Equipment" : "Edit Equipment"}
      description={isCreating ? "Enter equipment details" : "Update equipment information"}
      onSave={handleSubmit}
      isSaving={isSaving}
      saveButtonText={isCreating ? "Add Equipment" : "Save Changes"}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="type">Equipment Type</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="licensePlate">License Plate</Label>
          <Input
            id="licensePlate"
            value={formData.licensePlate}
            onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="operatorName">Operator Name</Label>
          <Input
            id="operatorName"
            value={formData.operatorName}
            onChange={(e) => setFormData({...formData, operatorName: e.target.value})}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="operatorId">Operator ID</Label>
          <Input
            id="operatorId"
            value={formData.operatorId}
            onChange={(e) => setFormData({...formData, operatorId: e.target.value})}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <Select 
            value={formData.region_id} 
            onValueChange={(value) => setFormData({...formData, region_id: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dailySalary">Daily Salary (GEL)</Label>
          <Input
            id="dailySalary"
            type="number"
            value={formData.dailySalary}
            onChange={(e) => {
              const value = Number(e.target.value);
              setFormData({
                ...formData, 
                dailySalary: value,
                dailysalary: value // Update both properties
              });
            }}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Select 
            value={formData.fuelType} 
            onValueChange={(value) => setFormData({...formData, fuelType: value as 'diesel' | 'gasoline'})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="gasoline">Gasoline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </EditDialog>
  );
}
