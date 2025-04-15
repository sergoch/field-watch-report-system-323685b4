
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

// Helper to check if user is admin
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

// Helper to check if user is engineer
export function isEngineer(user: User | null): boolean {
  return user?.role === 'engineer';
}

// Get engineer's assigned regions
export async function getEngineerRegions(engineerId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('engineer_regions')
      .select('region_id')
      .eq('engineer_id', engineerId);

    if (error) throw error;
    return data.map(item => item.region_id);
  } catch (err) {
    console.error('Error fetching engineer regions:', err);
    return [];
  }
}

// Upload image to Supabase storage
export async function uploadImage(file: File, bucket: string, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file);
    
    if (error) throw error;
    
    const { data } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (err) {
    console.error('Error uploading image:', err);
    return null;
  }
}

// Fetch an engineer's primary region
export async function getEngineerPrimaryRegion(engineerId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('engineer_regions')
      .select('region_id')
      .eq('engineer_id', engineerId)
      .limit(1)
      .single();

    if (error) return null;
    return data.region_id;
  } catch (err) {
    console.error('Error fetching engineer primary region:', err);
    return null;
  }
}
