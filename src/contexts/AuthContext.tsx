
import { createContext, useContext, ReactNode } from 'react';
import { User } from '@/types';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useSessionCheck } from '@/hooks/useSessionCheck';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string, isAdmin: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser, isLoading, setIsLoading, error, setError } = useAuthState();
  const { login, logout } = useAuthActions({ setUser, setError });
  
  // Initialize session checking
  useSessionCheck({ setUser, setIsLoading });
  
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
