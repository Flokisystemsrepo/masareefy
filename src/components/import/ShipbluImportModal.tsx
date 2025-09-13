import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ship } from "lucide-react";

interface ShipbluImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

const ShipbluImportModal: React.FC<ShipbluImportModalProps> = ({
  open,
  onOpenChange,
  onImportSuccess,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-6 w-6 text-purple-500" />
            Shipblu Import
          </DialogTitle>
        </DialogHeader>
        <div className="p-8 text-center">
          <p className="text-gray-600">
            Shipblu import functionality coming soon...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShipbluImportModal;

