
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";

interface EquipmentHeaderProps {
  onAddEquipment: () => void;
  onExportToExcel: () => void;
  hasEquipment: boolean;
}

export function EquipmentHeader({
  onAddEquipment,
  onExportToExcel,
  hasEquipment
}: EquipmentHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Equipment Registry</h1>
        <p className="text-muted-foreground">Manage construction site equipment</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onAddEquipment}>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
        <Button 
          variant="outline" 
          onClick={onExportToExcel}
          disabled={!hasEquipment}
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>
    </div>
  );
}
