
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EngineerDashboard } from "@/components/dashboard/EngineerDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { isAdmin } from "@/utils/auth";

export default function DashboardPage() {
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);

  useEffect(() => {
    // Page title
    document.title = userIsAdmin ? "Admin Dashboard | Amradzi V2.0" : "Engineer Dashboard | Amradzi V2.0";
  }, [userIsAdmin]);

  if (!user) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return userIsAdmin ? <AdminDashboard /> : <EngineerDashboard />;
}
