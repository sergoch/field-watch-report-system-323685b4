
import { ViewDetailsDialog } from "@/components/crud/ViewDetailsDialog";
import { Label } from "@/components/ui/label";
import { Worker } from "@/types";

interface ViewWorkerDialogProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
  regions: { id: string, name: string }[];
}

export function ViewWorkerDialog({
  worker,
  isOpen,
  onClose,
  regions
}: ViewWorkerDialogProps) {
  return (
    <ViewDetailsDialog 
      isOpen={isOpen}
      onClose={onClose}
      title="Worker Details"
      description="Complete worker information"
    >
      {worker && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Full Name</Label>
              <p>{worker.fullName}</p>
            </div>
            <div>
              <Label className="font-semibold">Personal ID</Label>
              <p>{worker.personalId}</p>
            </div>
            <div>
              <Label className="font-semibold">Region</Label>
              <p>{regions.find(r => r.id === worker.region_id)?.name || "Unassigned"}</p>
            </div>
            <div>
              <Label className="font-semibold">Daily Salary</Label>
              <p>{worker.dailySalary} GEL</p>
            </div>
            {worker?.createdAt && (
              <div>
                <Label className="font-semibold">Created At</Label>
                <p>{new Date(worker.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ViewDetailsDialog>
  );
}
