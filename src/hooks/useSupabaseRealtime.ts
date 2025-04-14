
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE';
interface UseRealtimeOptions {
  tableName: string;
  events?: SubscriptionEvent[];
  schema?: string;
  filter?: string;
  initialFetch?: boolean;
  transformFn?: (data: any) => any; // Add transform function to convert snake_case to camelCase
}

// Helper function to convert snake_case to camelCase
const snakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
};

export function useSupabaseRealtime<T = any>(options: UseRealtimeOptions) {
  const { 
    tableName, 
    events = ['INSERT', 'UPDATE', 'DELETE'], 
    schema = 'public', 
    filter, 
    initialFetch = true,
    transformFn = snakeToCamel 
  } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(initialFetch);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Initial data fetch
  useEffect(() => {
    if (initialFetch) {
      fetchData();
    }
  }, [tableName, filter]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema,
        table: tableName,
      }, async (payload) => {
        console.log('Realtime change:', payload);
        
        // Refetch data on any change
        try {
          await fetchData();
          
          // Show notification based on the event
          if (payload.eventType === 'INSERT') {
            toast({ title: 'New Entry', description: `A new ${tableName} entry was added` });
          } else if (payload.eventType === 'UPDATE') {
            toast({ title: 'Entry Updated', description: `A ${tableName} entry was updated` });
          } else if (payload.eventType === 'DELETE') {
            toast({ title: 'Entry Deleted', description: `A ${tableName} entry was removed` });
          }
        } catch (error) {
          console.error('Error refetching data:', error);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, schema]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from(tableName).select('*');
      
      if (filter) {
        query = query.eq(filter.split('=')[0], filter.split('=')[1]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data (convert snake_case to camelCase)
      const transformedData = transformFn ? data.map(transformFn) : data;
      setData(transformedData || []);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const addData = async (newData: Omit<T, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(newData)
        .select();
      
      if (error) throw error;
      return transformFn ? transformFn(data[0]) : data[0];
    } catch (error) {
      console.error(`Error adding ${tableName}:`, error);
      throw error;
    }
  };

  const updateData = async (id: string, updates: Partial<T>) => {
    try {
      // Convert camelCase to snake_case for update operations
      const snakeUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        acc[snakeKey] = value;
        return acc;
      }, {} as any);
      
      const { data, error } = await supabase
        .from(tableName)
        .update(snakeUpdates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return transformFn ? transformFn(data[0]) : data[0];
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      throw error;
    }
  };

  const deleteData = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      throw error;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    add: addData,
    update: updateData,
    remove: deleteData
  };
}
