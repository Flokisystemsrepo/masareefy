import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Calendar,
  Search,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Target,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { inventoryAPI } from "@/services/api";

interface BestSeller {
  id: string;
  productName: string;
  category: string;
  price: number;
  cost: number;
  stockQuantity: number;
  soldQuantity: number;
  revenue: number;
  profit: number;
  profitMargin: number;
  rating: number;
  reviews: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const BestSellersPage: React.FC = () => {
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  const categories = [
    "Sales",
    "Marketing",
    "Production",
    "Development",
    "Operations",
    "Finance",
    "Customer Service",
  ];

  const statuses = ["in-stock", "low-stock", "out-of-stock"];

  useEffect(() => {
    loadBestSellers();
  }, []);

  const loadBestSellers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await inventoryAPI.getAll();
      // Ensure data is always an array
      const inventoryItems = Array.isArray(data) ? data : data?.inventory || [];

      // Transform inventory items to best sellers format
      const transformedData: BestSeller[] = inventoryItems.map((item: any) => ({
        id: item.id,
        productName: item.productName,
        category: item.category,
        price: item.price || 0,
        cost: item.cost || 0,
        stockQuantity: item.stockQuantity || 0,
        soldQuantity: Math.floor(Math.random() * 100) + 10, // Mock sold quantity
        revenue: (item.price || 0) * (Math.floor(Math.random() * 100) + 10),
        profit:
          ((item.price || 0) - (item.cost || 0)) *
          (Math.floor(Math.random() * 100) + 10),
        profitMargin:
          item.price && item.cost
            ? ((item.price - item.cost) / item.price) * 100
            : 0,
        rating: Math.random() * 2 + 3, // Random rating between 3-5
        reviews: Math.floor(Math.random() * 50) + 5,
        status: item.status || "in-stock",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setBestSellers(transformedData);
    } catch (error: any) {
      console.error("Error loading best sellers:", error);
      setError(error.message || "Failed to load best sellers");
      setBestSellers([]); // Set empty array on error
      toast({
        title: "Error",
        description: error.message || "Failed to load best sellers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-800";
      case "low-stock":
        return "bg-yellow-100 text-yellow-800";
      case "out-of-stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? "text-green-600" : "text-red-600";
  };

  const getTrendIcon = (trend: "up" | "down") => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const filteredAndSortedBestSellers = (bestSellers || [])
    .filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;
      const matchesStatus =
        filterStatus === "all" || item.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case "revenue":
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case "profit":
          aValue = a.profit;
          bValue = b.profit;
          break;
        case "soldQuantity":
          aValue = a.soldQuantity;
          bValue = b.soldQuantity;
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          aValue = a.revenue;
          bValue = b.revenue;
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  const totalRevenue = (bestSellers || []).reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const totalProfit = (bestSellers || []).reduce(
    (sum, item) => sum + item.profit,
    0
  );
  const totalSold = (bestSellers || []).reduce(
    (sum, item) => sum + item.soldQuantity,
    0
  );
  const avgRating =
    (bestSellers || []).length > 0
      ? Math.round(
          ((bestSellers || []).reduce((sum, item) => sum + item.rating, 0) /
            (bestSellers || []).length) *
            10
        ) / 10
      : 0;

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading best sellers...</p>
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
              onClick={loadBestSellers}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Best Sellers</h1>
          <p className="text-gray-600 mt-1">
            Track your top-performing products and sales analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {[
          {
            title: "Total Revenue",
            value: `EGP ${totalRevenue.toLocaleString()}`,
            change: "+12.5%",
            trend: "up" as "up" | "down",
            icon: DollarSign,
            color: "green",
          },
          {
            title: "Total Profit",
            value: `EGP ${totalProfit.toLocaleString()}`,
            change: "+8.3%",
            trend: "up" as "up" | "down",
            icon: TrendingUp,
            color: "blue",
          },
          {
            title: "Units Sold",
            value: totalSold.toLocaleString(),
            change: "+15.2%",
            trend: "up" as "up" | "down",
            icon: ShoppingCart,
            color: "purple",
          },
          {
            title: "Avg Rating",
            value: `${avgRating}/5.0`,
            change: "+0.2",
            trend: "up" as "up" | "down",
            icon: Star,
            color: "yellow",
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(metric.trend)}
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
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg bg-${metric.color}-100 flex items-center justify-center`}
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

      {/* Search and Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="profit">Sort by Profit</option>
            <option value="soldQuantity">Sort by Units Sold</option>
            <option value="rating">Sort by Rating</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </motion.div>

      {/* Best Sellers Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {filteredAndSortedBestSellers.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {item.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({item.reviews})
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.category}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-lg font-semibold">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cost</p>
                      <p className="text-lg font-semibold">
                        ${item.cost.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Revenue</span>
                      <span className="text-sm font-semibold text-green-600">
                        EGP {item.revenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Profit</span>
                      <span
                        className={`text-sm font-semibold ${getProfitColor(
                          item.profit
                        )}`}
                      >
                        EGP {item.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Margin</span>
                      <span
                        className={`text-sm font-semibold ${getProfitColor(
                          item.profitMargin
                        )}`}
                      >
                        {item.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Stock</p>
                      <p className="text-lg font-semibold">
                        {item.stockQuantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sold</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {item.soldQuantity}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Updated:{" "}
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredAndSortedBestSellers.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No best sellers found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterCategory !== "all" || filterStatus !== "all"
              ? "No products match your search criteria."
              : "Start adding products to see your best sellers."}
          </p>
        </motion.div>
      )}

      {/* Performance Chart Placeholder */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sales Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BestSellersPage;
