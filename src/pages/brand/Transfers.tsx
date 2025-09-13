import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpDown,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Package,
  User,
  FileText,
  Upload,
  X,
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
import { Checkbox } from "@/components/ui/checkbox";
import { transfersAPI, metricsAPI, inventoryAPI } from "@/services/api";
import { toast } from "sonner";
import FeatureLock from "@/components/FeatureLock";
import { useLanguage } from "@/contexts/LanguageContext";

interface Transfer {
  id: string;
  type: "customer" | "inventory";
  fromLocation?: string;
  toLocation: string;
  quantity: number;
  description?: string;
  transferDate: string;
  inventoryItemId?: string;
  deductFromStock?: boolean;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface InventoryItem {
  id: string;
  productName: string;
  baseSku: string;
  category: string;
  currentStock: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

interface TransferMetrics {
  totalTransfers: number;
  monthlyTransfers: number;
}

const TransfersPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [showAddTransferModal, setShowAddTransferModal] = useState(false);
  const [showEditTransferModal, setShowEditTransferModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [transferType, setTransferType] = useState<"customer" | "inventory">(
    "customer"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [showFilters, setShowFilters] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    type: "customer" as "customer" | "inventory",
    fromLocation: "",
    toLocation: "",
    quantity: "",
    description: "",
    transferDate: "",
    inventoryItemId: "",
    deductFromStock: false,
  });

  // React Query hooks
  const {
    data: transfersData,
    isLoading: transfersLoading,
    error: transfersError,
  } = useQuery({
    queryKey: [
      "transfers",
      searchTerm,
      activeTab,
      startDate,
      endDate,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      transfersAPI.getAll({
        search: searchTerm,
        type: activeTab !== "all" ? activeTab : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: pageSize,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const transfersList = transfersData?.transfers || [];
  const pagination = transfersData?.pagination;

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["transfer-metrics"],
    queryFn: () => metricsAPI.getTransferMetrics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => inventoryAPI.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoized data processing
  const transfers = useMemo(() => {
    const transfersArray = transfersData?.transfers || transfersData || [];
    return Array.isArray(transfersArray) ? transfersArray : [];
  }, [transfersData]);

  const inventoryItems = useMemo(() => {
    const inventoryArray = inventoryData?.inventory || inventoryData || [];
    return Array.isArray(inventoryArray) ? inventoryArray : [];
  }, [inventoryData]);

  const loading = transfersLoading || metricsLoading || inventoryLoading;

  const resetForm = () => {
    setFormData({
      type: "customer",
      fromLocation: "",
      toLocation: "",
      quantity: "",
      description: "",
      transferDate: "",
      inventoryItemId: "",
      deductFromStock: false,
    });
    setSelectedTransfer(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddTransferModal(true);
  };

  const openEditModal = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setFormData({
      type: transfer.type,
      fromLocation: transfer.fromLocation || "",
      toLocation: transfer.toLocation,
      quantity: transfer.quantity.toString(),
      description: transfer.description || "",
      transferDate: transfer.transferDate.split("T")[0], // Convert ISO date to YYYY-MM-DD
      inventoryItemId: transfer.inventoryItemId || "",
      deductFromStock: transfer.deductFromStock || false,
    });
    setShowEditTransferModal(true);
  };

  const closeModals = () => {
    setShowAddTransferModal(false);
    setShowEditTransferModal(false);
    resetForm();
  };

  // Mutations
  const createTransferMutation = useMutation({
    mutationFn: (data: any) => transfersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["transfer-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); // Invalidate inventory in case stock was deducted
      toast.success(t("transfers.messages.transferCreated"));
      closeModals();
    },
    onError: (error: any) => {
      toast.error(error.message || t("transfers.messages.failedToCreate"));
    },
  });

  const updateTransferMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      transfersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["transfer-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); // Invalidate inventory in case stock was deducted
      toast.success(t("transfers.messages.transferUpdated"));
      closeModals();
    },
    onError: (error: any) => {
      toast.error(error.message || t("transfers.messages.failedToUpdate"));
    },
  });

  const deleteTransferMutation = useMutation({
    mutationFn: (id: string) => transfersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["transfer-metrics"] });
      toast.success(t("transfers.messages.transferDeleted"));
    },
    onError: (error: any) => {
      toast.error(error.message || t("transfers.messages.failedToDelete"));
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const submitData = {
        type: formData.type,
        fromLocation: formData.fromLocation || undefined,
        toLocation: formData.toLocation,
        quantity: parseInt(formData.quantity),
        description: formData.description,
        transferDate: new Date(formData.transferDate).toISOString(),
        inventoryItemId: formData.inventoryItemId || undefined,
        deductFromStock: formData.deductFromStock,
      };

      if (showAddTransferModal) {
        createTransferMutation.mutate(submitData);
      } else if (selectedTransfer) {
        updateTransferMutation.mutate({
          id: selectedTransfer.id,
          data: submitData,
        });
      }
    },
    [
      formData,
      showAddTransferModal,
      selectedTransfer,
      createTransferMutation,
      updateTransferMutation,
    ]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm(t("transfers.messages.deleteConfirm"))) return;
      deleteTransferMutation.mutate(id);
    },
    [deleteTransferMutation]
  );

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

