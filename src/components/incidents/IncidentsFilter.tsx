
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { IncidentType } from "@/types";
import { IncidentTypeTabs } from "./IncidentTypeTabs";

interface IncidentsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  onExport: (type: IncidentType | "All") => void;
  counts: Record<string, number>;
  incidentTypes: IncidentType[];
  filteredCount: number;
}

export function IncidentsFilter({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onExport,
  counts,
  incidentTypes,
  filteredCount
}: IncidentsFilterProps) {
  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by region or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <IncidentTypeTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        onExport={onExport}
        counts={counts}
        incidentTypes={incidentTypes}
        filteredCount={filteredCount}
      />
    </>
  );
}
