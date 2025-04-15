
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getLoggedInEngineer } from '@/utils/auth/engineerLogin';
import { User } from '@/types';

interface UseSessionCheckProps {
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export function useSessionCheck({ setUser, setIsLoading }: UseSessionCheckProps) {
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        // First check for engineer in localStorage
        const engineerData = getLoggedInEngineer();
        
        if (engineerData) {
          setUser({
            id: engineerData.id,
            name: engineerData.full_name,
            email: engineerData.email,
            role: 'engineer',
          } as User);
          setIsLoading(false);
          return;
        }
        
        // Check for special admin case
        const storedAdmin = localStorage.getItem('admin-user');
        if (storedAdmin) {
          setUser(JSON.parse(storedAdmin));
          setIsLoading(false);
          return;
        }
        
        // Then check for Supabase admin session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          // Create a user object from the session
          // This avoids the users table error
          const user: User = {
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'Admin User',
            email: session.user.email || '',
            role: 'admin',
          };
          
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth listener for admin users
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Create a user object from the session
        const user: User = {
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'Admin User',
          email: session.user.email || '',
          role: 'admin',
        };
        
        setUser(user);
      } else {
        // Check if we have an engineer logged in
        const engineerData = getLoggedInEngineer();
        const storedAdmin = localStorage.getItem('admin-user');
        
        if (!engineerData && !storedAdmin) {
          setUser(null);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setIsLoading]);
}
