import { subscriptionAPI, paymentAPI } from "@/services/api";

export interface PaymentCallbackData {
  planId: string;
  planName: string;
  timestamp: number;
}

export interface InvoiceData {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
}

export const handlePaymentCallback = async (): Promise<{
  success: boolean;
  planName?: string;
  invoiceData?: InvoiceData;
  error?: string;
}> => {
  try {
    // Check if there's a pending upgrade in localStorage
    const pendingUpgrade = localStorage.getItem("pendingUpgrade");
    if (!pendingUpgrade) {
      return { success: false, error: "No pending upgrade found" };
    }

    const upgradeData: PaymentCallbackData = JSON.parse(pendingUpgrade);

    // Check if the upgrade is recent (within last 10 minutes)
    const now = Date.now();
    const upgradeTime = upgradeData.timestamp;
    const timeDiff = now - upgradeTime;
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

    if (timeDiff > tenMinutes) {
      // Clear expired pending upgrade
      localStorage.removeItem("pendingUpgrade");
      return { success: false, error: "Upgrade session expired" };
    }

    // Get current user ID from localStorage
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    // Confirm payment with backend
    const paymentResponse = await paymentAPI.confirmPayment({
      paymentId: `PAY-${Date.now()}`, // Generate a payment ID
      planId: upgradeData.planId,
      userId: userId,
      amount: upgradeData.planName.toLowerCase() === "growth" ? 299 : 399,
      currency: "EGP",
      status: "completed",
    });

    if (paymentResponse.success) {
      // Clear the pending upgrade
      localStorage.removeItem("pendingUpgrade");

      // Extract invoice data from response
      const invoiceData: InvoiceData = {
        id: paymentResponse.data.invoice.invoiceNumber,
        amount: paymentResponse.data.payment.amount,
        currency: paymentResponse.data.payment.currency,
        date: new Date(
          paymentResponse.data.invoice.paidAt
        ).toLocaleDateString(),
        status: "Paid",
      };

      return {
        success: true,
        planName: upgradeData.planName,
        invoiceData,
      };
    } else {
      return {
        success: false,
        error: paymentResponse.error || "Failed to confirm payment",
      };
    }
  } catch (error: any) {
    console.error("Payment callback error:", error);
    return {
      success: false,
      error: error.message || "Payment processing failed",
    };
  }
};

export const checkForPendingPayment = (): PaymentCallbackData | null => {
  try {
    const pendingUpgrade = localStorage.getItem("pendingUpgrade");
    if (!pendingUpgrade) return null;

    const upgradeData: PaymentCallbackData = JSON.parse(pendingUpgrade);

    // Check if the upgrade is recent (within last 10 minutes)
    const now = Date.now();
    const upgradeTime = upgradeData.timestamp;
    const timeDiff = now - upgradeTime;
    const tenMinutes = 10 * 60 * 1000;

    if (timeDiff > tenMinutes) {
      localStorage.removeItem("pendingUpgrade");
      return null;
    }

    return upgradeData;
  } catch (error) {
    console.error("Error checking pending payment:", error);
    return null;
  }
};
