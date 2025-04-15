
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getEngineerRegions } from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          const supabaseUser = session.user;
          
          try {
            // First check if this is an admin (using email)
            const isAdmin = 
              supabaseUser.email?.endsWith('@amradzi.com') || 
              ['rasanidze@gmail.com', 'tbedinadze@gmail.com', 'sergoch@gmail.com'].includes(supabaseUser.email || '');

            if (isAdmin) {
              const adminUser: User = {
                id: supabaseUser.id,
                name: supabaseUser.user_metadata.name || supabaseUser.email?.split('@')[0] || 'Admin User',
                email: supabaseUser.email || '',
                role: 'admin',
              };
              
              localStorage.setItem('amradzi_user', JSON.stringify(adminUser));
              setUser(adminUser);
            } else {
              // For engineers, fetch their assigned regions
              const { data: engineerData, error: engineerError } = await supabase
                .from('engineers')
                .select(`
                  id,
                  username,
                  full_name,
                  email,
                  engineer_regions (
                    region_id
                  )
                `)
                .eq('email', supabaseUser.email)
                .single();
              
              if (engineerError) throw engineerError;
              
              if (engineerData) {
                // Get all assigned regions for this engineer
                const assignedRegions = await getEngineerRegions(supabaseUser.id);
                
                const engineerUser: User = {
                  id: supabaseUser.id,
                  name: engineerData.full_name || engineerData.username,
                  email: engineerData.email || '',
                  role: 'engineer',
                  engineerId: engineerData.id,
                  assignedRegions: assignedRegions,
                  // Use first assigned region as primary if available
                  regionId: assignedRegions.length > 0 ? assignedRegions[0] : undefined
                };
                
                localStorage.setItem('amradzi_user', JSON.stringify(engineerUser));
                setUser(engineerUser);
              }
            }
          } catch (err) {
            console.error('Error processing user data:', err);
            toast({
              title: "Authentication Error",
              description: "Failed to load user profile data.",
              variant: "destructive",
            });
            setUser(null);
          }
          
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT' || !session) {
          localStorage.removeItem('amradzi_user');
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    const checkLoginStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setIsLoading(false);
          return;
        }
        
        if (data.session) {
          const storedUser = localStorage.getItem('amradzi_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Exception when checking login status:', err);
        setIsLoading(false);
      }
    };

    checkLoginStatus();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Determine if input is email or username
      const isEmail = usernameOrEmail.includes('@');
      
      if (isEmail) {
        // Admin login via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: usernameOrEmail,
          password: password,
        });
        
        if (error) throw error;
        
        // Auth state change listener will handle setting the user
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      } else {
        // Engineer login via RPC function
        const { data: engineers, error: engineerError } = await supabase.rpc('authenticate_engineer', {
          p_username: usernameOrEmail,
          p_password: password
        });
        
        if (engineerError || !engineers?.[0]) {
          throw new Error('Invalid username or password');
        }
        
        const engineer = engineers[0];
        
        // Now create a Supabase session for the engineer using their email
        if (!engineer.email) {
          throw new Error('Engineer email not found');
        }
        
        // Sign in with email/password combo stored in auth.users
        const { data, error } = await supabase.auth.signInWithPassword({
          email: engineer.email,
          password: password
        });
        
        if (error) {
          console.error('Error signing in engineer:', error);
          throw new Error('Authentication failed');
        }
        
        // The auth state change listener will handle the rest
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials and try again.');
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      // The rest is handled by onAuthStateChange
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
