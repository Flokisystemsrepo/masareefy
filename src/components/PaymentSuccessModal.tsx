import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Download, Receipt, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  invoiceData?: {
    id: string;
    amount: number;
    currency: string;
    date: string;
    status: string;
  };
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  planName,
  invoiceData,
}) => {
  const handleDownloadInvoice = () => {
    if (invoiceData) {
      // Create a simple invoice PDF or redirect to invoice page
      const invoiceContent = `
        INVOICE
        =======
        
        Invoice ID: ${invoiceData.id}
        Date: ${invoiceData.date}
        Plan: ${planName}
        Amount: ${invoiceData.currency} ${invoiceData.amount}
        Status: ${invoiceData.status}
        
        Thank you for your payment!
      `;

      const blob = new Blob([invoiceContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceData.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Payment Successful!
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Subscription Upgraded Successfully!
            </h3>
            <p className="text-gray-600">
              You've been upgraded to the <strong>{planName}</strong> plan. Your
              new features are now available.
            </p>
          </div>

          {invoiceData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Payment Receipt
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice ID:</span>
                  <span className="font-medium">{invoiceData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {invoiceData.currency} {invoiceData.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{invoiceData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">
                    {invoiceData.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {invoiceData && (
              <Button
                variant="outline"
                onClick={handleDownloadInvoice}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            )}
            <Button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Continue
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessModal;
