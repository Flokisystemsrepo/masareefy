import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Zap,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
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

  const loadCashFlowData = async () => {
    try {
      setLoading(true);
      const [receivablesData, payablesData, walletsData] = await Promise.all([
        receivablesAPI.getAll(),
        payablesAPI.getAll(),
        walletAPI.getAll(),
      ]);

      setReceivables(Array.isArray(receivablesData) ? receivablesData : []);
      setPayables(Array.isArray(payablesData) ? payablesData : []);
      setWallets(Array.isArray(walletsData) ? walletsData : []);
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
        amount: parseFloat(newReceivable.amount),
        description: newReceivable.description,
        dueDate: newReceivable.dueDate,
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
        amount: parseFloat(newPayable.amount),
        description: newPayable.description,
        dueDate: newPayable.dueDate,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Flow Report</h1>
          <p className="text-gray-600">
            {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
            {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
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
              {receivables.slice(0, 5).map((receivable, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-green-50 rounded"
                >
                  <div>
                    <div className="font-medium">{receivable.description}</div>
                    <div className="text-sm text-gray-500">
                      Due: {new Date(receivable.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(receivable.amount || 0)}
                    </div>
                  </div>
                </div>
              ))}
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
              {payables.slice(0, 5).map((payable, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-red-50 rounded"
                >
                  <div>
                    <div className="font-medium">{payable.description}</div>
                    <div className="text-sm text-gray-500">
                      Due: {new Date(payable.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">
                      {formatCurrency(payable.amount || 0)}
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default CashFlowReport;
