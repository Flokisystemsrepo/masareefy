import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
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
import { revenuesAPI, metricsAPI, categoriesAPI } from "@/services/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

interface Revenue {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  source: string;
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

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueByCategory: Array<{
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

const RevenuesPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [showAddRevenueModal, setShowAddRevenueModal] = useState(false);
  const [showEditRevenueModal, setShowEditRevenueModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] =
    useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [revenueToDelete, setRevenueToDelete] = useState<Revenue | null>(null);
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
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
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    date: "",
    source: "",
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
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      // Load revenues and metrics in parallel
      const [revenuesResponse, metricsResponse] = await Promise.all([
        revenuesAPI.getAll(filters),
        metricsAPI.getRevenueMetrics(),
      ]);

      console.log("Revenues API Response:", revenuesResponse);
      console.log("Metrics API Response:", metricsResponse);

      setRevenues(revenuesResponse?.revenues || []);
      setMetrics(metricsResponse || {});

      // Update pagination info
      if (revenuesResponse?.pagination) {
        setTotalPages(revenuesResponse.pagination.pages);
        setTotalItems(revenuesResponse.pagination.total);
      }
    } catch (error: any) {
      console.error("Error loading revenues:", error);
      toast.error(error.message || t("revenue.messages.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Load managed categories from API
      const managedCategories = await categoriesAPI.getAll("revenue");

      // Load used categories (includes unmanaged ones from existing revenues)
      const usedCategories = await categoriesAPI.getUsed("revenue");

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
          name: "Sales",
          color: "bg-green-100 text-green-800",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Services",
          color: "bg-blue-100 text-blue-800",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Consulting",
          color: "bg-purple-100 text-purple-800",
          createdAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Subscriptions",
          color: "bg-orange-100 text-orange-800",
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
        type: "revenue",
      });

      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName("");
      toast.success(t("revenue.messages.categoryAdded"));
    } catch (error: any) {
      toast.error(error.message || t("revenue.messages.failedToAddCategory"));
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
      toast.success(t("revenue.messages.categoryUpdated"));
    } catch (error: any) {
      toast.error(
        error.message || t("revenue.messages.failedToUpdateCategory")
      );
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm(t("revenue.messages.categoryDeleteConfirm"))) return;

