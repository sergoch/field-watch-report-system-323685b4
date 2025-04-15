
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the given user is an admin
 * @param user The user object to check
 * @returns True if the user is an admin, false otherwise
 */
export function isAdmin(user?: User | null): boolean {
  return user?.role === "admin";
}

/**
 * Checks if the given user is an engineer
 * @param user The user object to check
 * @returns True if the user is an engineer, false otherwise
 */
export function isEngineer(user?: User | null): boolean {
  return user?.role === "engineer";
}

/**
 * Checks if the user has access to a specific region
 * @param user The user object to check
 * @param regionId The region ID to check access for
 * @returns True if the user has access to the region, false otherwise
 */
export function hasRegionAccess(user: User | null | undefined, regionId: string | undefined): boolean {
  if (!user || !regionId) return false;
  
  // Admins have access to all regions
  if (isAdmin(user)) return true;
  
  // Check if the engineer is assigned to this region
  if (user.assignedRegions) {
    return user.assignedRegions.includes(regionId);
  }
  
  // Default to no access
  return false;
}

/**
 * Fetches all regions assigned to an engineer
 * @param engineerId The ID of the engineer to fetch regions for
 * @returns An array of region IDs
 */
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
