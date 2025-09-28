import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<{
    success: boolean;
    message: string;
    orderId?: string;
    amount?: string;
    currency?: string;
  } | null>(null);

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        setLoading(true);

        // Extract payment information from URL parameters
        const orderId = searchParams.get("orderId");
        const amount = searchParams.get("amount");
        const currency = searchParams.get("currency");
        const status = searchParams.get("status");
        const paymentStatus = searchParams.get("paymentStatus");
        const transactionId = searchParams.get("transactionId");

        console.log("Payment result parameters:", {
          orderId,
          amount,
          currency,
          status,
          paymentStatus,
          transactionId,
        });

        // Check if payment was successful
        const isSuccess =
          status === "SUCCESS" ||
          paymentStatus === "paid" ||
          paymentStatus === "success";

        if (isSuccess) {
          setPaymentStatus({
            success: true,
            message: "Payment completed successfully!",
            orderId: orderId || undefined,
            amount: amount || undefined,
            currency: currency || undefined,
          });

          // Show success toast
          toast({
            title: "Payment Successful",
            description: "Your subscription has been upgraded successfully!",
          });

          // Check for pending upgrade in localStorage
          const pendingUpgrade = localStorage.getItem("pendingUpgrade");
          if (pendingUpgrade) {
            try {
              const upgradeData = JSON.parse(pendingUpgrade);
              console.log("Processing pending upgrade:", upgradeData);

              // Update user's subscription in the database immediately
              const token = localStorage.getItem("token");
              if (token && upgradeData.planId) {
                try {
                  // Get current subscription first
                  const subscriptionResponse = await fetch(
                    "/api/subscription/my-subscription",
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (subscriptionResponse.ok) {
                    const subscriptionData = await subscriptionResponse.json();
                    if (subscriptionData.success && subscriptionData.data) {
                      // Update the subscription with the new plan
                      const updateResponse = await fetch(
                        `/api/subscription/subscriptions/${subscriptionData.data.id}`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            planId: upgradeData.planId,
                            status: "active",
                            currentPeriodStart: new Date().toISOString(),
                            currentPeriodEnd: new Date(
                              Date.now() + 30 * 24 * 60 * 60 * 1000
                            ).toISOString(),
                            paymentMethod: "kashier",
                            isTrialActive: false,
                            trialEnd: null,
                          }),
                        }
                      );

                      if (updateResponse.ok) {
                        console.log("✅ Subscription updated successfully");
                        const updatedData = await updateResponse.json();
                        console.log("Updated subscription:", updatedData);
                      } else {
                        const errorText = await updateResponse.text();
                        console.error(
                          "Failed to update subscription:",
                          errorText
                        );
                        throw new Error(
                          `Failed to update subscription: ${errorText}`
                        );
                      }
                    }
                  }
                } catch (error) {
                  console.error("Error updating subscription:", error);
                  // Don't throw here, just log the error
                }
              }

              // Clear pending upgrade
              localStorage.removeItem("pendingUpgrade");

              // Force refresh subscription context immediately after update
              setTimeout(() => {
                if (window.forceRefreshSubscription) {
                  console.log("Force refreshing subscription after payment");
                  window.forceRefreshSubscription();
                } else if (window.refreshSubscription) {
                  console.log("Refreshing subscription after payment");
                  window.refreshSubscription();
                }
              }, 200); // Reduced delay to make refresh more immediate
            } catch (error) {
              console.error("Error processing pending upgrade:", error);
            }
          }
        } else {
          setPaymentStatus({
            success: false,
            message: "Payment was not completed successfully.",
            orderId: orderId || undefined,
            amount: amount || undefined,
            currency: currency || undefined,
          });

          // Show error toast
          toast({
            title: "Payment Failed",
            description:
              "Your payment could not be processed. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error processing payment result:", error);
        setPaymentStatus({
          success: false,
          message: "An error occurred while processing your payment.",
        });

        toast({
          title: "Error",
          description: "An error occurred while processing your payment.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [searchParams, toast]);

  const handleContinue = () => {
    // Navigate to appropriate page based on success
    if (paymentStatus?.success) {
      navigate("/brand/settings?tab=subscription");
    } else {
      navigate("/brand/subscription");
    }
  };

  const handleRetry = () => {
    navigate("/brand/subscription");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {paymentStatus?.success ? (
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          )}
          <CardTitle
            className={`text-2xl ${
              paymentStatus?.success ? "text-green-900" : "text-red-900"
            }`}
          >
            {paymentStatus?.success ? "Payment Successful!" : "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">{paymentStatus?.message}</p>

          {paymentStatus?.orderId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Payment Details
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Order ID:</span>{" "}
                  {paymentStatus.orderId}
                </p>
                {paymentStatus.amount && (
                  <p>
                    <span className="font-medium">Amount:</span>{" "}
                    {paymentStatus.amount} {paymentStatus.currency || "EGP"}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {paymentStatus?.success ? (
              <Button onClick={handleContinue} className="flex-1">
                Continue to Settings
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  Go to Subscription
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentResult;
