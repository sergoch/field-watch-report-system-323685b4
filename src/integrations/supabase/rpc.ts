
import { supabase } from './client';

// Enable realtime for specified tables
export const enableRealtimeForTables = async (tableNames: string[]) => {
  try {
    for (const tableName of tableNames) {
      // Execute ALTER TABLE command to set REPLICA IDENTITY FULL
      await supabase.rpc('enable_replica_identity', { table_name: tableName });
    }
    
    // Add tables to realtime publication
    await supabase.rpc('add_tables_to_publication', { tables: tableNames.join(',') });
    
    return true;
  } catch (error) {
    console.error('Error enabling realtime:', error);
    return false;
  }
};

// Call to setup realtime on app initialization
export const setupRealtime = async () => {
  const tables = [
    'reports', 
    'incidents', 
    'workers', 
    'equipment', 
    'report_workers', 
    'report_equipment',
    'regions',
    'settings'
  ];
  
  return await enableRealtimeForTables(tables);
};
