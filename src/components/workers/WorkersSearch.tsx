
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface WorkersSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function WorkersSearch({ value, onChange }: WorkersSearchProps) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by name or ID..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
