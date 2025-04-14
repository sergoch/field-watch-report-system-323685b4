
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Download, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WorkersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Mock data for workers
  const mockWorkers = [
    { id: "1", fullName: "Giorgi Beridze", personalId: "01005078956", dailySalary: 75 },
    { id: "2", fullName: "Nino Khelaia", personalId: "01008034289", dailySalary: 80 },
    { id: "3", fullName: "Davit Kapanadze", personalId: "01001045673", dailySalary: 85 },
    { id: "4", fullName: "Tamar Lomidze", personalId: "01009087452", dailySalary: 75 },
    { id: "5", fullName: "Levan Maisuradze", personalId: "01004056789", dailySalary: 90 },
  ];
  
  // Filter workers based on search query
  const filteredWorkers = mockWorkers.filter(worker => 
    worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.personalId.includes(searchQuery)
  );
  
  const handleDelete = (id: string, name: string) => {
    // In a real app, make API call to delete the worker
    toast({
      title: "Worker Deleted",
      description: `${name} has been removed from the registry.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workers Registry</h1>
          <p className="text-muted-foreground">Manage construction site workers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Worker
          </Button>
          <Button variant="outline">
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
                {filteredWorkers.length > 0 ? (
                  filteredWorkers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-medium">{worker.fullName}</TableCell>
                      <TableCell>{worker.personalId}</TableCell>
                      <TableCell>{worker.dailySalary}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(worker.id, worker.fullName)}
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
    </div>
  );
}
