
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Equipment } from "@/types";

interface EquipmentTableProps {
  equipment: Equipment[];
}

export function EquipmentTable({ equipment }: EquipmentTableProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-sky-50">
        <CardTitle>Equipment Used</CardTitle>
        <CardDescription>Equipment in your recent reports</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">License Plate</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map(equip => (
                <tr key={equip.id} className="border-b hover:bg-muted/20">
                  <td className="p-3">{equip.type}</td>
                  <td className="p-3">{equip.licensePlate}</td>
                </tr>
              ))}
              {equipment.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-3 text-center text-muted-foreground">No equipment used</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
