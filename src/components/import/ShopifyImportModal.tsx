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

interface ShopifyImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
  currentInventoryCount?: number;
  inventoryLimit?: number;
}

interface ShopifyRow {
  handle: string;
  title: string;
  bodyHtml: string;
  vendor: string;
  productType: string;
  tags: string;
  published: string;
  option1Name: string;
  option1Value: string;
  option2Name: string;
  option2Value: string;
  option3Name: string;
  option3Value: string;
  variantSku: string;
  variantGrams: number;
  variantInventoryQuantity: number;
  variantPrice: number;
  variantCompareAtPrice: number;
  variantBarcode: string;
  imageSrc: string;
  imageAltText: string;
  seoTitle: string;
  seoDescription: string;
  googleShoppingCategory: string;
  googleShoppingGender: string;
  googleShoppingAgeGroup: string;
  googleShoppingColor: string;
  googleShoppingSize: string;
  variantWeightUnit: string;
  costPerItem: number;
  status: string;
}

interface ShopifyImportData {
  rows: ShopifyRow[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateSkus: string[];
  };
}

const ShopifyImportModal: React.FC<ShopifyImportModalProps> = ({
  open,
  onOpenChange,
  onImportSuccess,
  currentInventoryCount = 0,
  inventoryLimit = 100,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [importData, setImportData] = useState<ShopifyImportData | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLimitExceededModal, setShowLimitExceededModal] = useState(false);
  const itemsPerPage = 10;

  // Use passed props for inventory count and limit
  const inventoryCount = currentInventoryCount;
  const remainingSlots = inventoryLimit - inventoryCount;

  const handleFileUpload = useCallback(
    (file: File) => {
      console.log(
        "Starting file upload for:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          console.log("File reader onload triggered");

          let jsonData: any[][];

          if (file.name.endsWith(".csv") || file.type === "text/csv") {
            // Handle CSV files
            console.log("Processing CSV file");
            const csvText = e.target?.result as string;
            console.log("CSV text length:", csvText.length);
            const workbook = XLSX.read(csvText, { type: "string" });
            console.log(
              "CSV workbook created, sheet names:",
              workbook.SheetNames
            );
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          } else {
            // Handle Excel files
            console.log("Processing Excel file");
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            console.log("Data array length:", data.length);
            console.log("XLSX library available:", typeof XLSX);
            const workbook = XLSX.read(data, { type: "array" });
            console.log("Workbook created, sheet names:", workbook.SheetNames);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          }

          console.log("JSON data parsed, rows:", jsonData.length);

          if (jsonData.length < 2) {
            throw new Error(
              "File must contain at least a header row and one data row"
            );
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];

          // Map headers to our interface
          const headerMap: { [key: string]: number } = {};
          headers.forEach((header, index) => {
            const normalizedHeader = header?.toString().toLowerCase().trim();
            if (normalizedHeader === "handle") {
              headerMap.handle = index;
            } else if (normalizedHeader === "title") {
              headerMap.title = index;
            } else if (
              normalizedHeader.includes("body") &&
              normalizedHeader.includes("html")
            ) {
              headerMap.bodyHtml = index;
            } else if (normalizedHeader === "vendor") {
              headerMap.vendor = index;
            } else if (
              normalizedHeader.includes("product") &&
              normalizedHeader.includes("type")
            ) {
              headerMap.productType = index;
            } else if (normalizedHeader === "tags") {
              headerMap.tags = index;
            } else if (normalizedHeader === "published") {
              headerMap.published = index;
            } else if (
              normalizedHeader.includes("option1") &&
              normalizedHeader.includes("name")
            ) {
              headerMap.option1Name = index;
            } else if (
              normalizedHeader.includes("option1") &&
              normalizedHeader.includes("value")
            ) {
              headerMap.option1Value = index;
            } else if (
              normalizedHeader.includes("option2") &&
              normalizedHeader.includes("name")
            ) {
              headerMap.option2Name = index;
            } else if (
              normalizedHeader.includes("option2") &&
              normalizedHeader.includes("value")
            ) {
              headerMap.option2Value = index;
            } else if (
              normalizedHeader.includes("option3") &&
              normalizedHeader.includes("name")
            ) {
              headerMap.option3Name = index;
            } else if (
              normalizedHeader.includes("option3") &&
              normalizedHeader.includes("value")
            ) {
              headerMap.option3Value = index;
            } else if (
              normalizedHeader.includes("variant") &&
              normalizedHeader.includes("sku")
            ) {
              headerMap.variantSku = index;
            } else if (
              normalizedHeader.includes("variant") &&
              normalizedHeader.includes("grams")
            ) {
              headerMap.variantGrams = index;
            } else if (
              normalizedHeader.includes("variant") &&
              normalizedHeader.includes("inventory") &&
              normalizedHeader.includes("quantity")
            ) {
              headerMap.variantInventoryQuantity = index;
            } else if (
              normalizedHeader.includes("variant") &&
              normalizedHeader.includes("price") &&
              !normalizedHeader.includes("compare")
            ) {
              headerMap.variantPrice = index;
            } else if (
              normalizedHeader.includes("variant") &&
              normalizedHeader.includes("compare")
            ) {
              headerMap.variantCompareAtPrice = index;
            } else if (
              normalizedHeader.includes("variant") &&
              normalizedHeader.includes("barcode")
            ) {
              headerMap.variantBarcode = index;
            } else if (
              normalizedHeader.includes("image") &&
              normalizedHeader.includes("src")
            ) {
              headerMap.imageSrc = index;
            } else if (
              normalizedHeader.includes("image") &&
              normalizedHeader.includes("alt")
            ) {
              headerMap.imageAltText = index;
            } else if (
              normalizedHeader.includes("seo") &&
              normalizedHeader.includes("title")
            ) {
              headerMap.seoTitle = index;
            } else if (
              normalizedHeader.includes("seo") &&
              normalizedHeader.includes("description")
            ) {
              headerMap.seoDescription = index;
            } else if (
              normalizedHeader.includes("google") &&
              normalizedHeader.includes("category")
            ) {
              headerMap.googleShoppingCategory = index;
            } else if (
              normalizedHeader.includes("google") &&
              normalizedHeader.includes("gender")
            ) {
              headerMap.googleShoppingGender = index;
            } else if (
              normalizedHeader.includes("google") &&
              normalizedHeader.includes("age")
            ) {
              headerMap.googleShoppingAgeGroup = index;
            } else if (
              normalizedHeader.includes("google") &&
              normalizedHeader.includes("color")
            ) {
              headerMap.googleShoppingColor = index;
            } else if (
              normalizedHeader.includes("google") &&
              normalizedHeader.includes("size")
            ) {
              headerMap.googleShoppingSize = index;
            } else if (
              normalizedHeader.includes("variant") &&
              normalizedHeader.includes("weight")
            ) {
              headerMap.variantWeightUnit = index;
            } else if (
              normalizedHeader.includes("cost") &&
              normalizedHeader.includes("item")
            ) {
              headerMap.costPerItem = index;
            } else if (normalizedHeader === "status") {
              headerMap.status = index;
            }
          });

          // Validate required columns
          if (headerMap.variantSku === undefined) {
            throw new Error("File must contain 'Variant SKU' column");
          }

          // Parse rows
          const parsedRows: ShopifyRow[] = [];
          const duplicateSkus: string[] = [];
          const seenSkus = new Set<string>();

          rows.forEach((row, index) => {
            if (!row || row.length === 0) return; // Skip empty rows

            const handle = row[headerMap.handle]?.toString().trim() || "";
            const title = row[headerMap.title]?.toString().trim() || "";
            const bodyHtml = row[headerMap.bodyHtml]?.toString().trim() || "";
            const vendor = row[headerMap.vendor]?.toString().trim() || "";
            const productType =
              row[headerMap.productType]?.toString().trim() || "";
            const tags = row[headerMap.tags]?.toString().trim() || "";
            const published = row[headerMap.published]?.toString().trim() || "";
            const option1Name =
              row[headerMap.option1Name]?.toString().trim() || "";
            const option1Value =
              row[headerMap.option1Value]?.toString().trim() || "";
            const option2Name =
              row[headerMap.option2Name]?.toString().trim() || "";
            const option2Value =
              row[headerMap.option2Value]?.toString().trim() || "";
            const option3Name =
              row[headerMap.option3Name]?.toString().trim() || "";
            const option3Value =
              row[headerMap.option3Value]?.toString().trim() || "";
            const variantSku =
              row[headerMap.variantSku]?.toString().trim() || "";
            const variantGrams =
              parseFloat(row[headerMap.variantGrams]?.toString() || "0") || 0;
            const variantInventoryQuantity =
              parseInt(
                row[headerMap.variantInventoryQuantity]?.toString() || "0"
              ) || 0;
            const variantPrice =
              parseFloat(row[headerMap.variantPrice]?.toString() || "0") || 0;
            const variantCompareAtPrice =
              parseFloat(
                row[headerMap.variantCompareAtPrice]?.toString() || "0"
              ) || 0;
            const variantBarcode =
              row[headerMap.variantBarcode]?.toString().trim() || "";
            const imageSrc = row[headerMap.imageSrc]?.toString().trim() || "";
            const imageAltText =
              row[headerMap.imageAltText]?.toString().trim() || "";
            const seoTitle = row[headerMap.seoTitle]?.toString().trim() || "";
            const seoDescription =
              row[headerMap.seoDescription]?.toString().trim() || "";
            const googleShoppingCategory =
              row[headerMap.googleShoppingCategory]?.toString().trim() || "";
            const googleShoppingGender =
              row[headerMap.googleShoppingGender]?.toString().trim() || "";
            const googleShoppingAgeGroup =
              row[headerMap.googleShoppingAgeGroup]?.toString().trim() || "";
            const googleShoppingColor =
              row[headerMap.googleShoppingColor]?.toString().trim() || "";
            const googleShoppingSize =
              row[headerMap.googleShoppingSize]?.toString().trim() || "";
            const variantWeightUnit =
              row[headerMap.variantWeightUnit]?.toString().trim() || "";
            const costPerItem =
              parseFloat(row[headerMap.costPerItem]?.toString() || "0") || 0;
            const status = row[headerMap.status]?.toString().trim() || "";

            // Check for duplicate SKUs
            if (variantSku && seenSkus.has(variantSku.toLowerCase())) {
              duplicateSkus.push(variantSku);
            } else if (variantSku) {
              seenSkus.add(variantSku.toLowerCase());
            }

            parsedRows.push({
              handle,
              title,
              bodyHtml,
              vendor,
              productType,
              tags,
              published,
              option1Name,
              option1Value,
              option2Name,
              option2Value,
              option3Name,
              option3Value,
              variantSku,
              variantGrams,
              variantInventoryQuantity,
              variantPrice,
              variantCompareAtPrice,
              variantBarcode,
              imageSrc,
              imageAltText,
              seoTitle,
              seoDescription,
              googleShoppingCategory,
              googleShoppingGender,
              googleShoppingAgeGroup,
              googleShoppingColor,
              googleShoppingSize,
              variantWeightUnit,
              costPerItem,
              status,
            });
          });

          const importData: ShopifyImportData = {
            rows: parsedRows,
            stats: {
              totalRows: parsedRows.length,
              validRows: parsedRows.filter(
                (row) =>
                  row.variantSku && !duplicateSkus.includes(row.variantSku)
              ).length,
              invalidRows: parsedRows.filter(
                (row) =>
                  !row.variantSku || duplicateSkus.includes(row.variantSku)
              ).length,
              duplicateSkus,
            },
          };

          setImportData(importData);
          setCurrentPage(1); // Reset to first page

          // Select all valid rows by default
          const validRowIndices = new Set(
            importData.rows
              .map((row, index) =>
                row.variantSku &&
                !importData.stats.duplicateSkus.includes(row.variantSku)
                  ? index
                  : -1
              )
              .filter((index) => index !== -1)
          );
          setSelectedRows(validRowIndices);

          toast({
            title: "File Parsed Successfully",
            description: `Found ${importData.stats.totalRows} products from Shopify`,
          });
        } catch (error: any) {
          console.error("Error parsing file:", error);
          toast({
            title: "Error Parsing File",
            description: error.message || "Failed to parse Shopify export file",
            variant: "destructive",
          });
        }
      };

      reader.onerror = (error) => {
        console.error("File reader error:", error);
        toast({
          title: "File Read Error",
          description: "Failed to read the file",
          variant: "destructive",
        });
      };

      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        console.log("Starting to read CSV file as text");
        reader.readAsText(file);
      } else {
        console.log("Starting to read Excel file as ArrayBuffer");
        reader.readAsArrayBuffer(file);
      }
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      console.log("Drop event triggered");
      const files = Array.from(e.dataTransfer.files);
      console.log("Files dropped:", files);

      const excelFile = files.find(
        (file) =>
          file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type === "application/vnd.ms-excel" ||
          file.type === "text/csv" ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".csv")
      );

      if (excelFile) {
        console.log("Valid Excel file found:", excelFile.name);
        toast({
          title: "File Detected",
          description: `Processing ${excelFile.name}...`,
        });
        handleFileUpload(excelFile);
      } else {
        console.log("No valid Excel file found");
        toast({
          title: "Invalid File Type",
          description:
            "Please upload an Excel file (.xlsx, .xls) or CSV file (.csv)",
          variant: "destructive",
        });
      }
    },
    [handleFileUpload, toast]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    console.log("Drag enter event triggered");
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const selectAllValid = () => {
    if (!importData) return;
    const validRowIndices = new Set(
      importData.rows
        .map((row, index) =>
          row.variantSku &&
          !importData.stats.duplicateSkus.includes(row.variantSku)
            ? index
            : -1
        )
        .filter((index) => index !== -1)
    );
    setSelectedRows(validRowIndices);
  };

  const selectNone = () => {
    setSelectedRows(new Set());
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleImport = async () => {
    if (!importData || selectedRows.size === 0) return;

    // Debug logging
    console.log("Import Debug Info:", {
      inventoryCount,
      inventoryLimit,
      selectedRowsSize: selectedRows.size,
      remainingSlots,
      wouldExceed: inventoryCount + selectedRows.size > inventoryLimit,
    });

    // Check if already at or over limit
    if (inventoryLimit !== -1 && inventoryCount >= inventoryLimit) {
      console.log("BLOCKING: Already at or over limit");
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
      console.log("BLOCKING: Import would exceed limit");
      setShowLimitExceededModal(true);
      return;
    }

    console.log("PROCEEDING: Import allowed");

    setIsImporting(true);
    try {
      const selectedData = Array.from(selectedRows).map(
        (index) => importData.rows[index]
      );

      // Import each selected item to inventory
      for (const item of selectedData) {
        try {
          // Extract sizes and colors from options
          const sizes: string[] = [];
          const colors: string[] = [];

          if (item.option1Name?.toLowerCase().includes("size")) {
            sizes.push(item.option1Value);
          } else if (item.option1Name?.toLowerCase().includes("color")) {
            colors.push(item.option1Value);
          }

          if (item.option2Name?.toLowerCase().includes("size")) {
            sizes.push(item.option2Value);
          } else if (item.option2Name?.toLowerCase().includes("color")) {
            colors.push(item.option2Value);
          }

          if (item.option3Name?.toLowerCase().includes("size")) {
            sizes.push(item.option3Value);
          } else if (item.option3Name?.toLowerCase().includes("color")) {
            colors.push(item.option3Value);
          }

          // Use Google Shopping data as fallback
          if (item.googleShoppingSize) {
            sizes.push(item.googleShoppingSize);
          }
          if (item.googleShoppingColor) {
            colors.push(item.googleShoppingColor);
          }

          // Create inventory item
          const inventoryItem = {
            productName:
              item.title || `Imported from Shopify - ${item.variantSku}`,
            baseSku: item.variantSku,
            category: item.productType || "Imported from Shopify",
            supplier: item.vendor || "Shopify Import",
            unitCost: item.costPerItem || 0,
            sellingPrice: item.variantPrice,
            currentStock: item.variantInventoryQuantity,
            reorderLevel: 10, // Default reorder level
            description:
              item.bodyHtml?.replace(/<[^>]*>/g, "") ||
              `Imported from Shopify - ${item.handle}`,
            location: "Imported",
            sizes: sizes.filter(Boolean),
            colors: colors.filter(Boolean),
          };

          // Use the inventory API service
          await inventoryAPI.create(inventoryItem);
        } catch (itemError) {
          console.error(`Error importing item ${item.variantSku}:`, itemError);
          // Continue with other items even if one fails
        }
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${selectedRows.size} products from Shopify`,
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
    // Create and download Shopify template
    const templateData = [
      [
        "Handle",
        "Title",
        "Body (HTML)",
        "Vendor",
        "Product Type",
        "Tags",
        "Published",
        "Option1 Name",
        "Option1 Value",
        "Option2 Name",
        "Option2 Value",
        "Option3 Name",
        "Option3 Value",
        "Variant SKU",
        "Variant Grams",
        "Variant Inventory Quantity",
        "Variant Price",
        "Variant Compare At Price",
        "Variant Barcode",
        "Image Src",
        "Image Alt Text",
        "SEO Title",
        "SEO Description",
        "Google Shopping / Google Product Category",
        "Google Shopping / Gender",
        "Google Shopping / Age Group",
        "Google Shopping / Color (Product)",
        "Google Shopping / Size (Product)",
        "Variant Weight Unit",
        "Cost per item",
        "Status",
      ],
      [
        "sample-product",
        "Sample Product",
        "This is a sample product description",
        "Sample Vendor",
        "Sample Type",
        "sample, product, test",
        "TRUE",
        "Size",
        "Large",
        "Color",
        "Red",
        "",
        "",
        "SAMPLE-SKU-001",
        "500",
        "100",
        "29.99",
        "39.99",
        "1234567890123",
        "https://example.com/image.jpg",
        "Sample product image",
        "Sample Product - SEO Title",
        "Sample product SEO description",
        "Apparel & Accessories > Clothing",
        "unisex",
        "adult",
        "Red",
        "Large",
        "kg",
        "15.00",
        "active",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shopify Template");
    XLSX.writeFile(wb, "shopify_import_template.xlsx");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-green-600" />
            Shopify Import
          </DialogTitle>
        </DialogHeader>

        {!importData ? (
          // File Upload
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Upload your Shopify product export file to import products into
                your inventory
              </p>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="mb-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your Shopify export file here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse files
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="hidden"
                id="shopify-file-upload"
              />
              <Label
                htmlFor="shopify-file-upload"
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Choose File
              </Label>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Supported File Types:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Excel files (.xlsx, .xls)</li>
                <li>• CSV files (.csv)</li>
                <li>• Shopify product export files</li>
              </ul>
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
                      <p className="text-sm text-gray-600">Total Products</p>
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
                      <p className="text-sm text-gray-600">Valid Products</p>
                      <p className="text-2xl font-bold text-green-600">
                        {
                          importData.rows.filter(
                            (row) =>
                              row.variantSku &&
                              !importData.stats.duplicateSkus.includes(
                                row.variantSku
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
                      <p className="text-sm text-gray-600">Invalid Products</p>
                      <p className="text-2xl font-bold text-red-600">
                        {
                          importData.rows.filter(
                            (row) =>
                              !row.variantSku ||
                              importData.stats.duplicateSkus.includes(
                                row.variantSku
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
                        row.variantSku &&
                        !importData.stats.duplicateSkus.includes(row.variantSku)
                    ).length
                  }{" "}
                  valid products selected
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* Limit Status */}
                {inventoryLimit !== -1 && (
                  <div className="text-sm">
                    <span className="text-gray-600">Current: </span>
                    <span
                      className={`font-medium ${
                        remainingSlots <= 0
                          ? "text-red-600"
                          : remainingSlots <= 10
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {inventoryCount} / {inventoryLimit}
                    </span>
                    <span className="text-gray-500 ml-1">
                      ({remainingSlots} remaining)
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImportData(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Upload New File
              </Button>
            </div>

            {/* Limit Warning */}
            {inventoryLimit !== -1 &&
              remainingSlots <= 10 &&
              remainingSlots > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Approaching Limit
                      </p>
                      <p className="text-sm text-yellow-700">
                        You have {remainingSlots} slots remaining. Consider
                        upgrading your plan for unlimited inventory.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Data Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">
                        <Checkbox
                          checked={
                            selectedRows.size ===
                            importData.rows.filter(
                              (row) =>
                                row.variantSku &&
                                !importData.stats.duplicateSkus.includes(
                                  row.variantSku
                                )
                            ).length
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectAllValid();
                            } else {
                              selectNone();
                            }
                          }}
                        />
                      </th>
                      <th className="text-left p-2">Product Title</th>
                      <th className="text-left p-2">Vendor</th>
                      <th className="text-left p-2">Variant SKU</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Stock</th>
                      <th className="text-left p-2">Product Type</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageRows.map((row, index) => {
                      const globalIndex = currentPageIndices[index];
                      const isValid =
                        row.variantSku &&
                        !importData.stats.duplicateSkus.includes(
                          row.variantSku
                        );
                      const isSelected = selectedRows.has(globalIndex);

                      return (
                        <tr
                          key={globalIndex}
                          className={`border-t hover:bg-gray-50 ${
                            !isValid ? "bg-red-50" : ""
                          }`}
                        >
                          <td className="p-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleRowSelection(globalIndex)
                              }
                              disabled={!isValid}
                            />
                          </td>
                          <td className="p-2">
                            <div className="max-w-xs">
                              <p className="font-medium truncate">
                                {row.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {row.handle}
                              </p>
                            </div>
                          </td>
                          <td className="p-2">{row.vendor}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <span className={isValid ? "" : "text-red-600"}>
                                {row.variantSku || "No SKU"}
                              </span>
                              {importData.stats.duplicateSkus.includes(
                                row.variantSku
                              ) && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Duplicate
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            ${row.variantPrice.toFixed(2)}
                          </td>
                          <td className="p-2">
                            {row.variantInventoryQuantity}
                          </td>
                          <td className="p-2">{row.productType}</td>
                          <td className="p-2">
                            <Badge
                              variant={
                                row.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {row.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, importData.rows.length)} of{" "}
                    {importData.rows.length} products
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Import Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={selectedRows.size === 0 || isImporting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Import {selectedRows.size} Products
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
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

export default ShopifyImportModal;
