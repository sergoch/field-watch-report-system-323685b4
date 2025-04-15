
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SupabaseRealtimeOptions {
  tableName: string;
  initialFetch?: boolean;
  filter?: string | Record<string, any>;
  orderBy?: { column: string; ascending: boolean };
  relations?: string;
  limit?: number;
}

export function useSupabaseRealtime<T extends Record<string, any>>({
  tableName,
  initialFetch = true,
  filter,
  orderBy,
  relations,
  limit
}: SupabaseRealtimeOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Start building the query
      let query = supabase.from(tableName).select(relations ? relations : '*');
      
      // Apply filtering if provided
      if (filter) {
        if (typeof filter === 'string') {
          // Handle string-based filter (e.g. "region_id=eq.123")
          const [key, condition] = filter.split('=');
          if (condition?.startsWith('eq.')) {
            query = query.eq(key, condition.substring(3));
          } else if (condition?.startsWith('in.')) {
            const values = condition.substring(3).split(',');
            query = query.in(key, values);
          }
        } else {
          // Handle object-based filter
          for (const [key, value] of Object.entries(filter)) {
            query = query.eq(key, value);
          }
        }
      }
      
      // Apply ordering if provided
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending });
      }
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data: result, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Fix for TypeScript error: type casting the result to T[]
      if (result) {
        setData(result as unknown as T[]);
      } else {
        setData([]);
      }
      
      setError(null);
    } catch (err) {
      console.error(`Error fetching data from ${tableName}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialFetch) {
      fetchData();
    }
    
    // Set up realtime subscription
    const channel = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName
      }, (payload) => {
        console.log(`Realtime update for ${tableName}:`, payload);
        
        if (payload.eventType === 'INSERT') {
          const newItem = payload.new as T;
          setData((prevData) => [...prevData, newItem]);
        } 
        else if (payload.eventType === 'UPDATE') {
          const updatedItem = payload.new as T;
          setData((prevData) => 
            prevData.map((item) => 
              item.id === updatedItem.id ? updatedItem : item
            )
          );
        } 
        else if (payload.eventType === 'DELETE') {
          const deletedItem = payload.old as T;
          setData((prevData) => 
            prevData.filter((item) => item.id !== deletedItem.id)
          );
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, initialFetch, JSON.stringify(filter), JSON.stringify(orderBy), limit, relations]);

  // CRUD operations
  const add = async (item: Omit<T, 'id'>) => {
    try {
      const { data: newItem, error } = await supabase
        .from(tableName)
        .insert(item)
        .select();
      
      if (error) throw error;
      
      // Realtime should handle this, but we'll update the state just in case
      if (!newItem || newItem.length === 0) {
        await fetchData(); // Fallback to refetching all data
      }
      
      return newItem;
    } catch (err) {
      console.error(`Error adding to ${tableName}:`, err);
      throw err;
    }
  };

  const update = async (id: string | number, updates: Partial<T>) => {
    try {
      const { data: updatedItem, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // Realtime should handle this, but we'll update the state just in case
      if (!updatedItem || updatedItem.length === 0) {
        await fetchData(); // Fallback to refetching all data
      }
      
      return updatedItem;
    } catch (err) {
      console.error(`Error updating in ${tableName}:`, err);
      throw err;
    }
  };

  const remove = async (id: string | number) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Realtime should handle this, but we'll update the state manually to be sure
      setData((prevData) => prevData.filter((item) => item.id !== id));
      
      return true;
    } catch (err) {
      console.error(`Error deleting from ${tableName}:`, err);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
    add,
    update,
    remove
  };
}
