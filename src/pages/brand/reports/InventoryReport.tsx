import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
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
  AlertTriangle,
  Box,
  Tag,
  ShoppingCart,
  DollarSign,
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
import { inventoryAPI } from "@/services/api";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface InventoryMetrics {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  avgStockValue: number;
  stockTurnoverRate: number;
  topProducts: Array<{
    name: string;
    stock: number;
    value: number;
    percentage: number;
  }>;
  lowStockAlerts: Array<{
    name: string;
    currentStock: number;
    reorderLevel: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  stockValueByCategory: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
  supplierDistribution: Array<{
    supplier: string;
    count: number;
    percentage: number;
  }>;
}

interface InventoryReportProps {
  dateRange: DateRange;
  onGenerateReport: (type: string, format: "pdf" | "excel" | "csv") => void;
}

const InventoryReport: React.FC<InventoryReportProps> = ({
  dateRange,
  onGenerateReport,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    avgStockValue: 0,
    stockTurnoverRate: 0,
    topProducts: [],
    lowStockAlerts: [],
    categoryDistribution: [],
    stockValueByCategory: [],
    supplierDistribution: [],
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadInventoryData();
  }, [dateRange]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading inventory data...");
      const inventory = await inventoryAPI.getAll();
      console.log("Inventory API response:", inventory);

      // Handle different response formats
      let inventoryData = [];
      if (Array.isArray(inventory)) {
        inventoryData = inventory;
      } else if (inventory && Array.isArray(inventory.data)) {
        inventoryData = inventory.data;
      } else if (inventory && Array.isArray(inventory.inventory)) {
        inventoryData = inventory.inventory;
      } else {
        console.warn("Unexpected inventory response format:", inventory);
        inventoryData = [];
      }

      console.log("Processed inventory data:", inventoryData);

      // Calculate basic metrics
      const totalProducts = inventoryData.length;
      console.log("Total products:", totalProducts);

      const totalStock = inventoryData.reduce(
        (sum: number, item: any) => sum + (item.currentStock || 0),
        0
      );
      console.log("Total stock:", totalStock);

      const totalValue = inventoryData.reduce(
        (sum: number, item: any) =>
          sum + (item.currentStock || 0) * (item.sellingPrice || 0),
        0
      );
      console.log("Total value:", totalValue);

      const lowStockItems = inventoryData.filter(
        (item: any) =>
          (item.currentStock || 0) <= (item.reorderLevel || 0) &&
          (item.currentStock || 0) > 0
      ).length;
      console.log("Low stock items:", lowStockItems);

      const outOfStockItems = inventoryData.filter(
        (item: any) => (item.currentStock || 0) === 0
      ).length;
      console.log("Out of stock items:", outOfStockItems);

      const avgStockValue = totalProducts > 0 ? totalValue / totalProducts : 0;
      console.log("Average stock value:", avgStockValue);

      // Top products by value
      const topProducts = inventoryData
        .map((item: any) => ({
          name: item.productName,
          stock: item.currentStock || 0,
          value: (item.currentStock || 0) * (item.sellingPrice || 0),
          percentage:
            totalValue > 0
              ? (((item.currentStock || 0) * (item.sellingPrice || 0)) /
                  totalValue) *
                100
              : 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Low stock alerts
      const lowStockAlerts = inventoryData
        .filter(
          (item: any) => (item.currentStock || 0) <= (item.reorderLevel || 0)
        )
        .map((item: any) => ({
          name: item.productName,
          currentStock: item.currentStock || 0,
          reorderLevel: item.reorderLevel || 0,
        }))
        .slice(0, 10);

      // Category distribution
      const categoryCount = inventoryData.reduce((acc: any, item: any) => {
        const category = item.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const categoryDistribution = Object.entries(categoryCount)
        .map(([category, count]: [string, any]) => ({
          category,
          count,
          percentage: totalProducts > 0 ? (count / totalProducts) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Stock value by category
      const categoryValue = inventoryData.reduce((acc: any, item: any) => {
        const category = item.category || "Uncategorized";
        const value = (item.currentStock || 0) * (item.sellingPrice || 0);
        acc[category] = (acc[category] || 0) + value;
        return acc;
      }, {});

      const stockValueByCategory = Object.entries(categoryValue)
        .map(([category, value]: [string, any]) => ({
          category,
          value,
          percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);

      // Supplier distribution
      const supplierCount = inventoryData.reduce((acc: any, item: any) => {
        const supplier = item.supplier || "Unknown";
        acc[supplier] = (acc[supplier] || 0) + 1;
        return acc;
      }, {});

      const supplierDistribution = Object.entries(supplierCount)
        .map(([supplier, count]: [string, any]) => ({
          supplier,
          count,
          percentage: totalProducts > 0 ? (count / totalProducts) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setMetrics({
        totalProducts,
        totalStock,
        lowStockItems,
        outOfStockItems,
        totalValue,
        avgStockValue,
        stockTurnoverRate: 2.5, // Mock data
        topProducts,
        lowStockAlerts,
        categoryDistribution,
        stockValueByCategory,
        supplierDistribution,
      });
    } catch (error: any) {
      console.error("Error loading inventory data:", error);
      setError(error.message || "Failed to load inventory data");
      toast({
        title: "Error",
        description: error.message || "Failed to load inventory data",
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

  const getStatusColor = (stock: number, reorderLevel: number) => {
    if (stock === 0) return "text-red-600";
    if (stock <= reorderLevel) return "text-orange-600";
    return "text-green-600";
  };

  const getStatusIcon = (stock: number, reorderLevel: number) => {
    if (stock === 0) return <XCircle className="h-4 w-4 text-red-500" />;
    if (stock <= reorderLevel)
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
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
          <p className="text-gray-600">Loading inventory data...</p>
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
          <Button onClick={loadInventoryData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Report</h1>
          <p className="text-gray-600">
            {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
            {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onGenerateReport("inventory", "pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => onGenerateReport("inventory", "excel")}
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
          onClick={() => handleMetricClick("products")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.totalProducts}
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleMetricClick("stock")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">
                {metrics.totalStock.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Box className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleMetricClick("value")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(metrics.totalValue)}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => handleMetricClick("alerts")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-orange-600">
                {metrics.lowStockItems + metrics.outOfStockItems}
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Stock Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Stock</span>
              <span className="font-semibold text-green-600">
                {metrics.totalProducts -
                  metrics.lowStockItems -
                  metrics.outOfStockItems}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Low Stock</span>
              <span className="font-semibold text-orange-600">
                {metrics.lowStockItems}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Out of Stock</span>
              <span className="font-semibold text-red-600">
                {metrics.outOfStockItems}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Stock Value</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(metrics.avgStockValue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.categoryDistribution.slice(0, 5).map((category, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{category.category}</span>
                <div className="text-right">
                  <div className="font-semibold">{category.count}</div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(category.percentage)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Products by Value */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Products by Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      Stock: {product.stock.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {formatCurrency(product.value)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(product.percentage)} of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.lowStockAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(alert.currentStock, alert.reorderLevel)}
                  <div>
                    <div className="font-medium">{alert.name}</div>
                    <div className="text-sm text-gray-500">
                      Current: {alert.currentStock} | Reorder Level:{" "}
                      {alert.reorderLevel}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      alert.currentStock === 0 ? "destructive" : "secondary"
                    }
                    className={getStatusColor(
                      alert.currentStock,
                      alert.reorderLevel
                    )}
                  >
                    {alert.currentStock === 0 ? "Out of Stock" : "Low Stock"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Value by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Stock Value by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.stockValueByCategory.slice(0, 5).map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{category.category}</div>
                    <div className="text-sm text-gray-500">
                      {formatPercentage(category.percentage)} of total value
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-purple-600">
                    {formatCurrency(category.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-500" />
            Inventory Insights & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryData.length < 3 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Enough Data
              </h3>
              <p className="text-gray-600 mb-4">
                We need at least 3 inventory items to generate meaningful
                insights.
              </p>
              <div className="text-sm text-gray-500">
                <p>Current data: {inventoryData.length} inventory items</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded">
                <div className="text-sm font-medium text-green-800">
                  Stock Health
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.lowStockItems === 0
                    ? "100%"
                    : `${Math.round(
                        ((metrics.totalProducts - metrics.lowStockItems) /
                          metrics.totalProducts) *
                          100
                      )}%`}
                </div>
                <div className="text-xs text-green-600">
                  Items above reorder level
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded">
                <div className="text-sm font-medium text-blue-800">
                  Inventory Value
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(metrics.totalValue)}
                </div>
                <div className="text-xs text-blue-600">Total stock value</div>
              </div>
              <div className="p-4 bg-purple-50 rounded">
                <div className="text-sm font-medium text-purple-800">
                  Category Diversity
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.categoryDistribution.length}
                </div>
                <div className="text-xs text-purple-600">
                  Product categories
                </div>
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
              {selectedMetric === "products" && "Product Details"}
              {selectedMetric === "stock" && "Stock Details"}
              {selectedMetric === "value" && "Value Analysis"}
              {selectedMetric === "alerts" && "Stock Alerts"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMetric === "products" && (
              <div>
                <h3 className="font-semibold mb-2">Product Distribution</h3>
                <div className="space-y-2">
                  {metrics.categoryDistribution.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{category.category}</span>
                      <span className="font-semibold">
                        {category.count} products
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedMetric === "stock" && (
              <div>
                <h3 className="font-semibold mb-2">Stock Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span>Total Stock Units</span>
                    <span className="font-semibold text-green-600">
                      {metrics.totalStock.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span>Average Stock per Product</span>
                    <span className="font-semibold text-blue-600">
                      {metrics.totalProducts > 0
                        ? Math.round(metrics.totalStock / metrics.totalProducts)
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span>Stock Turnover Rate</span>
                    <span className="font-semibold text-purple-600">
                      {metrics.stockTurnoverRate}x
                    </span>
                  </div>
                </div>
              </div>
            )}
            {selectedMetric === "value" && (
              <div>
                <h3 className="font-semibold mb-2">Value Analysis</h3>
                <div className="space-y-2">
                  {metrics.stockValueByCategory.map((category, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{category.category}</span>
                      <span className="font-semibold">
                        {formatCurrency(category.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedMetric === "alerts" && (
              <div>
                <h3 className="font-semibold mb-2">Stock Alerts</h3>
                <div className="space-y-2">
                  {metrics.lowStockAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-red-50 rounded"
                    >
                      <span>{alert.name}</span>
                      <span className="font-semibold text-red-600">
                        {alert.currentStock} / {alert.reorderLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryReport;
