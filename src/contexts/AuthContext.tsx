
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
              // For demo purposes, create an engineer user based on the email
              // In a real app, you'd query the engineers table
              
              // Create a simulated engineer user
              const name = supabaseUser.email?.split('@')[0] || 'Engineer';
              const engineerUser: User = {
                id: supabaseUser.id,
                name: name.charAt(0).toUpperCase() + name.slice(1),
                email: supabaseUser.email || '',
                role: 'engineer',
                engineerId: supabaseUser.id,
                assignedRegions: ['region1', 'region2'] // Demo regions
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
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      } else {
        // Engineer login - since we don't have the engineers table yet,
        // we'll use a simulated approach for demo
        if ((usernameOrEmail === 'keda' && password === 'engineer12345') || 
            (usernameOrEmail === 'engineer' && password === 'password')) {
          
          // Create a fake email for the Supabase auth system
          const email = `${usernameOrEmail}@amradzi-engineer.com`;
          
          // Try to sign in first
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });
          
          // If login fails, create the account
          if (error) {
            if (error.message.includes('Invalid login credentials')) {
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                  data: {
                    username: usernameOrEmail,
                    role: 'engineer'
                  }
                }
              });
              
              if (signUpError) {
                throw signUpError;
              }
              
              toast({
                title: "Account Created",
                description: "Your engineer account was created and you are now logged in.",
              });
              
              // Handle new user - we'll create a simulated engineer user
              const engineerUser: User = {
                id: signUpData.user?.id || '',
                name: usernameOrEmail.charAt(0).toUpperCase() + usernameOrEmail.slice(1),
                email: email,
                role: 'engineer',
                engineerId: signUpData.user?.id || '',
                assignedRegions: ['region1', 'region2'] // Demo regions
              };
              
              localStorage.setItem('amradzi_user', JSON.stringify(engineerUser));
              setUser(engineerUser);
              setIsLoading(false);
              
              return;
            } else {
              throw error;
            }
          }
          
          // If we successfully logged in, the auth state change handler will handle setting the user
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
        } else {
          throw new Error('Invalid username or password');
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
