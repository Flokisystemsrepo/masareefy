import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Box,
  ShoppingCart,
  Download,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import BostaImportModal from "./import/BostaImportModal";
import ShopifyImportModal from "./import/ShopifyImportModal";
import SystemTemplateModal from "./import/SystemTemplateModal";

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
  currentInventoryCount?: number;
  inventoryLimit?: number;
}

type ImportType = "bosta" | "shopify" | "system" | null;

const BulkImportModal: React.FC<BulkImportModalProps> = ({
  open,
  onOpenChange,
  onImportSuccess,
  currentInventoryCount = 0,
  inventoryLimit = 100,
}) => {
  const { t, isRTL } = useLanguage();
  const [selectedImportType, setSelectedImportType] =
    useState<ImportType>(null);

  const importOptions = [
    {
      id: "bosta" as ImportType,
      title: "Bosta Import",
      description:
        "Import inventory data from Bosta with SKU validation and product tracking",
      icon: Box,
      color: "bg-blue-500",
      features: ["SKU Validation", "Product Tracking", "Inventory Sync"],
    },
    {
      id: "shopify" as ImportType,
      title: "Shopify Import",
      description:
        "Import products from Shopify with automatic variant mapping and inventory sync",
      icon: ShoppingCart,
      color: "bg-green-500",
      features: ["Product Import", "Variant Mapping", "Inventory Sync"],
    },
    {
      id: "system" as ImportType,
      title: "System Template",
      description:
        "Download our template and import your data with custom mapping",
      icon: FileSpreadsheet,
      color: "bg-orange-500",
      features: ["Custom Template", "Flexible Mapping", "Data Validation"],
    },
  ];

  const handleImportTypeSelect = (type: ImportType) => {
    setSelectedImportType(type);
  };

  const handleClose = () => {
    setSelectedImportType(null);
    onOpenChange(false);
  };

  const handleImportSuccess = () => {
    setSelectedImportType(null);
    onImportSuccess?.();
    onOpenChange(false);
  };

  if (selectedImportType) {
    return (
      <>
        {selectedImportType === "bosta" && (
          <BostaImportModal
            open={true}
            onOpenChange={(open) => !open && setSelectedImportType(null)}
            onImportSuccess={handleImportSuccess}
            currentInventoryCount={currentInventoryCount}
            inventoryLimit={inventoryLimit}
          />
        )}
        {selectedImportType === "shopify" && (
          <ShopifyImportModal
            open={true}
            onOpenChange={(open) => !open && setSelectedImportType(null)}
            onImportSuccess={handleImportSuccess}
            currentInventoryCount={currentInventoryCount}
            inventoryLimit={inventoryLimit}
          />
        )}
        {selectedImportType === "system" && (
          <SystemTemplateModal
            open={true}
            onOpenChange={(open) => !open && setSelectedImportType(null)}
            onImportSuccess={handleImportSuccess}
            currentInventoryCount={currentInventoryCount}
            inventoryLimit={inventoryLimit}
          />
        )}
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-6 w-6" />
            Bulk Import Options
          </DialogTitle>
          <p className="text-gray-600">
            Choose your import method to bulk import inventory data
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {importOptions.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                onClick={() => handleImportTypeSelect(option.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${option.color} text-white`}
                    >
                      <option.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {option.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {option.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        <span>Get Started</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
