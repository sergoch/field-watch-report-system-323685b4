
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Region } from "@/types";

interface RegionDialogProps {
  region: Region | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  isSaving: boolean;
  isCreating: boolean;
}

export function RegionDialog({
  region,
  isOpen,
  onClose,
  onSave,
  isSaving,
  isCreating
}: RegionDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (region) {
      setName(region.name);
    } else {
      setName("");
    }
  }, [region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Add New Region" : "Edit Region"}
          </DialogTitle>
          <DialogDescription>
            {isCreating ? "Create a new geographical region." : "Update region details."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Region Name</Label>
              <Input
                id="name"
                placeholder="Enter region name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? "Saving..." : isCreating ? "Add Region" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
