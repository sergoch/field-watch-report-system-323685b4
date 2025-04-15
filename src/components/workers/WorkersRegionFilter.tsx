
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface WorkersRegionFilterProps {
  regions: { id: string, name: string }[];
  selectedRegion: string | null;
  onRegionChange: (regionId: string | null) => void;
  isAdmin: boolean;
}

export function WorkersRegionFilter({ regions, selectedRegion, onRegionChange, isAdmin }: WorkersRegionFilterProps) {
  if (!isAdmin || regions.length <= 1) return null;

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
          <SelectItem value="all">All Regions</SelectItem>
          {regions.map((region) => (
            <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
