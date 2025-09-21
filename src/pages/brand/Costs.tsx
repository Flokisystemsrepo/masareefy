import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Tag,
  User,
  FileText,
  Upload,
  X,
  Settings,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { costsAPI, metricsAPI, categoriesAPI } from "@/services/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

interface Cost {
  id: string;
  name: string;
  amount: number;
  category: string;
  costType: "fixed" | "variable";
  date: string;
  vendor: string;
  receiptUrl?: string;
  receiptFile?: File;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface CostMetrics {
  totalCosts: number;
  monthlyCosts: number;
  costsByCategory: Array<{
    category: string;
    amount: number;
  }>;
}

interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const CostsPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [showEditCostModal, setShowEditCostModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] =
    useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [costToDelete, setCostToDelete] = useState<Cost | null>(null);
  const [selectedCost, setSelectedCost] = useState<Cost | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCostType, setSelectedCostType] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Data states
  const [costs, setCosts] = useState<Cost[]>([]);
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    costType: "variable" as "fixed" | "variable",
    date: "",
    vendor: "",
    receiptUrl: "",
  });

  // Category management
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Drag and drop
  const [isDragOver, setIsDragOver] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  // Load data when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    selectedCategory,
    selectedCostType,
    startDate,
    endDate,
    currentPage,
    itemsPerPage,
  ]);

  const loadData = async () => {
    try {
      setLoading(true);

      const filters = {
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
        category:
          selectedCategory && selectedCategory !== "all"
            ? selectedCategory
            : undefined,
        costType:
          selectedCostType && selectedCostType !== "all"
            ? selectedCostType
            : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      // Load costs and metrics in parallel
      const [costsResponse, metricsResponse] = await Promise.all([
        costsAPI.getAll(filters),
        metricsAPI.getCostMetrics(),
      ]);

      console.log("Costs API Response:", costsResponse);
      console.log("Metrics API Response:", metricsResponse);

      setCosts(costsResponse?.costs || []);
      setMetrics(metricsResponse || {});

      // Update pagination info
      if (costsResponse?.pagination) {
        setTotalPages(costsResponse.pagination.pages);
        setTotalItems(costsResponse.pagination.total);
      }
    } catch (error: any) {
      console.error("Error loading costs:", error);
      toast.error(error.message || t("cost.messages.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Load managed categories from API
      const managedCategories = await categoriesAPI.getAll("cost");

      // Load used categories (includes unmanaged ones from existing costs)
      const usedCategories = await categoriesAPI.getUsed("cost");

      // Combine both lists, avoiding duplicates
      const allCategories = [...managedCategories];
      usedCategories.forEach((usedCat) => {
        if (!allCategories.find((cat) => cat.name === usedCat.name)) {
          allCategories.push({
            id: `used-${usedCat.name}`,
            name: usedCat.name,
            color: usedCat.color,
            createdAt: new Date().toISOString(),
          });
        }
      });

      setCategories(allCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      // Fallback to default categories
      const defaultCategories: Category[] = [
        {
          id: "1",
          name: "Marketing",
          color: "bg-red-100 text-red-800",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Operations",
          color: "bg-orange-100 text-orange-800",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Technology",
          color: "bg-purple-100 text-purple-800",
          createdAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Office",
          color: "bg-blue-100 text-blue-800",
          createdAt: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Travel",
          color: "bg-green-100 text-green-800",
          createdAt: new Date().toISOString(),
        },
      ];
      setCategories(defaultCategories);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await categoriesAPI.create({
        name: newCategoryName.trim(),
        color: "bg-gray-100 text-gray-800",
        type: "cost",
      });

      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName("");
      toast.success(t("cost.messages.categoryAdded"));
    } catch (error: any) {
      toast.error(error.message || t("cost.messages.failedToAddCategory"));
    }
  };

  const updateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) return;

    try {
      const updatedCategory = await categoriesAPI.update(editingCategory.id, {
        name: newCategoryName.trim(),
      });

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id ? updatedCategory : cat
        )
      );
      setEditingCategory(null);
      setNewCategoryName("");
      toast.success(t("cost.messages.categoryUpdated"));
    } catch (error: any) {
      toast.error(error.message || t("cost.messages.failedToUpdateCategory"));
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm(t("cost.messages.categoryDeleteConfirm"))) return;

    try {
      await categoriesAPI.delete(categoryId);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast.success(t("cost.messages.categoryDeleted"));
    } catch (error: any) {
      toast.error(error.message || t("cost.messages.failedToDeleteCategory"));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      category: "",
      costType: "variable",
      date: "",
      vendor: "",
      receiptUrl: "",
    });
    setSelectedCost(null);
    setReceiptFile(null);
    setCustomCategoryInput("");
  };

  const openAddModal = () => {
    resetForm();
    setShowAddCostModal(true);
  };

  const openEditModal = (cost: Cost) => {
    setSelectedCost(cost);
    setFormData({
      name: cost.name,
      amount: cost.amount.toString(),
      category: cost.category,
      costType: cost.costType,
      date: cost.date.split("T")[0], // Convert ISO date to YYYY-MM-DD
      vendor: cost.vendor,
      receiptUrl: cost.receiptUrl || "",
    });
    setShowEditCostModal(true);
  };

  const closeModals = () => {
    setShowAddCostModal(false);
    setShowEditCostModal(false);
    setShowManageCategoriesModal(false);
    resetForm();
    setEditingCategory(null);
    setNewCategoryName("");
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setReceiptFile(file);
        toast.success(t("cost.messages.receiptUploaded"));
      } else {
        toast.error(t("cost.messages.invalidFileType"));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setReceiptFile(file);
        toast.success(t("cost.messages.receiptUploaded"));
      } else {
        toast.error(t("cost.messages.invalidFileType"));
      }
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const submitData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        costType: formData.costType,
        date: new Date(formData.date).toISOString(), // Convert to ISO-8601 format
        vendor: formData.vendor,
        receiptUrl: formData.receiptUrl,
      };

      if (showAddCostModal) {
        // Create new cost
        const result = await costsAPI.create(submitData);

        // Handle file upload if there's a receipt file
        if (receiptFile && result.id) {
          // TODO: Implement file upload to server
          // For now, we'll just show a message that file upload is not yet implemented
          console.log("File upload not yet implemented:", receiptFile);
        }

        toast.success(t("cost.messages.costCreated"));
      } else {
        // Update existing cost
        if (selectedCost) {
          const result = await costsAPI.update(selectedCost.id, submitData);

          // Handle file upload if there's a receipt file
          if (receiptFile) {
            // TODO: Implement file upload to server
            // For now, we'll just show a message that file upload is not yet implemented
            console.log("File upload not yet implemented:", receiptFile);
          }

          toast.success(t("cost.messages.costUpdated"));
        }
      }

      closeModals();
      loadData(); // Reload data
    } catch (error: any) {
      toast.error(error.message || t("cost.messages.failedToSaveCost"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (cost: Cost) => {
    setCostToDelete(cost);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!costToDelete) return;

    try {
      await costsAPI.delete(costToDelete.id);
      toast.success(t("cost.messages.costDeleted"));
      loadData(); // Reload data
    } catch (error: any) {
      toast.error(error.message || t("cost.messages.failedToDeleteCost"));
    } finally {
      setShowDeleteConfirmation(false);
      setCostToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Reset to first page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    if (filterType === "category") {
      setSelectedCategory(value);
    } else if (filterType === "costType") {
      setSelectedCostType(value);
    } else if (filterType === "startDate") {
      setStartDate(value);
    } else if (filterType === "endDate") {
      setEndDate(value);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div
      className={`p-6 space-y-6 bg-gray-50 min-h-screen ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("cost.title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("cost.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowManageCategoriesModal(true)}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            {t("cost.manageCategories")}
          </Button>
          <Button
            onClick={openAddModal}
            className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("cost.addCost")}
          </Button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("cost.metrics.totalCosts")}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {metrics ? formatCurrency(metrics.totalCosts) : "$0.00"}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("cost.metrics.monthlyCosts")}
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics ? formatCurrency(metrics.monthlyCosts) : "$0.00"}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("cost.metrics.totalEntries")}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {costs.length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filters Section */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {t("cost.filters.title")}
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {showFilters && (
                <div className="flex flex-wrap items-center gap-4">
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) =>
                      handleFilterChange("category", value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue
                        placeholder={t("cost.filters.allCategories")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("cost.filters.allCategories")}
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedCostType}
                    onValueChange={(value) =>
                      handleFilterChange("costType", value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue
                        placeholder={t("cost.filters.allCostTypes")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("cost.filters.allCostTypes")}
                      </SelectItem>
                      <SelectItem value="fixed">
                        {t("cost.filters.fixedCost")}
                      </SelectItem>
                      <SelectItem value="variable">
                        {t("cost.filters.variableCost")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    placeholder={t("cost.filters.startDate")}
                    className="w-48"
                  />

                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    placeholder={t("cost.filters.endDate")}
                    className="w-48"
                  />

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedCostType("");
                      setStartDate("");
                      setEndDate("");
                      setCurrentPage(1);
                    }}
                    className="text-gray-600"
                  >
                    {t("cost.filters.clearFilters")}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("cost.filters.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#106df9]"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {costs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("cost.table.noCosts")}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t("cost.table.noCostsDescription")}
                  </p>
                  <Button
                    onClick={openAddModal}
                    className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("cost.addCost")}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {costs.map((cost) => (
                      <motion.div
                        key={cost.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {cost.name}
                            </h3>
                            <div className="flex gap-2 mb-2">
                              <Badge className="bg-red-100 text-red-800">
                                {cost.category}
                              </Badge>
                              <Badge
                                className={
                                  cost.costType === "fixed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {cost.costType === "fixed"
                                  ? t("cost.table.fixed")
                                  : t("cost.table.variable")}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(cost)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(cost)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {t("cost.table.amount")}
                            </span>
                            <span className="font-semibold text-gray-900 text-lg">
                              {formatCurrency(cost.amount)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {t("cost.table.vendor")}
                            </span>
                            <span className="font-medium text-gray-900">
                              {cost.vendor}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {t("cost.table.date")}
                            </span>
                            <span className="text-gray-900">
                              {formatDate(cost.date)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {t("cost.table.created")}
                            </span>
                            <span className="text-gray-900">
                              {formatDate(cost.createdAt)}
                            </span>
                          </div>
                        </div>

                        {cost.receiptUrl && (
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <a
                              href={cost.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#106df9] hover:underline flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              {t("cost.table.viewReceipt")}
                            </a>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {t("cost.table.showing")}{" "}
                          {(currentPage - 1) * itemsPerPage + 1}{" "}
                          {t("cost.table.to")}{" "}
                          {Math.min(currentPage * itemsPerPage, totalItems)}{" "}
                          {t("cost.table.of")} {totalItems}{" "}
                          {t("cost.table.results")}
                        </span>
                        <Select
                          value={itemsPerPage.toString()}
                          onValueChange={(value) =>
                            handleItemsPerPageChange(parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-600">
                          {t("cost.table.perPage")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          {t("cost.table.previous")}
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              return (
                                <Button
                                  key={pageNum}
                                  variant={
                                    currentPage === pageNum
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  className={
                                    currentPage === pageNum
                                      ? "bg-[#106df9] text-white"
                                      : ""
                                  }
                                >
                                  {pageNum}
                                </Button>
                              );
                            }
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          {t("cost.table.next")}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      {(showAddCostModal || showEditCostModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {showAddCostModal
                  ? t("cost.form.addTitle")
                  : t("cost.form.editTitle")}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("cost.form.costName")}
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={t("cost.form.costNamePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("cost.form.amount")}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder={t("cost.form.amountPlaceholder")}
                    required
                  />
                </div>

                {/* Category Dropdown with Custom Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("cost.form.category")}
                  </label>
                  <div className="relative">
                    <div
                      className="flex items-center justify-between w-full p-3 border border-gray-300 rounded-md bg-white cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() =>
                        setCategoryDropdownOpen(!categoryDropdownOpen)
                      }
                    >
                      <span
                        className={
                          formData.category ? "text-gray-900" : "text-gray-500"
                        }
                      >
                        {formData.category ||
                          t("cost.form.categoryPlaceholder")}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          categoryDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {categoryDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        <div className="p-2 border-b border-gray-200">
                          <Input
                            placeholder={t(
                              "cost.form.categorySearchPlaceholder"
                            )}
                            value={customCategoryInput}
                            onChange={(e) =>
                              setCustomCategoryInput(e.target.value)
                            }
                            className="w-full"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (customCategoryInput.trim()) {
                                  setFormData({
                                    ...formData,
                                    category: customCategoryInput.trim(),
                                  });
                                  setCustomCategoryInput("");
                                  setCategoryDropdownOpen(false);
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="max-h-40 overflow-auto">
                          {categories
                            .filter((cat) =>
                              cat.name
                                .toLowerCase()
                                .includes(customCategoryInput.toLowerCase())
                            )
                            .map((category) => (
                              <div
                                key={category.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    category: category.name,
                                  });
                                  setCustomCategoryInput("");
                                  setCategoryDropdownOpen(false);
                                }}
                              >
                                <span>{category.name}</span>
                                {formData.category === category.name && (
                                  <Check className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("cost.form.costType")}
                  </label>
                  <Select
                    value={formData.costType}
                    onValueChange={(value: "fixed" | "variable") =>
                      setFormData({ ...formData, costType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("cost.form.costTypePlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="variable">
                        {t("cost.filters.variableCost")}
                      </SelectItem>
                      <SelectItem value="fixed">
                        {t("cost.filters.fixedCost")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("cost.form.date")}
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("cost.form.vendor")}
                  </label>
                  <Input
                    value={formData.vendor}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor: e.target.value })
                    }
                    placeholder={t("cost.form.vendorPlaceholder")}
                    required
                  />
                </div>
              </div>

              {/* Drag and Drop Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("cost.form.receipt")}
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {receiptFile ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-gray-900">
                        {receiptFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeReceipt}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t("cost.form.remove")}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        {t("cost.form.receiptDragText")}{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {t("cost.form.receiptBrowse")}
                        </button>
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("cost.form.receiptSupport")}
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModals}
                  disabled={submitting}
                >
                  {t("cost.form.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : showAddCostModal ? (
                    t("cost.form.create")
                  ) : (
                    t("cost.form.update")
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {showManageCategoriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("cost.categories.title")}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Add New Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("cost.categories.addNew")}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t("cost.categories.addNewPlaceholder")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCategory();
                      }
                    }}
                  />
                  <Button
                    onClick={addCategory}
                    disabled={!newCategoryName.trim()}
                    className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                  >
                    {t("cost.categories.add")}
                  </Button>
                </div>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("cost.categories.existing")}
                </label>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      {editingCategory?.id === category.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                updateCategory();
                              }
                            }}
                          />
                          <Button
                            onClick={updateCategory}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingCategory(null);
                              setNewCategoryName("");
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => {
                                setEditingCategory(category);
                                setNewCategoryName(category.name);
                              }}
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => deleteCategory(category.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setCostToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={t("cost.messages.costDeleteConfirm")}
        description={t("common.deleteConfirmation.description")}
        itemName={costToDelete?.name}
      />
    </div>
  );
};

export default CostsPage;
