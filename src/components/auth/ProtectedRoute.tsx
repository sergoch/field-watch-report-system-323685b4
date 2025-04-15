
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getLoggedInEngineer } from '@/utils/auth/engineerLogin';
import { useToast } from '@/hooks/use-toast';

export interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // Verify authentication on mount
  useEffect(() => {
    if (!isLoading && !user && !getLoggedInEngineer()) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to access this page.",
        variant: "destructive",
      });
    }
  }, [isLoading, user, toast]);

  // Show loading state if auth is still being checked
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check for engineer in localStorage
  const engineerData = getLoggedInEngineer();
  
  // Redirect to login if not authenticated (neither user nor engineer)
  if (!user && !engineerData) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For role-based access
  if (allowedRoles) {
    const currentRole = user?.role || (engineerData ? 'engineer' : '');
    if (!allowedRoles.includes(currentRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
