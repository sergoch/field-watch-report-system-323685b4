
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Equipment } from "@/types";

interface EquipmentTableProps {
  equipment: Equipment[];
  regions: { id: string, name: string }[];
  loading: boolean;
  onView: (equipment: Equipment) => void;
  onEdit: (equipment: Equipment) => void;
  onDelete: (equipment: Equipment) => void;
}

export function EquipmentTable({ 
  equipment, 
  regions, 
  loading, 
  onView, 
  onEdit, 
  onDelete 
}: EquipmentTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Fuel Type</TableHead>
              <TableHead>Daily Salary (GEL)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Loading equipment data...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Fuel Type</TableHead>
              <TableHead>Daily Salary (GEL)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No equipment found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Operator</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Fuel Type</TableHead>
            <TableHead>Daily Salary (GEL)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((equip) => {
            const region = regions.find(r => r.id === equip.region_id);
            
            return (
              <TableRow key={equip.id}>
                <TableCell className="font-medium">{equip.type}</TableCell>
                <TableCell>{equip.licensePlate}</TableCell>
                <TableCell>{equip.operatorName}</TableCell>
                <TableCell>{region?.name || "Unassigned"}</TableCell>
                <TableCell className="capitalize">{equip.fuelType}</TableCell>
                <TableCell>{equip.dailySalary}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(equip)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(equip)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(equip)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
