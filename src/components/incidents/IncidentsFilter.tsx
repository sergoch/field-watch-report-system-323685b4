
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { IncidentType } from "@/types";

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
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="All" className="relative">
            All
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
              {counts["All"]}
            </span>
          </TabsTrigger>
          {incidentTypes.map((type) => (
            <TabsTrigger key={type} value={type} className="relative">
              {type}
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {counts[type]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="All" className="pt-2">
          <div className="flex justify-end mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport("All")}
              disabled={filteredCount === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </TabsContent>
        
        {incidentTypes.map((type) => (
          <TabsContent key={type} value={type} className="pt-2">
            <div className="flex justify-end mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onExport(type)}
                disabled={counts[type] === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
