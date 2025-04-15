
import { Card, CardContent } from "@/components/ui/card";
import { WorkersTable } from "@/components/workers/WorkersTable";
import { ViewWorkerDialog } from "@/components/workers/ViewWorkerDialog";
import { EditWorkerDialog } from "@/components/workers/EditWorkerDialog";
import { DeleteWorkerDialog } from "@/components/workers/DeleteWorkerDialog";
import { WorkersHeader } from "@/components/workers/WorkersHeader";
import { WorkersSearch } from "@/components/workers/WorkersSearch";
import { WorkerProvider, useWorkerContext } from "@/contexts/WorkerProvider";
import { WorkersRegionFilter } from "@/components/workers/WorkersRegionFilter";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/utils/auth";

function WorkersContent() {
  const {
    workers,
    loading,
    regions,
    searchQuery,
    setSearchQuery,
    viewWorker,
    setViewWorker,
    editWorker,
    setEditWorker,
    deleteWorker,
    setDeleteWorker,
    isDeleting,
    isSaving,
    isCreating,
    setIsCreating,
    handleSaveEdit,
    handleDelete,
    handleCreateNew,
    handleExportToExcel,
    selectedRegion,
    setSelectedRegion
  } = useWorkerContext();

  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);

  return (
    <div className="space-y-6">
      <WorkersHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddWorker={() => setIsCreating(true)}
        onExportToExcel={handleExportToExcel}
        hasWorkers={workers.length > 0}
      />
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
            <div className="flex-1">
              <WorkersSearch 
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
            <WorkersRegionFilter 
              regions={regions}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              isAdmin={userIsAdmin}
            />
          </div>
          
          <WorkersTable 
            workers={workers}
            regions={regions}
            loading={loading}
            onView={setViewWorker}
            onEdit={setEditWorker}
            onDelete={setDeleteWorker}
          />
        </CardContent>
      </Card>

      <ViewWorkerDialog 
        worker={viewWorker}
        isOpen={!!viewWorker}
        onClose={() => setViewWorker(null)}
        regions={regions}
      />

      <EditWorkerDialog
        worker={editWorker}
        isOpen={!!editWorker}
        onClose={() => setEditWorker(null)}
        onSave={handleSaveEdit}
        isSaving={isSaving}
        regions={regions}
      />

      <EditWorkerDialog
        worker={null}
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSave={handleCreateNew}
        isSaving={isSaving}
        regions={regions}
        isCreating={true}
      />

      <DeleteWorkerDialog
        worker={deleteWorker}
        isOpen={!!deleteWorker}
        onClose={() => setDeleteWorker(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default function WorkersPage() {
  return (
    <WorkerProvider>
      <WorkersContent />
    </WorkerProvider>
  );
}
