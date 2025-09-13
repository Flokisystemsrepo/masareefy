import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AnalyticsData {
  period: string;
  userGrowth: Array<{ date: string; count: number }>;
  revenueData: Array<{ date: string; amount: number }>;
  subscriptionData: Array<{ date: string; trialing: number; active: number }>;
  brandGrowth: Array<{ date: string; count: number }>;
}

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        period: selectedPeriod,
      });

      const response = await fetch(
        `http://localhost:3001/api/admin/analytics?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data: AnalyticsResponse = await response.json();

      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        throw new Error("Failed to load analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const calculateGrowth = (data: Array<{ date: string; count: number }>) => {
    if (data.length < 2) return { percentage: 0, change: 0 };

    const first = data[0].count;
    const last = data[data.length - 1].count;
    const change = last - first;
    const percentage = first > 0 ? (change / first) * 100 : 0;

    return { percentage: Math.round(percentage * 10) / 10, change };
  };

  const calculateTotalRevenue = () => {
    if (!analyticsData?.revenueData) return 0;
    return analyticsData.revenueData.reduce(
      (sum, item) => sum + item.amount,
      0
    );
  };

  const calculateConversionRate = () => {
    if (!analyticsData?.subscriptionData) return 0;

    const totalTrialing = analyticsData.subscriptionData.reduce(
      (sum, item) => sum + item.trialing,
      0
    );
    const totalActive = analyticsData.subscriptionData.reduce(
      (sum, item) => sum + item.active,
      0
    );

    const total = totalTrialing + totalActive;
    return total > 0 ? Math.round((totalActive / total) * 100 * 10) / 10 : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export analytics data");
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics & Reports
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive analytics and insights for your platform
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchAnalytics}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={fetchAnalytics} variant="outline">
              Try Again
            </Button>
          </div>
        ) : analyticsData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    User Growth
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {(() => {
                    const userGrowth = calculateGrowth(
                      analyticsData.userGrowth
                    );
                    return (
                      <>
                        <div className="text-2xl font-bold">
                          {userGrowth.percentage > 0 ? "+" : ""}
                          {userGrowth.percentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {userGrowth.change > 0 ? "+" : ""}
                          {userGrowth.change} users this period
                        </p>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(calculateTotalRevenue())}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analyticsData.revenueData.length} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversion Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateConversionRate()}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trial to paid conversion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Brand Growth
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {(() => {
                    const brandGrowth = calculateGrowth(
                      analyticsData.brandGrowth
                    );
                    return (
                      <>
                        <div className="text-2xl font-bold">
                          {brandGrowth.percentage > 0 ? "+" : ""}
                          {brandGrowth.percentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {brandGrowth.change > 0 ? "+" : ""}
                          {brandGrowth.change} brands this period
                        </p>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Growth</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData.userGrowth.length > 0 ? (
                    <div className="space-y-4">
                      <div className="h-64 flex items-end justify-between space-x-2">
                        {analyticsData.userGrowth.map((item, index) => {
                          const maxCount = Math.max(
                            ...analyticsData.userGrowth.map((d) => d.count)
                          );
                          const height =
                            maxCount > 0 ? (item.count / maxCount) * 200 : 0;
                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center space-y-2"
                            >
                              <div
                                className="bg-blue-500 rounded-t w-8 transition-all duration-300"
                                style={{ height: `${height}px` }}
                              />
                              <div className="text-xs text-gray-500">
                                {formatDate(item.date)}
                              </div>
                              <div className="text-xs font-medium">
                                {item.count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No user growth data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Subscription Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsData.subscriptionData.length > 0 ? (
                    <div className="space-y-4">
                      <div className="h-64 flex items-end justify-between space-x-2">
                        {analyticsData.subscriptionData.map((item, index) => {
                          const maxCount = Math.max(
                            ...analyticsData.subscriptionData.map(
                              (d) => d.trialing + d.active
                            )
                          );
                          const trialingHeight =
                            maxCount > 0 ? (item.trialing / maxCount) * 200 : 0;
                          const activeHeight =
                            maxCount > 0 ? (item.active / maxCount) * 200 : 0;
                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center space-y-2"
                            >
                              <div className="flex flex-col space-y-1">
                                <div
                                  className="bg-green-500 rounded-t w-8 transition-all duration-300"
                                  style={{ height: `${activeHeight}px` }}
                                  title={`Active: ${item.active}`}
                                />
                                <div
                                  className="bg-blue-500 w-8 transition-all duration-300"
                                  style={{ height: `${trialingHeight}px` }}
                                  title={`Trialing: ${item.trialing}`}
                                />
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(item.date)}
                              </div>
                              <div className="text-xs font-medium">
                                {item.active + item.trialing}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>Active</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span>Trialing</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No subscription data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Brand Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Brand Growth</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.brandGrowth.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {analyticsData.brandGrowth.map((item, index) => {
                        const maxCount = Math.max(
                          ...analyticsData.brandGrowth.map((d) => d.count)
                        );
                        const height =
                          maxCount > 0 ? (item.count / maxCount) * 200 : 0;
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center space-y-2"
                          >
                            <div
                              className="bg-purple-500 rounded-t w-8 transition-all duration-300"
                              style={{ height: `${height}px` }}
                            />
                            <div className="text-xs text-gray-500">
                              {formatDate(item.date)}
                            </div>
                            <div className="text-xs font-medium">
                              {item.count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No brand growth data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Summary Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analyticsData.userGrowth.reduce(
                        (sum, item) => sum + item.count,
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.subscriptionData.reduce(
                        (sum, item) => sum + item.active,
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Active Subscriptions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analyticsData.brandGrowth.reduce(
                        (sum, item) => sum + item.count,
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Total Brands</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminAnalytics;
