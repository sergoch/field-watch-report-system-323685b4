
import { ViewDetailsDialog } from "@/components/crud/ViewDetailsDialog";
import { format } from "date-fns";

interface UserViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    name: string;
    regionName?: string;
    role: string;
    created_at?: string;
  } | null;
}

export function UserViewDialog({ isOpen, onClose, user }: UserViewDialogProps) {
  if (!user) return null;

  return (
    <ViewDetailsDialog
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
    >
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Full Name</h4>
          <p className="text-sm text-muted-foreground">{user.name}</p>
        </div>
        <div>
          <h4 className="font-medium">Email</h4>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div>
          <h4 className="font-medium">Role</h4>
          <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
        </div>
        <div>
          <h4 className="font-medium">Assigned Region</h4>
          <p className="text-sm text-muted-foreground">{user.regionName || 'Unassigned'}</p>
        </div>
        {user.created_at && (
          <div>
            <h4 className="font-medium">Created Date</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(user.created_at), 'PPP')}
            </p>
          </div>
        )}
      </div>
    </ViewDetailsDialog>
  );
}
