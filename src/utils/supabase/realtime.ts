
import { supabase } from "@/integrations/supabase/client";

export const initializeApp = async () => {
  try {
    // Enable realtime subscriptions for all tables we're using
    const tables = ["reports", "incidents", "workers", "equipment", "report_workers", "report_equipment", "regions", "settings"];
    
    // Check if Supabase is using postgreSQL function for enabling realtime
    try {
      await supabase.rpc('enable_realtime', { tables });
    } catch (error) {
      console.warn('Realtime subscriptions using RPC not available, falling back to channel setup');
      
      // Set up individual channels for each table
      tables.forEach(table => {
        const channel = supabase.channel(`${table}-changes`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table,
          }, (payload) => {
            console.log(`Change in ${table}:`, payload);
          })
          .subscribe();
      });
    }
    
    console.log("Initialized realtime functionalities");
    return true;
  } catch (error) {
    console.error("Error initializing realtime functionality:", error);
    return false;
  }
};
