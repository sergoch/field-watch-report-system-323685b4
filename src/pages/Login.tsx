
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { getLoggedInEngineer } from '@/utils/auth/engineerLogin';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // If already authenticated via context or localStorage, redirect to dashboard
  if (!isLoading && (user || getLoggedInEngineer())) {
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
