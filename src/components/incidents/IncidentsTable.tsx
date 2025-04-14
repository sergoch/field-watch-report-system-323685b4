
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, Edit, Trash2 } from "lucide-react";
import { Incident } from "@/types";

interface IncidentsTableProps {
  incidents: Incident[];
  loading: boolean;
  regionNames: Record<string, string>;
  onView: (incident: Incident) => void;
  onEdit: (incident: Incident) => void;
  onDelete: (incident: Incident) => void;
}

export function IncidentsTable({ 
  incidents, 
  loading,
  regionNames,
  onView,
  onEdit,
  onDelete
}: IncidentsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Loading incidents data...
              </TableCell>
            </TableRow>
          ) : incidents.length > 0 ? (
            incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{new Date(incident.date || "").toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {incident.type}
                  </span>
                </TableCell>
                <TableCell>{regionNames[incident.regionId || ""] || "Unknown"}</TableCell>
                <TableCell>
                  <span className="text-xs font-mono">
                    {incident.latitude?.toFixed(6) || "N/A"}, {incident.longitude?.toFixed(6) || "N/A"}
                  </span>
                </TableCell>
                <TableCell className="max-w-md truncate">{incident.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(incident)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(incident)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(incident)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No incidents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
