import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Package,
  BarChart3,
  Info,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { inventoryAPI } from "@/services/api";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ProductsReportProps {
  dateRange: DateRange;
  onGenerateReport: (type: string, format: "pdf" | "excel" | "csv") => void;
}

const ProductsReport: React.FC<ProductsReportProps> = ({
  dateRange,
  onGenerateReport,
}) => {
  const [loading, setLoading] = useState(true);
  const [productsData, setProductsData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProductsData();
  }, [dateRange]);

  const loadProductsData = async () => {
    try {
      setLoading(true);
      const inventory = await inventoryAPI.getAll();
      const inventoryData = Array.isArray(inventory) ? inventory : [];
      setProductsData(inventoryData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load products data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = productsData.length;
  const totalValue = productsData.reduce(
    (sum, item) => sum + (item.currentStock || 0) * (item.sellingPrice || 0),
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
  const totalStock = productsData.reduce(
    (sum, item) => sum + (item.currentStock || 0),
    0
  );
  const averageStockPerProduct =
    totalProducts > 0 ? totalStock / totalProducts : 0;
  const averageValuePerProduct =
    totalProducts > 0 ? totalValue / totalProducts : 0;

  const lowStockItems = productsData.filter(
    (item) => (item.currentStock || 0) <= (item.reorderLevel || 0)
  );
  const outOfStockItems = productsData.filter(
    (item) => (item.currentStock || 0) === 0
  );

  const productsByCategory = productsData.reduce((acc: any, item: any) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0, stock: 0 };
    }
    acc[category].count += 1;
    acc[category].value += (item.currentStock || 0) * (item.sellingPrice || 0);
    acc[category].stock += item.currentStock || 0;
    return acc;
  }, {});

  const topCategories = Object.entries(productsByCategory)
    .map(([category, data]: [string, any]) => ({
      category,
      count: data.count,
      value: data.value,
      stock: data.stock,
      percentage: totalProducts > 0 ? (data.count / totalProducts) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const topValueProducts = productsData
    .sort(
      (a, b) =>
        (b.currentStock || 0) * (b.sellingPrice || 0) -
        (a.currentStock || 0) * (a.sellingPrice || 0)
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products Report</h1>
          <p className="text-gray-600">
            {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
            {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onGenerateReport("products", "pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => onGenerateReport("products", "excel")}
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
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalProducts}
            </div>
            <p className="text-gray-600 text-sm">Unique items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalStock.toLocaleString()}
            </div>
            <p className="text-gray-600 text-sm">Units in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-gray-600 text-sm">Total value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockItems.length}
            </div>
            <p className="text-gray-600 text-sm">Need reorder</p>
          </CardContent>
        </Card>
      </div>

      {/* Products by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Products by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
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
                      {category.count} products •{" "}
                      {category.stock.toLocaleString()} units
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {formatCurrency(category.value)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(category.percentage)} of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Value Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            Highest Value Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topValueProducts.map((product, index) => {
              const productValue =
                (product.currentStock || 0) * (product.sellingPrice || 0);
              return (
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
                      <div className="font-medium">
                        {product.productName || product.baseSku}
                      </div>
                      <div className="text-sm text-gray-600">
                        Stock: {product.currentStock?.toLocaleString() || 0} •
                        Price: {formatCurrency(product.sellingPrice || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(productValue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage((productValue / totalValue) * 100)} of
                      total value
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stock Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-500" />
            Stock Analysis & Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded">
              <div className="text-sm font-medium text-blue-800">
                Average Stock
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {averageStockPerProduct.toFixed(0)}
              </div>
              <div className="text-xs text-blue-600">Units per product</div>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <div className="text-sm font-medium text-green-800">
                Average Value
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(averageValuePerProduct)}
              </div>
              <div className="text-xs text-green-600">Per product</div>
            </div>
            <div className="p-4 bg-orange-50 rounded">
              <div className="text-sm font-medium text-orange-800">
                Out of Stock
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {outOfStockItems.length}
              </div>
              <div className="text-xs text-orange-600">Products</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Inventory Management Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded">
                <h4 className="font-semibold text-green-800 mb-2">
                  Inventory Health
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {lowStockItems.length < totalProducts * 0.1 && (
                    <li>• Good stock levels maintained</li>
                  )}
                  {outOfStockItems.length === 0 && (
                    <li>• No out-of-stock products</li>
                  )}
                  {averageStockPerProduct > 10 && (
                    <li>• Adequate stock per product</li>
                  )}
                </ul>
              </div>
              <div className="p-4 bg-red-50 rounded">
                <h4 className="font-semibold text-red-800 mb-2">
                  Attention Needed
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {lowStockItems.length > 0 && (
                    <li>• {lowStockItems.length} products need reorder</li>
                  )}
                  {outOfStockItems.length > 0 && (
                    <li>• {outOfStockItems.length} products out of stock</li>
                  )}
                  {averageStockPerProduct < 5 && (
                    <li>• Low average stock levels</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">
                Strategic Actions
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {lowStockItems.length > 0 && (
                  <li>• Reorder {lowStockItems.length} low-stock products</li>
                )}
                {topCategories[0]?.percentage > 40 && (
                  <li>
                    • Focus on {topCategories[0].category} category (highest
                    value)
                  </li>
                )}
                <li>• Monitor stock levels for high-value products</li>
                <li>• Optimize reorder levels based on demand</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsReport;
