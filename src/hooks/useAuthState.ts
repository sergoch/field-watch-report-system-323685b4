
import { useState } from 'react';
import { User } from '@/types';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    error,
    setError
  };
}
