
import { EditDialog } from "@/components/crud/EditDialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Region } from "@/types";

interface UserEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; region_id: string }) => Promise<void>;
  user: {
    id: string;
    name: string;
    region_id?: string;
  } | null;
  regions: Region[];
  isSaving: boolean;
}

export function UserEditDialog({ isOpen, onClose, onSave, user, regions, isSaving }: UserEditDialogProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    region_id: user?.region_id || ''
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }
    await onSave(formData);
  };

  return (
    <EditDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      description="Update user details below."
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="grid gap-4 py-4">
        <div className="space-y-1">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="region">Region</Label>
          <Select
            value={formData.region_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, region_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </EditDialog>
  );
}
