
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Report {
  id: string;
  date: string;
  region: string;
  workers: number;
  equipment: number;
  fuel: number;
  materials: string;
}

interface ReportDetailsProps {
  report: Report | null;
  onClose: () => void;
}

export function ReportDetails({ report, onClose }: ReportDetailsProps) {
  if (!report) return null;

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
              <p>{report.date}</p>
            </div>
            <div>
              <h3 className="font-semibold">Region</h3>
              <p>{report.region}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Resources</h3>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <span className="text-muted-foreground">Workers:</span>
                <p className="text-lg">{report.workers}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Equipment:</span>
                <p className="text-lg">{report.equipment}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fuel Used:</span>
                <p className="text-lg">{report.fuel}L</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Materials</h3>
            <p className="mt-1">{report.materials}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
