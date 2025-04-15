
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

/**
 * Hook to check authentication status and redirect to login if not authenticated
 * @param redirectPath Path to redirect to if not authenticated (defaults to /login)
 */
export function useAuthCheck(redirectPath: string = '/login') {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to access this page.",
          variant: "destructive",
        });
        
        navigate(redirectPath, { replace: true });
        return false;
      }
      
      return true;
    };
    
    checkAuth();
    
    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate(redirectPath, { replace: true });
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirectPath, toast]);
}
