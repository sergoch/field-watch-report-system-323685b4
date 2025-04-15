
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loginEngineer, logoutEngineer } from '@/utils/auth/engineerLogin';
import { User } from '@/types';

interface UseAuthActionsProps {
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
}

export function useAuthActions({ setUser, setError }: UseAuthActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const login = async (identifier: string, password: string, isAdmin: boolean) => {
    try {
      setError(null);
      
      if (isAdmin) {
        // For admin login
        if (identifier === 'admin@amradzi.ge' && password === 'amradzi') {
          // Special case for the specified admin
          setUser({
            id: 'admin-id',
            name: 'Admin User',
            email: 'admin@amradzi.ge',
            role: 'admin',
          });
          
          toast({
            title: "Admin login successful",
            description: "Welcome back!",
          });
          
          navigate('/dashboard');
          return;
        }
        
        // Normal Supabase auth login for other admins
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Admin login successful",
          description: "Welcome back!",
        });
      } else {
        // Engineer login via RPC
        try {
          const engineerData = await loginEngineer(identifier, password);
          
          setUser({
            id: engineerData.id,
            name: engineerData.full_name,
            email: engineerData.email,
            role: 'engineer',
          } as User);
          
          toast({
            title: "Engineer login successful",
            description: `Welcome back, ${engineerData.full_name}!`,
          });
          
          navigate('/dashboard');
        } catch (error) {
          throw new Error('Invalid username or password');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || "An error occurred during login");
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      
      // Perform both logout operations to ensure clean state
      logoutEngineer();
      await supabase.auth.signOut();
      
      setUser(null);
      
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });

      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || "An error occurred during logout");
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    login,
    logout
  };
}
