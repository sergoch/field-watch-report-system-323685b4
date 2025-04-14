
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EquipmentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Mock data for equipment
  const mockEquipment = [
    { id: "1", type: "Excavator", licensePlate: "AA-001-AA", fuelType: "diesel", operatorName: "Giorgi Tsereteli", operatorId: "01002345678", dailySalary: 120 },
    { id: "2", type: "Bulldozer", licensePlate: "BB-002-BB", fuelType: "diesel", operatorName: "Tamaz Kalandadze", operatorId: "01003456789", dailySalary: 130 },
    { id: "3", type: "Crane", licensePlate: "CC-003-CC", fuelType: "diesel", operatorName: "Vakhtang Kikabidze", operatorId: "01004567890", dailySalary: 140 },
    { id: "4", type: "Truck", licensePlate: "DD-004-DD", fuelType: "diesel", operatorName: "Zurab Shengelia", operatorId: "01005678901", dailySalary: 100 },
    { id: "5", type: "Loader", licensePlate: "EE-005-EE", fuelType: "diesel", operatorName: "Irakli Javakhishvili", operatorId: "01006789012", dailySalary: 110 },
    { id: "6", type: "Compactor", licensePlate: "FF-006-FF", fuelType: "gasoline", operatorName: "Mamuka Kobakhidze", operatorId: "01007890123", dailySalary: 95 },
  ];
  
  // Filter equipment based on search query
  const filteredEquipment = mockEquipment.filter(equipment => 
    equipment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    equipment.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    equipment.operatorName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleDelete = (id: string, type: string, licensePlate: string) => {
    // In a real app, make API call to delete the equipment
    toast({
      title: "Equipment Deleted",
      description: `${type} (${licensePlate}) has been removed from the registry.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipment Registry</h1>
          <p className="text-muted-foreground">Manage construction site equipment</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Equipment List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by type, license plate or operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Daily Salary (GEL)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell className="font-medium">{equipment.type}</TableCell>
                      <TableCell>{equipment.licensePlate}</TableCell>
                      <TableCell>
                        <Badge variant={equipment.fuelType === "diesel" ? "outline" : "secondary"}>
                          {equipment.fuelType}
                        </Badge>
                      </TableCell>
                      <TableCell>{equipment.operatorName}</TableCell>
                      <TableCell>{equipment.dailySalary}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(equipment.id, equipment.type, equipment.licensePlate)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No equipment found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
