
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
}

export function useSupabaseRealtime<T = any>(options: UseRealtimeOptions) {
  const { tableName, events = ['INSERT', 'UPDATE', 'DELETE'], schema = 'public', filter, initialFetch = true } = options;
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
      setData(data || []);
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
      return data;
    } catch (error) {
      console.error(`Error adding ${tableName}:`, error);
      throw error;
    }
  };

  const updateData = async (id: string, updates: Partial<T>) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
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
