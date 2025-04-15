
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { hasRegionAccess } from "@/utils/auth";

interface WorkersRegionFilterProps {
  regions: { id: string, name: string }[];
  selectedRegion: string | null;
  onRegionChange: (regionId: string | null) => void;
  isAdmin: boolean;
}

export function WorkersRegionFilter({ regions, selectedRegion, onRegionChange, isAdmin }: WorkersRegionFilterProps) {
  const { user } = useAuth();
  
  // Only show region filter if user is admin or has multiple regions
  if ((!isAdmin && regions.length <= 1) || regions.length === 0) {
    return null;
  }

  // Filter regions based on user access if not an admin
  const accessibleRegions = isAdmin 
    ? regions 
    : regions.filter(region => hasRegionAccess(user, region.id));

  if (accessibleRegions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-1.5 mb-4">
      <Label htmlFor="region-filter">Filter by Region</Label>
      <Select
        value={selectedRegion || "all"}
        onValueChange={(value) => onRegionChange(value === "all" ? null : value)}
      >
        <SelectTrigger id="region-filter" className="w-full sm:w-[250px]">
          <SelectValue placeholder="Select Region" />
        </SelectTrigger>
        <SelectContent>
          {isAdmin && <SelectItem value="all">All Regions</SelectItem>}
          {accessibleRegions.map((region) => (
            <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
