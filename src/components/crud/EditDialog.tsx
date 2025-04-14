
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave: () => void;
  isSaving?: boolean;
}

export function EditDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSave,
  isSaving = false
}: EditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isSaving}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="p-1">{children}</div>
        </ScrollArea>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave} 
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
