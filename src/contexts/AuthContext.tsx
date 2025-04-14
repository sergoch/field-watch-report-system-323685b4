
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // This is a mock implementation - will be replaced with Supabase auth
      // For demo purposes, we're simulating different user roles
      
      let mockUser: User;
      
      if (email.includes('admin')) {
        mockUser = {
          id: '1',
          name: 'Admin User',
          email,
          role: 'admin',
        };
      } else {
        mockUser = {
          id: '2',
          name: 'Engineer User',
          email,
          role: 'engineer',
          regionId: '1',
        };
      }
      
      // Store in local storage for persistence
      localStorage.setItem('amradzi_user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
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
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
