import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  AlertCircle,
  Info,
  Zap,
  Shield,
  Star,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  revenuesAPI,
  costsAPI,
  receivablesAPI,
  payablesAPI,
  walletAPI,
} from "@/services/api";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface FinancialMetrics {
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  profitMargin: number;
  receivables: number;
  payables: number;
  cashFlow: number;
  revenueGrowth: number;
  costGrowth: number;
  profitGrowth: number;
  topRevenueSources: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  topCostCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    costs: number;
    profit: number;
  }>;
  walletBalances: Array<{ name: string; balance: number; percentage: number }>;
}

interface FinancialReportProps {
  dateRange: DateRange;
  onGenerateReport: (type: string, format: "pdf" | "excel" | "csv") => void;
}

const FinancialReport: React.FC<FinancialReportProps> = ({
  dateRange,
  onGenerateReport,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    totalCosts: 0,
    totalProfit: 0,
    profitMargin: 0,
    receivables: 0,
    payables: 0,
    cashFlow: 0,
    revenueGrowth: 0,
    costGrowth: 0,
    profitGrowth: 0,
    topRevenueSources: [],
    topCostCategories: [],
    monthlyTrends: [],
    walletBalances: [],
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenues, costs, receivables, payables, wallets] =
        await Promise.all([
          revenuesAPI.getAll({
            dateFrom: dateRange.startDate,
            dateTo: dateRange.endDate,
          }),
          costsAPI.getAll({
            dateFrom: dateRange.startDate,
            dateTo: dateRange.endDate,
          }),
          receivablesAPI.getAll({
            dateFrom: dateRange.startDate,
            dateTo: dateRange.endDate,
          }),
          payablesAPI.getAll({
            dateFrom: dateRange.startDate,
            dateTo: dateRange.endDate,
          }),
          walletAPI.getAll(),
        ]);

      // Extract data arrays
      const revenuesData = revenues?.revenues || revenues || [];
      const costsData = costs?.costs || costs || [];
      const receivablesData = Array.isArray(receivables) ? receivables : [];
      const payablesData = Array.isArray(payables) ? payables : [];
      const walletsData = Array.isArray(wallets) ? wallets : [];

      // Calculate metrics
      const totalRevenue = revenuesData.reduce(
        (sum: number, rev: any) => sum + (rev.amount || 0),
        0
      );
      const totalCosts = costsData.reduce(
        (sum: number, cost: any) => sum + (cost.amount || 0),
        0
      );
      const totalReceivables = receivablesData.reduce(
        (sum: number, rec: any) => sum + (rec.amount || 0),
        0
      );
      const totalPayables = payablesData.reduce(
        (sum: number, pay: any) => sum + (pay.amount || 0),
        0
      );

      const totalProfit = totalRevenue - totalCosts;
      const profitMargin =
        totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      const cashFlow =
        totalRevenue - totalCosts + totalReceivables - totalPayables;

      // Calculate top revenue sources
      const revenueBySource = revenuesData.reduce((acc: any, rev: any) => {
        const source = rev.source || "Other";
        acc[source] = (acc[source] || 0) + (rev.amount || 0);
        return acc;
      }, {});

      const topRevenueSources = Object.entries(revenueBySource)
        .map(([source, amount]: [string, any]) => ({
          source,
          amount,
          percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate top cost categories
      const costByCategory = costsData.reduce((acc: any, cost: any) => {
        const category = cost.category || "Other";
        acc[category] = (acc[category] || 0) + (cost.amount || 0);
        return acc;
      }, {});

      const topCostCategories = Object.entries(costByCategory)
        .map(([category, amount]: [string, any]) => ({
          category,
          amount,
          percentage: totalCosts > 0 ? (amount / totalCosts) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate wallet balances
      const totalWalletBalance = walletsData.reduce(
        (sum: number, wallet: any) => sum + (wallet.balance || 0),
        0
      );
      const walletBalances = walletsData
        .map((wallet: any) => ({
          name: wallet.name,
          balance: wallet.balance || 0,
          percentage:
            totalWalletBalance > 0
              ? ((wallet.balance || 0) / totalWalletBalance) * 100
              : 0,
        }))
        .sort((a, b) => b.balance - a.balance);

      // Generate monthly trends (simplified)
      const monthlyTrends = [
        {
          month: "Jan",
          revenue: totalRevenue * 0.8,
          costs: totalCosts * 0.8,
          profit: (totalRevenue - totalCosts) * 0.8,
        },
        {
          month: "Feb",
          revenue: totalRevenue * 0.9,
          costs: totalCosts * 0.9,
          profit: (totalRevenue - totalCosts) * 0.9,
        },
        {
          month: "Mar",
          revenue: totalRevenue,
          costs: totalCosts,
          profit: totalRevenue - totalCosts,
        },
      ];

      setMetrics({
        totalRevenue,
        totalCosts,
        totalProfit,
        profitMargin,
        receivables: totalReceivables,
        payables: totalPayables,
        cashFlow,
        revenueGrowth: 12.5, // Mock data
        costGrowth: -5.2, // Mock data
        profitGrowth: 25.8, // Mock data
        topRevenueSources,
        topCostCategories,
        monthlyTrends,
        walletBalances,
      });
    } catch (error: any) {
      console.error("Error loading financial data:", error);
      setError(error.message || "Failed to load financial data");
      toast({
        title: "Error",
        description: error.message || "Failed to load financial data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const handleMetricClick = (metric: string) => {
    setSelectedMetric(metric);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadFinancialData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Report</h1>
          <p className="text-gray-600">
            {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
            {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onGenerateReport("financial", "pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => onGenerateReport("financial", "excel")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleMetricClick("revenue")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.totalRevenue)}
              </div>
              <div className="flex items-center gap-1">
                {getGrowthIcon(metrics.revenueGrowth)}
                <span
                  className={`text-sm font-medium ${getGrowthColor(
                    metrics.revenueGrowth
                  )}`}
                >
                  {formatPercentage(metrics.revenueGrowth)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleMetricClick("costs")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(metrics.totalCosts)}
              </div>
              <div className="flex items-center gap-1">
                {getGrowthIcon(metrics.costGrowth)}
                <span
                  className={`text-sm font-medium ${getGrowthColor(
                    metrics.costGrowth
                  )}`}
                >
                  {formatPercentage(metrics.costGrowth)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleMetricClick("profit")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(metrics.totalProfit)}
              </div>
              <div className="flex items-center gap-1">
                {getGrowthIcon(metrics.profitGrowth)}
                <span
                  className={`text-sm font-medium ${getGrowthColor(
                    metrics.profitGrowth
                  )}`}
                >
                  {formatPercentage(metrics.profitGrowth)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleMetricClick("margin")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(metrics.profitMargin)}
              </div>
              <div className="flex items-center gap-1">
                <Percent className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Cash Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cash Flow</span>
              <span
                className={`font-semibold ${
                  metrics.cashFlow >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(metrics.cashFlow)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Receivables</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(metrics.receivables)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payables</span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(metrics.payables)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Balances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Wallet Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.walletBalances.slice(0, 5).map((wallet, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{wallet.name}</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(wallet.balance)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(wallet.percentage)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Revenue Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Revenue Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topRevenueSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{source.source}</div>
                    <div className="text-sm text-gray-500">
                      {formatPercentage(source.percentage)} of total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatCurrency(source.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Cost Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Top Cost Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topCostCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{category.category}</div>
                    <div className="text-sm text-gray-500">
                      {formatPercentage(category.percentage)} of total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">
                    {formatCurrency(category.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMetric === "revenue" && "Revenue Details"}
              {selectedMetric === "costs" && "Cost Details"}
              {selectedMetric === "profit" && "Profit Details"}
              {selectedMetric === "margin" && "Margin Analysis"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMetric === "revenue" && (
              <div>
                <h3 className="font-semibold mb-2">Revenue Breakdown</h3>
                <div className="space-y-2">
                  {metrics.topRevenueSources.map((source, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{source.source}</span>
                      <span className="font-semibold">
                        {formatCurrency(source.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedMetric === "costs" && (
              <div>
                <h3 className="font-semibold mb-2">Cost Breakdown</h3>
                <div className="space-y-2">
                  {metrics.topCostCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{category.category}</span>
                      <span className="font-semibold">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedMetric === "profit" && (
              <div>
                <h3 className="font-semibold mb-2">Profit Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span>Total Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(metrics.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span>Total Costs</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(metrics.totalCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded border-2">
                    <span>Net Profit</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(metrics.totalProfit)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {selectedMetric === "margin" && (
              <div>
                <h3 className="font-semibold mb-2">Margin Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Profit Margin</span>
                    <span className="font-semibold">
                      {formatPercentage(metrics.profitMargin)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Revenue Growth</span>
                    <span className="font-semibold text-green-600">
                      {formatPercentage(metrics.revenueGrowth)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Profit Growth</span>
                    <span className="font-semibold text-blue-600">
                      {formatPercentage(metrics.profitGrowth)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialReport;
