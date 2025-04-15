
import { User } from '@/types';

/**
 * Check if the current user is an administrator
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if the current user is an engineer
 */
export function isEngineer(user: User | null): boolean {
  return user?.role === 'engineer';
}

/**
 * Check if the user has access to a specific region
 */
export function hasRegionAccess(user: User | null, regionId: string): boolean {
  if (!user) return false;
  
  // Admins have access to all regions
  if (isAdmin(user)) return true;
  
  // Engineers only have access to their assigned regions
  return user.assignedRegions?.includes(regionId) || false;
}

/**
 * Filter a list of items by the user's region access
 */
export function filterByUserRegions<T extends { region_id?: string; regionId?: string }>(
  user: User | null, 
  items: T[]
): T[] {
  if (!user) return [];
  
  // Admins can see all items
  if (isAdmin(user)) return items;
  
  // Engineers can only see items from their regions
  return items.filter(item => {
    const itemRegionId = item.region_id || item.regionId;
    if (!itemRegionId) return false;
    return hasRegionAccess(user, itemRegionId);
  });
}
