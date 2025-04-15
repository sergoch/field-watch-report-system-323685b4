
import { DeleteConfirmDialog } from "@/components/crud/DeleteConfirmDialog";
import { Worker } from "@/types";

interface DeleteWorkerDialogProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteWorkerDialog({
  worker,
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}: DeleteWorkerDialogProps) {
  const workerName = worker?.fullName || worker?.full_name || 'this worker';
  
  return (
    <DeleteConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Worker"
      description={`Are you sure you want to remove ${workerName} from the registry? This action cannot be undone.`}
      isDeleting={isDeleting}
    />
  );
}
