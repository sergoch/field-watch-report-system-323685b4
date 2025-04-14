import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { convertToCamelCase, convertToSnakeCase } from '@/utils/supabase/typeAdapter';

type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE';
interface UseRealtimeOptions {
  tableName: string;
  events?: SubscriptionEvent[];
  schema?: string;
  filter?: string;
  initialFetch?: boolean;
}

export function useSupabaseRealtime<T extends Record<string, any>>(options: UseRealtimeOptions) {
  const { 
    tableName, 
    events = ['INSERT', 'UPDATE', 'DELETE'], 
    schema = 'public', 
    filter, 
    initialFetch = true
  } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(initialFetch);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialFetch) {
      fetchData();
    }
  }, [tableName, filter]);

  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema,
        table: tableName,
      }, async (payload) => {
        console.log('Realtime change:', payload);
        
        try {
          await fetchData();
          
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
      
      const transformedData = data?.map(item => convertToCamelCase<T>(item as Record<string, any>)) || [];
      setData(transformedData);
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const addData = async (newData: Partial<T>) => {
    try {
      const dbData = convertToSnakeCase(newData as Record<string, any>);
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(dbData)
        .select();
      
      if (error) throw error;
      return convertToCamelCase<T>(data[0] as Record<string, any>);
    } catch (error) {
      console.error(`Error adding ${tableName}:`, error);
      throw error;
    }
  };

  const updateData = async (id: string, updates: Partial<T>) => {
    try {
      const dbUpdates = convertToSnakeCase(updates as Record<string, any>);
      
      const { data, error } = await supabase
        .from(tableName)
        .update(dbUpdates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return convertToCamelCase<T>(data[0] as Record<string, any>);
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
