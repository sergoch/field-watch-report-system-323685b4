
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
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
    
    // Set up auth listener
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
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (identifier: string, password: string) => {
    try {
      setError(null);
      
      // Check if the identifier is an email or username
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        // Admin login via Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Admin login successful",
          description: "Welcome back!",
        });
      } else {
        // Engineer login via custom RPC function
        const { data, error } = await supabase.rpc('authenticate_engineer', {
          p_username: identifier,
          p_password: password
        });
        
        if (error || !data || data.length === 0) {
          throw error || new Error('Invalid engineer credentials');
        }
        
        // Create a session for the engineer
        const engineerData = data[0];
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: engineerData.email,
          password: password,
        });
        
        if (signInError) {
          throw signInError;
        }
        
        toast({
          title: "Engineer login successful",
          description: `Welcome back, ${engineerData.full_name}!`,
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || "An error occurred during login");
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
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
  
  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
