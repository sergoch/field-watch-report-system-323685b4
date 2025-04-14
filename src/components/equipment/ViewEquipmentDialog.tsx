
import { ViewDetailsDialog } from "@/components/crud/ViewDetailsDialog";
import { Label } from "@/components/ui/label";
import { Equipment } from "@/types";

interface ViewEquipmentDialogProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  regions: { id: string, name: string }[];
}

export function ViewEquipmentDialog({
  equipment,
  isOpen,
  onClose,
  regions
}: ViewEquipmentDialogProps) {
  return (
    <ViewDetailsDialog 
      isOpen={isOpen}
      onClose={onClose}
      title="Equipment Details"
      description="Complete equipment information"
    >
      {equipment && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Type</Label>
              <p>{equipment.type}</p>
            </div>
            <div>
              <Label className="font-semibold">License Plate</Label>
              <p>{equipment.licensePlate}</p>
            </div>
            <div>
              <Label className="font-semibold">Operator Name</Label>
              <p>{equipment.operatorName}</p>
            </div>
            <div>
              <Label className="font-semibold">Operator ID</Label>
              <p>{equipment.operatorId}</p>
            </div>
            <div>
              <Label className="font-semibold">Region</Label>
              <p>{regions.find(r => r.id === equipment.region_id)?.name || "Unassigned"}</p>
            </div>
            <div>
              <Label className="font-semibold">Fuel Type</Label>
              <p className="capitalize">{equipment.fuelType}</p>
            </div>
            <div>
              <Label className="font-semibold">Daily Salary</Label>
              <p>{equipment.dailySalary} GEL</p>
            </div>
          </div>
        </div>
      )}
    </ViewDetailsDialog>
  );
}