    try {
      await categoriesAPI.delete(categoryId);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast.success(t("revenue.messages.categoryDeleted"));
    } catch (error: any) {
      toast.error(
        error.message || t("revenue.messages.failedToDeleteCategory")
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      category: "",
      date: "",
      source: "",
      receiptUrl: "",
    });
    setSelectedRevenue(null);
    setReceiptFile(null);
    setCustomCategoryInput("");
  };

  const openAddModal = () => {
    resetForm();
    setShowAddRevenueModal(true);
  };

  const openEditModal = (revenue: Revenue) => {
    setSelectedRevenue(revenue);
    setFormData({
      name: revenue.name,
      amount: revenue.amount.toString(),
      category: revenue.category,
      date: revenue.date.split("T")[0], // Convert ISO date to YYYY-MM-DD
      source: revenue.source,
      receiptUrl: revenue.receiptUrl || "",
    });
    setShowEditRevenueModal(true);
  };

  const closeModals = () => {
    setShowAddRevenueModal(false);
    setShowEditRevenueModal(false);
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
        toast.success(t("revenue.messages.receiptUploaded"));
      } else {
        toast.error(t("revenue.messages.invalidFileType"));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        setReceiptFile(file);
        toast.success(t("revenue.messages.receiptUploaded"));
      } else {
        toast.error(t("revenue.messages.invalidFileType"));
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
        date: new Date(formData.date).toISOString(), // Convert to ISO-8601 format
        source: formData.source,
        receiptUrl: formData.receiptUrl,
      };

      if (showAddRevenueModal) {
        // Create new revenue
        const result = await revenuesAPI.create(submitData);

        // Handle file upload if there's a receipt file
        if (receiptFile && result.id) {
          // TODO: Implement file upload to server
          // For now, we'll just show a message that file upload is not yet implemented
          console.log("File upload not yet implemented:", receiptFile);
        }

        toast.success(t("revenue.messages.revenueCreated"));
      } else {
        // Update existing revenue
        if (selectedRevenue) {
          const result = await revenuesAPI.update(
            selectedRevenue.id,
            submitData
          );

          // Handle file upload if there's a receipt file
          if (receiptFile) {
            // TODO: Implement file upload to server
            // For now, we'll just show a message that file upload is not yet implemented
            console.log("File upload not yet implemented:", receiptFile);
          }

          toast.success(t("revenue.messages.revenueUpdated"));
        }
      }

      closeModals();
      loadData(); // Reload data
    } catch (error: any) {
      toast.error(error.message || t("revenue.messages.failedToSaveRevenue"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (revenue: Revenue) => {
    setRevenueToDelete(revenue);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!revenueToDelete) return;

    try {
      await revenuesAPI.delete(revenueToDelete.id);
      toast.success(t("revenue.messages.revenueDeleted"));
      loadData(); // Reload data
    } catch (error: any) {
      toast.error(error.message || t("revenue.messages.failedToDeleteRevenue"));
    } finally {
      setShowDeleteConfirmation(false);
      setRevenueToDelete(null);
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
            {t("revenue.title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("revenue.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowManageCategoriesModal(true)}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            {t("revenue.manageCategories")}
          </Button>
          <Button
            onClick={openAddModal}
            className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("revenue.addRevenue")}
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
                    {t("revenue.metrics.totalRevenue")}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics ? formatCurrency(metrics.totalRevenue) : "$0.00"}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
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
                    {t("revenue.metrics.monthlyRevenue")}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics ? formatCurrency(metrics.monthlyRevenue) : "$0.00"}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
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
                    {t("revenue.metrics.totalEntries")}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {revenues.length}
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
                {t("revenue.filters.title")}
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
                        placeholder={t("revenue.filters.allCategories")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("revenue.filters.allCategories")}
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    placeholder={t("revenue.filters.startDate")}
                    className="w-48"
                  />

                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    placeholder={t("revenue.filters.endDate")}
                    className="w-48"
                  />

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory("");
                      setStartDate("");
                      setEndDate("");
                      setCurrentPage(1);
                    }}
                    className="text-gray-600"
                  >
                    {t("revenue.filters.clearFilters")}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("revenue.filters.searchPlaceholder")}
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
              {revenues.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("revenue.table.noRevenues")}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t("revenue.table.noRevenuesDescription")}
                  </p>
                  <Button
                    onClick={openAddModal}
                    className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("revenue.addRevenue")}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {revenues.map((revenue) => (
                      <motion.div
                        key={revenue.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {revenue.name}
                            </h3>
                            <Badge className="bg-green-100 text-green-800 mb-2">
                              {revenue.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(revenue)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(revenue)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {t("revenue.table.amount")}
                            </span>
                            <span className="font-semibold text-gray-900 text-lg">
                              {formatCurrency(revenue.amount)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {t("revenue.table.source")}
                            </span>
                            <span className="font-medium text-gray-900">
                              {revenue.source}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {t("revenue.table.date")}
                            </span>
                            <span className="text-gray-900">
                              {formatDate(revenue.date)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {t("revenue.table.created")}
                            </span>
                            <span className="text-gray-900">
                              {formatDate(revenue.createdAt)}
                            </span>
                          </div>
                        </div>

                        {revenue.receiptUrl && (
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <a
                              href={revenue.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#106df9] hover:underline flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              {t("revenue.table.viewReceipt")}
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
                          {t("revenue.table.showing")}{" "}
                          {(currentPage - 1) * itemsPerPage + 1}{" "}
                          {t("revenue.table.to")}{" "}
                          {Math.min(currentPage * itemsPerPage, totalItems)}{" "}
                          {t("revenue.table.of")} {totalItems}{" "}
                          {t("revenue.table.results")}
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
                          {t("revenue.table.perPage")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          {t("revenue.table.previous")}
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
                          {t("revenue.table.next")}
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
      {(showAddRevenueModal || showEditRevenueModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {showAddRevenueModal
                  ? t("revenue.form.addTitle")
                  : t("revenue.form.editTitle")}
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
                    {t("revenue.form.revenueName")}
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={t("revenue.form.revenueNamePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("revenue.form.amount")}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder={t("revenue.form.amountPlaceholder")}
                    required
                  />
                </div>

                {/* Category Dropdown with Custom Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("revenue.form.category")}
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
                          t("revenue.form.categoryPlaceholder")}
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
                              "revenue.form.categorySearchPlaceholder"
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
                    {t("revenue.form.date")}
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
                    {t("revenue.form.source")}
                  </label>
                  <Input
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    placeholder={t("revenue.form.sourcePlaceholder")}
                    required
                  />
                </div>
              </div>

              {/* Drag and Drop Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("revenue.form.receipt")}
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
                        {t("revenue.form.remove")}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        {t("revenue.form.receiptDragText")}{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {t("revenue.form.receiptBrowse")}
                        </button>
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("revenue.form.receiptSupport")}
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
                  {t("revenue.form.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : showAddRevenueModal ? (
                    t("revenue.form.create")
                  ) : (
                    t("revenue.form.update")
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
                {t("revenue.categories.title")}
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
                  {t("revenue.categories.addNew")}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t("revenue.categories.addNewPlaceholder")}
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
                    {t("revenue.categories.add")}
                  </Button>
                </div>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("revenue.categories.existing")}
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
          setRevenueToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={t("revenue.messages.revenueDeleteConfirm")}
        description={t("common.deleteConfirmation.description")}
        itemName={revenueToDelete?.name}
      />
    </div>
  );
};

export default RevenuesPage;
