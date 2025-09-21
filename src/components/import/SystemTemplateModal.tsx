import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  ArrowRight,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import { inventoryAPI } from "@/services/api";

interface SystemTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
  currentInventoryCount?: number;
  inventoryLimit?: number;
}

interface SystemTemplateRow {
  productName: string;
  baseSku: string;
  category: string;
  stock: number; // This is the input field name, will be mapped to currentStock
  sellingPrice: number;
  costPrice: number;
  supplier: string;
  location: string;
  description?: string;
  sizes?: string;
  colors?: string;
}

interface SystemTemplateStats {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
}

interface SystemTemplateImportData {
  rows: SystemTemplateRow[];
  stats: SystemTemplateStats;
}

const SystemTemplateModal: React.FC<SystemTemplateModalProps> = ({
  open,
  onOpenChange,
  onImportSuccess,
  currentInventoryCount = 0,
  inventoryLimit = 100,
}) => {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [importData, setImportData] = useState<SystemTemplateImportData | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLimitExceededModal, setShowLimitExceededModal] = useState(false);

  const downloadTemplate = useCallback(() => {
    // Create template data with headers and sample rows
    const templateData = [
      {
        "Product Name": "Sample Product 1",
        "Base SKU": "SKU-001",
        Category: "Electronics",
        Stock: 100,
        "Selling Price": 299.99,
        "Cost Price": 199.99,
        Supplier: "Tech Supplier",
        Location: "Warehouse A",
        Description: "Sample product description",
        Sizes: "S,M,L,XL",
        Colors: "Red,Blue,Green",
      },
      {
        "Product Name": "Sample Product 2",
        "Base SKU": "SKU-002",
        Category: "Clothing",
        Stock: 50,
        "Selling Price": 49.99,
        "Cost Price": 29.99,
        Supplier: "Fashion Supplier",
        Location: "Warehouse B",
        Description: "Another sample product",
        Sizes: "XS,S,M,L",
        Colors: "Black,White",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory Template");

    // Generate and download file
    const fileName = `inventory_template_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Template Downloaded",
      description: "Inventory template has been downloaded successfully.",
    });
  }, [toast]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    []
  );

  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const parsedData = parseSystemTemplateFile(jsonData);
          setImportData(parsedData);
          setShowConfirmation(true);

          toast({
            title: "File Processed",
            description: `Successfully processed ${parsedData.stats.totalRows} rows`,
          });
        } catch (error) {
          console.error("Error processing file:", error);
          toast({
            title: "Error Processing File",
            description:
              "There was an error processing your file. Please try again.",
            variant: "destructive",
          });
        }
      };

      reader.readAsArrayBuffer(file);
    },
    [toast]
  );

  const parseSystemTemplateFile = (data: any[]): SystemTemplateImportData => {
    const requiredColumns = [
      "Product Name",
      "Base SKU",
      "Category",
      "Stock",
      "Selling Price",
      "Cost Price",
      "Supplier",
      "Location",
    ];

    const rows: SystemTemplateRow[] = [];
    const seenSkus = new Set<string>();
    let validRows = 0;
    let invalidRows = 0;
    let duplicates = 0;

    data.forEach((row, index) => {
      // Check for required columns
      const missingColumns = requiredColumns.filter(
        (col) =>
          !(col in row) ||
          row[col] === undefined ||
          row[col] === null ||
          row[col] === ""
      );

      if (missingColumns.length > 0) {
        invalidRows++;
        return;
      }

      // Check for duplicate SKUs
      const sku = String(row["Base SKU"]).trim();
      if (seenSkus.has(sku)) {
        duplicates++;
        return;
      }
      seenSkus.add(sku);

      // Validate numeric fields
      const stock = Number(row["Stock"]);
      const sellingPrice = Number(row["Selling Price"]);
      const costPrice = Number(row["Cost Price"]);

      if (isNaN(stock) || isNaN(sellingPrice) || isNaN(costPrice)) {
        invalidRows++;
        return;
      }

      const templateRow: SystemTemplateRow = {
        productName: String(row["Product Name"]).trim(),
        baseSku: sku,
        category: String(row["Category"]).trim(),
        stock: stock,
        sellingPrice: sellingPrice,
        costPrice: costPrice,
        supplier: String(row["Supplier"]).trim(),
        location: String(row["Location"]).trim(),
        description: row["Description"]
          ? String(row["Description"]).trim()
          : "",
        sizes: row["Sizes"] ? String(row["Sizes"]).trim() : "",
        colors: row["Colors"] ? String(row["Colors"]).trim() : "",
      };

      rows.push(templateRow);
      validRows++;
    });

    return {
      rows,
      stats: {
        totalRows: data.length,
        validRows,
        invalidRows,
        duplicates,
      },
    };
  };

  const processSystemTemplateImport = useCallback(async () => {
    if (!importData) return;

    // Check if already at or over limit
    if (inventoryLimit !== -1 && currentInventoryCount >= inventoryLimit) {
      toast({
        title: "Limit Reached",
        description: `You have reached your limit of ${inventoryLimit} products. Please upgrade your plan to add more products.`,
        variant: "destructive",
      });
      return;
    }

    // Check if import would exceed limit
    if (
      inventoryLimit !== -1 &&
      currentInventoryCount + importData.stats.validRows > inventoryLimit
    ) {
      setShowLimitExceededModal(true);
      return;
    }

    try {
      setIsProcessing(true);

      // Process in batches of 10
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < importData.rows.length; i += batchSize) {
        batches.push(importData.rows.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const batchPromises = batch.map(async (row) => {
          const inventoryItem = {
            productName: row.productName,
            baseSku: row.baseSku,
            category: row.category,
            currentStock: row.stock,
            sellingPrice: row.sellingPrice,
            unitCost: row.costPrice,
            supplier: row.supplier,
            location: row.location,
            description: row.description || "",
            sizes: row.sizes ? row.sizes.split(",").map((s) => s.trim()) : [],
            colors: row.colors
              ? row.colors.split(",").map((c) => c.trim())
              : [],
          };

          return inventoryAPI.create(inventoryItem);
        });

        await Promise.all(batchPromises);
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${importData.stats.validRows} inventory items`,
      });

      onImportSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description:
          "There was an error importing your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    importData,
    toast,
    onImportSuccess,
    currentInventoryCount,
    inventoryLimit,
  ]);

  const handleClose = () => {
    setImportData(null);
    setShowConfirmation(false);
    setIsDragOver(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-orange-500" />
            System Template Import
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Download our template, fill in your data, and import your inventory
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {!showConfirmation ? (
            // File Upload Section
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Upload Filled Template
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-orange-400"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop your filled template here
                </h3>
                <p className="text-gray-600 mb-4">
                  Or click to browse and select your Excel file
                </p>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="system-template-upload"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("system-template-upload")?.click()
                  }
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
              </div>

              {/* Template Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Template Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>• Download the template and fill in your inventory data</p>
                  <p>
                    • Required fields: Product Name, Base SKU, Category, Stock,
                    Selling Price, Cost Price, Supplier, Location
                  </p>
                  <p>
                    • Optional fields: Description, Sizes (comma-separated),
                    Colors (comma-separated), Tags (comma-separated)
                  </p>
                  <p>
                    • Ensure SKUs are unique and numeric fields contain valid
                    numbers
                  </p>
                  <p>• Save as Excel format (.xlsx) before uploading</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Confirmation Section
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Import Confirmation</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirmation(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Back to Upload
                </Button>
              </div>

              {/* Import Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {importData?.stats.totalRows}
                    </div>
                    <div className="text-sm text-gray-600">Total Rows</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {importData?.stats.validRows}
                    </div>
                    <div className="text-sm text-gray-600">Valid Rows</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {importData?.stats.invalidRows}
                    </div>
                    <div className="text-sm text-gray-600">Invalid Rows</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {importData?.stats.duplicates}
                    </div>
                    <div className="text-sm text-gray-600">Duplicates</div>
                  </CardContent>
                </Card>
              </div>

              {/* Sample Data Preview */}
              {importData && importData.rows.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Sample Data Preview (First 5 items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Product Name</th>
                            <th className="text-left p-2">SKU</th>
                            <th className="text-left p-2">Category</th>
                            <th className="text-left p-2">Stock</th>
                            <th className="text-left p-2">Price</th>
                            <th className="text-left p-2">Supplier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importData.rows.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{row.productName}</td>
                              <td className="p-2">{row.baseSku}</td>
                              <td className="p-2">{row.category}</td>
                              <td className="p-2">{row.stock}</td>
                              <td className="p-2">EGP {row.sellingPrice}</td>
                              <td className="p-2">{row.supplier}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                >
                  ← Back to Upload
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={processSystemTemplateImport}
                    disabled={
                      isProcessing || (importData?.stats.validRows || 0) === 0
                    }
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Import {importData?.stats.validRows || 0} Items
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Limit Exceeded Modal */}
      <Dialog
        open={showLimitExceededModal}
        onOpenChange={setShowLimitExceededModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Import Limit Exceeded
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              You have {importData?.stats.validRows || 0} items to import, but your plan only
              allows {inventoryLimit} products total. You currently have{" "}
              {currentInventoryCount} products and can only import{" "}
              {Math.max(0, inventoryLimit - currentInventoryCount)} more.
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  Your import would exceed your plan limit
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  // Auto-select only the remaining slots
                  const maxCanImport = inventoryLimit - currentInventoryCount;
                  const validRows = importData?.rows || [];
                  
                  // Create a new import data with only the items that fit within the limit
                  const limitedRows = validRows.slice(0, maxCanImport);
                  const limitedStats = {
                    ...importData?.stats,
                    validRows: Math.min(maxCanImport, importData?.stats.validRows || 0),
                    totalRows: limitedRows.length,
                  };

                  setImportData({
                    rows: limitedRows,
                    stats: limitedStats,
                  });
                  setShowLimitExceededModal(false);

                  toast({
                    title: "Auto-Selected Items",
                    description: `Automatically selected ${maxCanImport} items that fit within your limit`,
                  });
                }}
                className="w-full"
              >
                Select Only {Math.max(0, inventoryLimit - currentInventoryCount)}{" "}
                Remaining
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setImportData(null);
                  setShowLimitExceededModal(false);
                }}
                className="w-full"
              >
                Cancel Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default SystemTemplateModal;
