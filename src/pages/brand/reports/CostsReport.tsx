import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  TrendingDown,
  BarChart3,
  Info,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { costsAPI } from "@/services/api";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface CostsReportProps {
  dateRange: DateRange;
  onGenerateReport: (type: string, format: "pdf" | "excel" | "csv") => void;
}

const CostsReport: React.FC<CostsReportProps> = ({
  dateRange,
  onGenerateReport,
}) => {
  const [loading, setLoading] = useState(true);
  const [costsData, setCostsData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCostsData();
  }, [dateRange]);

  const loadCostsData = async () => {
    try {
      setLoading(true);
      const costs = await costsAPI.getAll();
      const costsData = costs?.costs || costs || [];
      setCostsData(costsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load costs data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalCosts = costsData.reduce(
    (sum, cost) => sum + (cost.amount || 0),
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
  const costByCategory = costsData.reduce((acc: any, cost: any) => {
    const category = cost.category || "Other";
    acc[category] = (acc[category] || 0) + (cost.amount || 0);
    return acc;
  }, {});

  const costByVendor = costsData.reduce((acc: any, cost: any) => {
    const vendor = cost.vendor || "Other";
    acc[vendor] = (acc[vendor] || 0) + (cost.amount || 0);
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

  const topVendors = Object.entries(costByVendor)
    .map(([vendor, amount]: [string, any]) => ({
      vendor,
      amount,
      percentage: totalCosts > 0 ? (amount / totalCosts) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const averageCostPerItem =
    costsData.length > 0 ? totalCosts / costsData.length : 0;
  const highestCostItem = costsData.reduce(
    (max, cost) => ((cost.amount || 0) > (max.amount || 0) ? cost : max),
    { amount: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Costs Report</h1>
          <p className="text-gray-600">
            {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
            {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onGenerateReport("costs", "pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => onGenerateReport("costs", "excel")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalCosts)}
            </div>
            <p className="text-gray-600 text-sm">Total expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cost Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {costsData.length}
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
              {formatCurrency(averageCostPerItem)}
            </div>
            <p className="text-gray-600 text-sm">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Highest Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(highestCostItem.amount || 0)}
            </div>
            <p className="text-gray-600 text-sm">Single transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Costs by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Costs by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCostCategories.map((category, index) => (
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
        </CardContent>
      </Card>

      {/* Costs by Vendor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            Costs by Vendor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topVendors.map((vendor, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-orange-50 rounded"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{vendor.vendor}</div>
                    <div className="text-sm text-gray-600">
                      {formatPercentage(vendor.percentage)} of total costs
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-orange-600">
                    {formatCurrency(vendor.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {vendor.percentage > 25
                      ? "💰 Major Supplier"
                      : vendor.percentage > 10
                      ? "📊 Regular"
                      : "📈 Occasional"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-500" />
            Cost Insights & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {costsData.length < 3 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Enough Data
              </h3>
              <p className="text-gray-600 mb-4">
                We need at least 3 cost entries to generate meaningful insights.
              </p>
              <div className="text-sm text-gray-500">
                <p>Current data: {costsData.length} cost entries</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded">
                <div className="text-sm font-medium text-red-800">
                  Cost Concentration
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {topCostCategories[0]?.percentage
                    ? formatPercentage(topCostCategories[0].percentage)
                    : "0%"}
                </div>
                <div className="text-xs text-red-600">Top category share</div>
              </div>
              <div className="p-4 bg-orange-50 rounded">
                <div className="text-sm font-medium text-orange-800">
                  Vendor Diversity
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(costByVendor).length}
                </div>
                <div className="text-xs text-orange-600">Unique vendors</div>
              </div>
              <div className="p-4 bg-purple-50 rounded">
                <div className="text-sm font-medium text-purple-800">
                  Cost Efficiency
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {costsData.length > 0
                    ? formatCurrency(totalCosts / costsData.length)
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
            Cost Management Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded">
                <h4 className="font-semibold text-green-800 mb-2">
                  Well Managed
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {Object.keys(costByCategory).length > 5 && (
                    <li>• Good cost categorization</li>
                  )}
                  {Object.keys(costByVendor).length > 3 && (
                    <li>• Vendor diversification</li>
                  )}
                  {averageCostPerItem < 1000 && (
                    <li>• Controlled average cost</li>
                  )}
                </ul>
              </div>
              <div className="p-4 bg-red-50 rounded">
                <h4 className="font-semibold text-red-800 mb-2">
                  Attention Needed
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {topCostCategories[0]?.percentage > 40 && (
                    <li>
                      • High concentration in {topCostCategories[0].category}
                    </li>
                  )}
                  {topVendors[0]?.percentage > 50 && (
                    <li>• Over-reliance on {topVendors[0].vendor}</li>
                  )}
                  {averageCostPerItem > 2000 && (
                    <li>• High average transaction cost</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">
                Strategic Actions
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {topCostCategories[0]?.percentage > 30 && (
                  <li>
                    • Review {topCostCategories[0].category} costs for
                    optimization
                  </li>
                )}
                {topVendors[0]?.percentage > 40 && (
                  <li>• Diversify suppliers beyond {topVendors[0].vendor}</li>
                )}
                <li>• Negotiate better rates with major vendors</li>
                <li>
                  • Implement cost control measures for high-impact categories
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostsReport;
