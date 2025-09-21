import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Shield,
  DollarSign,
  TrendingUp,
  TrendingDown,
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
import {
  walletAPI,
  receivablesAPI,
  payablesAPI,
  inventoryAPI,
} from "@/services/api";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface BalanceSheetReportProps {
  dateRange: DateRange;
  onGenerateReport: (type: string, format: "pdf" | "excel" | "csv") => void;
}

const BalanceSheetReport: React.FC<BalanceSheetReportProps> = ({
  dateRange,
  onGenerateReport,
}) => {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [payables, setPayables] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    loadBalanceSheetData();
  }, [dateRange]);

  useEffect(() => {
    setCustomDateRange({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  }, [dateRange]);

  const handleDateRangeChange = () => {
    setShowDateFilter(false);
    loadBalanceSheetData();
  };

  const loadBalanceSheetData = async () => {
    try {
      setLoading(true);
      const [walletsData, receivablesData, payablesData, inventoryData] =
        await Promise.all([
          walletAPI.getAll(),
          receivablesAPI.getAll({
            startDate: customDateRange.startDate,
            endDate: customDateRange.endDate,
          }),
          payablesAPI.getAll({
            startDate: customDateRange.startDate,
            endDate: customDateRange.endDate,
          }),
          inventoryAPI.getAll(),
        ]);

      // Debug: Log the data structure
      console.log("Balance Sheet - Wallets data:", walletsData);
      console.log("Balance Sheet - Receivables data:", receivablesData);
      console.log("Balance Sheet - Payables data:", payablesData);
      console.log("Balance Sheet - Inventory data:", inventoryData);

      // Handle different possible response structures
      const wallets = walletsData || [];
      const receivables = receivablesData?.receivables || receivablesData || [];
      const payables = payablesData?.payables || payablesData || [];
      const inventory = inventoryData?.inventory || inventoryData || [];

      setWallets(Array.isArray(wallets) ? wallets : []);
      setReceivables(Array.isArray(receivables) ? receivables : []);
      setPayables(Array.isArray(payables) ? payables : []);
      setInventory(Array.isArray(inventory) ? inventory : []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load balance sheet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAssets =
    wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) +
    receivables.reduce((sum, rec) => sum + (rec.amount || 0), 0) +
    inventory.reduce(
      (sum, item) => sum + (item.currentStock || 0) * (item.sellingPrice || 0),
      0
    );

  const totalLiabilities = payables.reduce(
    (sum, pay) => sum + (pay.amount || 0),
    0
  );
  const totalEquity = totalAssets - totalLiabilities;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading balance sheet data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Balance Sheet</h1>
          <p className="text-gray-600">
            {new Date(customDateRange.startDate).toLocaleDateString()} -{" "}
            {new Date(customDateRange.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDateFilter(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Custom Date Range
          </Button>
          <Button
            variant="outline"
            onClick={loadBalanceSheetData}
            disabled={loading}
          >
            <Shield className="h-4 w-4 mr-2" />
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button onClick={() => onGenerateReport("balancesheet", "pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => onGenerateReport("balancesheet", "excel")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === "development" && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">
              Debug Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-yellow-700">
              <div>Wallets loaded: {wallets.length}</div>
              <div>Receivables loaded: {receivables.length}</div>
              <div>Payables loaded: {payables.length}</div>
              <div>Inventory loaded: {inventory.length}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Sheet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAssets)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Liabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalLiabilities)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Equity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalEquity >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatCurrency(totalEquity)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Balance Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="font-medium">Cash & Wallets</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(
                  wallets.reduce(
                    (sum, wallet) => sum + (wallet.balance || 0),
                    0
                  )
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="font-medium">Accounts Receivable</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(
                  receivables.reduce((sum, rec) => sum + (rec.amount || 0), 0)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="font-medium">Inventory</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(
                  inventory.reduce(
                    (sum, item) =>
                      sum + (item.currentStock || 0) * (item.sellingPrice || 0),
                    0
                  )
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-100 rounded border-2">
              <span className="font-semibold">Total Assets</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalAssets)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Liabilities & Equity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
              <span className="font-medium">Accounts Payable</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(
                  payables.reduce((sum, pay) => sum + (pay.amount || 0), 0)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-100 rounded border-2">
              <span className="font-semibold">Total Liabilities</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(totalLiabilities)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
              <span className="font-medium">Owner's Equity</span>
              <span
                className={`font-semibold ${
                  totalEquity >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {formatCurrency(totalEquity)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-100 rounded border-2">
              <span className="font-semibold">Total Liabilities & Equity</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(totalLiabilities + totalEquity)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter Modal */}
      <Dialog open={showDateFilter} onOpenChange={setShowDateFilter}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Custom Date Range
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={customDateRange.startDate}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    startDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={customDateRange.endDate}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    endDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDateFilter(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDateRangeChange}
                className="flex-1"
                disabled={
                  !customDateRange.startDate || !customDateRange.endDate
                }
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BalanceSheetReport;
