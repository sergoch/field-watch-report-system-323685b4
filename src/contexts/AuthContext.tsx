
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          // For demo purposes, we'll create a mock user based on the Supabase user
          const supabaseUser = session.user;
          
          let mockUser: User;
          
          // Map to our application's user structure
          if (supabaseUser.email?.includes('admin')) {
            mockUser = {
              id: supabaseUser.id,
              name: supabaseUser.user_metadata.name || 'Admin User',
              email: supabaseUser.email,
              role: 'admin',
            };
          } else {
            mockUser = {
              id: supabaseUser.id,
              name: supabaseUser.user_metadata.name || 'Engineer User',
              email: supabaseUser.email,
              role: 'engineer',
              regionId: supabaseUser.user_metadata.regionId || '1',
            };
          }
          
          // Store in local storage for persistence
          localStorage.setItem('amradzi_user', JSON.stringify(mockUser));
          setUser(mockUser);
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
            // If we have a session but no stored user, create one based on the session
            const supabaseUser = data.session.user;
            
            let mockUser: User;
            
            if (supabaseUser.email?.includes('admin')) {
              mockUser = {
                id: supabaseUser.id,
                name: supabaseUser.user_metadata.name || 'Admin User',
                email: supabaseUser.email,
                role: 'admin',
              };
            } else {
              mockUser = {
                id: supabaseUser.id,
                name: supabaseUser.user_metadata.name || 'Engineer User',
                email: supabaseUser.email,
                role: 'engineer',
                regionId: supabaseUser.user_metadata.regionId || '1',
              };
            }
            
            localStorage.setItem('amradzi_user', JSON.stringify(mockUser));
            setUser(mockUser);
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

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This is a mock implementation that will now use Supabase auth
      // Default role assignment based on username
      const role = username.toLowerCase().includes('admin') ? 'admin' : 'engineer';
      const regionId = role === 'engineer' ? '1' : null;
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@amradzi.com`,
        password: password,
      });
      
      if (error) {
        console.error('Supabase login error:', error);
        
        // For development purposes, if the user doesn't exist, sign them up
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: `${username}@amradzi.com`,
            password: password,
            options: {
              data: {
                name: username,
                role: role,
                regionId: regionId,
              }
            }
          });
          
          if (signUpError) {
            throw signUpError;
          }
          
          // After signup, login again
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: `${username}@amradzi.com`,
            password: password,
          });
          
          if (loginError) {
            throw loginError;
          }
          
          // User is now logged in
          toast({
            title: "Account Created",
            description: "Your account was created and you are now logged in.",
          });
        } else {
          throw error;
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
