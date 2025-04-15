
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Worker } from "@/types";

interface WorkersTableProps {
  workers: Worker[];
  regions: { id: string, name: string }[];
  loading: boolean;
  onView: (worker: Worker) => void;
  onEdit: (worker: Worker) => void;
  onDelete: (worker: Worker) => void;
}

export function WorkersTable({ 
  workers, 
  regions, 
  loading, 
  onView, 
  onEdit, 
  onDelete 
}: WorkersTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Personal ID</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Daily Salary (GEL)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Loading workers data...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // Ensure workers is an array
  const validWorkers = Array.isArray(workers) ? workers : [];

  if (validWorkers.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Personal ID</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Daily Salary (GEL)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No workers found.
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
            <TableHead>Full Name</TableHead>
            <TableHead>Personal ID</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Daily Salary (GEL)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validWorkers.map((worker) => {
            if (!worker || !worker.id) return null;
            const region = regions.find(r => r.id === worker.region_id);
            
            return (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">{worker.fullName}</TableCell>
                <TableCell>{worker.personalId}</TableCell>
                <TableCell>{region?.name || "Unassigned"}</TableCell>
                <TableCell>{worker.dailysalary}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(worker)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(worker)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(worker)}
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
