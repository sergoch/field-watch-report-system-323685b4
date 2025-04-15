
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jgcprmbicffwqekwdljs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnY3BybWJpY2Zmd3Fla3dkbGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTcwMDMsImV4cCI6MjA2MDIzMzAwM30.MtuOf1G-L3vuhHa5cmNxQHB1TAOFD1WE4E-9hZupOj4';

export const supabase = createClient(
  supabaseUrl, 
  supabaseKey,
  {
    auth: {
      persistSession: true,
      storage: localStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);
