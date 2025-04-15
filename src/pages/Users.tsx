
import { UserManager } from "@/components/settings/UserManager";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/utils/auth";
import { Navigate } from "react-router-dom";

export default function UsersPage() {
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);
  
  // Only admins can access this page
  if (!userIsAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage system users and their permissions
        </p>
      </div>

      <UserManager />
    </div>
  );
}
