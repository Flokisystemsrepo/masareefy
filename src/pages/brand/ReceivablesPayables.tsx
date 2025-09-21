import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building,
  X,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { receivablesAPI, payablesAPI, metricsAPI } from "@/services/api";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, ArrowUpRight } from "lucide-react";

interface Receivable {
  id: string;
  entityName: string;
  amount: number;
  dueDate: string;
  status: "current" | "overdue" | "critical" | "paid";
  description?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Payable {
  id: string;
  entityName: string;
  amount: number;
  dueDate: string;
  status: "current" | "overdue" | "critical" | "paid";
  description?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface FinancialMetrics {
  totalReceivables: number;
  totalPayables: number;
  totalRevenue: number;
  totalCosts: number;
  netIncome: number;
  overdueReceivables: number;
  overduePayables: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ReceivablesPayablesPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const {
    hasSectionAccess,
    getSectionLockMessage,
    subscription,
    testUpgradeToGrowth,
    testUpgradeToScale,
  } = useSubscription();

  // State for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // State for delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "receivable" | "payable";
    name: string;
  } | null>(null);

  // Helper functions for upgrade modal
  const getUpgradePlan = () => {
    if (!subscription) return "Growth";
    if (subscription.isFreePlan) return "Growth";
    if (subscription.plan.name.toLowerCase() === "growth") return "Scale";
    return "Growth";
  };

  const getUpgradePrice = () => {
    if (!subscription) return "299 EGP/month";
    if (subscription.isFreePlan) return "299 EGP/month";
    if (subscription.plan.name.toLowerCase() === "growth")
      return "399 EGP/month";
    return "299 EGP/month";
  };

  const handleActionClick = () => {
    if (subscription?.isFreePlan && !hasSectionAccess("receivables")) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "all" | "receivables" | "payables"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalType, setModalType] = useState<"receivable" | "payable">(
    "receivable"
  );
  const [editingItem, setEditingItem] = useState<Receivable | Payable | null>(
    null
  );
  const [viewingItem, setViewingItem] = useState<Receivable | Payable | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    entityName: "",
    amount: "",
    dueDate: "",
    description: "",
    invoiceNumber: "",
    receiptUrl: "",
    autoConvertToRevenue: false, // For receivables
    autoConvertToCost: false, // For payables
  });

  // React Query hooks
  const {
    data: receivablesData,
    isLoading: receivablesLoading,
    error: receivablesError,
  } = useQuery({
    queryKey: [
      "receivables",
      searchTerm,
      statusFilter,
      startDate,
      endDate,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      receivablesAPI.getAll({
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: pageSize,
      }),
    enabled: activeTab === "receivables" || activeTab === "all",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: payablesData,
    isLoading: payablesLoading,
    error: payablesError,
  } = useQuery({
    queryKey: [
      "payables",
      searchTerm,
      statusFilter,
      startDate,
      endDate,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      payablesAPI.getAll({
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: pageSize,
      }),
    enabled: activeTab === "payables" || activeTab === "all",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["financial-metrics"],
    queryFn: () => metricsAPI.getFinancialMetrics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const receivablesList = receivablesData?.receivables || [];
  const payablesList = payablesData?.payables || [];
  const receivablesPagination = receivablesData?.pagination;
  const payablesPagination = payablesData?.pagination;

  // Combined data for "all" tab
  const allItems = [...receivablesList, ...payablesList];
  const allPagination =
    activeTab === "all"
      ? {
          page: currentPage,
          limit: pageSize,
          total:
            (receivablesPagination?.total || 0) +
            (payablesPagination?.total || 0),
          pages: Math.ceil(
            ((receivablesPagination?.total || 0) +
              (payablesPagination?.total || 0)) /
              pageSize
          ),
        }
      : null;

  // Mutations
  const createReceivableMutation = useMutation({
    mutationFn: receivablesAPI.create,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      queryClient.invalidateQueries({ queryKey: ["financial-metrics"] });

      // Check if auto-conversion is enabled
      if (variables.autoConvertToRevenue) {
        toast.success(
          t("receivablesPayables.messages.receivableCreated") +
            " " +
            t("receivablesPayables.messages.autoConversionNote")
        );
      } else {
        toast.success(t("receivablesPayables.messages.receivableCreated"));
      }

      resetForm();
      setShowAddModal(false);
    },
    onError: (error: any) => {
      toast.error(
        error.message ||
          t("receivablesPayables.messages.failedToCreateReceivable")
      );
    },
  });

  const createPayableMutation = useMutation({
    mutationFn: payablesAPI.create,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["financial-metrics"] });

      // Check if auto-conversion is enabled
      if (variables.autoConvertToCost) {
        toast.success(
          t("receivablesPayables.messages.payableCreated") +
            " " +
            t("receivablesPayables.messages.autoConversionNote")
        );
      } else {
        toast.success(t("receivablesPayables.messages.payableCreated"));
      }

      resetForm();
      setShowAddModal(false);
    },
    onError: (error: any) => {
      toast.error(
        error.message || t("receivablesPayables.messages.failedToCreatePayable")
      );
    },
  });

  const updateReceivableMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      receivablesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      queryClient.invalidateQueries({ queryKey: ["financial-metrics"] });
      toast.success(t("receivablesPayables.messages.receivableUpdated"));
      resetForm();
      setShowEditModal(false);
    },
    onError: (error: any) => {
      toast.error(
        error.message ||
          t("receivablesPayables.messages.failedToUpdateReceivable")
      );
    },
  });

  const updatePayableMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      payablesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["financial-metrics"] });
      toast.success(t("receivablesPayables.messages.payableUpdated"));
      resetForm();
      setShowEditModal(false);
    },
    onError: (error: any) => {
      toast.error(
        error.message || t("receivablesPayables.messages.failedToUpdatePayable")
      );
    },
  });

  const deleteReceivableMutation = useMutation({
    mutationFn: receivablesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["financial-metrics"] });
      toast.success(t("receivablesPayables.messages.receivableDeleted"));
    },
    onError: (error: any) => {
      toast.error(
        error.message ||
          t("receivablesPayables.messages.failedToDeleteReceivable")
      );
    },
  });

  const deletePayableMutation = useMutation({
    mutationFn: payablesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      queryClient.invalidateQueries({ queryKey: ["financial-metrics"] });
      toast.success(t("receivablesPayables.messages.payableDeleted"));
    },
    onError: (error: any) => {
      toast.error(
        error.message || t("receivablesPayables.messages.failedToDeletePayable")
      );
    },
  });

  // Helper functions
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  }, []);

  const getCurrentPagination = () => {
    if (activeTab === "receivables") return receivablesPagination;
    if (activeTab === "payables") return payablesPagination;
    return allPagination;
  };

  const getCurrentItems = () => {
    if (activeTab === "receivables") return receivablesList;
    if (activeTab === "payables") return payablesList;
    return allItems;
  };

  const isLoading = receivablesLoading || payablesLoading || metricsLoading;

  const resetForm = () => {
    setFormData({
      entityName: "",
      amount: "",
      dueDate: "",
      description: "",
      invoiceNumber: "",
      receiptUrl: "",
      autoConvertToRevenue: false,
      autoConvertToCost: false,
    });
    setEditingItem(null);
  };

  const openAddModal = (type: "receivable" | "payable") => {
    if (!handleActionClick()) return;
    setModalType(type);
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (
    item: Receivable | Payable,
    type: "receivable" | "payable"
  ) => {
    if (!handleActionClick()) return;
    setModalType(type);
    setEditingItem(item);
    setFormData({
      entityName: item.entityName,
      amount: item.amount.toString(),
      dueDate: item.dueDate.split("T")[0],
      description: item.description || "",
      invoiceNumber: item.invoiceNumber || "",
      receiptUrl: item.receiptUrl || "",
      autoConvertToRevenue: (item as any).autoConvertToRevenue || false,
      autoConvertToCost: (item as any).autoConvertToCost || false,
    });
    setShowEditModal(true);
  };

  const openViewModal = (item: Receivable | Payable) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  const handleDelete = (
    id: string,
    type: "receivable" | "payable",
    name: string
  ) => {
    // Find the item to check its status
    const item =
      type === "receivable"
        ? receivablesList.find((r) => r.id === id)
        : payablesList.find((p) => p.id === id);

    // Check if item has been converted
    if (item?.status === "converted") {
      toast.error(t("receivablesPayables.messages.cannotDeleteConverted"));
      return;
    }

    setItemToDelete({ id, type, name });
    setShowDeleteConfirmation(true);
  };

  // Helper function to determine item type from ID
  const getItemType = (id: string): "receivable" | "payable" => {
    // Check if the ID exists in receivables list
    const isReceivable = receivablesList.some((item) => item.id === id);
    return isReceivable ? "receivable" : "payable";
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "receivable") {
      deleteReceivableMutation.mutate(itemToDelete.id);
    } else {
      deletePayableMutation.mutate(itemToDelete.id);
    }

    setShowDeleteConfirmation(false);
    setItemToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        entityName: formData.entityName,
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate).toISOString(), // Convert to ISO-8601 format
        description: formData.description,
        invoiceNumber: formData.invoiceNumber,
        receiptUrl: formData.receiptUrl,
        ...(modalType === "receivable" && {
          autoConvertToRevenue: formData.autoConvertToRevenue,
        }),
        ...(modalType === "payable" && {
          autoConvertToCost: formData.autoConvertToCost,
        }),
      };

      if (editingItem) {
        // Update existing item
        if (modalType === "receivable") {
          updateReceivableMutation.mutate({ id: editingItem.id, data });
        } else {
          updatePayableMutation.mutate({ id: editingItem.id, data });
        }
      } else {
        // Create new item
        if (modalType === "receivable") {
          createReceivableMutation.mutate(data);
        } else {
          createPayableMutation.mutate(data);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "current":
        return <CheckCircle className="h-4 w-4" />;
      case "overdue":
        return <Clock className="h-4 w-4" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
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

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Chart data
  const chartData = metrics
    ? [
        {
          name: "Receivables",
          value: metrics.totalReceivables,
          color: "#10b981",
        },
        { name: "Payables", value: metrics.totalPayables, color: "#ef4444" },
      ]
    : [];

  const currentData =
    activeTab === "all"
      ? [...receivablesList, ...payablesList]
      : activeTab === "receivables"
      ? receivablesList
      : payablesList;

  return (
    <div
      className={`p-6 space-y-6 bg-gray-50 min-h-screen ${
        isRTL ? "rtl" : "ltr"
      } ${!hasSectionAccess("receivables") ? "relative" : ""}`}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("receivablesPayables.title")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("receivablesPayables.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => openAddModal("receivable")}
            className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("receivablesPayables.addReceivable")}
          </Button>
          <Button
            onClick={() => openAddModal("payable")}
            className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("receivablesPayables.addPayable")}
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <Card className="bg-white shadow-sm border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {t("receivablesPayables.filters.title")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />{" "}
                {showFilters
                  ? t("receivablesPayables.filters.hideFilters")
                  : t("receivablesPayables.filters.showFilters")}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />{" "}
                {t("receivablesPayables.export")}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("receivablesPayables.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("receivablesPayables.filters.status")}
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("receivablesPayables.filters.allStatuses")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("receivablesPayables.filters.allStatuses")}
                    </SelectItem>
                    <SelectItem value="current">
                      {t("receivablesPayables.status.current")}
                    </SelectItem>
                    <SelectItem value="overdue">
                      {t("receivablesPayables.status.overdue")}
                    </SelectItem>
                    <SelectItem value="critical">
                      {t("receivablesPayables.status.critical")}
                    </SelectItem>
                    <SelectItem value="paid">
                      {t("receivablesPayables.status.paid")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("receivablesPayables.filters.fromDate")}
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("receivablesPayables.filters.toDate")}
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                {t("receivablesPayables.filters.clearAllFilters")}
              </Button>
              <div className="text-sm text-gray-500">
                {getCurrentPagination() && (
                  <>
                    {t("receivablesPayables.filters.showing")}{" "}
                    {(currentPage - 1) * pageSize + 1}{" "}
                    {t("receivablesPayables.filters.to")}{" "}
                    {Math.min(
                      currentPage * pageSize,
                      getCurrentPagination()?.total || 0
                    )}{" "}
                    {t("receivablesPayables.filters.of")}{" "}
                    {getCurrentPagination()?.total}{" "}
                    {t("receivablesPayables.filters.items")}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Metrics Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm h-28">
            <CardContent className="p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">
                    {t("receivablesPayables.metrics.totalReceivables")}
                  </p>
                  <p className="text-xl font-bold text-green-600 truncate">
                    {metrics
                      ? formatCurrency(metrics.totalReceivables)
                      : "EGP 0"}
                  </p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm h-28">
            <CardContent className="p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">
                    {t("receivablesPayables.metrics.totalPayables")}
                  </p>
                  <p className="text-xl font-bold text-red-600 truncate">
                    {metrics ? formatCurrency(metrics.totalPayables) : "EGP 0"}
                  </p>
                </div>
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm h-28">
            <CardContent className="p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">
                    {t("receivablesPayables.metrics.overdueReceivables")}
                  </p>
                  <p className="text-xl font-bold text-yellow-600 truncate">
                    {metrics
                      ? formatCurrency(metrics.overdueReceivables)
                      : "EGP 0"}
                  </p>
                </div>
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm h-28">
            <CardContent className="p-4 h-full">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">
                    {t("receivablesPayables.metrics.overduePayables")}
                  </p>
                  <p className="text-xl font-bold text-orange-600 truncate">
                    {metrics
                      ? formatCurrency(metrics.overduePayables)
                      : "EGP 0"}
                  </p>
                </div>
                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Tabs and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-white text-[#106df9] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("receivablesPayables.tabs.all")}
            </button>
            <button
              onClick={() => {
                setActiveTab("receivables");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "receivables"
                  ? "bg-white text-[#106df9] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("receivablesPayables.tabs.receivables")}
            </button>
            <button
              onClick={() => {
                setActiveTab("payables");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "payables"
                  ? "bg-white text-[#106df9] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("receivablesPayables.tabs.payables")}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("receivablesPayables.filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue
                  placeholder={t("receivablesPayables.filters.status")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("receivablesPayables.status.allStatus")}
                </SelectItem>
                <SelectItem value="current">
                  {t("receivablesPayables.status.current")}
                </SelectItem>
                <SelectItem value="overdue">
                  {t("receivablesPayables.status.overdue")}
                </SelectItem>
                <SelectItem value="critical">
                  {t("receivablesPayables.status.critical")}
                </SelectItem>
                <SelectItem value="paid">
                  {t("receivablesPayables.status.paid")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#106df9]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentData.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "all"
                    ? t("receivablesPayables.emptyState.noItems")
                    : activeTab === "receivables"
                    ? t("receivablesPayables.emptyState.noReceivables")
                    : t("receivablesPayables.emptyState.noPayables")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === "all"
                    ? t("receivablesPayables.emptyState.noItemsDescription")
                    : activeTab === "receivables"
                    ? t(
                        "receivablesPayables.emptyState.noReceivablesDescription"
                      )
                    : t("receivablesPayables.emptyState.noPayablesDescription")}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => openAddModal("receivable")}
                    className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("receivablesPayables.addReceivable")}
                  </Button>
                  <Button
                    onClick={() => openAddModal("payable")}
                    className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("receivablesPayables.addPayable")}
                  </Button>
                </div>
              </div>
            ) : (
              currentData.map((item) => {
                const itemType = getItemType(item);
                const isReceivable = itemType === "receivable";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`text-xs ${
                                isReceivable
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {isReceivable
                                ? t("receivablesPayables.itemCard.receivable")
                                : t("receivablesPayables.itemCard.payable")}
                            </Badge>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.charAt(0).toUpperCase() +
                                item.status.slice(1)}
                            </Badge>
                            {getDaysOverdue(item.dueDate) > 0 && (
                              <Badge
                                variant="outline"
                                className="text-orange-600 text-xs"
                              >
                                {getDaysOverdue(item.dueDate)}d{" "}
                                {t("receivablesPayables.itemCard.overdue")}
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.entityName}
                          </h3>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(item.amount)}
                            </span>
                            <span>
                              {t("receivablesPayables.itemCard.due")}{" "}
                              {formatDate(item.dueDate)}
                            </span>
                            {item.invoiceNumber && (
                              <span>
                                {t("receivablesPayables.itemCard.invoice")}{" "}
                                {item.invoiceNumber}
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewModal(item)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openEditModal(
                                item,
                                activeTab === "all"
                                  ? getItemType(item.id)
                                  : activeTab === "receivables"
                                  ? "receivable"
                                  : "payable"
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                item.id,
                                activeTab === "all"
                                  ? getItemType(item.id)
                                  : activeTab === "receivables"
                                  ? "receivable"
                                  : "payable",
                                item.entityName
                              )
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {getCurrentPagination() && getCurrentPagination()!.pages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              {t("receivablesPayables.pagination.rowsPerPage")}
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {t("receivablesPayables.pagination.previous")}
            </Button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, getCurrentPagination()!.pages) },
                (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
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
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === getCurrentPagination()!.pages}
            >
              {t("receivablesPayables.pagination.next")}
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {showAddModal
                  ? modalType === "receivable"
                    ? t("receivablesPayables.form.addReceivable")
                    : t("receivablesPayables.form.addPayable")
                  : modalType === "receivable"
                  ? t("receivablesPayables.form.editReceivable")
                  : t("receivablesPayables.form.editPayable")}
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
                    {modalType === "receivable"
                      ? t("receivablesPayables.form.customerVendorName")
                      : t("receivablesPayables.form.vendorName")}
                  </label>
                  <Input
                    value={formData.entityName}
                    onChange={(e) =>
                      setFormData({ ...formData, entityName: e.target.value })
                    }
                    placeholder={t("receivablesPayables.form.namePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("receivablesPayables.form.amount")}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder={t(
                      "receivablesPayables.form.amountPlaceholder"
                    )}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("receivablesPayables.form.dueDate")}
                  </label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("receivablesPayables.form.invoiceNumber")}
                  </label>
                  <Input
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoiceNumber: e.target.value,
                      })
                    }
                    placeholder={t(
                      "receivablesPayables.form.invoicePlaceholder"
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("receivablesPayables.form.description")}
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t(
                    "receivablesPayables.form.descriptionPlaceholder"
                  )}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("receivablesPayables.form.receiptUrl")}
                </label>
                <Input
                  value={formData.receiptUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, receiptUrl: e.target.value })
                  }
                  placeholder={t("receivablesPayables.form.receiptPlaceholder")}
                />
              </div>

              {/* Auto-conversion options */}
              {modalType === "receivable" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="autoConvertToRevenue"
                      checked={formData.autoConvertToRevenue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          autoConvertToRevenue: e.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="autoConvertToRevenue"
                        className="text-sm font-medium text-blue-900 cursor-pointer"
                      >
                        {t("receivablesPayables.form.autoConvertToRevenue")}
                      </label>
                      <p className="text-xs text-blue-700 mt-1">
                        {t(
                          "receivablesPayables.form.autoConvertToRevenueDescription"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {modalType === "payable" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="autoConvertToCost"
                      checked={formData.autoConvertToCost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          autoConvertToCost: e.target.checked,
                        })
                      }
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="autoConvertToCost"
                        className="text-sm font-medium text-red-900 cursor-pointer"
                      >
                        {t("receivablesPayables.form.autoConvertToCost")}
                      </label>
                      <p className="text-xs text-red-700 mt-1">
                        {t(
                          "receivablesPayables.form.autoConvertToCostDescription"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModals}
                  disabled={submitting}
                >
                  {t("receivablesPayables.form.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : showAddModal ? (
                    t("receivablesPayables.form.create")
                  ) : (
                    t("receivablesPayables.form.update")
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {getItemType(viewingItem) === "receivable"
                  ? t("receivablesPayables.viewModal.viewReceivable")
                  : t("receivablesPayables.viewModal.viewPayable")}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("receivablesPayables.viewModal.entityName")}
                  </label>
                  <p className="text-gray-900 font-medium">
                    {viewingItem.entityName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("receivablesPayables.viewModal.amount")}
                  </label>
                  <p className="text-gray-900 font-medium">
                    EGP {viewingItem.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("receivablesPayables.viewModal.dueDate")}
                  </label>
                  <p className="text-gray-900">
                    {new Date(viewingItem.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("receivablesPayables.viewModal.status")}
                  </label>
                  <Badge className={getStatusColor(viewingItem.status)}>
                    {viewingItem.status.charAt(0).toUpperCase() +
                      viewingItem.status.slice(1)}
                  </Badge>
                </div>

                {viewingItem.invoiceNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("receivablesPayables.viewModal.invoiceNumber")}
                    </label>
                    <p className="text-gray-900">{viewingItem.invoiceNumber}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("receivablesPayables.viewModal.createdBy")}
                  </label>
                  <p className="text-gray-900">
                    {viewingItem.creator.firstName}{" "}
                    {viewingItem.creator.lastName}
                  </p>
                </div>
              </div>

              {viewingItem.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("receivablesPayables.viewModal.description")}
                  </label>
                  <p className="text-gray-900">{viewingItem.description}</p>
                </div>
              )}

              {viewingItem.receiptUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("receivablesPayables.viewModal.receipt")}
                  </label>
                  <a
                    href={viewingItem.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {t("receivablesPayables.viewModal.viewReceipt")}
                  </a>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                >
                  {t("receivablesPayables.viewModal.close")}
                </Button>
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(viewingItem, getItemType(viewingItem.id));
                  }}
                  className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t("receivablesPayables.viewModal.edit")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Blur overlay for locked sections - only for Free plan users */}
      {subscription?.isFreePlan && !hasSectionAccess("receivables") && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg border max-w-md">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              🔒 Section Locked
            </h3>
            <p className="text-gray-600 mb-4">
              {getSectionLockMessage("receivables")}
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {getUpgradePrice()}
              </div>
              <div className="text-sm text-gray-600">
                {getUpgradePlan()} Plan
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                if (subscription?.isFreePlan) {
                  testUpgradeToGrowth();
                } else if (subscription?.plan.name.toLowerCase() === "growth") {
                  testUpgradeToScale();
                } else {
                  window.location.href = "/pricing";
                }
              }}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              🔒 Action Locked
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-gray-600 text-base">
                {getSectionLockMessage("receivables")}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {getUpgradePrice()}
              </div>
              <div className="text-sm text-gray-600">
                {getUpgradePlan()} Plan
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (subscription?.isFreePlan) {
                    testUpgradeToGrowth();
                    setShowUpgradeModal(false);
                  } else if (
                    subscription?.plan.name.toLowerCase() === "growth"
                  ) {
                    testUpgradeToScale();
                    setShowUpgradeModal(false);
                  } else {
                    window.location.href = "/pricing";
                  }
                }}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={t("receivablesPayables.messages.deleteConfirm")}
        description={t("common.deleteConfirmation.description")}
        itemName={itemToDelete?.name}
      />
    </div>
  );
};

export default ReceivablesPayablesPage;
