
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/utils/auth';

export function AdminRoute() {
  const { user } = useAuth();
  
  if (!isAdmin(user)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />;
}