  // Clear filters function
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  }, []);

  // Error handling
  if (transfersError) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{t("transfers.failedToLoad")}</p>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["transfers"] })
              }
            >
              {t("transfers.retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#106df9]"></div>
        </div>
      </div>
    );
  }

  return (
    <FeatureLock featureName="Transfers">
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
              {t("transfers.title")}
            </h1>
            <p className="text-gray-600 mt-2">{t("transfers.subtitle")}</p>
          </div>
          <Button
            onClick={openAddModal}
            className="bg-[#106df9] hover:bg-[#106df9]/90 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("transfers.addTransfer")}
          </Button>
        </motion.div>

        {/* Metrics Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t("transfers.metrics.totalTransfers")}
                </CardTitle>
                <ArrowUpDown className="h-4 w-4 text-[#106df9]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics?.totalTransfers || 0}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {t("transfers.metrics.allTimeTransfers")}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t("transfers.metrics.monthlyTransfers")}
                </CardTitle>
                <Calendar className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics?.monthlyTransfers || 0}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {t("transfers.metrics.thisMonth")}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t("transfers.metrics.activeTransfers")}
                </CardTitle>
                <Package className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {
                    (transfersList || []).filter(
                      (t) => new Date(t.transferDate) > new Date()
                    ).length
                  }
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {t("transfers.metrics.pendingTransfers")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Search and Filters */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {t("transfers.filters.title")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {showFilters
                      ? t("transfers.filters.hideFilters")
                      : t("transfers.filters.showFilters")}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {t("transfers.export")}
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
                    placeholder={t("transfers.filters.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Date Range Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("transfers.filters.fromDate")}
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
                      {t("transfers.filters.toDate")}
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
                    {t("transfers.filters.clearAllFilters")}
                  </Button>
                  <div className="text-sm text-gray-500">
                    {pagination && (
                      <>
                        {t("transfers.filters.showing")}{" "}
                        {(currentPage - 1) * pageSize + 1}{" "}
                        {t("transfers.filters.to")}{" "}
                        {Math.min(currentPage * pageSize, pagination.total)}{" "}
                        {t("transfers.filters.of")} {pagination.total}{" "}
                        {t("transfers.filters.transfers")}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setCurrentPage(1); // Reset to first page when changing tabs
            }}
          >
            <TabsList className="bg-white">
              <TabsTrigger value="all">
                {t("transfers.tabs.allTransfers")}
              </TabsTrigger>
              <TabsTrigger value="customer">
                {t("transfers.tabs.customerTransfers")}
              </TabsTrigger>
              <TabsTrigger value="inventory">
                {t("transfers.tabs.inventoryTransfers")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {transfersList.length === 0 ? (
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("transfers.emptyState.noTransfers")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm
                        ? t("transfers.emptyState.noTransfersSearch")
                        : t("transfers.emptyState.noTransfersDescription")}
                    </p>
                    <Button
                      onClick={openAddModal}
                      className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("transfers.addTransfer")}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {transfersList.map((transfer) => (
                    <motion.div
                      key={transfer.id}
                      variants={itemVariants}
                      className="group"
                    >
                      <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                transfer.type === "customer"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {transfer.type === "customer"
                                ? t("transfers.transferCard.customer")
                                : t("transfers.transferCard.inventory")}
                            </Badge>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(transfer)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(transfer.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="font-medium">
                                {t("transfers.transferCard.from")}
                              </span>
                              <span className="ml-1">
                                {transfer.fromLocation || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="font-medium">
                                {t("transfers.transferCard.to")}
                              </span>
                              <span className="ml-1">
                                {transfer.toLocation}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <Package className="h-4 w-4 mr-2" />
                              <span>
                                {t("transfers.transferCard.quantity")}{" "}
                                {transfer.quantity}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{formatDate(transfer.transferDate)}</span>
                            </div>
                          </div>

                          {transfer.type === "inventory" &&
                            transfer.inventoryItemId && (
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Package className="h-4 w-4 mr-2" />
                                  <span className="font-medium">
                                    {t("transfers.transferCard.item")}
                                  </span>
                                  <span className="ml-1">
                                    {inventoryItems.find(
                                      (item) =>
                                        item.id === transfer.inventoryItemId
                                    )?.productName ||
                                      t("transfers.transferCard.unknownItem")}
                                  </span>
                                </div>
                                {transfer.deductFromStock && (
                                  <div className="flex items-center mt-1">
                                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                      {t(
                                        "transfers.transferCard.stockDeducted"
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                          {transfer.description && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">
                                {t("transfers.transferCard.description")}
                              </span>
                              <p className="mt-1">{transfer.description}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                            <span>
                              {t("transfers.transferCard.createdBy")}{" "}
                              {transfer.creator.firstName}{" "}
                              {transfer.creator.lastName}
                            </span>
                            <span>{formatDate(transfer.createdAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      {t("transfers.pagination.rowsPerPage")}
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
                      {t("transfers.pagination.previous")}
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.pages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
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
                      disabled={currentPage === pagination.pages}
                    >
                      {t("transfers.pagination.next")}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Add/Edit Transfer Modal */}
        {(showAddTransferModal || showEditTransferModal) && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {showAddTransferModal
                      ? t("transfers.form.addTitle")
                      : t("transfers.form.editTitle")}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeModals}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("transfers.form.transferType")}
                    </label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "customer" | "inventory") =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">
                          {t("transfers.form.customerTransfer")}
                        </SelectItem>
                        <SelectItem value="inventory">
                          {t("transfers.form.inventoryTransfer")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type === "inventory" && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {t("transfers.form.inventoryItem")}
                      </label>
                      <Select
                        value={formData.inventoryItemId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, inventoryItemId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "transfers.form.selectInventoryItem"
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{item.productName}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  (Stock: {item.currentStock})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("transfers.form.quantity")}
                    </label>
                    <Input
                      type="number"
                      placeholder={t("transfers.form.quantityPlaceholder")}
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("transfers.form.fromLocation")}
                    </label>
                    <Input
                      placeholder={t("transfers.form.fromLocationPlaceholder")}
                      value={formData.fromLocation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fromLocation: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("transfers.form.toLocation")}
                    </label>
                    <Input
                      placeholder={t("transfers.form.toLocationPlaceholder")}
                      value={formData.toLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, toLocation: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("transfers.form.transferDate")}
                    </label>
                    <Input
                      type="date"
                      value={formData.transferDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          transferDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t("transfers.form.description")}
                    </label>
                    <Textarea
                      placeholder={t("transfers.form.descriptionPlaceholder")}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  {formData.type === "inventory" &&
                    formData.inventoryItemId && (
                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="deductFromStock"
                            checked={formData.deductFromStock}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                deductFromStock: !!checked,
                              })
                            }
                          />
                          <label
                            htmlFor="deductFromStock"
                            className="text-sm font-medium text-gray-700"
                          >
                            {t("transfers.form.deductFromStock")}
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("transfers.form.deductFromStockDescription")}
                        </p>
                      </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModals}
                    disabled={
                      createTransferMutation.isPending ||
                      updateTransferMutation.isPending
                    }
                  >
                    {t("transfers.form.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#106df9] hover:bg-[#106df9]/90 text-white"
                    disabled={
                      createTransferMutation.isPending ||
                      updateTransferMutation.isPending
                    }
                  >
                    {createTransferMutation.isPending ||
                    updateTransferMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : showAddTransferModal ? (
                      t("transfers.form.createTransfer")
                    ) : (
                      t("transfers.form.updateTransfer")
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </FeatureLock>
  );
};

export default TransfersPage;
