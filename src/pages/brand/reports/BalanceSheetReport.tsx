import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Shield,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const loadBalanceSheetData = async () => {
    try {
      setLoading(true);
      const [walletsData, receivablesData, payablesData, inventoryData] =
        await Promise.all([
          walletAPI.getAll(),
          receivablesAPI.getAll(),
          payablesAPI.getAll(),
          inventoryAPI.getAll(),
        ]);

      setWallets(Array.isArray(walletsData) ? walletsData : []);
      setReceivables(Array.isArray(receivablesData) ? receivablesData : []);
      setPayables(Array.isArray(payablesData) ? payablesData : []);
      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Balance Sheet</h1>
          <p className="text-gray-600">
            {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
            {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
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
    </div>
  );
};

export default BalanceSheetReport;
