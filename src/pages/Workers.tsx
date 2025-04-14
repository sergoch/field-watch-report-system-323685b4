
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Download, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { Worker } from "@/types";
import { ViewDetailsDialog } from "@/components/crud/ViewDetailsDialog";
import { EditDialog } from "@/components/crud/EditDialog";
import { DeleteConfirmDialog } from "@/components/crud/DeleteConfirmDialog";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';

export default function WorkersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [viewWorker, setViewWorker] = useState<Worker | null>(null);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [deleteWorker, setDeleteWorker] = useState<Worker | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    fullName: '',
    personalId: '',
    dailySalary: 0
  });

  // Use our real-time hook to fetch workers data
  const { 
    data: workers, 
    loading, 
    update: updateWorker,
    remove: removeWorker 
  } = useSupabaseRealtime<Worker>({ 
    tableName: 'workers' 
  });

  // Filter workers based on search query
  const filteredWorkers = workers.filter(worker => 
    worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.personalId.includes(searchQuery)
  );
  
  const handleOpenEditDialog = (worker: Worker) => {
    setEditWorker(worker);
    setFormData({
      fullName: worker.fullName,
      personalId: worker.personalId,
      dailySalary: worker.dailySalary
    });
  };

  const handleSaveEdit = async () => {
    if (!editWorker) return;

    setIsSaving(true);
    try {
      await updateWorker(editWorker.id, {
        fullName: formData.fullName,
        personalId: formData.personalId,
        dailySalary: formData.dailySalary
      });
      
      toast({
        title: "Worker Updated",
        description: `${formData.fullName} has been updated successfully.`
      });
      
      setEditWorker(null);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the worker.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteWorker) return;
    
    setIsDeleting(true);
    try {
      await removeWorker(deleteWorker.id);
      
      toast({
        title: "Worker Deleted",
        description: `${deleteWorker.fullName} has been removed from the registry.`
      });
      
      setDeleteWorker(null);
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "There was an error removing the worker.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredWorkers.map(worker => ({
        "Full Name": worker.fullName,
        "Personal ID": worker.personalId,
        "Daily Salary (GEL)": worker.dailySalary
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Workers");
      
      // Save file
      XLSX.writeFile(workbook, `amradzi_workers_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: "Workers data exported to Excel successfully."
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
          <h1 className="text-2xl font-bold tracking-tight">Workers Registry</h1>
          <p className="text-muted-foreground">Manage construction site workers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <a href="/workers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Worker
            </a>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportToExcel}
            disabled={filteredWorkers.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Workers List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Personal ID</TableHead>
                  <TableHead>Daily Salary (GEL)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading workers data...
                    </TableCell>
                  </TableRow>
                ) : filteredWorkers.length > 0 ? (
                  filteredWorkers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-medium">{worker.fullName}</TableCell>
                      <TableCell>{worker.personalId}</TableCell>
                      <TableCell>{worker.dailySalary}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setViewWorker(worker)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenEditDialog(worker)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteWorker(worker)}
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
                    <TableCell colSpan={4} className="h-24 text-center">
                      No workers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Worker Details Dialog */}
      <ViewDetailsDialog 
        isOpen={!!viewWorker}
        onClose={() => setViewWorker(null)}
        title="Worker Details"
        description="Complete worker information"
      >
        {viewWorker && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Full Name</Label>
                <p>{viewWorker.fullName}</p>
              </div>
              <div>
                <Label className="font-semibold">Personal ID</Label>
                <p>{viewWorker.personalId}</p>
              </div>
              <div>
                <Label className="font-semibold">Daily Salary</Label>
                <p>{viewWorker.dailySalary} GEL</p>
              </div>
              <div>
                <Label className="font-semibold">Created At</Label>
                <p>{new Date(viewWorker.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </ViewDetailsDialog>

      {/* Edit Worker Dialog */}
      <EditDialog
        isOpen={!!editWorker}
        onClose={() => setEditWorker(null)}
        title="Edit Worker"
        description="Update worker information"
        onSave={handleSaveEdit}
        isSaving={isSaving}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="personalId">Personal ID</Label>
            <Input
              id="personalId"
              value={formData.personalId}
              onChange={(e) => setFormData({...formData, personalId: e.target.value})}
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

      {/* Delete Worker Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteWorker}
        onClose={() => setDeleteWorker(null)}
        onConfirm={handleDelete}
        title="Delete Worker"
        description={`Are you sure you want to remove ${deleteWorker?.fullName} from the registry? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
