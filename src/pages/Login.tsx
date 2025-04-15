
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Check for existing Supabase session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("Active Supabase session detected in Login page");
      }
    };
    
    checkSession();
  }, []);

  // If already authenticated, redirect to dashboard
  if (!isLoading && user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="flex min-h-screen bg-muted/30 items-center justify-center p-4 md:p-0">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
