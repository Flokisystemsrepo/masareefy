import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  CreditCard,
  DollarSign,
  PiggyBank,
  Building,
  ArrowRight,
  CheckCircle,
  X,
  Clock,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { walletAPI, revenuesAPI, costsAPI } from "@/services/api";
import FeatureLock from "@/components/FeatureLock";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { Package, Users } from "lucide-react";
import { UpgradePromptModal } from "@/components/UpgradePromptModal";
import { useNavigate } from "react-router-dom";

interface WalletData {
  id: string;
  name: string;
  balance: number;
  type: string;
  currency: string;
  color: string;
  createdAt: string;
}

interface WalletTransaction {
  id: string;
  type: "credit" | "debit" | "transfer";
  amount: number;
  description: string;
  fromWallet?: string;
  toWallet?: string;
  date: string;
  status: "completed" | "pending" | "failed";
  category?: string;
  countAsRevenue?: boolean;
  countAsCost?: boolean;
}

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const { subscription, getPlanLimit } = useSubscription();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [operationLoading, setOperationLoading] = useState(false);
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [showEditWalletModal, setShowEditWalletModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTransactionConfirm, setShowTransactionConfirm] = useState(false);
  const [showTransactionSuccess, setShowTransactionSuccess] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeResourceType, setUpgradeResourceType] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [transactionType, setTransactionType] = useState<
    "transfer" | "credit" | "debit"
  >("credit");
  const [activeTab, setActiveTab] = useState("wallets");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    type: "CUSTOM",
    currency: "EGP",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
  });

  const [transactionForm, setTransactionForm] = useState({
    amount: "",
    description: "",
    fromWalletId: "",
    toWalletId: "",
    countAsRevenue: false,
    countAsCost: false,
    category: "",
  });

  const walletColors = [
    { name: "Blue", class: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { name: "Green", class: "bg-gradient-to-br from-green-500 to-green-600" },
    {
      name: "Purple",
      class: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      name: "Orange",
      class: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
    { name: "Red", class: "bg-gradient-to-br from-red-500 to-red-600" },
    {
      name: "Indigo",
      class: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    },
    { name: "Pink", class: "bg-gradient-to-br from-pink-500 to-pink-600" },
    {
      name: "Yellow",
      class: "bg-gradient-to-br from-yellow-500 to-yellow-600",
    },
    { name: "Teal", class: "bg-gradient-to-br from-teal-500 to-teal-600" },
    { name: "Gray", class: "bg-gradient-to-br from-gray-500 to-gray-600" },
  ];

  const walletTypes = [
    {
      value: "BUSINESS",
      label: t("wallet.walletTypes.business"),
      icon: Building,
    },
    {
      value: "PERSONAL",
      label: t("wallet.walletTypes.personal"),
      icon: CreditCard,
    },
    {
      value: "SAVINGS",
      label: t("wallet.walletTypes.savings"),
      icon: PiggyBank,
    },
    { value: "CUSTOM", label: t("wallet.walletTypes.custom"), icon: Wallet },
  ];

  useEffect(() => {
    loadWallets();
  }, []); // Empty dependency array to run only once on mount

  const loadWallets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const walletsData = await walletAPI.getAll();
      setWallets(walletsData || []);

      // Load all transactions for the brand
      try {
        const transactionsData = await walletAPI.getAllTransactions();
        console.log("Loaded transactions:", transactionsData);
        // The API returns { transactions: [...], pagination: {...} }
        setTransactions(
          transactionsData?.transactions || transactionsData || []
        );
      } catch (error) {
        console.warn("Failed to load transactions:", error);
        setTransactions([]);
      }
    } catch (error: any) {
      console.error("Error loading wallets:", error);
      setError(error.message || "Failed to load wallets");
      toast({
        title: "Error",
        description: error.message || t("wallet.messages.failedToLoad"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getWalletIcon = (type: string) => {
    const walletType = walletTypes.find((t) => t.value === type);
    return walletType ? walletType.icon : Wallet;
  };

  const openAddModal = () => {
    // Check wallet limit before opening add modal
    const walletLimit = getPlanLimit("wallets");
    const isAtLimit = walletLimit !== -1 && wallets.length >= walletLimit;

    if (isAtLimit) {
      toast({
        title: "Limit Reached",
        description: `You have reached your limit of ${walletLimit} wallets. Please upgrade your plan to add more wallets.`,
        variant: "destructive",
      });
      setUpgradeResourceType("wallets");
      setShowUpgradeModal(true);
      return;
    }

    setFormData({
      name: "",
      balance: "",
      type: "CUSTOM",
      currency: "EGP",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    });
    setShowAddWalletModal(true);
  };

  const openWalletDetails = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setShowWalletDetails(true);
  };

  const openEditModal = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setFormData({
      name: wallet.name,
      balance: wallet.balance.toString(),
      type: wallet.type,
      currency: wallet.currency,
      color: wallet.color,
    });
    setShowEditWalletModal(true);
  };

  const openDeleteConfirm = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setShowDeleteConfirm(true);
  };

  const openTransactionModal = (type: "transfer" | "credit" | "debit") => {
    setTransactionType(type);
    setTransactionForm({
      amount: "",
      description: "",
      fromWalletId: wallets[0]?.id || "",
      toWalletId:
        type === "credit" ? wallets[0]?.id || "" : wallets[1]?.id || "",
      countAsRevenue: false,
      countAsCost: false,
      category: "",
    });
    setShowTransactionModal(true);
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setOperationLoading(true);
      const amount = parseFloat(transactionForm.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: t("wallet.messages.validAmount"),
          variant: "destructive",
        });
        return;
      }

      // Validate sufficient balance for transfer and debit
      if (transactionType === "transfer" || transactionType === "debit") {
        const fromWallet = wallets.find(
          (w) => w.id === transactionForm.fromWalletId
        );
        if (fromWallet && fromWallet.balance < amount) {
          toast({
            title: "Error",
            description: t("wallet.messages.insufficientBalance", {
              amount: formatCurrency(fromWallet.balance, fromWallet.currency),
            }),
            variant: "destructive",
          });
          return;
        }
      }

      // Ensure we have valid wallet IDs or undefined (not empty strings)
      const fromWalletId =
        transactionType === "credit"
          ? undefined
          : transactionForm.fromWalletId &&
            transactionForm.fromWalletId.trim() !== ""
          ? transactionForm.fromWalletId
          : undefined;

      const toWalletId =
        transactionType === "transfer" || transactionType === "credit"
          ? transactionForm.toWalletId &&
            transactionForm.toWalletId.trim() !== ""
            ? transactionForm.toWalletId
            : undefined
          : undefined;

      const transactionData = {
        type: transactionType,
        amount,
        description: transactionForm.description,
        fromWalletId,
        toWalletId,
        category: transactionForm.category || undefined,
        countAsRevenue: transactionForm.countAsRevenue,
        countAsCost: transactionForm.countAsCost,
      };

      console.log("Frontend - Transaction data being sent:", transactionData);
      console.log("Frontend - Transaction form state:", transactionForm);
      console.log(
        "Frontend - Available wallets:",
        wallets.map((w) => ({ id: w.id, name: w.name }))
      );

      const transactionResult = await walletAPI.createTransaction(
        transactionData
      );

      console.log("Frontend - Transaction created:", transactionResult);

      // Handle revenue/cost integration
      if (transactionForm.countAsRevenue && transactionType === "credit") {
        try {
          await revenuesAPI.create({
            name: transactionForm.description,
            amount: amount,
            category: transactionForm.category || "Wallet Credit",
            date: new Date().toISOString(),
            source: "Wallet Transaction",
            receiptUrl: undefined,
          });
          console.log("Revenue created from wallet transaction");
        } catch (error) {
          console.error(
            "Failed to create revenue from wallet transaction:",
            error
          );
          toast({
            title: "Warning",
            description: t(
              "wallet.messages.transactionCompletedButFailedRevenue"
            ),
            variant: "destructive",
          });
        }
      }

      if (transactionForm.countAsCost && transactionType === "debit") {
        try {
          await costsAPI.create({
            name: transactionForm.description,
            amount: amount,
            category: transactionForm.category || "Wallet Debit",
            costType: "variable",
            date: new Date().toISOString(),
            vendor: "Wallet Transaction",
            receiptUrl: undefined,
          });
          console.log("Cost created from wallet transaction");
        } catch (error) {
          console.error(
            "Failed to create cost from wallet transaction:",
            error
          );
          toast({
            title: "Warning",
            description: t("wallet.messages.transactionCompletedButFailedCost"),
            variant: "destructive",
          });
        }
      }

      // Optimistic update for wallet balances - more efficient approach
      setWallets((prevWallets) => {
        return prevWallets.map((wallet) => {
          if (transactionType === "credit" && wallet.id === toWalletId) {
            return { ...wallet, balance: wallet.balance + amount };
          } else if (
            transactionType === "debit" &&
            wallet.id === fromWalletId
          ) {
            return { ...wallet, balance: wallet.balance - amount };
          } else if (transactionType === "transfer") {
            if (wallet.id === fromWalletId) {
              return { ...wallet, balance: wallet.balance - amount };
            } else if (wallet.id === toWalletId) {
              return { ...wallet, balance: wallet.balance + amount };
            }
          }
          return wallet;
        });
      });

      // Add the new transaction to the transactions list using the actual API response
      const newTransaction = {
        id: transactionResult.id,
        type: transactionResult.type,
        amount: transactionResult.amount,
        description: transactionResult.description,
        fromWallet: transactionResult.fromWalletId,
        toWallet: transactionResult.toWalletId,
        date: transactionResult.date,
        status: transactionResult.status,
        category: transactionResult.category,
        countAsRevenue: transactionResult.countAsRevenue,
        countAsCost: transactionResult.countAsCost,
      };

      console.log("Frontend - Adding transaction to state:", newTransaction);

      // Update transactions state without triggering a full page reload
      setTransactions((prevTransactions) => [
        newTransaction,
        ...prevTransactions,
      ]);

      toast({
        title: "Success",
        description: t("wallet.messages.transactionCompleted"),
      });

      setShowTransactionModal(false);
      setShowTransactionConfirm(false);
      setShowTransactionSuccess(true);

      // Auto-hide success modal after 3 seconds
      setTimeout(() => {
        setShowTransactionSuccess(false);
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || t("wallet.messages.failedToProcess"),
        variant: "destructive",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTransactionModal(false);
    setShowTransactionConfirm(true);
  };

  const confirmTransaction = () => {
    handleTransaction(new Event("submit") as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check wallet limit before creating new wallet
    if (!showEditWalletModal) {
      const walletLimit = getPlanLimit("wallets");
      const isAtLimit = walletLimit !== -1 && wallets.length >= walletLimit;

      if (isAtLimit) {
        toast({
          title: "Limit Reached",
          description: `You have reached your limit of ${walletLimit} wallets. Please upgrade your plan to add more wallets.`,
          variant: "destructive",
        });
        setUpgradeResourceType("wallets");
        setShowUpgradeModal(true);
        setShowAddWalletModal(false);
        return;
      }
    }

    // Validate form data
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: t("wallet.messages.walletNameRequired"),
        variant: "destructive",
      });
      return;
    }

    const balance = parseFloat(formData.balance);
    if (isNaN(balance) || balance < 0) {
      toast({
        title: "Error",
        description: t("wallet.messages.validBalance"),
        variant: "destructive",
      });
      return;
    }

    try {
      setOperationLoading(true);
      const submitData = {
        name: formData.name.trim(),
        balance: balance,
        type: formData.type,
        currency: formData.currency,
        color: formData.color,
      };

      if (showEditWalletModal && selectedWallet) {
        const updatedWallet = await walletAPI.update(
          selectedWallet.id,
          submitData
        );
        // Optimistic update
        setWallets((prevWallets) =>
          prevWallets.map((wallet) =>
            wallet.id === selectedWallet.id ? updatedWallet : wallet
          )
        );
        toast({
          title: "Success",
          description: t("wallet.messages.walletUpdated"),
        });
      } else {
        console.log("Creating wallet with data:", submitData);
        const newWallet = await walletAPI.create(submitData);
        console.log("Wallet creation result:", newWallet);
        // Optimistic update
        setWallets((prevWallets) => [newWallet, ...prevWallets]);
        // Invalidate usage tracking
        queryClient.invalidateQueries({ queryKey: ["usage", user?.brandId] });
        toast({
          title: "Success",
          description: t("wallet.messages.walletCreated"),
        });
      }

      setShowAddWalletModal(false);
      setShowEditWalletModal(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || t("wallet.messages.failedToSave"),
        variant: "destructive",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWallet) return;

    try {
      setOperationLoading(true);
      await walletAPI.delete(selectedWallet.id);
      // Optimistic update
      setWallets((prevWallets) =>
        prevWallets.filter((wallet) => wallet.id !== selectedWallet.id)
      );
      // Invalidate usage tracking
      queryClient.invalidateQueries({ queryKey: ["usage", user?.brandId] });
      toast({
        title: "Success",
        description: t("wallet.messages.walletDeleted"),
      });
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || t("wallet.messages.failedToDelete"),
        variant: "destructive",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const filteredWallets = wallets.filter((wallet) => {
    const matchesSearch = wallet.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "active" && wallet.balance > 0) ||
      (filterType === "empty" && wallet.balance === 0);

    return matchesSearch && matchesFilter;
  });

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const totalWallets = wallets.length;
  const activeWallets = wallets.filter((w) => w.balance > 0).length;

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">{t("wallet.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={loadWallets}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("wallet.retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FeatureLock featureName="Wallet Management">
      <div
        className={`p-6 space-y-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen ${
          isRTL ? "rtl" : "ltr"
        }`}
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("wallet.title")}
            </h1>
            <p className="text-gray-600 text-sm">{t("wallet.subtitle")}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              {t("wallet.export")}
            </Button>
            <Button
              onClick={() => {
                const walletLimit = getPlanLimit("wallets");
                const currentWallets = wallets.length;

                if (walletLimit === -1 || currentWallets < walletLimit) {
                  openAddModal();
                } else {
                  setUpgradeResourceType("wallets");
                  setShowUpgradeModal(true);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("wallet.addWallet")}
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {[
            {
              title: t("wallet.metrics.totalBalance"),
              value: formatCurrency(totalBalance, "EGP"),
              change: "+5.2%",
              trend: "up",
              icon: DollarSign,
              color: "green",
            },
            {
              title: t("wallet.metrics.totalWallets"),
              value: (() => {
                const walletLimit = getPlanLimit("wallets");
                return walletLimit === -1
                  ? totalWallets.toString()
                  : `${totalWallets}/${walletLimit}`;
              })(),
              change: (() => {
                const walletLimit = getPlanLimit("wallets");
                if (walletLimit === -1) return "+2";
                const remaining = walletLimit - totalWallets;
                return `${remaining} ${t("wallet.metrics.remaining")}`;
              })(),
              trend: "up",
              icon: Wallet,
              color: (() => {
                const walletLimit = getPlanLimit("wallets");
                if (walletLimit === -1) return "blue";
                if (totalWallets >= walletLimit) return "red";
                if (totalWallets >= walletLimit * 0.8) return "yellow";
                return "blue";
              })(),
            },
            {
              title: t("wallet.metrics.activeWallets"),
              value: activeWallets.toString(),
              change: "+1",
              trend: "up",
              icon: TrendingUp,
              color: "purple",
            },
            {
              title: t("wallet.metrics.recentTransactions"),
              value: transactions.length.toString(),
              change: "+12",
              trend: "up",
              icon: ArrowUpRight,
              color: "orange",
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 h-32">
                <CardContent className="p-6 h-full">
                  <div className="flex items-center justify-between h-full">
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </p>
                      <div className="flex items-center space-x-1">
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            metric.trend === "up"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {metric.change}
                        </span>
                        <span className="text-sm text-gray-500">
                          {t("wallet.metrics.vsLastMonth")}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-lg bg-${metric.color}-100 flex items-center justify-center flex-shrink-0`}
                    >
                      <metric.icon
                        className={`h-6 w-6 text-${metric.color}-600`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wallets" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                {t("wallet.tabs.wallets")}
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                {t("wallet.tabs.transactions")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wallets" className="space-y-4">
              {/* Search and Filters */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("wallet.filters.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={filterType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("all")}
                  >
                    {t("wallet.filters.all")}
                  </Button>
                  <Button
                    variant={filterType === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("active")}
                  >
                    {t("wallet.filters.active")}
                  </Button>
                  <Button
                    variant={filterType === "empty" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("empty")}
                  >
                    {t("wallet.filters.empty")}
                  </Button>
                </div>
              </motion.div>

              {/* Wallets Grid - 2D Card Design */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {filteredWallets.map((wallet, index) => {
                  const WalletIcon = getWalletIcon(wallet.type);

                  return (
                    <motion.div
                      key={wallet.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="group"
                    >
                      {/* 2D Wallet Card */}
                      <div className="relative">
                        <div
                          className={`relative w-full h-48 rounded-xl shadow-lg overflow-hidden cursor-pointer ${wallet.color} transform transition-all duration-300 hover:shadow-xl group-hover:scale-105`}
                        >
                          {/* Card Background Pattern */}
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -translate-y-12 translate-x-12"></div>
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
                          </div>

                          {/* Card Content */}
                          <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                            {/* Top Section */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                  <WalletIcon className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-white/80 text-xs font-medium">
                                    {t("wallet.cardLabels.cardHolder")}
                                  </p>
                                  <p className="text-white font-semibold text-sm">
                                    {wallet.name}
                                  </p>
                                </div>
                              </div>

                              {/* Card Type Badge */}
                              <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                                <p className="text-white text-xs font-medium">
                                  {wallet.type}
                                </p>
                              </div>
                            </div>

                            {/* Middle Section - Card Number */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                {/* Card Chip */}
                                <div className="relative w-8 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow-md">
                                  <div className="absolute inset-0.5 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-sm"></div>
                                  <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                                  <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                                  <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                                  <div className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                                </div>

                                {/* Contactless Symbol */}
                                <div className="flex items-center space-x-1">
                                  <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                                    <div className="w-3 h-3 border border-white/60 rounded-full"></div>
                                  </div>
                                  <div className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 border border-white/60 rounded-full"></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bottom Section */}
                            <div className="flex items-end justify-between">
                              <div className="text-right space-y-1">
                                <p className="text-white/60 text-xs">
                                  {t("wallet.cardLabels.balance")}
                                </p>
                                <p className="text-white font-bold text-sm">
                                  {formatCurrency(
                                    wallet.balance,
                                    wallet.currency
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons - Hidden by default, shown on hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openWalletDetails(wallet);
                                }}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                {t("wallet.actions.view")}
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(wallet);
                                }}
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                {t("wallet.actions.edit")}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteConfirm(wallet);
                                }}
                                className="bg-red-500/80 hover:bg-red-600/80 text-white"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {t("wallet.actions.delete")}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTransactionType("credit");
                              setTransactionForm({
                                ...transactionForm,
                                toWalletId: wallet.id,
                                countAsRevenue: false,
                                countAsCost: false,
                                category: "",
                              });
                              setShowTransactionModal(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg text-xs px-2 py-1"
                          >
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            {t("wallet.actions.credit")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTransactionType("debit");
                              setTransactionForm({
                                ...transactionForm,
                                fromWalletId: wallet.id,
                                countAsRevenue: false,
                                countAsCost: false,
                                category: "",
                              });
                              setShowTransactionModal(true);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg text-xs px-2 py-1"
                          >
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            {t("wallet.actions.debit")}
                          </Button>
                        </div>

                        {/* Status Indicator */}
                        <div className="absolute top-3 right-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              wallet.balance > 0
                                ? "bg-green-400"
                                : "bg-gray-400"
                            } shadow-sm`}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Empty State */}
              {filteredWallets.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("wallet.emptyState.noWallets")}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? t("wallet.emptyState.noWalletsSearch")
                      : t("wallet.emptyState.noWalletsDescription")}
                  </p>
                  <Button
                    onClick={openAddModal}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("wallet.addWallet")}
                  </Button>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              {/* Transaction Management Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t("wallet.transactions.title")}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {t("wallet.transactions.subtitle")}
                  </p>
                </div>
              </motion.div>

              {/* Transaction Type Tabs */}
              <Tabs
                value={filterType}
                onValueChange={setFilterType}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">
                    {t("wallet.transactions.allTransactions")}
                  </TabsTrigger>
                  <TabsTrigger value="credit">
                    {t("wallet.transactions.creditTransactions")}
                  </TabsTrigger>
                  <TabsTrigger value="debit">
                    {t("wallet.transactions.debitTransactions")}
                  </TabsTrigger>
                  <TabsTrigger value="transfer">
                    {t("wallet.transactions.transferTransactions")}
                  </TabsTrigger>
                </TabsList>

                {/* ALL Tab */}
                <TabsContent value="all" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {t("wallet.transactions.allTransactions")}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => {
                          setTransactionType("credit");
                          setTransactionForm({
                            amount: "",
                            description: "",
                            fromWalletId: wallets[0]?.id || "",
                            toWalletId: wallets[0]?.id || "",
                            countAsRevenue: false,
                            countAsCost: false,
                            category: "",
                          });
                          setShowTransactionModal(true);
                        }}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 gap-2"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        {t("wallet.transactions.addCredit")}
                      </Button>
                      <Button
                        onClick={() => {
                          setTransactionType("debit");
                          setTransactionForm({
                            amount: "",
                            description: "",
                            fromWalletId: wallets[0]?.id || "",
                            toWalletId: wallets[1]?.id || "",
                            countAsRevenue: false,
                            countAsCost: false,
                            category: "",
                          });
                          setShowTransactionModal(true);
                        }}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 gap-2"
                      >
                        <ArrowDownRight className="h-4 w-4" />
                        {t("wallet.transactions.addDebit")}
                      </Button>
                      <Button
                        onClick={() => {
                          setTransactionType("transfer");
                          setTransactionForm({
                            amount: "",
                            description: "",
                            fromWalletId: wallets[0]?.id || "",
                            toWalletId: wallets[1]?.id || "",
                            countAsRevenue: false,
                            countAsCost: false,
                            category: "",
                          });
                          setShowTransactionModal(true);
                        }}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        <ArrowRight className="h-4 w-4" />
                        {t("wallet.transactions.addTransfer")}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* CREDITS Tab */}
                <TabsContent value="credit" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {t("wallet.transactions.creditTransactions")}
                    </h3>
                    <Button
                      onClick={() => {
                        setTransactionType("credit");
                        setTransactionForm({
                          amount: "",
                          description: "",
                          fromWalletId: wallets[0]?.id || "",
                          toWalletId: wallets[0]?.id || "",
                          countAsRevenue: false,
                          countAsCost: false,
                          category: "",
                        });
                        setShowTransactionModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      {t("wallet.transactions.addCredit")}
                    </Button>
                  </div>
                </TabsContent>

                {/* DEBITS Tab */}
                <TabsContent value="debit" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {t("wallet.transactions.debitTransactions")}
                    </h3>
                    <Button
                      onClick={() => {
                        setTransactionType("debit");
                        setTransactionForm({
                          amount: "",
                          description: "",
                          fromWalletId: wallets[0]?.id || "",
                          toWalletId: wallets[1]?.id || "",
                          countAsRevenue: false,
                          countAsCost: false,
                          category: "",
                        });
                        setShowTransactionModal(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 gap-2"
                    >
                      <ArrowDownRight className="h-4 w-4" />
                      {t("wallet.transactions.addDebit")}
                    </Button>
                  </div>
                </TabsContent>

                {/* TRANSFERS Tab */}
                <TabsContent value="transfer" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {t("wallet.transactions.transferTransactions")}
                    </h3>
                    <Button
                      onClick={() => {
                        setTransactionType("transfer");
                        setTransactionForm({
                          amount: "",
                          description: "",
                          fromWalletId: wallets[0]?.id || "",
                          toWalletId: wallets[1]?.id || "",
                          countAsRevenue: false,
                          countAsCost: false,
                          category: "",
                        });
                        setShowTransactionModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      {t("wallet.transactions.addTransfer")}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Transaction History */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {t("wallet.transactions.transactionHistory")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Filter transactions based on selected tab
                      const filteredTransactions =
                        filterType === "all"
                          ? transactions
                          : transactions.filter(
                              (transaction) => transaction.type === filterType
                            );

                      return filteredTransactions.length === 0 ? (
                        <div className="text-center py-8">
                          <ArrowRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filterType === "all"
                              ? t("wallet.transactions.noTransactions")
                              : t("wallet.transactions.noTransactionsType", {
                                  type: filterType,
                                })}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {filterType === "all"
                              ? t("wallet.transactions.startFirstTransaction")
                              : t(
                                  "wallet.transactions.startFirstTransactionType",
                                  { type: filterType }
                                )}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    transaction.type === "credit"
                                      ? "bg-green-100"
                                      : transaction.type === "debit"
                                      ? "bg-red-100"
                                      : "bg-blue-100"
                                  }`}
                                >
                                  {transaction.type === "credit" ? (
                                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                                  ) : transaction.type === "debit" ? (
                                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                                  ) : (
                                    <ArrowRight className="h-5 w-5 text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {transaction.description}
                                  </p>
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {new Date(
                                        transaction.date
                                      ).toLocaleDateString()}
                                    </span>
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {new Date(
                                        transaction.date
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`font-semibold text-lg ${
                                    transaction.type === "credit"
                                      ? "text-green-600"
                                      : transaction.type === "debit"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                  }`}
                                >
                                  {transaction.type === "credit" ? "+" : "-"}
                                  {formatCurrency(transaction.amount, "EGP")}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    transaction.status === "completed"
                                      ? "border-green-200 text-green-700"
                                      : transaction.status === "pending"
                                      ? "border-yellow-200 text-yellow-700"
                                      : "border-red-200 text-red-700"
                                  }`}
                                >
                                  {t(
                                    `wallet.transactions.status.${transaction.status}`
                                  )}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Add/Edit Wallet Modal */}
        {(showAddWalletModal || showEditWalletModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <h2 className="text-xl font-bold mb-6">
                {showEditWalletModal
                  ? t("wallet.form.editTitle")
                  : t("wallet.form.addTitle")}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section - Left Side */}
                <div className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("wallet.form.walletName")}
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder={t("wallet.form.walletNamePlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("wallet.form.initialBalance")}
                      </label>
                      <Input
                        type="number"
                        value={formData.balance}
                        onChange={(e) =>
                          setFormData({ ...formData, balance: e.target.value })
                        }
                        placeholder={t("wallet.form.balancePlaceholder")}
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("wallet.form.type")}
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        {walletTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("wallet.form.currency")}
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) =>
                          setFormData({ ...formData, currency: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="EGP">EGP</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("wallet.form.colorTheme")}
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {walletColors.map((color, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`w-10 h-10 rounded-lg ${color.class} ${
                              formData.color === color.class
                                ? "ring-2 ring-blue-500 ring-offset-2"
                                : ""
                            } transition-all duration-200 hover:scale-110`}
                            onClick={() =>
                              setFormData({ ...formData, color: color.class })
                            }
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddWalletModal(false);
                          setShowEditWalletModal(false);
                        }}
                        className="flex-1"
                      >
                        {t("wallet.form.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={operationLoading}
                      >
                        {operationLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {showEditWalletModal
                              ? t("wallet.form.updating")
                              : t("wallet.form.creating")}
                          </>
                        ) : showEditWalletModal ? (
                          t("wallet.form.update")
                        ) : (
                          t("wallet.form.create")
                        )}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Card Preview Section - Right Side */}
                <div className="flex flex-col items-center justify-center">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    {t("wallet.form.liveCardPreview")}
                  </label>
                  <div className="bg-gray-50 rounded-lg p-6 flex justify-center w-full">
                    <div
                      className={`relative w-96 h-56 rounded-xl shadow-lg overflow-hidden ${formData.color}`}
                    >
                      {/* Card Background Pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -translate-y-12 translate-x-12"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
                      </div>

                      {/* Card Content */}
                      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                        {/* Top Section */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                              {(() => {
                                const WalletIcon = getWalletIcon(formData.type);
                                return (
                                  <WalletIcon className="h-4 w-4 text-white" />
                                );
                              })()}
                            </div>
                            <div>
                              <p className="text-white/80 text-xs font-medium">
                                {t("wallet.cardLabels.cardHolder")}
                              </p>
                              <p className="text-white font-semibold text-sm">
                                {formData.name || "Wallet Name"}
                              </p>
                            </div>
                          </div>

                          {/* Card Type Badge */}
                          <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                            <p className="text-white text-xs font-medium">
                              {walletTypes.find(
                                (t) => t.value === formData.type
                              )?.label || "Type"}
                            </p>
                          </div>
                        </div>

                        {/* Middle Section - Card Number */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            {/* Card Chip */}
                            <div className="relative w-8 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow-md">
                              <div className="absolute inset-0.5 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-sm"></div>
                              <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                              <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                              <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                              <div className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                            </div>

                            {/* Contactless Symbol */}
                            <div className="flex items-center space-x-1">
                              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 border border-white/60 rounded-full"></div>
                              </div>
                              <div className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 border border-white/60 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="flex items-end justify-between">
                          <div className="text-right space-y-1">
                            <p className="text-white/60 text-xs">
                              {t("wallet.cardLabels.balance")}
                            </p>
                            <p className="text-white font-bold text-sm">
                              {formData.balance
                                ? formatCurrency(
                                    parseFloat(formData.balance),
                                    formData.currency
                                  )
                                : "0.00"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <h2 className="text-xl font-bold mb-4">
                {transactionType === "credit"
                  ? "Credit Wallet"
                  : transactionType === "debit"
                  ? "Debit Wallet"
                  : "Transfer Between Wallets"}
              </h2>
              <form onSubmit={handleTransaction} className="space-y-4">
                {transactionType === "transfer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Wallet
                    </label>
                    <select
                      value={transactionForm.fromWalletId}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          fromWalletId: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name} (
                          {formatCurrency(wallet.balance, wallet.currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {transactionType === "transfer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Wallet
                    </label>
                    <select
                      value={transactionForm.toWalletId}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          toWalletId: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name} (
                          {formatCurrency(wallet.balance, wallet.currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <Input
                    type="number"
                    value={transactionForm.amount}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder={t("wallet.transactionForm.amountPlaceholder")}
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Input
                    value={transactionForm.description}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter transaction description"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTransactionModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={operationLoading}
                  >
                    {operationLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Process Transaction"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <h2 className="text-xl font-bold mb-4">Delete Wallet</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedWallet?.name}"? This
                action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={operationLoading}
                >
                  {operationLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Wallet Details Modal */}
        {showWalletDetails && selectedWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Wallet Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWalletDetails(false)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* 2D Card View */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4 text-gray-900">
                    Card View
                  </h4>
                  <div
                    className={`relative w-full h-48 rounded-xl shadow-lg overflow-hidden ${selectedWallet.color}`}
                  >
                    {/* Card Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -translate-y-12 translate-x-12"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                      {/* Top Section */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            {(() => {
                              const WalletIcon = getWalletIcon(
                                selectedWallet.type
                              );
                              return (
                                <WalletIcon className="h-4 w-4 text-white" />
                              );
                            })()}
                          </div>
                          <div>
                            <p className="text-white/80 text-xs font-medium">
                              CARD HOLDER
                            </p>
                            <p className="text-white font-semibold text-sm">
                              {selectedWallet.name}
                            </p>
                          </div>
                        </div>

                        {/* Card Type Badge */}
                        <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                          <p className="text-white text-xs font-medium">
                            {selectedWallet.type}
                          </p>
                        </div>
                      </div>

                      {/* Middle Section - Card Number */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          {/* Card Chip */}
                          <div className="relative w-8 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow-md">
                            <div className="absolute inset-0.5 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-sm"></div>
                            <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                            <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                            <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                            <div className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-yellow-700 rounded-full"></div>
                          </div>

                          {/* Contactless Symbol */}
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 border border-white/60 rounded-full"></div>
                            </div>
                            <div className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 border border-white/60 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="flex items-end justify-between">
                        <div className="text-right space-y-1">
                          <p className="text-white/60 text-xs">BALANCE</p>
                          <p className="text-white font-bold text-sm">
                            {formatCurrency(
                              selectedWallet.balance,
                              selectedWallet.currency
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wallet Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Balance</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        selectedWallet.balance,
                        selectedWallet.currency
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="text-lg font-medium">
                      {selectedWallet.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-lg font-medium">
                      {new Date(selectedWallet.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge
                      variant={
                        selectedWallet.balance > 0 ? "default" : "secondary"
                      }
                      className={
                        selectedWallet.balance > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {selectedWallet.balance > 0 ? "Active" : "Empty"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Recent Transactions</h4>
                  <div className="space-y-2">
                    {transactions
                      .filter(
                        (t) =>
                          t.fromWallet === selectedWallet.id ||
                          t.toWallet === selectedWallet.id
                      )
                      .slice(0, 5)
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold ${
                                transaction.type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "credit" ? "+" : "-"}
                              {formatCurrency(
                                transaction.amount,
                                selectedWallet.currency
                              )}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <h2 className="text-xl font-bold mb-4">
                {transactionType === "credit"
                  ? "Credit Wallet"
                  : transactionType === "debit"
                  ? "Debit Wallet"
                  : "Transfer Between Wallets"}
              </h2>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                {transactionType === "transfer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Wallet
                    </label>
                    <select
                      value={transactionForm.fromWalletId}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          fromWalletId: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name} (
                          {formatCurrency(wallet.balance, wallet.currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {transactionType === "transfer" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Wallet
                    </label>
                    <select
                      value={transactionForm.toWalletId}
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          toWalletId: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name} (
                          {formatCurrency(wallet.balance, wallet.currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {(transactionType === "credit" ||
                  transactionType === "debit") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {transactionType === "credit"
                        ? "To Wallet"
                        : "From Wallet"}
                    </label>
                    <select
                      value={
                        transactionType === "credit"
                          ? transactionForm.toWalletId
                          : transactionForm.fromWalletId
                      }
                      onChange={(e) =>
                        setTransactionForm({
                          ...transactionForm,
                          [transactionType === "credit"
                            ? "toWalletId"
                            : "fromWalletId"]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name} (
                          {formatCurrency(wallet.balance, wallet.currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <Input
                    type="number"
                    value={transactionForm.amount}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder={t("wallet.transactionForm.amountPlaceholder")}
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Input
                    value={transactionForm.description}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter transaction description"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <Input
                    value={transactionForm.category}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        category: e.target.value,
                      })
                    }
                    placeholder="Enter category (optional)"
                  />
                </div>

                {/* Revenue/Cost Integration */}
                {transactionType === "credit" && (
                  <div className="border-t pt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={transactionForm.countAsRevenue}
                        onChange={(e) =>
                          setTransactionForm({
                            ...transactionForm,
                            countAsRevenue: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Count as Revenue
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      This transaction will be added to your revenues section
                    </p>
                  </div>
                )}

                {transactionType === "debit" && (
                  <div className="border-t pt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={transactionForm.countAsCost}
                        onChange={(e) =>
                          setTransactionForm({
                            ...transactionForm,
                            countAsCost: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Count as Cost
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      This transaction will be added to your costs section
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTransactionModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={operationLoading}
                  >
                    {operationLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Transaction Confirmation Modal */}
        {showTransactionConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">Confirm Transaction</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to proceed with this transaction?
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Type:</span>
                    <Badge
                      variant="outline"
                      className={
                        transactionType === "credit"
                          ? "border-green-200 text-green-700"
                          : transactionType === "debit"
                          ? "border-red-200 text-red-700"
                          : "border-blue-200 text-blue-700"
                      }
                    >
                      {transactionType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Amount:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        parseFloat(transactionForm.amount || "0"),
                        "EGP"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Description:</span>
                    <span className="font-medium text-sm">
                      {transactionForm.description}
                    </span>
                  </div>
                  {transactionForm.category && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Category:</span>
                      <span className="font-medium text-sm">
                        {transactionForm.category}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowTransactionConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmTransaction}
                    className="flex-1"
                    disabled={operationLoading}
                  >
                    {operationLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Transaction Success Modal */}
        {showTransactionSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">
                  Transaction Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your transaction has been processed successfully.
                </p>

                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Type:</span>
                    <Badge
                      variant="outline"
                      className="border-green-200 text-green-700"
                    >
                      {transactionType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Amount:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(
                        parseFloat(transactionForm.amount || "0"),
                        "EGP"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Description:</span>
                    <span className="font-medium text-sm">
                      {transactionForm.description}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowTransactionSuccess(false)}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Upgrade Prompt Modal */}
        <UpgradePromptModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            // Navigate to subscription page
            const brandId = localStorage.getItem("brandId");
            if (brandId) {
              navigate(`/brand/${brandId}/subscription`);
            }
          }}
          resourceType={upgradeResourceType}
          currentPlan={
            subscription?.isFreePlan
              ? "Free"
              : subscription?.plan?.name || "Free"
          }
          limit={getPlanLimit(upgradeResourceType)}
          current={wallets.length}
        />
      </div>
    </FeatureLock>
  );
};

export default WalletPage;
