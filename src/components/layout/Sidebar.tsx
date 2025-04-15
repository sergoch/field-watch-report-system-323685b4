
import { NavLink } from "react-router-dom";
import { 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  Briefcase, 
  Truck, 
  Users, 
  Settings,
  Map
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/utils/auth";

export function Sidebar() {
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);
  
  return (
    <div className="pb-12 w-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Dashboard</h2>
          <div className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "transparent"
                )
              }
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </NavLink>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Reports & Incidents</h2>
          <div className="space-y-1">
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "transparent"
                )
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              Daily Reports
            </NavLink>
            <NavLink
              to="/incidents"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "transparent"
                )
              }
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Incidents
            </NavLink>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Resources</h2>
          <div className="space-y-1">
            <NavLink
              to="/workers"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "transparent"
                )
              }
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Workers
            </NavLink>
            <NavLink
              to="/equipment"
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "transparent"
                )
              }
            >
              <Truck className="mr-2 h-4 w-4" />
              Equipment
            </NavLink>
          </div>
        </div>
        
        {userIsAdmin && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Administration</h2>
            <div className="space-y-1">
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "transparent"
                  )
                }
              >
                <Users className="mr-2 h-4 w-4" />
                Users
              </NavLink>
              
              <NavLink
                to="/regions"
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "transparent"
                  )
                }
              >
                <Map className="mr-2 h-4 w-4" />
                Regions
              </NavLink>
              
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "transparent"
                  )
                }
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
