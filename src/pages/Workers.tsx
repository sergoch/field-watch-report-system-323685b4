
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EditWorkerDialog } from '@/components/workers/EditWorkerDialog';
import { DeleteWorkerDialog } from '@/components/workers/DeleteWorkerDialog';
import { ViewWorkerDialog } from '@/components/workers/ViewWorkerDialog';
import { WorkersTable } from '@/components/workers/WorkersTable';
import { WorkersHeader } from '@/components/workers/WorkersHeader';
import { WorkersProvider, useWorkersContext, Worker, WorkerFormData } from '@/contexts/WorkerProvider';
import { WorkersSearch } from '@/components/workers/WorkersSearch';
import { WorkersRegionFilter } from '@/components/workers/WorkersRegionFilter';

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
    error, 
    createWorker, 
    updateWorker, 
    deleteWorker,
    filter,
    setFilter,
  } = useWorkersContext();

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Error Loading Data</h2>
          <p className="text-gray-500 mt-2">{error.message || "An unexpected error occurred"}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
      // Ensure the form data matches the required format
      const workerData: WorkerFormData = {
        ...formData,
        dailysalary: formData.dailysalary || 0  // Ensure the property name matches
      };
      await createWorker(workerData);
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
      // Ensure the form data matches the required format
      const workerData: WorkerFormData = {
        ...formData,
        dailysalary: formData.dailysalary || 0  // Ensure the property name matches
      };
      if (selectedWorker) {
        await updateWorker(selectedWorker.id, workerData);
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

  const handleDeleteSubmit = async () => {
    try {
      if (selectedWorker) {
        await deleteWorker(selectedWorker.id);
        setIsDeleteDialogOpen(false);
        toast({
          title: "Worker Deleted",
          description: "Worker has been successfully deleted",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error Deleting Worker",
        description: error.message || "There was an error deleting the worker",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <WorkersHeader />
      
      <div className="my-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <WorkersSearch />
          <WorkersRegionFilter />
        </div>
        <Button onClick={handleCreateWorker} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Worker
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <WorkersTable 
          workers={workers}
          loading={loading}
          onView={handleViewWorker}
          onEdit={handleEditWorker}
          onDelete={handleDeleteWorker}
        />
      </div>
      
      {/* Create/Edit Dialog */}
      <EditWorkerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />
      
      {selectedWorker && (
        <>
          <EditWorkerDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            worker={selectedWorker}
            onSubmit={handleEditSubmit}
          />
          
          <DeleteWorkerDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            worker={selectedWorker}
            onConfirm={handleDeleteSubmit}
          />
          
          <ViewWorkerDialog
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
            worker={selectedWorker}
          />
        </>
      )}
    </div>
  );
}

export default function Workers() {
  return (
    <WorkersProvider>
      <WorkersContent />
    </WorkersProvider>
  );
}
