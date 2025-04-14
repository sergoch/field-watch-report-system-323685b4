
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EngineerDashboard } from "@/components/dashboard/EngineerDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Page title
    document.title = isAdmin ? "Admin Dashboard | Amradzi V2.0" : "Engineer Dashboard | Amradzi V2.0";
  }, [isAdmin]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return isAdmin ? <AdminDashboard /> : <EngineerDashboard />;
}
