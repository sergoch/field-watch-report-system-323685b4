
import { DeleteConfirmDialog } from "@/components/crud/DeleteConfirmDialog";
import { Equipment } from "@/types";

interface DeleteEquipmentDialogProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteEquipmentDialog({
  equipment,
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}: DeleteEquipmentDialogProps) {
  return (
    <DeleteConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Equipment"
      description={`Are you sure you want to delete ${equipment?.type} (${equipment?.licensePlate})? This action cannot be undone.`}
      isDeleting={isDeleting}
    />
  );
}
