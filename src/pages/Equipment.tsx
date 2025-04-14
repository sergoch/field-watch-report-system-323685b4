
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { Equipment } from "@/types";
import { ViewDetailsDialog } from "@/components/crud/ViewDetailsDialog";
import { EditDialog } from "@/components/crud/EditDialog";
import { DeleteConfirmDialog } from "@/components/crud/DeleteConfirmDialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from 'xlsx';

export default function EquipmentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const [viewEquipment, setViewEquipment] = useState<Equipment | null>(null);
  const [editEquipment, setEditEquipment] = useState<Equipment | null>(null);
  const [deleteEquipment, setDeleteEquipment] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    type: '',
    licensePlate: '',
    fuelType: 'diesel' as 'diesel' | 'gasoline',
    operatorName: '',
    operatorId: '',
    dailySalary: 0
  });

  // Use our real-time hook to fetch equipment data
  const { 
    data: equipmentList, 
    loading, 
    update: updateEquipment,
    remove: removeEquipment 
  } = useSupabaseRealtime<Equipment>({ 
    tableName: 'equipment' 
  });

  // Filter equipment based on search query
  const filteredEquipment = equipmentList.filter(equipment => 
    equipment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    equipment.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    equipment.operatorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEditDialog = (equipment: Equipment) => {
    setEditEquipment(equipment);
    setFormData({
      type: equipment.type,
      licensePlate: equipment.licensePlate,
      fuelType: equipment.fuelType,
      operatorName: equipment.operatorName,
      operatorId: equipment.operatorId,
      dailySalary: equipment.dailySalary
    });
  };

  const handleSaveEdit = async () => {
    if (!editEquipment) return;

    setIsSaving(true);
    try {
      await updateEquipment(editEquipment.id, {
        type: formData.type,
        licensePlate: formData.licensePlate,
        fuelType: formData.fuelType,
        operatorName: formData.operatorName,
        operatorId: formData.operatorId,
        dailySalary: formData.dailySalary
      });
      
      toast({
        title: "Equipment Updated",
        description: `${formData.type} (${formData.licensePlate}) has been updated successfully.`
      });
      
      setEditEquipment(null);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the equipment.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEquipment) return;
    
    setIsDeleting(true);
    try {
      await removeEquipment(deleteEquipment.id);
      
      toast({
        title: "Equipment Deleted",
        description: `${deleteEquipment.type} (${deleteEquipment.licensePlate}) has been removed from the registry.`
      });
      
      setDeleteEquipment(null);
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "There was an error removing the equipment.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      const exportData = filteredEquipment.map(equipment => ({
        "Type": equipment.type,
        "License Plate": equipment.licensePlate,
        "Fuel Type": equipment.fuelType,
        "Operator": equipment.operatorName,
        "Operator ID": equipment.operatorId,
        "Daily Salary (GEL)": equipment.dailySalary
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Equipment");
      
      XLSX.writeFile(workbook, `amradzi_equipment_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: "Equipment data exported to Excel successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export data to Excel.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipment Registry</h1>
          <p className="text-muted-foreground">Manage construction site equipment</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <a href="/equipment/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </a>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportToExcel}
            disabled={filteredEquipment.length === 0}
          >
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading equipment data...
                    </TableCell>
                  </TableRow>
                ) : filteredEquipment.length > 0 ? (
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setViewEquipment(equipment)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenEditDialog(equipment)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteEquipment(equipment)}
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

      {/* View Equipment Details Dialog */}
      <ViewDetailsDialog 
        isOpen={!!viewEquipment}
        onClose={() => setViewEquipment(null)}
        title="Equipment Details"
        description="Complete equipment information"
      >
        {viewEquipment && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Type</Label>
                <p>{viewEquipment.type}</p>
              </div>
              <div>
                <Label className="font-semibold">License Plate</Label>
                <p>{viewEquipment.licensePlate}</p>
              </div>
              <div>
                <Label className="font-semibold">Fuel Type</Label>
                <p>
                  <Badge variant={viewEquipment.fuelType === "diesel" ? "outline" : "secondary"}>
                    {viewEquipment.fuelType}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="font-semibold">Operator Name</Label>
                <p>{viewEquipment.operatorName}</p>
              </div>
              <div>
                <Label className="font-semibold">Operator ID</Label>
                <p>{viewEquipment.operatorId}</p>
              </div>
              <div>
                <Label className="font-semibold">Daily Salary</Label>
                <p>{viewEquipment.dailySalary} GEL</p>
              </div>
            </div>
          </div>
        )}
      </ViewDetailsDialog>

      {/* Edit Equipment Dialog */}
      <EditDialog
        isOpen={!!editEquipment}
        onClose={() => setEditEquipment(null)}
        title="Edit Equipment"
        description="Update equipment information"
        onSave={handleSaveEdit}
        isSaving={isSaving}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="type">Equipment Type</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="licensePlate">License Plate</Label>
            <Input
              id="licensePlate"
              value={formData.licensePlate}
              onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="fuelType">Fuel Type</Label>
            <Select 
              value={formData.fuelType} 
              onValueChange={(value) => setFormData({...formData, fuelType: value as 'diesel' | 'gasoline'})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="gasoline">Gasoline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="operatorName">Operator Name</Label>
            <Input
              id="operatorName"
              value={formData.operatorName}
              onChange={(e) => setFormData({...formData, operatorName: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="operatorId">Operator ID</Label>
            <Input
              id="operatorId"
              value={formData.operatorId}
              onChange={(e) => setFormData({...formData, operatorId: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dailySalary">Daily Salary (GEL)</Label>
            <Input
              id="dailySalary"
              type="number"
              value={formData.dailySalary}
              onChange={(e) => setFormData({...formData, dailySalary: Number(e.target.value)})}
              className="mt-1"
            />
          </div>
        </div>
      </EditDialog>

      {/* Delete Equipment Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteEquipment}
        onClose={() => setDeleteEquipment(null)}
        onConfirm={handleDelete}
        title="Delete Equipment"
        description={`Are you sure you want to remove ${deleteEquipment?.type} (${deleteEquipment?.licensePlate}) from the registry? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
