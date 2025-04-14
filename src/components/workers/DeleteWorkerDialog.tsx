
import { DeleteConfirmDialog } from "@/components/crud/DeleteConfirmDialog";
import { Worker } from "@/types";

interface DeleteWorkerDialogProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteWorkerDialog({
  worker,
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}: DeleteWorkerDialogProps) {
  return (
    <DeleteConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Worker"
      description={`Are you sure you want to remove ${worker?.fullName} from the registry? This action cannot be undone.`}
      isDeleting={isDeleting}
    />
  );
}
