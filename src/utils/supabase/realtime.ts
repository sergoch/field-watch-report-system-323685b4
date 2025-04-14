
import { supabase } from '@/integrations/supabase/client';

// Enable realtime for all tables
export const enableRealtimeForTables = async () => {
  try {
    // Execute SQL to enable REPLICA IDENTITY FULL for tables
    await supabase.rpc('enable_realtime', {
      tables: ['reports', 'incidents', 'workers', 'equipment', 'report_workers', 'report_equipment', 'regions', 'settings']
    });
    
    console.log('Realtime enabled for all tables');
    return true;
  } catch (error) {
    console.error('Error enabling realtime:', error);
    return false;
  }
};

// Get the current supabase client instance
export const getSupabaseClient = () => {
  return supabase;
};

export const initializeApp = async () => {
  // Enable realtime functionality
  await enableRealtimeForTables();
};
