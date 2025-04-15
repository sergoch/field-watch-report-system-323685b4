
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
          // For admin users, we'll create a mock user based on the Supabase user
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
              
              // Store in local storage for persistence
              localStorage.setItem('amradzi_user', JSON.stringify(adminUser));
              setUser(adminUser);
            } else {
              // This is an engineer user - get their info from the engineers table
              const { data: engineerData, error: engineerError } = await supabase
                .from('engineers')
                .select('id, username, full_name, email')
                .eq('email', supabaseUser.email)
                .single();
              
              if (engineerError || !engineerData) {
                console.error('Error fetching engineer data:', engineerError);
                // Not an engineer either, something went wrong
                setUser(null);
                setError('User not found in engineers table');
                await supabase.auth.signOut();
                return;
              }
              
              // Get assigned regions
              const { data: regionData } = await supabase
                .from('engineer_regions')
                .select('region_id')
                .eq('engineer_id', engineerData.id);
              
              const regionIds = regionData?.map(r => r.region_id) || [];
              
              const engineerUser: User = {
                id: engineerData.id,
                name: engineerData.full_name || engineerData.username,
                email: engineerData.email || supabaseUser.email || '',
                role: 'engineer',
                engineerId: engineerData.id,
                assignedRegions: regionIds
              };
              
              // Store in local storage for persistence
              localStorage.setItem('amradzi_user', JSON.stringify(engineerUser));
              setUser(engineerUser);
            }
          } catch (err) {
            console.error('Error processing user data:', err);
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
          } else {
            // User will be set by the onAuthStateChange handler
            console.log('Session exists but waiting for onAuthStateChange');
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
  }, []);

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
        
        if (error) {
          throw error;
        }
        
        // Auth state change listener will handle setting the user
      } else {
        // Engineer login via custom method
        // First, try to get the engineer's email using the username
        const { data: engineerData, error: engineerError } = await supabase
          .from('engineers')
          .select('email, id')
          .eq('username', usernameOrEmail)
          .single();
        
        if (engineerError || !engineerData || !engineerData.email) {
          throw new Error('Invalid username or password');
        }
        
        // Now log in via Supabase Auth using the engineer's email
        const { data, error } = await supabase.auth.signInWithPassword({
          email: engineerData.email,
          password: password,
        });
        
        if (error) {
          // If login fails, try to create the account automatically for testing
          if (error.message.includes('Invalid login credentials')) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: engineerData.email,
              password: password,
              options: {
                data: {
                  engineer_id: engineerData.id
                }
              }
            });
            
            if (signUpError) {
              throw signUpError;
            }
            
            // After signup, login again
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email: engineerData.email,
              password: password,
            });
            
            if (loginError) {
              throw loginError;
            }
            
            // User is now logged in and handled by onAuthStateChange
            toast({
              title: "Engineer Account Created",
              description: "Your account was created and you are now logged in.",
            });
          } else {
            throw error;
          }
        }
      }
      
      // Authentication is now handled by onAuthStateChange listener
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
      // The rest is handled by onAuthStateChange
    } catch (error) {
      console.error('Logout error:', error);
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
