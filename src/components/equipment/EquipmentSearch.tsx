
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EquipmentSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function EquipmentSearch({ value, onChange }: EquipmentSearchProps) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by type, license plate or operator..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
