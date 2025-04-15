
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verify authentication on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to access this page.",
          variant: "destructive",
        });
        
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    if (!isLoading && !user) {
      checkAuthStatus();
    }
  }, [isLoading, user, navigate, location, toast]);

  // Show loading state if auth is still being checked
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}
