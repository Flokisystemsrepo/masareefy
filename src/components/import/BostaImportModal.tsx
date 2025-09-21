import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Box,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { inventoryAPI } from "@/services/api";

interface BostaImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
  currentInventoryCount?: number;
  inventoryLimit?: number;
}

interface BostaRow {
  bostaSku: string;
  productName: string;
  productNameAR: string;
  price: number;
  forecasted: number;
  onhandQuantity: number;
  internalReferenceNumber: string;
  [key: string]: any;
}

interface BostaImportData {
  rows: BostaRow[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    unknownSkus: string[];
  };
}

const BostaImportModal: React.FC<BostaImportModalProps> = ({
  open,
  onOpenChange,
  onImportSuccess,
  currentInventoryCount = 0,
  inventoryLimit = 100,
}) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();

  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importData, setImportData] = useState<BostaImportData | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLimitExceededModal, setShowLimitExceededModal] = useState(false);
  const itemsPerPage = 10;

  // Use passed props for inventory count and limit
  const inventoryCount = currentInventoryCount;
  const remainingSlots = inventoryLimit - inventoryCount;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Parse the actual Excel file
      const data = await parseExcelFile(file);
      setImportData(data);
      setCurrentPage(1); // Reset to first page

      // Select all valid rows by default
      const validRowIndices = new Set(
        data.rows
          .map((row, index) =>
            !data.stats.unknownSkus.includes(row.bostaSku) ? index : -1
          )
          .filter((index) => index !== -1)
      );
      setSelectedRows(validRowIndices);

      toast({
        title: "File Parsed Successfully",
        description: `Found ${data.stats.totalRows} rows with ${data.stats.validRows} valid entries`,
      });
    } catch (error: any) {
      toast({
        title: "Import Error",
        description: error.message || "Failed to parse file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Function to parse Excel file with correct field mapping
  const parseExcelFile = async (file: File): Promise<BostaImportData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length < 2) {
            throw new Error(
              "File must contain at least a header row and one data row"
            );
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];

          // Map headers to our expected fields
          const headerMap: { [key: string]: number } = {};
          headers.forEach((header, index) => {
            const normalizedHeader = header?.toString().toLowerCase().trim();
            if (
              normalizedHeader.includes("bosta") &&
              normalizedHeader.includes("sku")
            ) {
              headerMap.bostaSku = index;
            } else if (
              normalizedHeader.includes("product") &&
              normalizedHeader.includes("name") &&
              !normalizedHeader.includes("ar")
            ) {
              headerMap.productName = index;
            } else if (
              normalizedHeader.includes("product") &&
              normalizedHeader.includes("name") &&
              normalizedHeader.includes("ar")
            ) {
              headerMap.productNameAR = index;
            } else if (normalizedHeader.includes("price")) {
              headerMap.price = index;
            } else if (
              normalizedHeader.includes("forecasted") &&
              normalizedHeader.includes("onhand")
            ) {
              // Combined field: "Forecasted Onhand Qua"
              headerMap.onhandQuantity = index;
            } else if (
              normalizedHeader.includes("forecasted") &&
              !normalizedHeader.includes("onhand")
            ) {
              headerMap.forecasted = index;
            } else if (
              normalizedHeader.includes("onhand") ||
              normalizedHeader.includes("quantity")
            ) {
              headerMap.onhandQuantity = index;
            } else if (
              normalizedHeader.includes("internal") &&
              normalizedHeader.includes("reference")
            ) {
              headerMap.internalReferenceNumber = index;
            }
          });

          // Validate required headers
          if (headerMap.bostaSku === undefined) {
            throw new Error("Required column 'Bosta SKU' not found");
          }

          const parsedRows: BostaRow[] = [];
          const unknownSkus: string[] = [];

          rows.forEach((row, index) => {
            if (!row || row.length === 0) return; // Skip empty rows

            const bostaSku = row[headerMap.bostaSku]?.toString().trim() || "";
            const productName =
              row[headerMap.productName]?.toString().trim() || "";
            const productNameAR =
              row[headerMap.productNameAR]?.toString().trim() || "";
            const price =
              parseFloat(row[headerMap.price]?.toString() || "0") || 0;
            const forecasted =
              parseInt(row[headerMap.forecasted]?.toString() || "0") || 0;
            const onhandQuantity =
              parseInt(row[headerMap.onhandQuantity]?.toString() || "0") || 0;
            const internalReferenceNumber =
              row[headerMap.internalReferenceNumber]?.toString().trim() || "";

            // Check if SKU is valid (not empty and not a known invalid pattern)
            const isValidSku =
              bostaSku &&
              !bostaSku.toLowerCase().includes("unknown") &&
              !bostaSku.toLowerCase().includes("invalid");

            if (!isValidSku) {
              unknownSkus.push(bostaSku || `ROW-${index + 2}`);
            }

            parsedRows.push({
              bostaSku,
              productName,
              productNameAR,
              price,
              forecasted,
              onhandQuantity,
              internalReferenceNumber,
            });
          });

          const result: BostaImportData = {
            rows: parsedRows,
            stats: {
              totalRows: parsedRows.length,
              validRows: parsedRows.length - unknownSkus.length,
              invalidRows: unknownSkus.length,
              unknownSkus,
            },
          };

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const toggleRowSelection = (index: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedRows(newSelection);
  };

  const selectAllValid = () => {
    if (!importData) return;
    const validRowIndices = new Set(
      importData.rows
        .map((row, index) =>
          !importData.stats.unknownSkus.includes(row.bostaSku) ? index : -1
        )
        .filter((index) => index !== -1)
    );
    setSelectedRows(validRowIndices);
  };

  const selectNone = () => {
    setSelectedRows(new Set());
  };

  // Pagination logic
  const totalPages = importData
    ? Math.ceil(importData.rows.length / itemsPerPage)
    : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageRows = importData
    ? importData.rows.slice(startIndex, endIndex)
    : [];
  const currentPageIndices = currentPageRows.map(
    (_, index) => startIndex + index
  );

  const handleImport = async () => {
    if (!importData || selectedRows.size === 0) return;

    // Check if already at or over limit
    if (inventoryLimit !== -1 && inventoryCount >= inventoryLimit) {
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
      inventoryCount + selectedRows.size > inventoryLimit
    ) {
      setShowLimitExceededModal(true);
      return;
    }

    setIsImporting(true);
    try {
      const selectedData = Array.from(selectedRows).map(
        (index) => importData.rows[index]
      );

      // Import each selected item to inventory
      for (const item of selectedData) {
        try {
          // Use the actual inventory API to create items
          const inventoryItem = {
            productName:
              item.productName ||
              item.productNameAR ||
              `Imported from Bosta - ${item.bostaSku}`,
            baseSku: item.bostaSku,
            category: "Imported from Bosta",
            supplier: "Bosta Import",
            unitCost: 0, // Default cost
            sellingPrice: item.price,
            currentStock: item.onhandQuantity,
            reorderLevel: 10, // Default reorder level
            description: `Imported from Bosta - ${item.internalReferenceNumber}`,
            location: "Imported",
            sizes: [], // Default empty sizes
            colors: [], // Default empty colors
          };

          // Use the inventory API service
          await inventoryAPI.create(inventoryItem);
        } catch (itemError) {
          console.error(`Error importing item ${item.bostaSku}:`, itemError);
          // Continue with other items even if one fails
        }
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${selectedRows.size} inventory items from Bosta`,
      });

      onImportSuccess?.();
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Create and download Bosta template
    const templateData = [
      [
        "Bosta SKU",
        "Product Name",
        "Product Name AR",
        "Price",
        "Forecasted Onhand Qua",
        "Internal Reference Number",
      ],
      [
        "BOS-SHIRT-001",
        "Blue Cotton Shirt",
        "قميص قطني أزرق",
        "150.00",
        "50",
        "REF-001",
      ],
    ];

    const csvContent = templateData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bosta-import-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-6 w-6 text-blue-500" />
            Bosta Import
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Import shipping data from Bosta with SKU validation and order
            tracking
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {!importData ? (
            // File Upload Section
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Upload Bosta File
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
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="bosta-file-upload"
                />
                <label htmlFor="bosta-file-upload" className="cursor-pointer">
                  <motion.div
                    animate={{ scale: isUploading ? 0.95 : 1 }}
                    className="space-y-4"
                  >
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                      ) : (
                        <Upload className="h-8 w-8 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {isUploading
                          ? "Processing file..."
                          : "Drag & drop your Bosta file here"}
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to browse files
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supports .xlsx and .xls files
                      </p>
                    </div>
                  </motion.div>
                </label>
              </div>
            </div>
          ) : (
            // Data Preview and Selection
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Total Rows</p>
                        <p className="text-2xl font-bold">
                          {importData.rows.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Valid Rows</p>
                        <p className="text-2xl font-bold text-green-600">
                          {
                            importData.rows.filter(
                              (row) =>
                                !importData.stats.unknownSkus.includes(
                                  row.bostaSku
                                )
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-600">Invalid Rows</p>
                        <p className="text-2xl font-bold text-red-600">
                          {
                            importData.rows.filter((row) =>
                              importData.stats.unknownSkus.includes(
                                row.bostaSku
                              )
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Selected for Import
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedRows.size}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={selectAllValid}>
                    Select All Valid
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectNone}>
                    Select None
                  </Button>
                  <span className="text-sm text-gray-600">
                    {selectedRows.size} of{" "}
                    {
                      importData.rows.filter(
                        (row) =>
                          !importData.stats.unknownSkus.includes(row.bostaSku)
                      ).length
                    }{" "}
                    valid rows selected
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportData(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Upload New File
                </Button>
              </div>

              {/* Data Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Import Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Select</th>
                          <th className="text-left p-2">Bosta SKU</th>
                          <th className="text-left p-2">Product Name</th>
                          <th className="text-left p-2">Product Name AR</th>
                          <th className="text-left p-2">Price</th>
                          <th className="text-left p-2">
                            Forecasted Onhand Qua
                          </th>
                          <th className="text-left p-2">Internal Ref</th>
                          <th className="text-left p-2">Validation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPageRows.map((row, index) => {
                          const actualIndex = currentPageIndices[index];
                          const isValid =
                            !importData.stats.unknownSkus.includes(
                              row.bostaSku
                            );
                          const isSelected = selectedRows.has(actualIndex);

                          return (
                            <tr
                              key={index}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="p-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    toggleRowSelection(actualIndex)
                                  }
                                  disabled={!isValid}
                                />
                              </td>
                              <td className="p-2 font-mono text-xs">
                                {row.bostaSku}
                              </td>
                              <td className="p-2">
                                {row.productName || (
                                  <span className="text-gray-500 italic">
                                    {row.productNameAR || "No name"}
                                  </span>
                                )}
                              </td>
                              <td className="p-2">
                                {row.productNameAR && (
                                  <span
                                    className={
                                      row.productName
                                        ? "text-gray-400 text-xs"
                                        : "text-gray-500 italic"
                                    }
                                  >
                                    {row.productNameAR}
                                  </span>
                                )}
                              </td>
                              <td className="p-2">${row.price.toFixed(2)}</td>
                              <td className="p-2">{row.onhandQuantity}</td>
                              <td className="p-2 font-mono text-xs">
                                {row.internalReferenceNumber}
                              </td>
                              <td className="p-2">
                                {isValid ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(endIndex, importData.rows.length)} of{" "}
                        {importData.rows.length} items
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Import Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={selectedRows.size === 0 || isImporting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isImporting
                    ? "Importing..."
                    : `Import ${selectedRows.size} Items`}
                </Button>
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
              You have selected {selectedRows.size} items, but your plan only
              allows {inventoryLimit} products total. You currently have{" "}
              {inventoryCount} products and can only import{" "}
              {Math.max(0, inventoryLimit - inventoryCount)} more.
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
                  const maxCanImport = inventoryLimit - inventoryCount;
                  const validRows =
                    importData?.rows.filter((_, index) =>
                      importData.validation.validRows.includes(index)
                    ) || [];

                  const newSelected = new Set<number>();
                  let count = 0;

                  for (
                    let i = 0;
                    i < validRows.length && count < maxCanImport;
                    i++
                  ) {
                    const originalIndex =
                      importData?.rows.findIndex(
                        (row) => row === validRows[i]
                      ) || 0;
                    newSelected.add(originalIndex);
                    count++;
                  }

                  setSelectedRows(newSelected);
                  setShowLimitExceededModal(false);

                  toast({
                    title: "Auto-Selected Items",
                    description: `Automatically selected ${maxCanImport} items that fit within your limit`,
                  });
                }}
                className="w-full"
              >
                Select Only {Math.max(0, inventoryLimit - inventoryCount)}{" "}
                Remaining
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRows(new Set());
                  setShowLimitExceededModal(false);
                }}
                className="w-full"
              >
                Select None
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default BostaImportModal;
