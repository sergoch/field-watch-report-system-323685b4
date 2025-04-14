
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Report } from "@/types";

interface ReportDetailsProps {
  report: Report | null;
  onClose: () => void;
}

export function ReportDetails({ report, onClose }: ReportDetailsProps) {
  if (!report) return null;

  // Get region name from the regionId or show "Unknown"
  const regionName = report.region?.name || "Unknown Region";

  return (
    <Dialog open={!!report} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Date</h3>
              <p>{new Date(report.date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold">Region</h3>
              <p>{regionName}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Resources</h3>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <span className="text-muted-foreground">Workers:</span>
                <p className="text-lg">{report.workers ? report.workers.length : 0}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Equipment:</span>
                <p className="text-lg">{report.equipment ? report.equipment.length : 0}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fuel Used:</span>
                <p className="text-lg">{report.totalFuel}L</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Materials</h3>
            <p className="mt-1">{report.materialsUsed}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
