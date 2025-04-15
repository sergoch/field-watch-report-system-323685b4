
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, AlertTriangle, Briefcase, Tractor } from "lucide-react";

interface DashboardQuickActionsProps {
  onCleanTestData: () => Promise<void>;
}

export function DashboardQuickActions({ onCleanTestData }: DashboardQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild variant="secondary" className="bg-sky-50 hover:bg-sky-100 text-sky-700">
        <Link to="/workers">
          <Briefcase className="mr-2 h-4 w-4" />
          Manage Workers
        </Link>
      </Button>
      <Button asChild variant="secondary" className="bg-sky-50 hover:bg-sky-100 text-sky-700">
        <Link to="/equipment">
          <Tractor className="mr-2 h-4 w-4" />
          Manage Equipment
        </Link>
      </Button>
      <Button asChild variant="secondary" className="bg-sky-50 hover:bg-sky-100 text-sky-700">
        <Link to="/reports">
          <FileText className="mr-2 h-4 w-4" />
          View Reports
        </Link>
      </Button>
      <Button asChild variant="secondary" className="bg-sky-50 hover:bg-sky-100 text-sky-700">
        <Link to="/incidents">
          <AlertTriangle className="mr-2 h-4 w-4" />
          View Incidents
        </Link>
      </Button>
      <Button 
        variant="outline" 
        className="bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
        onClick={onCleanTestData}
      >
        Clean Test Data
      </Button>
    </div>
  );
}
