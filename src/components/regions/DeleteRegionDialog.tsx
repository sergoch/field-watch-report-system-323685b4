
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Region } from "@/types";
import { Button } from "@/components/ui/button";

interface DeleteRegionDialogProps {
  region: Region | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteRegionDialog({
  region,
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}: DeleteRegionDialogProps) {
  if (!region) return null;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {region.name}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this region? This action cannot be undone.
            <br /><br />
            <strong>Note:</strong> Regions that are assigned to equipment, workers, reports, or incidents cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
