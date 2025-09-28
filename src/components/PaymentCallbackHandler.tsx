import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  handlePaymentCallback,
  checkForPendingPayment,
} from "@/utils/paymentCallback";
import PaymentSuccessModal from "./PaymentSuccessModal";

const PaymentCallbackHandler: React.FC = () => {
  const { toast } = useToast();
  const { forceRefresh } = useSubscription();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    planName: string;
    invoiceData?: any;
  } | null>(null);

  useEffect(() => {
    const checkPaymentCallback = async () => {
      try {
        // Check if there's a pending payment
        const pendingPayment = checkForPendingPayment();
        if (!pendingPayment) return;

        // Check if we're returning from a payment page
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get("paymentStatus");
        const paymentId = urlParams.get("payment_id");
        const currentUrl = window.location.href;

        // Check if we're on a payment success page or have success parameters
        const isPaymentSuccess =
          currentUrl.includes("payment-approved") ||
          currentUrl.includes("paymentStatus=SUCCESS") ||
          paymentStatus === "SUCCESS";

        // If we have payment parameters, process the callback
        if (isPaymentSuccess || paymentStatus === "success" || paymentId) {
          const result = await handlePaymentCallback();

          if (result.success) {
            setSuccessData({
              planName: result.planName!,
              invoiceData: result.invoiceData,
            });
            setShowSuccessModal(true);

            // Refresh subscription data
            await forceRefresh();

            // Clean up URL parameters
            const url = new URL(window.location.href);
            url.searchParams.delete("paymentStatus");
            url.searchParams.delete("payment_status");
            url.searchParams.delete("payment_id");
            url.searchParams.delete("cardDataToken");
            window.history.replaceState({}, "", url.toString());
          } else {
            toast({
              title: "Payment Processing Failed",
              description:
                result.error ||
                "Failed to process payment. Please contact support.",
              variant: "destructive",
            });
          }
        }
      } catch (error: any) {
        console.error("Payment callback error:", error);
        toast({
          title: "Payment Error",
          description:
            "An error occurred while processing your payment. Please contact support.",
          variant: "destructive",
        });
      }
    };

    // Small delay to ensure the app is fully loaded
    const timer = setTimeout(checkPaymentCallback, 1000);

    return () => clearTimeout(timer);
  }, [toast, forceRefresh]);

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
  };

  if (!showSuccessModal || !successData) {
    return null;
  }

  return (
    <PaymentSuccessModal
      isOpen={showSuccessModal}
      onClose={handleSuccessModalClose}
      planName={successData.planName}
      invoiceData={successData.invoiceData}
    />
  );
};

export default PaymentCallbackHandler;
