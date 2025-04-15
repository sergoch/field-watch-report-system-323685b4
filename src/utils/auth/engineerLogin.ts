
import { supabase } from '@/integrations/supabase/client';

interface EngineerData {
  id: string;
  username: string;
  full_name: string;
  email: string;
}

export const loginEngineer = async (username: string, password: string): Promise<EngineerData> => {
  const { data, error } = await supabase.rpc('authenticate_engineer', {
    p_username: username,
    p_password: password
  });
  
  if (error || !data || data.length === 0) {
    throw error || new Error('Invalid engineer credentials');
  }
  
  const engineerData = data[0];
  
  // Save engineer data to localStorage
  localStorage.setItem('engineer', JSON.stringify(engineerData));
  
  return engineerData;
};

export const getLoggedInEngineer = (): EngineerData | null => {
  const engineerData = localStorage.getItem('engineer');
  return engineerData ? JSON.parse(engineerData) : null;
};

export const logoutEngineer = (): void => {
  localStorage.removeItem('engineer');
};
