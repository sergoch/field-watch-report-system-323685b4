
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
        
        // Then check for Supabase admin session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            throw userError;
          }
          
          setUser(userData as User);
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
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          setUser(null);
          return;
        }
        
        setUser(userData as User);
      } else {
        // Check if we have an engineer logged in
        const engineerData = getLoggedInEngineer();
        if (!engineerData) {
          setUser(null);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setIsLoading]);
}
