
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Edit } from "lucide-react";
import { Incident } from "@/types";

interface IncidentDetailsProps {
  incident: Incident;
  regionNames: Record<string, string>;
  onEdit: (incident: Incident) => void;
}

export function IncidentDetails({ incident, regionNames, onEdit }: IncidentDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="font-semibold">Date</Label>
          <p>{new Date(incident.date || "").toLocaleDateString()}</p>
        </div>
        <div>
          <Label className="font-semibold">Type</Label>
          <p className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {incident.type}
          </p>
        </div>
        <div>
          <Label className="font-semibold">Region</Label>
          <p>{regionNames[incident.regionId || ""] || "Unknown"}</p>
        </div>
        <div>
          <Label className="font-semibold">Location</Label>
          <p className="flex items-center text-xs font-mono">
            <MapPin className="h-4 w-4 mr-1" />
            {incident.latitude}, {incident.longitude}
          </p>
        </div>
      </div>

      <div>
        <Label className="font-semibold">Description</Label>
        <p className="mt-1 whitespace-pre-wrap">{incident.description}</p>
      </div>

      {incident.imageUrl && (
        <div>
          <Label className="font-semibold">Incident Photo</Label>
          <div className="mt-2 border rounded-md overflow-hidden">
            <img 
              src={incident.imageUrl} 
              alt="Incident" 
              className="w-full h-auto max-h-60 object-contain"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(incident)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Incident
        </Button>
      </div>
    </div>
  );
}
