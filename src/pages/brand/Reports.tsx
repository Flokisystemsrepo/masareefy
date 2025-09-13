import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Search,
  Eye,
  FileText,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Target,
  AlertCircle,
  RefreshCw,
  PieChart,
  LineChart,
  Activity,
  Award,
  X,
  ChevronDown,
  ChevronUp,
  BarChart,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Shield,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Palette,
  Settings,
  BookOpen,
  Brain,
  Lightbulb,
  TrendingUp as TrendingUpIcon2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  inventoryAPI,
  revenuesAPI,
  costsAPI,
  receivablesAPI,
  payablesAPI,
  projectTargetsAPI,
  teamAPI,
  tasksAPI,
  walletAPI,
  metricsAPI,
} from "@/services/api";

// Import report components
import PLReport from "./reports/PLReport";
import RevenueReport from "./reports/RevenueReport";
import CostsReport from "./reports/CostsReport";
import ProductsReport from "./reports/ProductsReport";
import CashFlowReport from "./reports/CashFlowReport";
import BalanceSheetReport from "./reports/BalanceSheetReport";
import BrandSettings from "@/components/BrandSettings";
import { PDFGenerator, generateInsights } from "@/services/pdfGenerator";
import FeatureLock from "@/components/FeatureLock";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { UpgradePromptModal } from "@/components/UpgradePromptModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

