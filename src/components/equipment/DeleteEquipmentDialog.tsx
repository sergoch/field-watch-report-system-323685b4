
import { DeleteConfirmDialog } from "@/components/crud/DeleteConfirmDialog";
import { Equipment } from "@/types";

interface DeleteEquipmentDialogProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteEquipmentDialog({
  equipment,
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}: DeleteEquipmentDialogProps) {
  const equipmentName = equipment?.type || 'this equipment';
  const licensePlate = equipment?.licensePlate || equipment?.license_plate || '';
  
  return (
    <DeleteConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Equipment"
      description={`Are you sure you want to delete ${equipmentName} (${licensePlate})? This action cannot be undone.`}
      isDeleting={isDeleting}
    />
  );
}
