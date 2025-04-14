
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Search } from "lucide-react";

interface WorkersHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddWorker: () => void;
  onExportToExcel: () => void;
  hasWorkers: boolean;
}

export function WorkersHeader({
  searchQuery,
  onSearchChange,
  onAddWorker,
  onExportToExcel,
  hasWorkers
}: WorkersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workers Registry</h1>
        <p className="text-muted-foreground">Manage construction site workers</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onAddWorker}>
          <Plus className="mr-2 h-4 w-4" />
          Add Worker
        </Button>
        <Button 
          variant="outline" 
          onClick={onExportToExcel}
          disabled={!hasWorkers}
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>
    </div>
  );
}
