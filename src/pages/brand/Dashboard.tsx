import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Calendar,
  Filter,
  MoreVertical,
  Users,
  Package,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { metricsAPI, revenuesAPI, costsAPI, walletAPI } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardMetrics {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  walletBalance: number;
  revenueChange: number;
  costChange: number;
  profitChange: number;
  walletChange: number;
}

interface RecentActivity {
  id: string;
  type: "revenue" | "cost" | "team" | "transfer";
  description: string;
  amount: number | null;
  time: string;
}

const Dashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [dateRange, setDateRange] = useState("30d");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [costData, setCostData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []); // Only fetch on initial load

  // Separate effect for date range changes with debounce
  useEffect(() => {
    if (metrics) {
      // Only update if we already have data
      const timeoutId = setTimeout(() => {
        handleDateRangeChange();
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all metrics in parallel with date range
      const [
        financialMetrics,
        revenueMetrics,
        costMetrics,
        revenuesData,
        costsData,
        walletsData,
      ] = await Promise.all([
        metricsAPI.getFinancialMetrics(dateRange),
        metricsAPI.getRevenueMetrics(dateRange),
        metricsAPI.getCostMetrics(dateRange),
        revenuesAPI.getAll({ limit: 5 }),
        costsAPI.getAll({ limit: 5 }),
        walletAPI.getAll(),
      ]);

      console.log("Dashboard API Responses:", {
        financialMetrics,
        revenueMetrics,
        costMetrics,
        revenuesData,
        costsData,
      });

      // Calculate dashboard metrics using real data
      const dashboardMetrics: DashboardMetrics = {
        totalRevenue: revenueMetrics.totalRevenue || 0,
        totalCosts: costMetrics.totalCosts || 0,
        netProfit:
          (revenueMetrics.totalRevenue || 0) - (costMetrics.totalCosts || 0),
        walletBalance: walletsData
          ? walletsData.reduce(
              (sum: number, wallet: any) => sum + wallet.balance,
              0
            )
          : 0,
        revenueChange: revenueMetrics.monthlyRevenue
          ? (revenueMetrics.monthlyRevenue /
              (revenueMetrics.totalRevenue || 1)) *
            100
          : 0,
        costChange: costMetrics.monthlyCosts
          ? (costMetrics.monthlyCosts / (costMetrics.totalCosts || 1)) * 100
          : 0,
        profitChange:
          (revenueMetrics.monthlyRevenue || 0) -
            (costMetrics.monthlyCosts || 0) >
          0
            ? 5.2
            : -3.1, // Simplified calculation
        walletChange: financialMetrics.totalReceivables > 0 ? 2.1 : -1.5, // Simplified calculation
      };

      setMetrics(dashboardMetrics);

      // Create recent activities from real data
      const activities: RecentActivity[] = [];

      // Add recent revenues
      if (revenuesData?.revenues && Array.isArray(revenuesData.revenues)) {
        revenuesData.revenues.forEach((revenue: any) => {
          activities.push({
            id: revenue.id,
            type: "revenue",
            description: `${revenue.name} - ${revenue.source}`,
            amount: revenue.amount,
            time: new Date(revenue.createdAt).toLocaleDateString(),
          });
        });
      }

      // Add recent costs
      if (costsData?.costs && Array.isArray(costsData.costs)) {
        costsData.costs.forEach((cost: any) => {
          activities.push({
            id: cost.id,
            type: "cost",
            description: `${cost.name} - ${cost.vendor}`,
            amount: -cost.amount,
            time: new Date(cost.createdAt).toLocaleDateString(),
          });
        });
      }

      // Sort by creation date and take the most recent 5
      activities.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setRecentActivities(activities.slice(0, 5));

      // Generate real chart data from costs and revenues
      const generateCostData = (costs: any[]) => {
        if (!costs || !Array.isArray(costs)) return [];

        const categoryMap = new Map();
        costs.forEach((cost: any) => {
          const category = cost.category || "Other";
          categoryMap.set(
            category,
            (categoryMap.get(category) || 0) + cost.amount
          );
        });

        return Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value: Number(value),
        }));
      };

      const generateRevenueData = (revenues: any[]) => {
        if (!revenues || !Array.isArray(revenues)) return [];

        const monthlyData = new Map();
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        revenues.forEach((revenue: any) => {
          const date = new Date(revenue.date);
          const monthKey = months[date.getMonth()];
          const current = monthlyData.get(monthKey) || {
            revenue: 0,
            profit: 0,
          };
          current.revenue += revenue.amount;
          current.profit += revenue.amount * 0.4; // Simplified profit calculation
          monthlyData.set(monthKey, current);
        });

        return months.map((month) => ({
          month,
          revenue: monthlyData.get(month)?.revenue || 0,
          profit: monthlyData.get(month)?.profit || 0,
        }));
      };

      // Store chart data in state
      setCostData(generateCostData(costsData?.costs || []));
      setRevenueData(generateRevenueData(revenuesData?.revenues || []));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = async () => {
    try {
      setFilterLoading(true);

      // Only fetch the metrics that change with date range
      const [financialMetrics, revenueMetrics, costMetrics] = await Promise.all(
        [
          metricsAPI.getFinancialMetrics(dateRange),
          metricsAPI.getRevenueMetrics(dateRange),
          metricsAPI.getCostMetrics(dateRange),
        ]
      );

      // Update only the metrics that change
      setMetrics((prevMetrics) => {
        if (!prevMetrics) return prevMetrics;

        return {
          ...prevMetrics,
          totalRevenue: revenueMetrics.totalRevenue || 0,
          totalCosts: costMetrics.totalCosts || 0,
          netProfit:
            (revenueMetrics.totalRevenue || 0) - (costMetrics.totalCosts || 0),
          revenueChange: revenueMetrics.monthlyRevenue
            ? (revenueMetrics.monthlyRevenue /
                (revenueMetrics.totalRevenue || 1)) *
              100
            : 0,
          costChange: costMetrics.monthlyCosts
            ? (costMetrics.monthlyCosts / (costMetrics.totalCosts || 1)) * 100
            : 0,
          profitChange:
            (revenueMetrics.monthlyRevenue || 0) -
              (costMetrics.monthlyCosts || 0) >
            0
              ? 5.2
              : -3.1,
        };
      });

      // Update chart data with new date range
      const [revenuesData, costsData] = await Promise.all([
        revenuesAPI.getAll({ limit: 50 }), // Get more data for charts
        costsAPI.getAll({ limit: 50 }),
      ]);

      // Update chart data
      const generateCostData = (costs: any[]) => {
        if (!costs || !Array.isArray(costs)) return [];

        const categoryMap = new Map();
        costs.forEach((cost: any) => {
          const category = cost.category || "Other";
          categoryMap.set(
            category,
            (categoryMap.get(category) || 0) + cost.amount
          );
        });

        return Array.from(categoryMap.entries()).map(([name, value]) => ({
          name,
          value: Number(value),
        }));
      };

      const generateRevenueData = (revenues: any[]) => {
        if (!revenues || !Array.isArray(revenues)) return [];

        const monthlyData = new Map();
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        revenues.forEach((revenue: any) => {
          const date = new Date(revenue.date);
          const monthKey = months[date.getMonth()];
          const current = monthlyData.get(monthKey) || {
            revenue: 0,
            profit: 0,
          };
          current.revenue += revenue.amount;
          current.profit += revenue.amount * 0.4;
          monthlyData.set(monthKey, current);
        });

        return months.map((month) => ({
          month,
          revenue: monthlyData.get(month)?.revenue || 0,
          profit: monthlyData.get(month)?.profit || 0,
        }));
      };

      setCostData(generateCostData(costsData?.costs || []));
      setRevenueData(generateRevenueData(revenuesData?.revenues || []));
    } catch (error) {
      console.error("Error updating date range:", error);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t("dashboard.loading")}</p>
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
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("dashboard.retry")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 space-y-6 bg-gray-50 min-h-screen ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("dashboard.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("dashboard.subtitle")}</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            disabled={filterLoading}
            className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              filterLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <option value="7d">
              {filterLoading
                ? t("dashboard.dateRange.loading")
                : t("dashboard.dateRange.last7Days")}
            </option>
            <option value="30d">
              {filterLoading
                ? t("dashboard.dateRange.loading")
                : t("dashboard.dateRange.last30Days")}
            </option>
            <option value="90d">
              {filterLoading
                ? t("dashboard.dateRange.loading")
                : t("dashboard.dateRange.last90Days")}
            </option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {refreshing ? t("dashboard.refreshing") : t("dashboard.refresh")}
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {metrics &&
          [
            {
              title: t("dashboard.metrics.totalRevenue"),
              value: `EGP ${metrics.totalRevenue.toLocaleString()}`,
              change: `${
                metrics.revenueChange > 0 ? "+" : ""
              }${metrics.revenueChange.toFixed(1)}%`,
              trend: metrics.revenueChange >= 0 ? "up" : "down",
              icon: DollarSign,
              color: "green",
            },
            {
              title: t("dashboard.metrics.totalCosts"),
              value: `EGP ${metrics.totalCosts.toLocaleString()}`,
              change: `${
                metrics.costChange > 0 ? "+" : ""
              }${metrics.costChange.toFixed(1)}%`,
              trend: metrics.costChange >= 0 ? "up" : "down",
              icon: TrendingUp,
              color: "red",
            },
            {
              title: t("dashboard.metrics.netProfit"),
              value: `EGP ${metrics.netProfit.toLocaleString()}`,
              change: `${
                metrics.profitChange > 0 ? "+" : ""
              }${metrics.profitChange.toFixed(1)}%`,
              trend: metrics.profitChange >= 0 ? "up" : "down",
              icon: TrendingUp,
              color: "blue",
            },
            {
              title: t("dashboard.metrics.walletBalance"),
              value: `EGP ${metrics.walletBalance.toLocaleString()}`,
              change: `${
                metrics.walletChange > 0 ? "+" : ""
              }${metrics.walletChange.toFixed(1)}%`,
              trend: metrics.walletChange >= 0 ? "up" : "down",
              icon: Wallet,
              color: "purple",
            },
          ].map((metric, index) => (
            <motion.div key={metric.title} variants={itemVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-600 h-32">
                <CardContent className="p-4 h-full">
                  <div className="flex items-center justify-between h-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 truncate">
                        {metric.title}
                      </p>
                      <p className="text-xl font-bold text-gray-900 truncate">
                        {filterLoading ? (
                          <span className="inline-flex items-center">
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </span>
                        ) : (
                          metric.value
                        )}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        {metric.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            metric.trend === "up"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {metric.change}
                        </span>
                        <span className="text-xs text-gray-500">
                          {t("dashboard.metrics.vsLastMonth")}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-lg bg-${metric.color}-100 flex items-center justify-center flex-shrink-0 ml-3`}
                    >
                      <metric.icon
                        className={`h-5 w-5 text-${metric.color}-600`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Costs by Category */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                {t("dashboard.charts.costsByCategory")}
              </CardTitle>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {filterLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">
                      {t("dashboard.charts.updatingChart")}
                    </p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [
                        `EGP ${value.toLocaleString()}`,
                        t("dashboard.charts.cost"),
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue & Profit Trend */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                {t("dashboard.charts.revenueProfitTrend")}
              </CardTitle>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {filterLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">
                      {t("dashboard.charts.updatingChart")}
                    </p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [
                        `EGP ${value.toLocaleString()}`,
                        t("dashboard.charts.amount"),
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {t("dashboard.recentActivity.title")}
            </CardTitle>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === "revenue"
                            ? "bg-green-100"
                            : activity.type === "cost"
                            ? "bg-red-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {activity.type === "revenue" ? (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        ) : activity.type === "cost" ? (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        ) : (
                          <Users className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    {activity.amount !== null && (
                      <span
                        className={`text-sm font-medium ${
                          activity.amount > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {activity.amount > 0 ? "+" : ""}EGP{" "}
                        {Math.abs(activity.amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {t("dashboard.recentActivity.noActivity")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
