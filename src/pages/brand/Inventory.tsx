import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Box,
  RefreshCw,
  CheckCircle,
  Info,
} from "lucide-react";
import { inventoryAPI, bostaImportAPI } from "@/services/api";
import * as XLSX from "xlsx";
import { useAuth } from "@/contexts/AuthContext";
import { useUsageTrackingFallback } from "@/hooks/useUsageTrackingFallback";
import { useInventoryUsage } from "@/hooks/useInventoryUsage";
import { useBackgroundSync } from "@/hooks/useBackgroundSync";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { UpgradePromptModal } from "@/components/UpgradePromptModal";
import { useLanguage } from "@/contexts/LanguageContext";
import TagInput from "@/components/ui/TagInput";
import BulkImportModal from "@/components/BulkImportModal";

interface InventoryItem {
  id: string;
  productName: string;
  baseSku: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  description: string;
  sizes: string[];
  colors: string[];
  createdAt: string;
  updatedAt: string;
}

// Bosta Import Interfaces
interface BostaRow {
  trackingNumber: string;
  deliveryState: string;
  codAmount: number;
  sku?: string;
  businessReference?: string;
  description?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  city?: string;
  createdAt?: string;
}

interface BostaStats {
  totalOrders: number;
  expectedCash: number;
  delivered: number;
  returned: number;
  returnRate: number;
  deliveryRate: number;
  unknownSkus: string[];
}

interface BostaImportData {
  rows: BostaRow[];
  stats: BostaStats;
}

const InventoryPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription } = useSubscription();

  // Usage tracking with emergency fallback to prevent auth issues
  const {
    getUsage,
    canAddResource,
    isLoading: usageLoading,
    syncUsage,
  } = useUsageTrackingFallback(user?.brandId || ""); // Using fallback temporarily

  // Use the new inventory usage hook for accurate counting
  const { currentCount: inventoryCount } = useInventoryUsage();

  // Check if at limit
  const isAtLimit = inventoryCount >= (getUsage("inventory")?.limit || 100);

  // Disable background sync temporarily to fix logout issue
  // useBackgroundSync();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeResourceType, setUpgradeResourceType] = useState("");
  const [showImportTypeModal, setShowImportTypeModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showNormalImportModal, setShowNormalImportModal] = useState(false);
  const [showBostaImportModal, setShowBostaImportModal] = useState(false);
  const [showShopifyImportModal, setShowShopifyImportModal] = useState(false);
  const [importType, setImportType] = useState<"normal" | "bosta" | "shopify">(
    "normal"
  );
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Bosta import specific state
  const [showBostaConfirmation, setShowBostaConfirmation] = useState(false);
  const [bostaImportData, setBostaImportData] =
    useState<BostaImportData | null>(null);
  const [addMissingSkus, setAddMissingSkus] = useState(false);
  const [createRevenue, setCreateRevenue] = useState(true);
  const [isProcessingBosta, setIsProcessingBosta] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    productName: "",
    baseSku: "",
    category: "",
    currentStock: "",
    reorderLevel: "",
    unitCost: "",
    sellingPrice: "",
    supplier: "",
    location: "",
    description: "",
    sizes: [] as string[],
    colors: [] as string[],
  });

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filterCategory,
    filterSupplier,
    filterLocation,
    startDate,
    endDate,
  ]);

  // Background sync will handle usage accuracy automatically

  // Fetch inventory data
  const {
    data: inventoryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "inventory",
      user?.brandId,
      searchTerm,
      filterCategory,
      filterSupplier,
      filterLocation,
      startDate,
      endDate,
    ],
    queryFn: () => {
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterCategory !== "all") filters.category = filterCategory;
      if (filterSupplier !== "all") filters.supplier = filterSupplier;
      if (filterLocation !== "all") filters.location = filterLocation;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      filters.limit = 10000; // Get all data for client-side pagination
      filters.sortBy = "createdAt";
      filters.sortOrder = "desc"; // Newest first
      return inventoryAPI.getAll(filters);
    },
    enabled: !!user?.brandId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Reduce retries
  });

  // Process data
  const allInventoryItems = useMemo(() => {
    const inventoryArray =
      inventoryData?.inventory || inventoryData?.data || [];
    if (!Array.isArray(inventoryArray)) return [];

    // Sort by creation date (newest first) as fallback
    return inventoryArray.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [inventoryData]);

  const inventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allInventoryItems.slice(startIndex, endIndex);
  }, [allInventoryItems, currentPage, itemsPerPage]);

  // Calculate statistics
  const inventoryStats = useMemo(() => {
    const totalItems = allInventoryItems.length;
    const totalValue = allInventoryItems.reduce((sum, item) => {
      return sum + (item.currentStock || 0) * (item.sellingPrice || 0);
    }, 0);
    const lowStockItems = allInventoryItems.filter((item) => {
      const currentStock = item.currentStock || 0;
      const reorderLevel = item.reorderLevel || 0;
      return currentStock <= reorderLevel && currentStock > 0;
    }).length;
    const outOfStockItems = allInventoryItems.filter((item) => {
      return (item.currentStock || 0) === 0;
    }).length;
    const inventoryCost = allInventoryItems.reduce((sum, item) => {
      return sum + (item.unitCost || 0) * (item.currentStock || 0);
    }, 0);

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      inventoryCost,
    };
  }, [allInventoryItems]);

  // Simple, reliable mutations
  const createInventoryMutation = useMutation({
    mutationFn: async (data: any) => {
      // Check limit before creating
      const limitCheck = await canAddResource("inventory");
      if (!limitCheck.canAdd) {
        throw new Error("Inventory limit reached. Please upgrade your plan.");
      }
      return inventoryAPI.create(data);
    },
    onSuccess: () => {
      // Invalidate both inventory and usage queries
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["usage", user?.brandId] });
      // Force sync usage after successful creation (but delay more to prevent API spam)
      setTimeout(() => {
        syncUsage("inventory");
      }, 5000);
      toast({
        title: "Success",
        description: "Item added successfully",
      });
      setShowAddItemModal(false);
      resetForm();
    },
    onError: (error: any) => {
      if (
        error.message?.includes("limit reached") ||
        error.message?.includes("Inventory limit")
      ) {
        setUpgradeResourceType("inventory");
        setShowUpgradeModal(true);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to save item",
          variant: "destructive",
        });
      }
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["usage", user?.brandId] });
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      setShowEditItemModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: (id: string) => inventoryAPI.delete(id),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["usage", user?.brandId] });
      // Force sync usage after successful deletion (but delay more to prevent API spam)
      setTimeout(() => {
        syncUsage("inventory");
      }, 5000);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteInventoryMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Use Promise.allSettled to handle partial failures gracefully
      const deletePromises = ids.map((id) => inventoryAPI.delete(id));
      const results = await Promise.allSettled(deletePromises);

      // Check if any deletions failed
      const failures = results.filter((result) => result.status === "rejected");
      if (failures.length > 0) {
        throw new Error(`${failures.length} items failed to delete`);
      }

      return results.length;
    },
    onSuccess: (deletedCount) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["usage", user?.brandId] });
      // Force sync usage after successful bulk deletion (but delay more to prevent API spam)
      setTimeout(() => {
        syncUsage("inventory");
      }, 5000);
      setSelectedItems([]);
      setShowBulkDeleteModal(false);
      toast({
        title: "Success",
        description: `${deletedCount} items deleted successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete items",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const resetForm = () => {
    setFormData({
      productName: "",
      baseSku: "",
      category: "",
      currentStock: "",
      reorderLevel: "",
      unitCost: "",
      sellingPrice: "",
      supplier: "",
      location: "",
      description: "",
      sizes: [],
      colors: [],
    });
    setSelectedItem(null);
  };

  // Check if user can add inventory items
  const handleAddItem = async () => {
    if (!user?.brandId) return;

    try {
      const limitCheck = await canAddResource("inventory");

      if (!limitCheck.canAdd) {
        setUpgradeResourceType("inventory");
        setShowUpgradeModal(true);
        return;
      }

      setShowAddItemModal(true);
    } catch (error) {
      console.error("Error checking inventory limit:", error);
      // If limit check fails, show upgrade modal to be safe
      setUpgradeResourceType("inventory");
      setShowUpgradeModal(true);
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const submitData = {
          productName: formData.productName,
          baseSku: formData.baseSku,
          category: formData.category,
          currentStock: parseInt(formData.currentStock) || 0,
          reorderLevel: parseInt(formData.reorderLevel) || 0,
          unitCost: parseFloat(formData.unitCost) || 0,
          sellingPrice: parseFloat(formData.sellingPrice) || 0,
          supplier: formData.supplier,
          location: formData.location,
          description: formData.description,
          sizes: formData.sizes,
          colors: formData.colors,
        };

        if (selectedItem) {
          updateInventoryMutation.mutate({
            id: selectedItem.id,
            data: submitData,
          });
        } else {
          createInventoryMutation.mutate(submitData);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Please check your input data",
          variant: "destructive",
        });
      }
    },
    [
      formData,
      selectedItem,
      createInventoryMutation,
      updateInventoryMutation,
      toast,
    ]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("Are you sure you want to delete this item?")) return;
      deleteInventoryMutation.mutate(id);
    },
    [deleteInventoryMutation]
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedItems.length === 0) return;
    // No need for confirm() here since we have a modal for confirmation
    bulkDeleteInventoryMutation.mutate(selectedItems);
  }, [selectedItems, bulkDeleteInventoryMutation]);

  const handleImportClick = () => {
    setShowBulkImportModal(true);
  };

  const handleImportTypeSelect = (type: "normal" | "bosta" | "shopify") => {
    setImportType(type);
    setShowImportTypeModal(false);

    if (type === "normal") {
      setShowNormalImportModal(true);
    } else if (type === "bosta") {
      setShowBostaImportModal(true);
    } else if (type === "shopify") {
      setShowShopifyImportModal(true);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      // Validate file type based on import type
      const validExtensions =
        importType === "shopify" ? [".csv"] : [".xlsx", ".xls", ".csv"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (validExtensions.includes(fileExtension)) {
        setImportFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: `Please select a ${validExtensions.join(", ")} file`,
          variant: "destructive",
        });
      }
    }
  };

  const parseBostaFile = async (file: File): Promise<BostaImportData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          console.log("File reader loaded, starting XLSX parsing...");
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          console.log("Sheet name:", sheetName);
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log("Parsed JSON data:", jsonData.length, "rows");

          if (jsonData.length < 2) {
            throw new Error("File appears to be empty or has no data rows");
          }

          const headers = (jsonData[0] as string[]).map((h) => h.trim());
          console.log("Headers found:", headers);
          const rows: BostaRow[] = [];

          // Find required column indices
          const trackingNumberCol = headers.findIndex((h) =>
            h.toLowerCase().includes("tracking number")
          );
          const deliveryStateCol = headers.findIndex((h) =>
            h.toLowerCase().includes("delivery state")
          );
          const codAmountCol = headers.findIndex((h) =>
            h.toLowerCase().includes("cod amount")
          );

          console.log("Column indices:", {
            trackingNumber: trackingNumberCol,
            deliveryState: deliveryStateCol,
            codAmount: codAmountCol,
          });

          if (
            trackingNumberCol === -1 ||
            deliveryStateCol === -1 ||
            codAmountCol === -1
          ) {
            throw new Error(
              "Required columns not found: Tracking Number, Delivery State, COD Amount"
            );
          }

          // Find optional column indices
          const skuCol = headers.findIndex((h) =>
            h.toLowerCase().includes("sku")
          );
          const businessRefCol = headers.findIndex((h) =>
            h.toLowerCase().includes("business reference")
          );
          const descriptionCol = headers.findIndex((h) =>
            h.toLowerCase().includes("description")
          );
          const customerNameCol = headers.findIndex((h) =>
            h.toLowerCase().includes("customer name")
          );
          const customerPhoneCol = headers.findIndex((h) =>
            h.toLowerCase().includes("customer phone")
          );
          const customerAddressCol = headers.findIndex((h) =>
            h.toLowerCase().includes("customer address")
          );
          const cityCol = headers.findIndex((h) =>
            h.toLowerCase().includes("city")
          );
          const createdAtCol = headers.findIndex((h) =>
            h.toLowerCase().includes("created at")
          );

          // Process rows
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (!row || row.length === 0) continue;

            const trackingNumber = row[trackingNumberCol]?.toString().trim();
            const deliveryState = row[deliveryStateCol]?.toString().trim();
            const codAmount = parseFloat(row[codAmountCol]) || 0;

            if (!trackingNumber || !deliveryState) continue;

            const bostaRow: BostaRow = {
              trackingNumber,
              deliveryState,
              codAmount,
            };

            // Add optional fields if they exist
            if (skuCol !== -1 && row[skuCol]) {
              bostaRow.sku = row[skuCol]?.toString().trim();
            }
            if (businessRefCol !== -1 && row[businessRefCol]) {
              bostaRow.businessReference = row[businessRefCol]
                ?.toString()
                .trim();
            }
            if (descriptionCol !== -1 && row[descriptionCol]) {
              bostaRow.description = row[descriptionCol]?.toString().trim();
            }
            if (customerNameCol !== -1 && row[customerNameCol]) {
              bostaRow.customerName = row[customerNameCol]?.toString().trim();
            }
            if (customerPhoneCol !== -1 && row[customerPhoneCol]) {
              bostaRow.customerPhone = row[customerPhoneCol]?.toString().trim();
            }
            if (customerAddressCol !== -1 && row[customerAddressCol]) {
              bostaRow.customerAddress = row[customerAddressCol]
                ?.toString()
                .trim();
            }
            if (cityCol !== -1 && row[cityCol]) {
              bostaRow.city = row[cityCol]?.toString().trim();
            }
            if (createdAtCol !== -1 && row[createdAtCol]) {
              bostaRow.createdAt = row[createdAtCol]?.toString().trim();
            }

            rows.push(bostaRow);
          }

          console.log("Processed rows:", rows.length);

          // Calculate stats
          const totalOrders = rows.length;
          const expectedCash = rows.reduce((sum, r) => sum + r.codAmount, 0);
          const delivered = rows.filter((r) =>
            r.deliveryState.toLowerCase().includes("delivered")
          ).length;
          const returned = rows.filter((r) =>
            r.deliveryState.toLowerCase().includes("returned")
          ).length;
          const eligibleBase = delivered + returned; // For rate calculations
          const returnRate =
            eligibleBase > 0 ? (returned / eligibleBase) * 100 : 0;
          const deliveryRate =
            eligibleBase > 0 ? (delivered / eligibleBase) * 100 : 0;

          // Get existing inventory to check for unknown SKUs
          const inventory = await inventoryAPI.getAll();
          const existingSkus = new Set(
            inventory.map((item) => item.baseSku.toLowerCase())
          );
          console.log("Existing SKUs:", existingSkus);

          const unknownSkus = Array.from(
            new Set(
              rows
                .map((r) => {
                  const sku = r.sku || r.businessReference || r.description;
                  return sku ? sku.toLowerCase().trim() : "";
                })
                .filter((sku) => sku && !existingSkus.has(sku))
            )
          );

          const stats: BostaStats = {
            totalOrders,
            expectedCash,
            delivered,
            returned,
            returnRate,
            deliveryRate,
            unknownSkus,
          };

          console.log("Final stats:", stats);
          console.log("Processed rows:", rows.length);
          resolve({ rows, stats });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsBinaryString(file);
    });
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    // Check inventory limit before import
    try {
      const limitCheck = await canAddResource("inventory");

      if (!limitCheck.canAdd) {
        toast({
          title: "Limit Reached",
          description: `You have reached your limit of ${limitCheck.limit} products. Please upgrade your plan to add more products.`,
          variant: "destructive",
        });
        setUpgradeResourceType("inventory");
        setShowUpgradeModal(true);
        return;
      }
    } catch (error) {
      console.error("Error checking inventory limit:", error);
      // If limit check fails, show upgrade modal to be safe
      setUpgradeResourceType("inventory");
      setShowUpgradeModal(true);
      return;
    }

    setIsImporting(true);
    try {
      if (importType === "normal") {
        // Handle normal Excel/CSV import
        const formData = new FormData();
        formData.append("file", importFile);

        const response = await fetch(`/api/inventory/${user?.brandId}/import`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Import failed");
        }

        const result = await response.json();
        toast({
          title: "Success",
          description: `Successfully imported ${result.count} items`,
        });

        // Refresh inventory data
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        setShowNormalImportModal(false);
        setImportFile(null);
      } else if (importType === "bosta") {
        // Handle Bosta import - parse file and show validation
        try {
          console.log("Starting Bosta file parsing...", importFile);
          const data = await parseBostaFile(importFile);
          console.log("Bosta file parsed successfully:", data);
          setBostaImportData(data);
          setShowBostaImportModal(false);
          setShowBostaConfirmation(true);
          console.log("Bosta confirmation modal should be showing now");
        } catch (error: any) {
          console.error("Bosta import error:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to parse Bosta file",
            variant: "destructive",
          });
        }
      } else if (importType === "shopify") {
        // Handle Shopify import
        toast({
          title: "Info",
          description: "Shopify import functionality will be available soon",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: "Failed to import items",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const processBostaImport = async () => {
    if (!bostaImportData) return;

    setIsProcessingBosta(true);
    try {
      const brandId = user?.brandId;
      if (!brandId) throw new Error("Brand ID not found");

      // Check for duplicates first
      const duplicateCheck = await bostaImportAPI.checkDuplicates(
        brandId,
        bostaImportData.rows
      );

      if (duplicateCheck.duplicateCount > 0) {
        toast({
          title: "Warning",
          description: `${duplicateCheck.duplicateCount} duplicate orders found. Please review.`,
          variant: "destructive",
        });
        setIsProcessingBosta(false);
        return;
      }

      // Add missing SKUs if selected
      if (addMissingSkus && bostaImportData.stats.unknownSkus.length > 0) {
        // Get actual inventory count from API
        const inventoryResponse = await inventoryAPI.getAll();
        const actualInventory =
          inventoryResponse.inventory || inventoryResponse || [];
        const currentInventoryCount = Array.isArray(actualInventory)
          ? actualInventory.length
          : 0;

        // Get inventory limit from subscription
        const inventoryUsage = getUsage("inventory");
        const inventoryLimit = inventoryUsage?.limit || 100; // Default to 100 if not set
        const skusToAdd = bostaImportData.stats.unknownSkus.length;

        console.log("Inventory limit check:", {
          currentInventoryCount,
          inventoryLimit,
          skusToAdd,
          wouldExceed: currentInventoryCount + skusToAdd > inventoryLimit,
        });

        // Check if already at or over limit
        if (currentInventoryCount >= inventoryLimit) {
          toast({
            title: "Limit Reached",
            description: `You have reached your limit of ${inventoryLimit} products. Please upgrade your plan to add more products.`,
            variant: "destructive",
          });
          setIsProcessingBosta(false);
          return;
        }

        // Check if adding SKUs would exceed limit
        if (currentInventoryCount + skusToAdd > inventoryLimit) {
          // Show limit exceeded modal (we'll add this modal)
          toast({
            title: "Limit Exceeded",
            description: `Adding ${skusToAdd} SKUs would exceed your limit. You can only add ${Math.max(
              0,
              inventoryLimit - currentInventoryCount
            )} more products.`,
            variant: "destructive",
          });
          setIsProcessingBosta(false);
          return;
        }

        // Proceed with adding SKUs
        for (const sku of bostaImportData.stats.unknownSkus) {
          await inventoryAPI.create({
            productName: `Imported from Bosta - ${sku}`,
            baseSku: sku,
            category: "Imported",
            supplier: "Bosta Import",
            unitCost: 0,
            sellingPrice: 0,
            currentStock: 0,
            reorderLevel: 10,
            description: "Automatically added from Bosta import",
          });
        }
        toast({
          title: "Success",
          description: `Added ${bostaImportData.stats.unknownSkus.length} new SKUs to inventory`,
        });
      }

      // Create the import record in the database
      const importRecord = await bostaImportAPI.createImport(brandId, {
        fileName: "Bosta Import",
        totalOrders: bostaImportData.stats.totalOrders,
        expectedCash: bostaImportData.stats.expectedCash,
        delivered: bostaImportData.stats.delivered,
        returned: bostaImportData.stats.returned,
        returnRate: bostaImportData.stats.returnRate,
        deliveryRate: bostaImportData.stats.deliveryRate,
        shipments: bostaImportData.rows,
      });

      toast({
        title: "Success",
        description: `Successfully imported ${bostaImportData.stats.totalOrders} Bosta orders`,
      });

      // Refresh inventory data
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowBostaConfirmation(false);
      setBostaImportData(null);
      setAddMissingSkus(false);
      setCreateRevenue(true);
    } catch (error) {
      console.error("Bosta import error:", error);
      toast({
        title: "Error",
        description: "Failed to import Bosta data",
        variant: "destructive",
      });
    } finally {
      setIsProcessingBosta(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      productName: item.productName,
      baseSku: item.baseSku,
      category: item.category,
      currentStock: item.currentStock.toString(),
      reorderLevel: item.reorderLevel.toString(),
      unitCost: item.unitCost.toString(),
      sellingPrice: item.sellingPrice.toString(),
      supplier: item.supplier,
      location: item.location,
      description: item.description,
      sizes: item.sizes,
      colors: item.colors,
    });
    setShowEditItemModal(true);
  };

  const handleItemSelect = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedItems(inventory.map((item) => item.id));
      } else {
        setSelectedItems([]);
      }
    },
    [inventory]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
    }).format(amount);
  };

  const totalPages = Math.ceil(allInventoryItems.length / itemsPerPage);

  if (error) {
    return (
      <div
        className={`p-6 space-y-6 bg-gray-50 min-h-screen ${
          isRTL ? "rtl" : "ltr"
        }`}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{t("inventory.failedToLoad")}</p>
            <Button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["inventory"] });
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("inventory.retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 space-y-6 bg-gray-50 min-h-screen ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("inventory.title")}
          </h1>
          <p className="text-gray-600">{t("inventory.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleImportClick}
            disabled={isAtLimit}
            title={
              isAtLimit
                ? "You have reached your inventory limit. Please upgrade your plan."
                : ""
            }
          >
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            onClick={handleAddItem}
          >
            <Plus className="h-4 w-4" />
            {t("inventory.addItem")}
          </Button>
        </div>
      </div>

      {/* Usage Display */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {usageLoading ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading usage data...</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("inventory.metrics.totalItems")}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-blue-600">
                    {inventoryStats.totalItems}
                  </p>
                  {/* Show X/100 format only for starter plan (299 EGP) */}
                  {subscription?.plan?.priceMonthly === 299 && (
                    <span className="text-sm text-gray-500">
                      / {subscription.plan.features.limits.inventoryItems}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {subscription?.plan?.priceMonthly === 299 ? (
                    <span
                      className={`${
                        inventoryStats.totalItems >=
                        subscription.plan.features.limits.inventoryItems
                          ? "text-red-500"
                          : inventoryStats.totalItems >=
                            subscription.plan.features.limits.inventoryItems *
                              0.8
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {subscription.plan.features.limits.inventoryItems -
                        inventoryStats.totalItems}{" "}
                      remaining
                    </span>
                  ) : (
                    "In catalog"
                  )}
                </p>
              </div>
              <Box className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("inventory.metrics.totalValue")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(inventoryStats.totalValue)}
                </p>
                <p className="text-xs text-gray-500">Current inventory value</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inventory Cost</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(inventoryStats.inventoryCost)}
                </p>
                <p className="text-xs text-gray-500">Total cost basis</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("inventory.metrics.lowStock")}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {inventoryStats.lowStockItems}
                </p>
                <p className="text-xs text-gray-500">Items need reorder</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("inventory.metrics.outOfStock")}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {inventoryStats.outOfStockItems}
                </p>
                <p className="text-xs text-gray-500">Items unavailable</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Management
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                  setFilterSupplier("all");
                  setFilterLocation("all");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                {t("inventory.filters.clearFilters")}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("inventory.filters.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t("inventory.filters.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("inventory.filters.all")}
                  </SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder={t("inventory.filters.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("inventory.filters.all")}
                  </SelectItem>
                  <SelectItem value="supplier1">Supplier 1</SelectItem>
                  <SelectItem value="supplier2">Supplier 2</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger>
                  <SelectValue placeholder={t("inventory.filters.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("inventory.filters.all")}
                  </SelectItem>
                  <SelectItem value="warehouse1">Warehouse 1</SelectItem>
                  <SelectItem value="warehouse2">Warehouse 2</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="Created From"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                placeholder="Created To"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedItems.length} item(s) selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}

          {/* Inventory Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading inventory...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedItems.length === inventory.length &&
                          inventory.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>{t("inventory.table.productName")}</TableHead>
                    <TableHead>{t("inventory.table.sku")}</TableHead>
                    <TableHead>{t("inventory.table.category")}</TableHead>
                    <TableHead>{t("inventory.table.stock")}</TableHead>
                    <TableHead>{t("inventory.table.sellingPrice")}</TableHead>
                    <TableHead>{t("inventory.table.supplier")}</TableHead>
                    <TableHead>{t("inventory.table.location")}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) =>
                            handleItemSelect(item.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{item.baseSku}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{item.currentStock}</span>
                          {item.currentStock <= item.reorderLevel && (
                            <Badge variant="destructive" className="text-xs">
                              Low
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    {t("inventory.pagination.showing")}{" "}
                    {(currentPage - 1) * itemsPerPage + 1}{" "}
                    {t("inventory.pagination.to")}{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      allInventoryItems.length
                    )}{" "}
                    {t("inventory.pagination.of")} {allInventoryItems.length}{" "}
                    {t("inventory.pagination.items")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      {t("inventory.pagination.previous")}
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}
                      {totalPages > 5 && (
                        <>
                          <span className="px-2">...</span>
                          <Button
                            variant={
                              currentPage === totalPages ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      {t("inventory.pagination.next")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Item Modal */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("inventory.form.addTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">
                  {t("inventory.form.productName")} *
                </Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="baseSku">SKU *</Label>
                <Input
                  id="baseSku"
                  value={formData.baseSku}
                  onChange={(e) =>
                    setFormData({ ...formData, baseSku: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">{t("inventory.form.category")}</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="currentStock">
                  {t("inventory.form.currentStock")}
                </Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({ ...formData, currentStock: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, reorderLevel: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitCost">{t("inventory.form.unitCost")}</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) =>
                    setFormData({ ...formData, unitCost: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="sellingPrice">
                  {t("inventory.form.sellingPrice")}
                </Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">{t("inventory.form.supplier")}</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="location">{t("inventory.form.location")}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">
                {t("inventory.form.description")}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sizes">{t("inventory.form.sizes")}</Label>
                <TagInput
                  value={formData.sizes}
                  onChange={(sizes) => setFormData({ ...formData, sizes })}
                  placeholder={t("inventory.form.sizesPlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="colors">{t("inventory.form.colors")}</Label>
                <TagInput
                  value={formData.colors}
                  onChange={(colors) => setFormData({ ...formData, colors })}
                  placeholder={t("inventory.form.colorsPlaceholder")}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddItemModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createInventoryMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createInventoryMutation.isPending ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={showEditItemModal} onOpenChange={setShowEditItemModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("inventory.form.editTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-productName">
                  {t("inventory.form.productName")} *
                </Label>
                <Input
                  id="edit-productName"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-baseSku">SKU *</Label>
                <Input
                  id="edit-baseSku"
                  value={formData.baseSku}
                  onChange={(e) =>
                    setFormData({ ...formData, baseSku: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-category">
                  {t("inventory.form.category")}
                </Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-currentStock">
                  {t("inventory.form.currentStock")}
                </Label>
                <Input
                  id="edit-currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({ ...formData, currentStock: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-reorderLevel">Reorder Level</Label>
                <Input
                  id="edit-reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, reorderLevel: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-unitCost">
                  {t("inventory.form.unitCost")}
                </Label>
                <Input
                  id="edit-unitCost"
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) =>
                    setFormData({ ...formData, unitCost: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-sellingPrice">
                  {t("inventory.form.sellingPrice")}
                </Label>
                <Input
                  id="edit-sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-supplier">
                  {t("inventory.form.supplier")}
                </Label>
                <Input
                  id="edit-supplier"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-location">
                  {t("inventory.form.location")}
                </Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">
                {t("inventory.form.description")}
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-sizes">{t("inventory.form.sizes")}</Label>
                <TagInput
                  value={formData.sizes}
                  onChange={(sizes) => setFormData({ ...formData, sizes })}
                  placeholder={t("inventory.form.sizesPlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="edit-colors">
                  {t("inventory.form.colors")}
                </Label>
                <TagInput
                  value={formData.colors}
                  onChange={(colors) => setFormData({ ...formData, colors })}
                  placeholder={t("inventory.form.colorsPlaceholder")}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditItemModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateInventoryMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateInventoryMutation.isPending
                  ? "Updating..."
                  : "Update Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Modal */}
      <Dialog open={showBulkDeleteModal} onOpenChange={setShowBulkDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete {selectedItems.length} item(s)?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkDeleteInventoryMutation.isPending}
              >
                {bulkDeleteInventoryMutation.isPending
                  ? "Deleting..."
                  : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        resourceType={upgradeResourceType}
        onUpgrade={() => {
          // TODO: Redirect to upgrade page or handle upgrade flow
          console.log("Upgrade clicked");
          setShowUpgradeModal(false);
        }}
        currentPlan="starter"
        limit={getUsage("inventory")?.limit || 100}
        current={inventoryCount}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={showBulkImportModal}
        onOpenChange={setShowBulkImportModal}
        onImportSuccess={() => {
          // Refresh inventory data and reset to first page
          queryClient.invalidateQueries({ queryKey: ["inventory"] });
          setCurrentPage(1);
          toast({
            title: "Import Complete",
            description: "Imported items have been added to your inventory",
          });
        }}
        currentInventoryCount={allInventoryItems.length}
        inventoryLimit={getUsage("inventory")?.limit || 100}
      />

      {/* Import Type Selection Modal */}
      <Dialog open={showImportTypeModal} onOpenChange={setShowImportTypeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Inventory Items
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Choose your import method and upload your file
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Import Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Import Type</Label>
              <div className="grid grid-cols-1 gap-3">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    importType === "normal"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleImportTypeSelect("normal")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        Normal Import
                      </h4>
                      <p className="text-sm text-gray-600">
                        Import from Excel/CSV files with standard inventory
                        format
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          .xlsx, .xls, .csv
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Standard Format
                        </Badge>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        importType === "normal"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {importType === "normal" && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    importType === "bosta"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleImportTypeSelect("bosta")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Box className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        Bosta Import
                      </h4>
                      <p className="text-sm text-gray-600">
                        Import shipping data from Bosta with SKU validation and
                        order tracking
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          .xlsx, .xls
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          SKU Validation
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Order Tracking
                        </Badge>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        importType === "bosta"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {importType === "bosta" && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    importType === "shopify"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleImportTypeSelect("shopify")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        Shopify Import
                      </h4>
                      <p className="text-sm text-gray-600">
                        Import product data from Shopify with variant management
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          .csv
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Variants
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Coming Soon
                        </Badge>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        importType === "shopify"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {importType === "shopify" && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowImportTypeModal(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Normal Import Modal */}
      <Dialog
        open={showNormalImportModal}
        onOpenChange={setShowNormalImportModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Normal Import
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Upload an Excel or CSV file with your inventory data
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Upload File</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="normal-file-upload"
                />
                <label htmlFor="normal-file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload
                      className={`h-8 w-8 transition-colors ${
                        isDragOver ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium transition-colors ${
                          isDragOver ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {isDragOver
                          ? "Drop your file here"
                          : importFile
                          ? importFile.name
                          : "Click to upload or drag and drop"}
                      </p>
                      <p
                        className={`text-xs transition-colors ${
                          isDragOver ? "text-blue-700" : "text-gray-500"
                        }`}
                      >
                        Excel (.xlsx, .xls) or CSV files
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {importFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    File selected: {importFile.name} (
                    {(importFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportFile(null)}
                    className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Import Requirements */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-gray-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">
                    Normal Import Requirements:
                  </p>
                  <ul className="text-gray-700 space-y-1">
                    <li>
                      • Required columns: Product Name, Base SKU, Category,
                      Current Stock
                    </li>
                    <li>
                      • Optional columns: Unit Cost, Selling Price, Supplier,
                      Location, etc.
                    </li>
                    <li>• First row should contain column headers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNormalImportModal(false);
                  setImportFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importFile || isImporting || isAtLimit}
                className="bg-blue-600 hover:bg-blue-700 min-w-[100px]"
                title={
                  isAtLimit
                    ? "You have reached your inventory limit. Please upgrade your plan."
                    : ""
                }
              >
                {isImporting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Import"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bosta Import Modal */}
      <Dialog
        open={showBostaImportModal}
        onOpenChange={setShowBostaImportModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Bosta Import
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Import shipping data from Bosta with SKU validation and order
              tracking
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Upload File</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="bosta-file-upload"
                />
                <label htmlFor="bosta-file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload
                      className={`h-8 w-8 transition-colors ${
                        isDragOver ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium transition-colors ${
                          isDragOver ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {isDragOver
                          ? "Drop your file here"
                          : importFile
                          ? importFile.name
                          : "Click to upload or drag and drop"}
                      </p>
                      <p
                        className={`text-xs transition-colors ${
                          isDragOver ? "text-blue-700" : "text-gray-500"
                        }`}
                      >
                        Excel (.xlsx, .xls) files only
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {importFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    File selected: {importFile.name} (
                    {(importFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportFile(null)}
                    className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Import Requirements */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    Bosta Import Requirements:
                  </p>
                  <ul className="text-blue-800 space-y-1">
                    <li>
                      • Required columns: Tracking Number, Delivery State, COD
                      Amount
                    </li>
                    <li>
                      • Optional columns: SKU, Business Reference, Customer
                      Name, etc.
                    </li>
                    <li>
                      • SKUs will be validated against your existing inventory
                    </li>
                    <li>
                      • Missing SKUs can be automatically added to inventory
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Debug: Test confirmation modal
                  console.log("Testing confirmation modal...");
                  setBostaImportData({
                    rows: [
                      {
                        trackingNumber: "TEST123",
                        deliveryState: "Delivered",
                        codAmount: 100,
                        sku: "TEST-SKU",
                        customerName: "Test Customer",
                      },
                    ],
                    stats: {
                      totalOrders: 1,
                      expectedCash: 100,
                      delivered: 1,
                      returned: 0,
                      returnRate: 0,
                      deliveryRate: 100,
                      unknownSkus: [],
                    },
                  });
                  setShowBostaImportModal(false);
                  setShowBostaConfirmation(true);
                }}
                className="text-xs"
              >
                🧪 Test Modal
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBostaImportModal(false);
                    setImportFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!importFile || isImporting || isAtLimit}
                  className="bg-green-600 hover:bg-green-700 min-w-[100px]"
                  title={
                    isAtLimit
                      ? "You have reached your inventory limit. Please upgrade your plan."
                      : ""
                  }
                >
                  {isImporting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    "Import"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shopify Import Modal */}
      <Dialog
        open={showShopifyImportModal}
        onOpenChange={setShowShopifyImportModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Shopify Import
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Import product data from Shopify with variant management
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Coming Soon Message */}
            <div className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-600 mb-4">
                Shopify import functionality is currently under development.
              </p>
              <p className="text-sm text-gray-500">
                This feature will allow you to import product data from Shopify
                with variant management and inventory synchronization.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowShopifyImportModal(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bosta Import Confirmation Modal */}
      <Dialog
        open={showBostaConfirmation}
        onOpenChange={(open) => {
          console.log("Bosta confirmation modal open state changed:", open);
          setShowBostaConfirmation(open);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Confirm Bosta Import</DialogTitle>
            <p className="text-sm text-gray-600">
              Review the parsed data and choose your import options
            </p>
          </DialogHeader>

          {bostaImportData && (
            <div className="space-y-6">
              {/* File Validation Summary */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-2">
                      File Validation Complete
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-800">
                          <span className="font-medium">File:</span>{" "}
                          {importFile?.name}
                        </p>
                        <p className="text-blue-800">
                          <span className="font-medium">Size:</span>{" "}
                          {(importFile?.size
                            ? importFile.size / 1024
                            : 0
                          ).toFixed(1)}{" "}
                          KB
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-800">
                          <span className="font-medium">Rows Processed:</span>{" "}
                          {bostaImportData.rows.length}
                        </p>
                        <p className="text-blue-800">
                          <span className="font-medium">Status:</span>
                          <span className="ml-1 text-green-600 font-medium">
                            ✓ Valid
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Import Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {bostaImportData.stats.totalOrders}
                      </p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        EGP {bostaImportData.stats.expectedCash.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">Expected Cash</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {bostaImportData.stats.delivered}
                      </p>
                      <p className="text-sm text-gray-600">Delivered</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {bostaImportData.stats.returned}
                      </p>
                      <p className="text-sm text-gray-600">Returned</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Delivery Rate */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        {bostaImportData.stats.deliveryRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">Delivery Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-red-600">
                        {bostaImportData.stats.returnRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">Return Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Unknown SKUs Warning */}
              {bostaImportData.stats.unknownSkus.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-orange-900">
                          Unknown SKUs Found (
                          {bostaImportData.stats.unknownSkus.length})
                        </h4>
                        <p className="text-sm text-orange-800 mt-1">
                          The following SKUs were not found in your inventory:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {bostaImportData.stats.unknownSkus
                            .slice(0, 10)
                            .map((sku, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-orange-800"
                              >
                                {sku}
                              </Badge>
                            ))}
                          {bostaImportData.stats.unknownSkus.length > 10 && (
                            <Badge
                              variant="outline"
                              className="text-orange-800"
                            >
                              +{bostaImportData.stats.unknownSkus.length - 10}{" "}
                              more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Import Options */}
              <div className="space-y-4">
                <h4 className="font-medium">Import Options</h4>

                {bostaImportData.stats.unknownSkus.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="add-missing-skus"
                      checked={addMissingSkus}
                      onCheckedChange={(checked) =>
                        setAddMissingSkus(checked === true)
                      }
                    />
                    <Label htmlFor="add-missing-skus">
                      Automatically add missing SKUs to inventory
                    </Label>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-revenue"
                    checked={createRevenue}
                    onCheckedChange={(checked) =>
                      setCreateRevenue(checked === true)
                    }
                  />
                  <Label htmlFor="create-revenue">
                    Create revenue entries for delivered orders
                  </Label>
                </div>
              </div>

              {/* Data Preview and Validation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Data Preview & Validation</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Showing first 5 of {bostaImportData.rows.length} rows
                    </span>
                    {bostaImportData.rows.length > 5 && (
                      <Badge variant="outline">
                        +{bostaImportData.rows.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Tracking #</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[100px]">COD Amount</TableHead>
                        <TableHead className="w-[120px]">
                          SKU/Reference
                        </TableHead>
                        <TableHead className="w-[150px]">Customer</TableHead>
                        <TableHead className="w-[100px]">City</TableHead>
                        <TableHead className="w-[80px]">Validation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bostaImportData.rows.slice(0, 5).map((row, index) => {
                        const hasValidSku = row.sku || row.businessReference;
                        const isSkuInInventory =
                          hasValidSku &&
                          !bostaImportData.stats.unknownSkus.includes(
                            (
                              row.sku ||
                              row.businessReference ||
                              ""
                            ).toLowerCase()
                          );

                        return (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {row.trackingNumber}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  row.deliveryState
                                    .toLowerCase()
                                    .includes("delivered")
                                    ? "default"
                                    : row.deliveryState
                                        .toLowerCase()
                                        .includes("returned")
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {row.deliveryState}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              EGP {row.codAmount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {row.sku || row.businessReference || "-"}
                                </div>
                                {row.description && (
                                  <div className="text-xs text-gray-500 truncate max-w-[100px]">
                                    {row.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {row.customerName || "-"}
                                </div>
                                {row.customerPhone && (
                                  <div className="text-xs text-gray-500">
                                    {row.customerPhone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.city || "-"}
                            </TableCell>
                            <TableCell>
                              {hasValidSku ? (
                                isSkuInInventory ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    <span className="text-xs">Valid</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-orange-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span className="text-xs">New</span>
                                  </div>
                                )
                              ) : (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <span className="text-xs">No SKU</span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Validation Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {
                        bostaImportData.rows.filter((row) => {
                          const sku = row.sku || row.businessReference;
                          return (
                            sku &&
                            !bostaImportData.stats.unknownSkus.includes(
                              sku.toLowerCase()
                            )
                          );
                        }).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Valid SKUs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">
                      {bostaImportData.stats.unknownSkus.length}
                    </div>
                    <div className="text-sm text-gray-600">New SKUs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-600">
                      {
                        bostaImportData.rows.filter(
                          (row) => !row.sku && !row.businessReference
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">No SKU</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBostaConfirmation(false);
                    setShowBostaImportModal(true);
                  }}
                >
                  ← Back to Upload
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowBostaConfirmation(false);
                      setBostaImportData(null);
                      setAddMissingSkus(false);
                      setCreateRevenue(true);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={processBostaImport}
                    disabled={isProcessingBosta}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessingBosta ? "Processing..." : "Import Orders"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
