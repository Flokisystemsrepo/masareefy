import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  DollarSign,
  TrendingUp,
  BarChart3,
  Info,
  Star,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { revenuesAPI } from "@/services/api";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface RevenueReportProps {
  dateRange: DateRange;
  onGenerateReport: (type: string, format: "pdf" | "excel" | "csv") => void;
}

const RevenueReport: React.FC<RevenueReportProps> = ({
  dateRange,
  onGenerateReport,
}) => {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRevenueData();
  }, [dateRange]);

  useEffect(() => {
    setCustomDateRange({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  }, [dateRange]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      const revenues = await revenuesAPI.getAll();
      const revenuesData = revenues?.revenues || revenues || [];
      setRevenueData(revenuesData);
    } catch (error: any) {
      toast({
        title: t("reports.error"),
        description: error.message || t("reports.failedToGenerate"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenueData.reduce(
    (sum, rev) => sum + (rev.amount || 0),
    0
  );

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

  // Calculate detailed metrics
  const revenueBySource = revenueData.reduce((acc: any, rev: any) => {
    const source = rev.source || "Other";
    acc[source] = (acc[source] || 0) + (rev.amount || 0);
    return acc;
  }, {});

  const revenueByCategory = revenueData.reduce((acc: any, rev: any) => {
    const category = rev.category || "Other";
    acc[category] = (acc[category] || 0) + (rev.amount || 0);
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

  const topRevenueCategories = Object.entries(revenueByCategory)
    .map(([category, amount]: [string, any]) => ({
      category,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const averageRevenuePerItem =
    revenueData.length > 0 ? totalRevenue / revenueData.length : 0;
  const highestRevenueItem = revenueData.reduce(
    (max, rev) => ((rev.amount || 0) > (max.amount || 0) ? rev : max),
    { amount: 0 }
  );

  return (
    <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("reports.types.revenue.title")}
          </h1>
          <p className="text-gray-600">
            {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
            {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onGenerateReport("revenue", "pdf")}>
            <Download className="h-4 w-4 mr-2" />
            {t("reports.pdf")}
          </Button>
          <Button
            variant="outline"
            onClick={() => onGenerateReport("revenue", "excel")}
          >
            <FileText className="h-4 w-4 mr-2" />
            {t("reports.excel")}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("reports.metrics.totalRevenue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-gray-600 text-sm">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Revenue Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {revenueData.length}
            </div>
            <p className="text-gray-600 text-sm">Total transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average per Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(averageRevenuePerItem)}
            </div>
            <p className="text-gray-600 text-sm">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Highest Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(highestRevenueItem.amount || 0)}
            </div>
            <p className="text-gray-600 text-sm">Single transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Revenue by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRevenueSources.map((source, index) => (
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
                    {source.percentage > 30
                      ? "🏆 Primary Source"
                      : source.percentage > 15
                      ? "📈 Major Source"
                      : "📊 Secondary"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Revenue by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRevenueCategories.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-blue-50 rounded"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{category.category}</div>
                    <div className="text-sm text-gray-600">
                      {formatPercentage(category.percentage)} of total revenue
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {formatCurrency(category.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.percentage > 25
                      ? "💎 Premium Category"
                      : category.percentage > 10
                      ? "📊 Standard"
                      : "📈 Emerging"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-500" />
            Revenue Insights & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.length < 3 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Enough Data
              </h3>
              <p className="text-gray-600 mb-4">
                We need at least 3 revenue entries to generate meaningful
                insights.
              </p>
              <div className="text-sm text-gray-500">
                <p>Current data: {revenueData.length} revenue entries</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded">
                <div className="text-sm font-medium text-green-800">
                  Revenue Concentration
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {topRevenueSources[0]?.percentage
                    ? formatPercentage(topRevenueSources[0].percentage)
                    : "0%"}
                </div>
                <div className="text-xs text-green-600">Top source share</div>
              </div>
              <div className="p-4 bg-blue-50 rounded">
                <div className="text-sm font-medium text-blue-800">
                  Revenue Diversity
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(revenueBySource).length}
                </div>
                <div className="text-xs text-blue-600">Unique sources</div>
              </div>
              <div className="p-4 bg-purple-50 rounded">
                <div className="text-sm font-medium text-purple-800">
                  Revenue Efficiency
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {revenueData.length > 0
                    ? formatCurrency(totalRevenue / revenueData.length)
                    : "$0"}
                </div>
                <div className="text-xs text-purple-600">Per transaction</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Business Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded">
                <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {topRevenueSources[0]?.percentage > 40 && (
                    <li>
                      • Strong primary revenue source:{" "}
                      {topRevenueSources[0].source}
                    </li>
                  )}
                  {Object.keys(revenueBySource).length > 3 && (
                    <li>• Good revenue diversification</li>
                  )}
                  {averageRevenuePerItem > 1000 && (
                    <li>• High average transaction value</li>
                  )}
                </ul>
              </div>
              <div className="p-4 bg-red-50 rounded">
                <h4 className="font-semibold text-red-800 mb-2">
                  Opportunities
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {topRevenueSources[0]?.percentage > 60 && (
                    <li>• Over-reliance on {topRevenueSources[0].source}</li>
                  )}
                  {Object.keys(revenueBySource).length < 3 && (
                    <li>• Limited revenue sources</li>
                  )}
                  {averageRevenuePerItem < 500 && (
                    <li>• Low average transaction value</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">
                Strategic Actions
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {topRevenueSources[0]?.percentage > 50 && (
                  <li>
                    • Develop additional revenue streams beyond{" "}
                    {topRevenueSources[0].source}
                  </li>
                )}
                {Object.keys(revenueByCategory).length < 5 && (
                  <li>• Expand into new revenue categories</li>
                )}
                <li>
                  • Focus on{" "}
                  {topRevenueCategories[0]?.category || "highest performing"}{" "}
                  category
                </li>
                <li>• Optimize pricing for better average transaction value</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueReport;
