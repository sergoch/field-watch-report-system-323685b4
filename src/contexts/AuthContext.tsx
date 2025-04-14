
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

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

  useEffect(() => {
    // Check if user is already logged in via local storage
    const checkLoginStatus = async () => {
      const storedUser = localStorage.getItem('amradzi_user');
      if (storedUser) {
        // In a real implementation, we would validate the session with Supabase
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    checkLoginStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // This is a mock implementation - will be replaced with Supabase auth
      // For demo purposes, we're simulating different user roles with default credentials
      
      let mockUser: User;
      
      // Check for default admin (sergo)
      if (username.toLowerCase() === 'sergo' && password === '599410902') {
        mockUser = {
          id: '1',
          name: 'Sergo',
          email: 'sergo@amradzi.com',
          role: 'admin',
        };
      } 
      // Check for default engineer (keda)
      else if (username.toLowerCase() === 'keda' && password === 'keda') {
        mockUser = {
          id: '2',
          name: 'Keda',
          email: 'keda@amradzi.com',
          role: 'engineer',
          regionId: '1',
        };
      }
      // Check for admin email
      else if (username.includes('admin')) {
        mockUser = {
          id: '3',
          name: 'Admin User',
          email: `${username}@amradzi.com`,
          role: 'admin',
        };
      } 
      // Default to engineer for all other logins
      else {
        mockUser = {
          id: '4',
          name: 'Engineer User',
          email: `${username}@amradzi.com`,
          role: 'engineer',
          regionId: '1',
        };
      }
      
      // Store in local storage for persistence
      localStorage.setItem('amradzi_user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials and try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Remove from local storage
      localStorage.removeItem('amradzi_user');
      setUser(null);
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