// Smart Insights Component
const SmartInsightsSection: React.FC = () => {
  const { t } = useLanguage();
  const [insightsData, setInsightsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsightsData();
  }, []);

  const loadInsightsData = async () => {
    try {
      setLoading(true);

      // Load real data from APIs
      const [revenues, costs, inventory] = await Promise.all([
        revenuesAPI.getAll().catch(() => ({ revenues: [] })),
        costsAPI.getAll().catch(() => ({ costs: [] })),
        inventoryAPI.getAll().catch(() => ({ inventory: [] })),
      ]);

      const revenueData = revenues?.revenues || revenues || [];
      const costData = costs?.costs || costs || [];
      const inventoryData = inventory?.inventory || inventory || [];

      // Calculate basic metrics
      const totalRevenue = revenueData.reduce(
        (sum: number, rev: any) => sum + (rev.amount || 0),
        0
      );
      const totalCosts = costData.reduce(
        (sum: number, cost: any) => sum + (cost.amount || 0),
        0
      );
      const totalInventoryValue = inventoryData.reduce(
        (sum: number, item: any) =>
          sum + (item.currentStock || 0) * (item.sellingPrice || 0),
        0
      );

      // Check if we have enough data for meaningful insights
      const hasEnoughData =
        revenueData.length >= 3 ||
        costData.length >= 3 ||
        inventoryData.length >= 3;

      if (!hasEnoughData) {
        setInsightsData({ hasEnoughData: false });
        return;
      }

      // SMART ANALYTICS CALCULATIONS

      // 1. Revenue Trends & Predictions
      const revenueTrend = calculateTrend(revenueData, "amount", "date");
      const avgRevenuePerTransaction =
        revenueData.length > 0 ? totalRevenue / revenueData.length : 0;
      const revenueGrowthRate = calculateGrowthRate(
        revenueData,
        "amount",
        "date"
      );
      const projectedMonthlyRevenue = totalRevenue * (1 + revenueGrowthRate);

      // 2. Cost Analysis & Optimization
      const costTrend = calculateTrend(costData, "amount", "date");
      const avgCostPerTransaction =
        costData.length > 0 ? totalCosts / costData.length : 0;
      const costEfficiency =
        totalRevenue > 0 ? (totalCosts / totalRevenue) * 100 : 0;
      const costOptimization = identifyCostOptimization(costData);

      // 3. Profitability Intelligence
      const profitMargin =
        totalRevenue > 0
          ? ((totalRevenue - totalCosts) / totalRevenue) * 100
          : 0;
      const profitTrend = calculateProfitTrend(revenueData, costData);
      const profitabilityScore = calculateProfitabilityScore(
        profitMargin,
        profitTrend,
        revenueGrowthRate
      );

      // 4. Inventory Intelligence
      const inventoryInsights = analyzeInventory(inventoryData);
      const stockTurnover = calculateStockTurnover(inventoryData, revenueData);
      const inventoryHealth = assessInventoryHealth(inventoryData);

      // 5. Business Performance Score
      const performanceScore = calculateBusinessPerformanceScore({
        profitMargin,
        revenueGrowthRate,
        costEfficiency,
        inventoryHealth,
        stockTurnover,
      });

      // 6. Actionable Recommendations
      const recommendations = generateRecommendations({
        profitMargin,
        revenueGrowthRate,
        costEfficiency,
        inventoryInsights,
        performanceScore,
      });

      setInsightsData({
        hasEnoughData: true,
        // Basic metrics
        totalRevenue,
        totalCosts,
        totalInventoryValue,
        revenueCount: revenueData.length,
        costCount: costData.length,
        inventoryCount: inventoryData.length,
        profitMargin,
        // Smart analytics
        revenueTrend,
        avgRevenuePerTransaction,
        revenueGrowthRate,
        projectedMonthlyRevenue,
        costTrend,
        avgCostPerTransaction,
        costEfficiency,
        costOptimization,
        profitTrend,
        profitabilityScore,
        inventoryInsights,
        stockTurnover,
        inventoryHealth,
        performanceScore,
        recommendations,
      });
    } catch (error) {
      console.error("Error loading insights data:", error);
      setInsightsData({ hasEnoughData: false });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for smart analytics
  const calculateTrend = (
    data: any[],
    amountField: string,
    dateField: string
  ) => {
    if (data.length < 2) return { direction: "stable", percentage: 0 };

    const sortedData = data.sort(
      (a, b) =>
        new Date(a[dateField] || 0).getTime() -
        new Date(b[dateField] || 0).getTime()
    );
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));

    const firstHalfAvg =
      firstHalf.reduce((sum, item) => sum + (item[amountField] || 0), 0) /
      firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, item) => sum + (item[amountField] || 0), 0) /
      secondHalf.length;

    const percentage =
      firstHalfAvg > 0
        ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
        : 0;

    return {
      direction:
        percentage > 5
          ? "increasing"
          : percentage < -5
          ? "decreasing"
          : "stable",
      percentage: Math.abs(percentage),
    };
  };

  const calculateGrowthRate = (
    data: any[],
    amountField: string,
    dateField: string
  ) => {
    if (data.length < 2) return 0;

    const sortedData = data.sort(
      (a, b) =>
        new Date(a[dateField] || 0).getTime() -
        new Date(b[dateField] || 0).getTime()
    );
    const first = sortedData[0][amountField] || 0;
    const last = sortedData[sortedData.length - 1][amountField] || 0;

    return first > 0 ? (last - first) / first : 0;
  };

  const identifyCostOptimization = (costData: any[]) => {
    if (costData.length === 0) return { opportunities: [], totalSavings: 0 };

    const categoryTotals = costData.reduce((acc, cost) => {
      const category = cost.category || "Other";
      acc[category] = (acc[category] || 0) + (cost.amount || 0);
      return acc;
    }, {});

    const totalCosts = Object.values(categoryTotals).reduce(
      (sum: number, amount: any) => sum + (amount as number),
      0
    );
    const opportunities = Object.entries(categoryTotals)
      .filter(([_, amount]) => {
        const numAmount = Number(amount);
        const threshold = Number(totalCosts) * 0.1;
        return numAmount > threshold;
      }) // Categories > 10% of total
      .map(([category, amount]) => ({
        category,
        amount: amount as number,
        potentialSavings: (amount as number) * 0.15, // Assume 15% savings potential
      }));

    return {
      opportunities,
      totalSavings: opportunities.reduce(
        (sum, opp) => sum + opp.potentialSavings,
        0
      ),
    };
  };

  const calculateProfitTrend = (revenueData: any[], costData: any[]) => {
    // Simplified profit trend calculation
    const revenueTrend = calculateTrend(revenueData, "amount", "date");
    const costTrend = calculateTrend(costData, "amount", "date");

    if (
      revenueTrend.direction === "increasing" &&
      costTrend.direction === "decreasing"
    ) {
      return "excellent";
    } else if (
      revenueTrend.direction === "increasing" &&
      costTrend.direction === "stable"
    ) {
      return "good";
    } else if (
      revenueTrend.direction === "stable" &&
      costTrend.direction === "decreasing"
    ) {
      return "good";
    } else if (
      revenueTrend.direction === "decreasing" &&
      costTrend.direction === "increasing"
    ) {
      return "poor";
    } else {
      return "stable";
    }
  };

  const calculateProfitabilityScore = (
    profitMargin: number,
    profitTrend: string,
    revenueGrowth: number
  ) => {
    let score = 0;

    // Profit margin scoring (0-40 points)
    if (profitMargin > 20) score += 40;
    else if (profitMargin > 10) score += 30;
    else if (profitMargin > 5) score += 20;
    else if (profitMargin > 0) score += 10;

    // Trend scoring (0-30 points)
    if (profitTrend === "excellent") score += 30;
    else if (profitTrend === "good") score += 20;
    else if (profitTrend === "stable") score += 10;

    // Growth scoring (0-30 points)
    if (revenueGrowth > 0.1) score += 30;
    else if (revenueGrowth > 0.05) score += 20;
    else if (revenueGrowth > 0) score += 10;

    return Math.min(score, 100);
  };

  const analyzeInventory = (inventoryData: any[]) => {
    if (inventoryData.length === 0)
      return { insights: [], recommendations: [] };

    const lowStockItems = inventoryData.filter(
      (item) => (item.currentStock || 0) < (item.minStock || 5)
    );
    const highValueItems = inventoryData.filter(
      (item) => (item.sellingPrice || 0) > 1000
    );
    const slowMovingItems = inventoryData.filter(
      (item) => (item.currentStock || 0) > (item.maxStock || 100)
    );

    return {
      lowStockItems: lowStockItems.length,
      highValueItems: highValueItems.length,
      slowMovingItems: slowMovingItems.length,
      totalItems: inventoryData.length,
      insights: [
        lowStockItems.length > 0
          ? `${lowStockItems.length} items need restocking`
          : null,
        highValueItems.length > 0
          ? `${highValueItems.length} high-value items need attention`
          : null,
        slowMovingItems.length > 0
          ? `${slowMovingItems.length} items may be overstocked`
          : null,
      ].filter(Boolean),
    };
  };

  const calculateStockTurnover = (inventoryData: any[], revenueData: any[]) => {
    if (inventoryData.length === 0 || revenueData.length === 0) return 0;

    const totalInventoryValue = inventoryData.reduce(
      (sum, item) => sum + (item.currentStock || 0) * (item.sellingPrice || 0),
      0
    );
    const totalRevenue = revenueData.reduce(
      (sum, rev) => sum + (rev.amount || 0),
      0
    );

    return totalInventoryValue > 0 ? totalRevenue / totalInventoryValue : 0;
  };

  const assessInventoryHealth = (inventoryData: any[]) => {
    if (inventoryData.length === 0) return "unknown";

    const lowStockRatio =
      inventoryData.filter(
        (item) => (item.currentStock || 0) < (item.minStock || 5)
      ).length / inventoryData.length;
    const overstockRatio =
      inventoryData.filter(
        (item) => (item.currentStock || 0) > (item.maxStock || 100)
      ).length / inventoryData.length;

    if (lowStockRatio > 0.3) return "poor";
    if (overstockRatio > 0.2) return "fair";
    if (lowStockRatio < 0.1 && overstockRatio < 0.1) return "excellent";
    return "good";
  };

  const calculateBusinessPerformanceScore = (metrics: any) => {
    let score = 0;

    // Profit margin (0-25 points)
    if (metrics.profitMargin > 20) score += 25;
    else if (metrics.profitMargin > 10) score += 20;
    else if (metrics.profitMargin > 5) score += 15;
    else if (metrics.profitMargin > 0) score += 10;

    // Revenue growth (0-25 points)
    if (metrics.revenueGrowthRate > 0.1) score += 25;
    else if (metrics.revenueGrowthRate > 0.05) score += 20;
    else if (metrics.revenueGrowthRate > 0) score += 15;

    // Cost efficiency (0-25 points)
    if (metrics.costEfficiency < 30) score += 25;
    else if (metrics.costEfficiency < 50) score += 20;
    else if (metrics.costEfficiency < 70) score += 15;
    else if (metrics.costEfficiency < 90) score += 10;

    // Inventory health (0-25 points)
    if (metrics.inventoryHealth === "excellent") score += 25;
    else if (metrics.inventoryHealth === "good") score += 20;
    else if (metrics.inventoryHealth === "fair") score += 15;
    else if (metrics.inventoryHealth === "poor") score += 5;

    return Math.min(score, 100);
  };

  const generateRecommendations = (metrics: any) => {
    const recommendations = [];

    if (metrics.profitMargin < 10) {
      recommendations.push({
        type: "profit",
        priority: "high",
        title: "Improve Profit Margins",
        description:
          "Consider increasing prices or reducing costs to improve profitability",
        action: "Review pricing strategy and cost structure",
      });
    }

    if (metrics.revenueGrowthRate < 0) {
      recommendations.push({
        type: "growth",
        priority: "high",
        title: "Boost Revenue Growth",
        description:
          "Revenue is declining. Focus on customer acquisition and retention",
        action: "Implement marketing campaigns and improve customer service",
      });
    }

    if (metrics.costEfficiency > 70) {
      recommendations.push({
        type: "cost",
        priority: "medium",
        title: "Optimize Cost Structure",
        description:
          "Costs are high relative to revenue. Look for cost reduction opportunities",
        action: "Review and negotiate supplier contracts",
      });
    }

    if (metrics.inventoryInsights?.lowStockItems > 0) {
      recommendations.push({
        type: "inventory",
        priority: "medium",
        title: "Restock Critical Items",
        description: `${metrics.inventoryInsights.lowStockItems} items are running low`,
        action: "Place orders for low-stock items immediately",
      });
    }

    if (metrics.performanceScore < 60) {
      recommendations.push({
        type: "overall",
        priority: "high",
        title: "Overall Performance Needs Attention",
        description: "Business performance is below optimal levels",
        action: "Develop comprehensive improvement plan",
      });
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading insights...</span>
      </div>
    );
  }

  if (!insightsData?.hasEnoughData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Enough Data
        </h3>
        <p className="text-gray-600 mb-4">
          We need at least 3 transactions in revenues, costs, or inventory to
          generate meaningful insights.
        </p>
        <div className="text-sm text-gray-500">
          <p>Current data:</p>
          <p>• Revenue entries: {insightsData?.revenueCount || 0}</p>
          <p>• Cost entries: {insightsData?.costCount || 0}</p>
          <p>• Inventory items: {insightsData?.inventoryCount || 0}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Performance Score */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Business Performance Score
              </h3>
              <p className="text-sm text-blue-700">
                Overall business health assessment
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">
              {insightsData.performanceScore}/100
            </div>
            <div className="text-sm text-blue-700">
              {insightsData.performanceScore >= 80
                ? "Excellent"
                : insightsData.performanceScore >= 60
                ? "Good"
                : insightsData.performanceScore >= 40
                ? "Fair"
                : "Needs Improvement"}
            </div>
          </div>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${insightsData.performanceScore}%` }}
          ></div>
        </div>
      </div>

      {/* Smart Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Revenue Intelligence */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUpIcon2 className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">
              Revenue Intelligence
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Current Trend:</span>
              <span
                className={`text-sm font-medium ${
                  insightsData.revenueTrend.direction === "increasing"
                    ? "text-green-600"
                    : insightsData.revenueTrend.direction === "decreasing"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {insightsData.revenueTrend.direction}{" "}
                {insightsData.revenueTrend.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">
                Avg per Transaction:
              </span>
              <span className="text-sm font-medium text-green-800">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "EGP",
                }).format(insightsData.avgRevenuePerTransaction)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Growth Rate:</span>
              <span
                className={`text-sm font-medium ${
                  insightsData.revenueGrowthRate > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(insightsData.revenueGrowthRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="pt-2 border-t border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">
                  Projected Next Month:
                </span>
                <span className="text-xs font-medium text-green-800">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "EGP",
                  }).format(insightsData.projectedMonthlyRevenue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Optimization */}
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDownIcon className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-800">
              Cost Optimization
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-700">Cost Efficiency:</span>
              <span
                className={`text-sm font-medium ${
                  insightsData.costEfficiency < 50
                    ? "text-green-600"
                    : insightsData.costEfficiency < 70
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {insightsData.costEfficiency.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-700">Cost Trend:</span>
              <span
                className={`text-sm font-medium ${
                  insightsData.costTrend.direction === "decreasing"
                    ? "text-green-600"
                    : insightsData.costTrend.direction === "increasing"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {insightsData.costTrend.direction}
              </span>
            </div>
            {insightsData.costOptimization.totalSavings > 0 && (
              <div className="pt-2 border-t border-red-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-600">
                    Potential Savings:
                  </span>
                  <span className="text-xs font-medium text-green-600">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "EGP",
                    }).format(insightsData.costOptimization.totalSavings)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profitability Score */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Percent className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">
              Profitability Score
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Current Margin:</span>
              <span
                className={`text-sm font-medium ${
                  insightsData.profitMargin > 20
                    ? "text-green-600"
                    : insightsData.profitMargin > 10
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {insightsData.profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Profit Trend:</span>
              <span
                className={`text-sm font-medium ${
                  insightsData.profitTrend === "excellent"
                    ? "text-green-600"
                    : insightsData.profitTrend === "good"
                    ? "text-blue-600"
                    : insightsData.profitTrend === "poor"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {insightsData.profitTrend}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Score:</span>
              <span className="text-sm font-medium text-blue-800">
                {insightsData.profitabilityScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Intelligence */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-800">
              Inventory Intelligence
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">Health Status:</span>
              <span
                className={`text-sm font-medium ${
                  insightsData.inventoryHealth === "excellent"
                    ? "text-green-600"
                    : insightsData.inventoryHealth === "good"
                    ? "text-blue-600"
                    : insightsData.inventoryHealth === "fair"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {insightsData.inventoryHealth}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">Stock Turnover:</span>
              <span className="text-sm font-medium text-purple-800">
                {insightsData.stockTurnover.toFixed(2)}x
              </span>
            </div>
            {insightsData.inventoryInsights.insights.length > 0 && (
              <div className="pt-2 border-t border-purple-200">
                <div className="text-xs text-purple-600">
                  {insightsData.inventoryInsights.insights[0]}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      {insightsData.recommendations &&
        insightsData.recommendations.length > 0 && (
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">
                  Smart Recommendations
                </h3>
                <p className="text-sm text-amber-700">
                  AI-powered insights to improve your business
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {insightsData.recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-1 rounded-full ${
                        rec.priority === "high"
                          ? "bg-red-100"
                          : rec.priority === "medium"
                          ? "bg-yellow-100"
                          : "bg-green-100"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          rec.priority === "high"
                            ? "bg-red-500"
                            : rec.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-900">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        {rec.description}
                      </p>
                      <p className="text-xs text-amber-600 mt-2 font-medium">
                        💡 {rec.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ReportData {
  id: string;
  title: string;
  type: string;
  category: string;
  data: any;
  generatedAt: string;
  status: "completed" | "processing" | "failed";
  format: "pdf" | "excel" | "csv";
  downloadUrl?: string;
}

const ReportsPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { hasFeatureAccess } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showBrandSettings, setShowBrandSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [brandSettings, setBrandSettings] = useState({
    primaryColor: "#3B82F6",
    secondaryColor: "#1E40AF",
    accentColor: "#10B981",
    brandName: "Your Brand",
    reportHeader: "Financial Report",
    reportFooter: "Generated by Your Brand Management System",
  });

  const { toast } = useToast();

  const reportTypes = [
    {
      id: "pl",
      title: t("reports.types.pl.title"),
      icon: TrendingUp,
      description: t("reports.types.pl.description"),
      color: "bg-green-500",
    },
    {
      id: "revenue",
      title: t("reports.types.revenue.title"),
      icon: DollarSign,
      description: t("reports.types.revenue.description"),
      color: "bg-emerald-500",
    },
    {
      id: "costs",
      title: t("reports.types.costs.title"),
      icon: TrendingDown,
      description: t("reports.types.costs.description"),
      color: "bg-red-500",
    },
    {
      id: "products",
      title: t("reports.types.products.title"),
      icon: Package,
      description: t("reports.types.products.description"),
      color: "bg-blue-500",
    },
    {
      id: "cashflow",
      title: t("reports.types.cashflow.title"),
      icon: Zap,
      description: t("reports.types.cashflow.description"),
      color: "bg-purple-500",
    },
    {
      id: "balancesheet",
      title: t("reports.types.balancesheet.title"),
      icon: Shield,
      description: t("reports.types.balancesheet.description"),
      color: "bg-indigo-500",
    },
  ];

  useEffect(() => {
    // Load brand settings from localStorage
    const savedSettings = localStorage.getItem("brandSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setBrandSettings(parsed);
      } catch (error) {
        console.error("Error parsing saved brand settings:", error);
      }
    }

    // Initial load - no specific data loading needed as components will handle their own data
    setLoading(false);
  }, []);

  const handleReportClick = (reportId: string) => {
    setSelectedReport(reportId);
  };

  const handleBackToReports = () => {
    setSelectedReport(null);
  };

  const generateReport = async (
    type: string,
    format: "pdf" | "excel" | "csv"
  ) => {
    try {
      setGeneratingReport(true);

      if (format === "pdf") {
        // Generate actual PDF with branding
        const pdfGenerator = new PDFGenerator(brandSettings);

        // Create report data based on type
        const reportData = {
          title: getReportTitle(type),
          dateRange,
          metrics: await getReportMetrics(type),
          insights: [],
          generatedAt: new Date().toISOString(),
        };

        // Generate insights based on metrics
        reportData.insights = generateInsights(reportData.metrics);

        // Generate the appropriate report type
        switch (type) {
          case "pl":
            pdfGenerator.generatePLReport(reportData);
            break;
          case "revenue":
            pdfGenerator.generateRevenueReport(reportData);
            break;
          case "costs":
            pdfGenerator.generateCostsReport(reportData);
            break;
          default:
            pdfGenerator.generateGenericReport(reportData);
            break;
        }

        // Save the PDF with branded filename
        const filename = `${brandSettings.brandName}_${getReportTitle(type)}_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        pdfGenerator.save(filename);

        toast({
          title: t("reports.success"),
          description: t("reports.reportGenerated", {
            title: getReportTitle(type),
          }),
        });
      } else {
        // For Excel/CSV, show a message that it's coming soon
        toast({
          title: t("reports.comingSoon"),
          description: `${format.toUpperCase()} ${t(
            "reports.exportComingSoon"
          )}`,
        });
      }
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast({
        title: t("reports.error"),
        description: error.message || t("reports.failedToGenerate"),
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  // Helper function to get report title
  const getReportTitle = (type: string): string => {
    const titles: { [key: string]: string } = {
      pl: t("reports.types.pl.title"),
      revenue: t("reports.types.revenue.title"),
      costs: t("reports.types.costs.title"),
      products: t("reports.types.products.title"),
      cashflow: t("reports.types.cashflow.title"),
      balancesheet: t("reports.types.balancesheet.title"),
    };
    return titles[type] || t("reports.types.pl.title");
  };

  // Helper function to get report metrics (simplified for demo)
  const getReportMetrics = async (type: string): Promise<any> => {
    try {
      // In a real implementation, you would fetch actual data from your APIs
      // For now, we'll return mock data that represents real metrics

      const mockMetrics = {
        totalRevenue: 150000,
        totalCosts: 75000,
        grossProfit: 75000,
        grossProfitMargin: 50,
        netProfit: 65000,
        netProfitMargin: 43.3,
        revenueGrowth: 15.2,
        costGrowth: -5.2,
        profitGrowth: 25.8,
        topRevenueSources: [
          { source: "Product Sales", amount: 90000, percentage: 60 },
          { source: "Service Revenue", amount: 45000, percentage: 30 },
          { source: "Other Income", amount: 15000, percentage: 10 },
        ],
        topCostCategories: [
          { category: "Materials", amount: 30000, percentage: 40 },
          { category: "Labor", amount: 22500, percentage: 30 },
          { category: "Overhead", amount: 15000, percentage: 20 },
          { category: "Marketing", amount: 7500, percentage: 10 },
        ],
      };

      return mockMetrics;
    } catch (error) {
      console.error("Error fetching metrics:", error);
      return {};
    }
  };

  const renderReportComponent = () => {
    const reportProps = {
      dateRange,
      onGenerateReport: generateReport,
      brandSettings,
    };

    switch (selectedReport) {
      case "pl":
        return <PLReport {...reportProps} />;
      case "revenue":
        return <RevenueReport {...reportProps} />;
      case "costs":
        return <CostsReport {...reportProps} />;
      case "products":
        return <ProductsReport {...reportProps} />;
      case "cashflow":
        return <CashFlowReport {...reportProps} />;
      case "balancesheet":
        return <BalanceSheetReport {...reportProps} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">{t("reports.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t("reports.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FeatureLock featureName="Reports">
      <div className={`container mx-auto px-4 py-8 ${isRTL ? "rtl" : "ltr"}`}>
        {!selectedReport ? (
          // Main Reports Dashboard
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t("reports.title")}
                  </h1>
                  <p className="text-gray-600">{t("reports.subtitle")}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowBrandSettings(true)}
                    className="gap-2"
                  >
                    <Palette className="h-4 w-4" />
                    {t("reports.brandSettings")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Quick export all reports
                      toast({
                        title: t("reports.exportAll"),
                        description: t("reports.exportAllDescription"),
                      });
                    }}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t("reports.exportAll")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t("reports.dateRangeFilter")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("reports.startDate")}
                    </label>
                    <Input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-48"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("reports.endDate")}
                    </label>
                    <Input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-48"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateRange({
                        startDate: new Date(
                          Date.now() - 30 * 24 * 60 * 60 * 1000
                        )
                          .toISOString()
                          .split("T")[0],
                        endDate: new Date().toISOString().split("T")[0],
                      });
                    }}
                    className="mt-6"
                  >
                    {t("reports.last30Days")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Smart Insights Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  {t("reports.smartInsights")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasFeatureAccess("smart insights") ? (
                  <SmartInsightsSection />
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t("reports.smartInsightsNotAvailable")}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {t("reports.smartInsightsDescription")}
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowUpgradeModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {t("reports.upgradeToProfessional")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((report) => (
                <motion.div
                  key={report.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
                    onClick={() => handleReportClick(report.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div
                          className={`p-3 rounded-lg ${report.color} text-white`}
                        >
                          <report.icon className="h-6 w-6" />
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-gray-400" />
                      </div>
                      <CardTitle className="text-xl mt-4">
                        {report.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {t("reports.clickToView")}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            {t("reports.pdf")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {t("reports.excel")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          // Individual Report View
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={handleBackToReports}
                className="mb-4"
              >
                <ChevronDown className="h-4 w-4 mr-2 rotate-90" />
                {t("reports.backToReports")}
              </Button>
            </div>
            {renderReportComponent()}
          </motion.div>
        )}

        {/* Brand Settings Modal */}
        <BrandSettings
          isOpen={showBrandSettings}
          onClose={() => setShowBrandSettings(false)}
          onSettingsChange={(settings) => {
            setBrandSettings(settings);
            toast({
              title: t("reports.success"),
              description: t("reports.brandSettingsUpdated"),
            });
          }}
        />

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
          resourceType="smart_insights"
          currentPlan="Starter"
          limit={0}
          current={0}
        />
      </div>
    </FeatureLock>
  );
};

export default ReportsPage;
