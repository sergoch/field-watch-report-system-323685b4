import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EditWorkerDialog } from '@/components/workers/EditWorkerDialog';
import { DeleteWorkerDialog } from '@/components/workers/DeleteWorkerDialog';
import { ViewWorkerDialog } from '@/components/workers/ViewWorkerDialog';
import { WorkersTable } from '@/components/workers/WorkersTable';
import { useWorkersProvider } from '@/components/workers/WorkersProvider';
import { Worker } from '@/types';

interface WorkerFormData {
  fullName: string;
  personalId: string;
  dailysalary: number;
  region_id: string;
}

function WorkersContent() {
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { 
    workers, 
    loading, 
    regions,
    searchQuery,
    setSearchQuery,
    handleCreateNew,
    handleSaveEdit,
    handleDelete,
    isDeleting,
    isSaving
  } = useWorkersProvider();

  const handleViewWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsViewDialogOpen(true);
  };

  const handleEditWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsEditDialogOpen(true);
  };

  const handleDeleteWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateWorker = () => {
    setSelectedWorker(null);
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = async (formData: WorkerFormData) => {
    try {
      await handleCreateNew({
        fullName: formData.fullName,
        personalId: formData.personalId,
        dailysalary: formData.dailysalary,
        region_id: formData.region_id
      });
      setIsCreateDialogOpen(false);
      toast({
        title: "Worker Created",
        description: "New worker has been successfully created",
      });
    } catch (error: any) {
      toast({
        title: "Error Creating Worker",
        description: error.message || "There was an error creating the worker",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (formData: WorkerFormData) => {
    try {
      if (selectedWorker) {
        await handleSaveEdit({
          fullName: formData.fullName,
          personalId: formData.personalId,
          dailysalary: formData.dailysalary,
          region_id: formData.region_id
        });
        setIsEditDialogOpen(false);
        toast({
          title: "Worker Updated",
          description: "Worker details have been successfully updated",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error Updating Worker",
        description: error.message || "There was an error updating the worker",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Workers</h1>
          <p className="text-muted-foreground">Manage construction site workers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateWorker} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
        </div>
      </div>
      
      <div className="my-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text" 
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <WorkersTable 
          workers={workers}
          loading={loading}
          regions={regions || []}
          onView={handleViewWorker}
          onEdit={handleEditWorker}
          onDelete={handleDeleteWorker}
        />
      </div>
      
      {/* Create Dialog */}
      <EditWorkerDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleCreateSubmit}
        worker={null}
        isSaving={isSaving}
        regions={regions || []}
        isCreating={true}
      />
      
      {selectedWorker && (
        <>
          <EditWorkerDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            worker={selectedWorker}
            onSave={handleEditSubmit}
            isSaving={isSaving}
            regions={regions || []}
          />
          
          <DeleteWorkerDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            worker={selectedWorker}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
          />
          
          <ViewWorkerDialog
            isOpen={isViewDialogOpen}
            onClose={() => setIsViewDialogOpen(false)}
            worker={selectedWorker}
            regions={regions || []}
          />
        </>
      )}
    </div>
  );
}

export default function Workers() {
  return <WorkersContent />;
}
