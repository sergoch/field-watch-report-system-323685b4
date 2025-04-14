import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  Settings,
  Users,
  AlertTriangle,
  Truck,
  Wrench
} from "lucide-react";

export function SidebarContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "admin";

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2">
        <h2 className="mb-2 text-lg font-semibold text-amradzi-blue tracking-tight">
          Amradzi V2.0
        </h2>
        <div className="text-xs text-muted-foreground mb-4">
          Field Control & Reporting
        </div>
      </div>
      <div className="space-y-1 px-3">
        <SidebarLink href="/dashboard" icon={Home} active={isActive('/dashboard')}>
          Dashboard
        </SidebarLink>
        
        <SidebarLink href="/reports" icon={FileText} active={isActive('/reports')}>
          Daily Reports
        </SidebarLink>

        <SidebarLink href="/incidents" icon={AlertTriangle} active={isActive('/incidents')}>
          Incidents
        </SidebarLink>
        
        {isAdmin && (
          <>
            <div className="pt-4">
              <hr className="border-muted" />
              <div className="pt-4 pb-2 text-xs font-medium text-muted-foreground">
                Administration
              </div>
            </div>
            
            <SidebarLink href="/users" icon={Users} active={isActive('/users')}>
              Manage Users
            </SidebarLink>
            
            <SidebarLink href="/settings" icon={Settings} active={isActive('/settings')}>
              Settings
            </SidebarLink>
          </>
        )}
      </div>
    </div>
  );
}

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  active?: boolean;
  children: React.ReactNode;
}

function SidebarLink({ href, icon: Icon, active, children }: SidebarLinkProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
        active ? "bg-primary text-white hover:bg-primary/90" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden border-r bg-background md:block w-64">
      <div className="flex flex-col h-full py-4">
        <SidebarContent />
      </div>
    </aside>
  );
}
