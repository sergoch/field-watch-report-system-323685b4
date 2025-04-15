
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentTable } from "@/components/equipment/EquipmentTable";
import { EditEquipmentDialog } from "@/components/equipment/EditEquipmentDialog";
import { DeleteEquipmentDialog } from "@/components/equipment/DeleteEquipmentDialog";
import { ViewEquipmentDialog } from "@/components/equipment/ViewEquipmentDialog";
import { EquipmentHeader } from "@/components/equipment/EquipmentHeader";
import { EquipmentSearch } from "@/components/equipment/EquipmentSearch";
import { useEquipmentProvider } from "@/components/equipment/EquipmentProvider";

export default function EquipmentPage() {
  const {
    equipment,
    loading,
    regions,
    searchQuery,
    setSearchQuery,
    viewEquipment,
    setViewEquipment,
    editEquipment,
    setEditEquipment,
    deleteEquipment,
    setDeleteEquipment,
    isDeleting,
    isSaving,
    isCreating,
    setIsCreating,
    handleSaveEdit,
    handleDelete,
    handleCreateNew,
    handleExportToExcel
  } = useEquipmentProvider();

  return (
    <div className="space-y-6">
      <EquipmentHeader
        onAddEquipment={() => setIsCreating(true)}
        onExportToExcel={handleExportToExcel}
        hasEquipment={equipment.length > 0}
      />
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Equipment List</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentSearch 
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          <EquipmentTable 
            equipment={equipment}
            regions={regions}
            loading={loading}
            onView={setViewEquipment}
            onEdit={setEditEquipment}
            onDelete={setDeleteEquipment}
          />
        </CardContent>
      </Card>

      <ViewEquipmentDialog 
        equipment={viewEquipment}
        isOpen={!!viewEquipment}
        onClose={() => setViewEquipment(null)}
        regions={regions}
      />

      <EditEquipmentDialog
        equipment={editEquipment}
        isOpen={!!editEquipment}
        onClose={() => setEditEquipment(null)}
        onSave={handleSaveEdit}
        isSaving={isSaving}
        regions={regions}
      />

      <EditEquipmentDialog
        equipment={null}
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSave={handleCreateNew}
        isSaving={isSaving}
        regions={regions}
        isCreating={true}
      />

      <DeleteEquipmentDialog
        equipment={deleteEquipment}
        isOpen={!!deleteEquipment}
        onClose={() => setDeleteEquipment(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
