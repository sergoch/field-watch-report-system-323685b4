
import { useState, useEffect } from "react";
import { EditDialog } from "@/components/crud/EditDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Worker } from "@/types";

interface WorkerFormData {
  fullName: string;
  personalId: string;
  dailySalary: number;
  region_id: string;
}

interface EditWorkerDialogProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkerFormData) => Promise<void>;
  isSaving: boolean;
  regions: { id: string, name: string }[];
  isCreating?: boolean;
}

export function EditWorkerDialog({
  worker,
  isOpen,
  onClose,
  onSave,
  isSaving,
  regions,
  isCreating = false
}: EditWorkerDialogProps) {
  const [formData, setFormData] = useState<WorkerFormData>({
    fullName: worker?.fullName || '',
    personalId: worker?.personalId || '',
    dailySalary: worker?.dailySalary || 0,
    region_id: worker?.region_id || ''
  });

  // Update form data when worker changes
  useEffect(() => {
    if (worker) {
      setFormData({
        fullName: worker.fullName,
        personalId: worker.personalId,
        dailySalary: worker.dailySalary,
        region_id: worker.region_id || ''
      });
    } else if (isCreating) {
      // Reset form when creating a new worker
      setFormData({
        fullName: '',
        personalId: '',
        dailySalary: 0,
        region_id: regions.length > 0 ? regions[0].id : ''
      });
    }
  }, [worker, isCreating, regions]);

  const handleSubmit = async () => {
    await onSave(formData);
  };

  return (
    <EditDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? "Add New Worker" : "Edit Worker"}
      description={isCreating ? "Enter worker details" : "Update worker information"}
      onSave={handleSubmit}
      isSaving={isSaving}
      saveButtonText={isCreating ? "Add Worker" : "Save Changes"}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="personalId">Personal ID</Label>
          <Input
            id="personalId"
            value={formData.personalId}
            onChange={(e) => setFormData({...formData, personalId: e.target.value})}
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
              {regions.length === 0 ? (
                <SelectItem value="">No regions available</SelectItem>
              ) : (
                regions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dailySalary">Daily Salary (GEL)</Label>
          <Input
            id="dailySalary"
            type="number"
            value={formData.dailySalary}
            onChange={(e) => setFormData({...formData, dailySalary: Number(e.target.value)})}
            className="mt-1"
          />
        </div>
      </div>
    </EditDialog>
  );
}
