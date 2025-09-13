import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
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
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calculator,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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

interface PLMetrics {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossProfitMargin: number;
  netProfit: number;
  netProfitMargin: number;
  operatingExpenses: number;
  operatingIncome: number;
  revenueGrowth: number;
  costGrowth: number;
  profitGrowth: number;
  revenueCount: number;
  costCount: number;
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
  profitByCategory: Array<{
    category: string;
    revenue: number;
    costs: number;
    profit: number;
    margin: number;
  }>;
}

interface BrandSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  brandName: string;
  reportHeader: string;
  reportFooter: string;
}

interface PLReportProps {
  dateRange: DateRange;
  onGenerateReport: (type: string, format: "pdf" | "excel" | "csv") => void;
  brandSettings: BrandSettings;
}

const PLReport: React.FC<PLReportProps> = ({
  dateRange,
  onGenerateReport,
  brandSettings,
}) => {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PLMetrics>({
    totalRevenue: 0,
    totalCosts: 0,
    grossProfit: 0,
    grossProfitMargin: 0,
    netProfit: 0,
    netProfitMargin: 0,
    operatingExpenses: 0,
    operatingIncome: 0,
    revenueGrowth: 0,
    costGrowth: 0,
    profitGrowth: 0,
    revenueCount: 0,
    costCount: 0,
    topRevenueSources: [],
    topCostCategories: [],
    monthlyTrends: [],
    profitByCategory: [],
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadPLData();
  }, [dateRange]);

  const loadPLData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenues, costs] = await Promise.all([
        revenuesAPI.getAll(),
        costsAPI.getAll(),
      ]);

      // Extract data arrays
      const revenuesData = revenues?.revenues || revenues || [];
      const costsData = costs?.costs || costs || [];

      // Calculate metrics
      const totalRevenue = revenuesData.reduce(
        (sum: number, rev: any) => sum + (rev.amount || 0),
        0
      );
      const totalCosts = costsData.reduce(
        (sum: number, cost: any) => sum + (cost.amount || 0),
        0
      );

      const grossProfit = totalRevenue - totalCosts;
      const grossProfitMargin =
        totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const netProfit = grossProfit; // Simplified - in real scenario would include other income/expenses
      const netProfitMargin =
        totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const operatingExpenses = totalCosts;
      const operatingIncome = grossProfit;

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

      // Calculate profit by category
      const profitByCategory = Object.keys(costByCategory)
        .map((category) => {
          const categoryCosts = costByCategory[category];
          const categoryRevenue = revenueBySource[category] || 0;
          const categoryProfit = categoryRevenue - categoryCosts;
          const categoryMargin =
            categoryRevenue > 0 ? (categoryProfit / categoryRevenue) * 100 : 0;

          return {
            category,
            revenue: categoryRevenue,
            costs: categoryCosts,
            profit: categoryProfit,
            margin: categoryMargin,
          };
        })
        .sort((a, b) => b.profit - a.profit);

      // Generate monthly trends (simplified)
      const monthlyTrends = [
        {
          month: "Jan",
          revenue: totalRevenue * 0.8,
          costs: totalCosts * 0.8,
          profit: grossProfit * 0.8,
        },
        {
          month: "Feb",
          revenue: totalRevenue * 0.9,
          costs: totalCosts * 0.9,
          profit: grossProfit * 0.9,
        },
        {
          month: "Mar",
          revenue: totalRevenue,
          costs: totalCosts,
          profit: grossProfit,
        },
      ];

      setMetrics({
        totalRevenue,
        totalCosts,
        grossProfit,
        grossProfitMargin,
        netProfit,
        netProfitMargin,
        operatingExpenses,
        operatingIncome,
        revenueGrowth: 0, // No historical data available for growth calculation
        costGrowth: 0, // No historical data available for growth calculation
        profitGrowth: 0, // No historical data available for growth calculation
        revenueCount: revenuesData.length,
        costCount: costsData.length,
        topRevenueSources,
        topCostCategories,
        monthlyTrends,
        profitByCategory,
      });
    } catch (error: any) {
      console.error("Error loading P&L data:", error);
      setError(error.message || "Failed to load P&L data");
      toast({
        title: t("reports.error"),
        description: error.message || t("reports.failedToGenerate"),
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
          <p className="text-gray-600">{t("reports.loading")}</p>
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
          <Button onClick={loadPLData}>{t("reports.retry")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {brandSettings.reportHeader || t("reports.types.pl.title")}
          </h1>
          <p className="text-gray-600">
            {brandSettings.brandName} •{" "}
            {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
            {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onGenerateReport("pl", "pdf")}
            style={{ backgroundColor: brandSettings.primaryColor }}
            className="hover:opacity-90"
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            {t("reports.pdf")}
          </Button>
          <Button
            variant="outline"
            onClick={() => onGenerateReport("pl", "excel")}
            style={{
              borderColor: brandSettings.primaryColor,
              color: brandSettings.primaryColor,
            }}
            className="hover:bg-opacity-10"
            disabled={loading}
          >
            <FileText className="h-4 w-4 mr-2" />
            {t("reports.excel")}
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
              {t("reports.metrics.totalRevenue")}
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
                  {metrics.revenueGrowth === 0
                    ? "N/A"
                    : formatPercentage(metrics.revenueGrowth)}
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
              {t("reports.metrics.totalCosts")}
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
                  {metrics.costGrowth === 0
                    ? "N/A"
                    : formatPercentage(metrics.costGrowth)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleMetricClick("grossProfit")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("reports.metrics.grossProfit")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(metrics.grossProfit)}
              </div>
              <div className="flex items-center gap-1">
                <Percent className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {formatPercentage(metrics.grossProfitMargin)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleMetricClick("netProfit")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("reports.metrics.netProfit")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(metrics.netProfit)}
              </div>
              <div className="flex items-center gap-1">
                {getGrowthIcon(metrics.profitGrowth)}
                <span
                  className={`text-sm font-medium ${getGrowthColor(
                    metrics.profitGrowth
                  )}`}
                >
                  {metrics.profitGrowth === 0
                    ? "N/A"
                    : formatPercentage(metrics.profitGrowth)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Revenue Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            {t("reports.metrics.revenueBySource")} &{" "}
            {t("reports.metrics.expenseAnalysis")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue by Source */}
            <div>
              <h3 className="font-semibold text-lg mb-3">
                {t("reports.metrics.revenueBySource")}
              </h3>
              <div className="space-y-3">
                {metrics.topRevenueSources.map((source, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{source.source}</div>
                        <div className="text-sm text-gray-600">
                          {formatPercentage(source.percentage)} of total revenue
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(source.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {source.percentage > 20
                          ? "🏆 Top Performer"
                          : source.percentage > 10
                          ? "📈 Growing"
                          : "📊 Stable"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <div className="text-sm font-medium text-blue-800">
                  Revenue Efficiency
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.totalRevenue > 0
                    ? formatPercentage(
                        (metrics.grossProfit / metrics.totalRevenue) * 100
                      )
                    : "0%"}
                </div>
                <div className="text-xs text-blue-600">
                  Profit per dollar earned
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <div className="text-sm font-medium text-green-800">
                  Growth Rate
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.revenueGrowth === 0
                    ? "N/A"
                    : formatPercentage(metrics.revenueGrowth)}
                </div>
                <div className="text-xs text-green-600">
                  {metrics.revenueGrowth === 0
                    ? "No historical data"
                    : "vs previous period"}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded">
                <div className="text-sm font-medium text-purple-800">
                  Revenue Health
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.revenueGrowth === 0
                    ? "Baseline"
                    : metrics.revenueGrowth > 10
                    ? "Excellent"
                    : metrics.revenueGrowth > 5
                    ? "Good"
                    : metrics.revenueGrowth > 0
                    ? "Stable"
                    : "Declining"}
                </div>
                <div className="text-xs text-purple-600">
                  {metrics.revenueGrowth === 0
                    ? "Current period data"
                    : "Performance indicator"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            {t("reports.metrics.costBreakdown")} &{" "}
            {t("reports.metrics.expenseAnalysis")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Cost by Category */}
            <div>
              <h3 className="font-semibold text-lg mb-3">
                {t("reports.metrics.topCostCategories")}
              </h3>
              <div className="space-y-3">
                {metrics.topCostCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-gray-600">
                          {formatPercentage(category.percentage)} of total costs
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">
                        {formatCurrency(category.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.percentage > 30
                          ? "⚠️ High Impact"
                          : category.percentage > 15
                          ? "📊 Moderate"
                          : "✅ Controlled"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50 rounded">
                <div className="text-sm font-medium text-orange-800">
                  Cost Efficiency
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.totalRevenue > 0
                    ? formatPercentage(
                        (metrics.totalCosts / metrics.totalRevenue) * 100
                      )
                    : "0%"}
                </div>
                <div className="text-xs text-orange-600">
                  Cost per dollar earned
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded">
                <div className="text-sm font-medium text-red-800">
                  Cost Trend
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {metrics.costGrowth === 0
                    ? "N/A"
                    : formatPercentage(metrics.costGrowth)}
                </div>
                <div className="text-xs text-red-600">
                  {metrics.costGrowth === 0
                    ? "No historical data"
                    : "vs previous period"}
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded">
                <div className="text-sm font-medium text-yellow-800">
                  Cost Control
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.costGrowth === 0
                    ? "Baseline"
                    : metrics.costGrowth < 0
                    ? "Improving"
                    : metrics.costGrowth < 5
                    ? "Stable"
                    : metrics.costGrowth < 10
                    ? "Watch"
                    : "Critical"}
                </div>
                <div className="text-xs text-yellow-600">
                  {metrics.costGrowth === 0
                    ? "Current period data"
                    : "Management status"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* P&L Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t("reports.types.pl.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="font-semibold text-green-800">
              {t("reports.metrics.totalRevenue")}
            </span>
            <span className="font-semibold text-green-800">
              {formatCurrency(metrics.totalRevenue)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-red-50 rounded">
            <span className="font-semibold text-red-800">
              {t("reports.metrics.totalCosts")}
            </span>
            <span className="font-semibold text-red-800">
              {formatCurrency(metrics.totalCosts)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-2">
            <span className="font-semibold text-blue-800">
              {t("reports.metrics.grossProfit")}
            </span>
            <span className="font-semibold text-blue-800">
              {formatCurrency(metrics.grossProfit)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span className="font-semibold text-blue-800">
              Gross Profit Margin
            </span>
            <span className="font-semibold text-blue-800">
              {formatPercentage(metrics.grossProfitMargin)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-purple-50 rounded border-2">
            <span className="font-semibold text-purple-800">Net Profit</span>
            <span className="font-semibold text-purple-800">
              {formatCurrency(metrics.netProfit)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
            <span className="font-semibold text-purple-800">
              Net Profit Margin
            </span>
            <span className="font-semibold text-purple-800">
              {formatPercentage(metrics.netProfitMargin)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Profit by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Profit by Category Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.profitByCategory.slice(0, 5).map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{category.category}</div>
                    <div className="text-sm text-gray-500">
                      Revenue: {formatCurrency(category.revenue)} | Costs:{" "}
                      {formatCurrency(category.costs)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      category.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(category.profit)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(category.margin)} margin
                  </div>
                  <div className="text-xs text-gray-400">
                    {category.profit >= 0 ? "✅ Profitable" : "❌ Loss-making"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Business Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Check if we have enough data for insights */}
          {metrics.revenueCount < 3 && metrics.costCount < 3 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Enough Data
              </h3>
              <p className="text-gray-600 mb-4">
                We need at least 3 revenue and 3 cost entries to generate
                meaningful business insights.
              </p>
              <div className="text-sm text-gray-500">
                <p>Current data:</p>
                <p>• Revenue entries: {metrics.revenueCount}</p>
                <p>• Cost entries: {metrics.costCount}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Strengths
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {metrics.grossProfitMargin > 30 && (
                      <li>
                        • Strong gross profit margin of{" "}
                        {formatPercentage(metrics.grossProfitMargin)}
                      </li>
                    )}
                    {metrics.revenueGrowth > 10 && (
                      <li>
                        • Healthy revenue growth of{" "}
                        {formatPercentage(metrics.revenueGrowth)}
                      </li>
                    )}
                    {metrics.profitByCategory.filter((c) => c.profit > 0)
                      .length > 2 && <li>• Multiple profitable categories</li>}
                    {metrics.grossProfitMargin <= 30 &&
                      metrics.revenueGrowth <= 10 &&
                      metrics.profitByCategory.filter((c) => c.profit > 0)
                        .length <= 2 && <li>• Based on real data analysis</li>}
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Areas for Improvement
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {metrics.grossProfitMargin < 20 && (
                      <li>• Low gross profit margin needs attention</li>
                    )}
                    {metrics.costGrowth > 10 && (
                      <li>
                        • High cost growth of{" "}
                        {formatPercentage(metrics.costGrowth)}
                      </li>
                    )}
                    {metrics.profitByCategory.filter((c) => c.profit < 0)
                      .length > 0 && (
                      <li>• Loss-making categories identified</li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Strategic Recommendations
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {metrics.topCostCategories[0]?.percentage > 40 && (
                    <li>
                      • Focus on reducing{" "}
                      {metrics.topCostCategories[0].category} costs (highest at{" "}
                      {formatPercentage(
                        metrics.topCostCategories[0].percentage
                      )}
                      )
                    </li>
                  )}
                  {metrics.topRevenueSources[0]?.percentage > 50 && (
                    <li>
                      • Diversify revenue sources beyond{" "}
                      {metrics.topRevenueSources[0].source}
                    </li>
                  )}
                  {metrics.grossProfitMargin < 25 && (
                    <li>• Review pricing strategy and cost structure</li>
                  )}
                  <li>
                    • Monitor{" "}
                    {
                      metrics.profitByCategory.filter((c) => c.profit < 0)
                        .length
                    }{" "}
                    loss-making categories
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMetric === "revenue" && "Revenue Details"}
              {selectedMetric === "costs" && "Cost Details"}
              {selectedMetric === "grossProfit" && "Gross Profit Analysis"}
              {selectedMetric === "netProfit" && "Net Profit Analysis"}
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
            {selectedMetric === "grossProfit" && (
              <div>
                <h3 className="font-semibold mb-2">Gross Profit Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span>Gross Profit</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(metrics.grossProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span>Gross Profit Margin</span>
                    <span className="font-semibold text-blue-600">
                      {formatPercentage(metrics.grossProfitMargin)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {selectedMetric === "netProfit" && (
              <div>
                <h3 className="font-semibold mb-2">Net Profit Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span>Net Profit</span>
                    <span className="font-semibold text-purple-600">
                      {formatCurrency(metrics.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span>Net Profit Margin</span>
                    <span className="font-semibold text-purple-600">
                      {formatPercentage(metrics.netProfitMargin)}
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

export default PLReport;
