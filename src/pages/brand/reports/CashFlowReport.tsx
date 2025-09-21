import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Zap,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { receivablesAPI, payablesAPI, walletAPI } from "@/services/api";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface CashFlowReportProps {
  dateRange: DateRange;
  onGenerateReport: (type: string, format: "pdf" | "excel" | "csv") => void;
}

const CashFlowReport: React.FC<CashFlowReportProps> = ({
  dateRange,
  onGenerateReport,
}) => {
  const [loading, setLoading] = useState(true);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [payables, setPayables] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [showAddReceivable, setShowAddReceivable] = useState(false);
  const [showAddPayable, setShowAddPayable] = useState(false);
  const [newReceivable, setNewReceivable] = useState({
    amount: "",
    description: "",
    dueDate: "",
  });
  const [newPayable, setNewPayable] = useState({
    amount: "",
    description: "",
    dueDate: "",
  });
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
    loadCashFlowData();
  }, [dateRange]);

  useEffect(() => {
    setCustomDateRange({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  }, [dateRange]);

  const handleDateRangeChange = () => {
    setShowDateFilter(false);
    loadCashFlowData();
  };

  const loadCashFlowData = async () => {
    try {
      setLoading(true);
      const [receivablesData, payablesData, walletsData] = await Promise.all([
        receivablesAPI.getAll({
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
        }),
        payablesAPI.getAll({
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
        }),
        walletAPI.getAll(),
      ]);

      // Debug: Log the data structure
      console.log("Receivables data:", receivablesData);
      console.log("Payables data:", payablesData);
      console.log("Wallets data:", walletsData);

      // Handle different possible response structures
      const receivables = receivablesData?.receivables || receivablesData || [];
      const payables = payablesData?.payables || payablesData || [];
      const wallets = walletsData || [];

      setReceivables(Array.isArray(receivables) ? receivables : []);
      setPayables(Array.isArray(payables) ? payables : []);
      setWallets(Array.isArray(wallets) ? wallets : []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load cash flow data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalReceivables = receivables.reduce(
    (sum, rec) => sum + (rec.amount || 0),
    0
  );
  const totalPayables = payables.reduce(
    (sum, pay) => sum + (pay.amount || 0),
    0
  );
  const totalWallets = wallets.reduce(
    (sum, wallet) => sum + (wallet.balance || 0),
    0
  );
  const netCashFlow = totalReceivables - totalPayables;

  const handleAddReceivable = async () => {
    try {
      await receivablesAPI.create({
        entityName: newReceivable.description || "New Receivable",
        amount: parseFloat(newReceivable.amount),
        description: newReceivable.description,
        dueDate: new Date(newReceivable.dueDate).toISOString(),
      });
      setShowAddReceivable(false);
      setNewReceivable({ amount: "", description: "", dueDate: "" });
      loadCashFlowData();
      toast({
        title: "Success",
        description: "Receivable added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add receivable",
        variant: "destructive",
      });
    }
  };

  const handleAddPayable = async () => {
    try {
      await payablesAPI.create({
        entityName: newPayable.description || "New Payable",
        amount: parseFloat(newPayable.amount),
        description: newPayable.description,
        dueDate: new Date(newPayable.dueDate).toISOString(),
      });
      setShowAddPayable(false);
      setNewPayable({ amount: "", description: "", dueDate: "" });
      loadCashFlowData();
      toast({
        title: "Success",
        description: "Payable added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add payable",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cash flow data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Flow Report</h1>
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
            onClick={loadCashFlowData}
            disabled={loading}
          >
            <Zap className="h-4 w-4 mr-2" />
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button onClick={() => onGenerateReport("cashflow", "pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => onGenerateReport("cashflow", "excel")}
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
              <div>Receivables loaded: {receivables.length}</div>
              <div>Payables loaded: {payables.length}</div>
              <div>Wallets loaded: {wallets.length}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cash Flow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Receivables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalReceivables)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Payables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalPayables)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Net Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netCashFlow >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(netCashFlow)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalWallets)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Cash Flow Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {receivables.length}
              </div>
              <div className="text-sm text-gray-600">Active Receivables</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {payables.length}
              </div>
              <div className="text-sm text-gray-600">Active Payables</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalWallets)}
              </div>
              <div className="text-sm text-gray-600">Available Cash</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Cash Flow Summary</div>
            <div className="text-lg">
              <span className="font-medium">Net Cash Flow:</span>{" "}
              <span
                className={`font-bold ${
                  netCashFlow >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(netCashFlow)}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {netCashFlow >= 0
                ? "Positive cash flow - more money coming in than going out"
                : "Negative cash flow - more money going out than coming in"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receivables and Payables Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receivables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Receivables
              </CardTitle>
              <Button size="sm" onClick={() => setShowAddReceivable(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {receivables.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No receivables found for this period
                </div>
              ) : (
                receivables.slice(0, 5).map((receivable, index) => (
                  <div
                    key={receivable.id || index}
                    className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {receivable.entityName ||
                          receivable.description ||
                          "Unnamed Receivable"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Due: {new Date(receivable.dueDate).toLocaleDateString()}
                      </div>
                      {receivable.status && (
                        <div className="text-xs text-gray-400 mt-1">
                          Status: {receivable.status}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(receivable.amount || 0)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {receivables.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View All ({receivables.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payables */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Payables
              </CardTitle>
              <Button size="sm" onClick={() => setShowAddPayable(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payables.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No payables found for this period
                </div>
              ) : (
                payables.slice(0, 5).map((payable, index) => (
                  <div
                    key={payable.id || index}
                    className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {payable.entityName ||
                          payable.description ||
                          "Unnamed Payable"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Due: {new Date(payable.dueDate).toLocaleDateString()}
                      </div>
                      {payable.status && (
                        <div className="text-xs text-gray-400 mt-1">
                          Status: {payable.status}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">
                        {formatCurrency(payable.amount || 0)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {payables.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View All ({payables.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Receivable Modal */}
      <Dialog open={showAddReceivable} onOpenChange={setShowAddReceivable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Receivable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newReceivable.amount}
                onChange={(e) =>
                  setNewReceivable({ ...newReceivable, amount: e.target.value })
                }
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newReceivable.description}
                onChange={(e) =>
                  setNewReceivable({
                    ...newReceivable,
                    description: e.target.value,
                  })
                }
                placeholder="Enter description"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newReceivable.dueDate}
                onChange={(e) =>
                  setNewReceivable({
                    ...newReceivable,
                    dueDate: e.target.value,
                  })
                }
              />
            </div>
            <Button onClick={handleAddReceivable} className="w-full">
              Add Receivable
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payable Modal */}
      <Dialog open={showAddPayable} onOpenChange={setShowAddPayable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payable-amount">Amount</Label>
              <Input
                id="payable-amount"
                type="number"
                value={newPayable.amount}
                onChange={(e) =>
                  setNewPayable({ ...newPayable, amount: e.target.value })
                }
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="payable-description">Description</Label>
              <Input
                id="payable-description"
                value={newPayable.description}
                onChange={(e) =>
                  setNewPayable({ ...newPayable, description: e.target.value })
                }
                placeholder="Enter description"
              />
            </div>
            <div>
              <Label htmlFor="payable-dueDate">Due Date</Label>
              <Input
                id="payable-dueDate"
                type="date"
                value={newPayable.dueDate}
                onChange={(e) =>
                  setNewPayable({ ...newPayable, dueDate: e.target.value })
                }
              />
            </div>
            <Button onClick={handleAddPayable} className="w-full">
              Add Payable
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

export default CashFlowReport;
