import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { subscriptionAPI } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SubscriptionPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { subscription, forceRefresh } = useSubscription();
  const navigate = useNavigate();

  // Debug: Log subscription data
  console.log("Current subscription:", subscription);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const response = await subscriptionAPI.getPlans();
        console.log("Fetched plans:", response);

        if (response && Array.isArray(response)) {
          setPlans(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          setPlans(response.data);
        } else {
          // Fallback to hardcoded plans if API fails
          setPlans([
            {
              id: "starter",
              name: "Starter",
              priceMonthly: 200,
              priceYearly: 2000,
              features: {
                features: [
                  "Up to 100 inventory items",
                  "Basic analytics",
                  "Email support",
                  "Standard integrations",
                ],
                limits: {
                  brands: 1,
                  users: 1,
                  transactions: 1000,
                  inventoryItems: 100,
                  teamMembers: 1,
                },
              },
            },
            {
              id: "professional",
              name: "Professional",
              priceMonthly: 499,
              priceYearly: 4990,
              features: {
                features: [
                  "Unlimited inventory items",
                  "Advanced analytics & insights",
                  "Shopify integration",
                  "Bosta integration",
                  "Business insights & analytics",
                  "Priority support",
                ],
                limits: {
                  brands: 5,
                  users: 10,
                  transactions: 10000,
                  inventoryItems: -1, // unlimited
                  teamMembers: 10,
                },
              },
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
        // Use fallback plans
        setPlans([
          {
            id: "starter",
            name: "Starter",
            priceMonthly: 200,
            priceYearly: 2000,
            features: {
              features: [
                "Up to 100 inventory items",
                "Basic analytics",
                "Email support",
                "Standard integrations",
              ],
              limits: {
                brands: 1,
                users: 1,
                transactions: 1000,
                inventoryItems: 100,
                teamMembers: 1,
              },
            },
          },
          {
            id: "professional",
            name: "Professional",
            priceMonthly: 499,
            priceYearly: 4990,
            features: {
              features: [
                "Unlimited inventory items",
                "Advanced analytics & insights",
                "Shopify integration",
                "Bosta integration",
                "Business insights & analytics",
                "Priority support",
              ],
              limits: {
                brands: 5,
                users: 10,
                transactions: 10000,
                inventoryItems: -1, // unlimited
                teamMembers: 10,
              },
            },
          },
        ]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getButtonLabel = (targetPlan: any) => {
    if (!subscription) return "Get Started";

    const currentPlanName = subscription.plan.name.toLowerCase();
    const targetPlanName = targetPlan.name.toLowerCase();

    // Get plan hierarchy from available plans (sorted by price)
    const sortedPlans = [...plans].sort(
      (a, b) => a.priceMonthly - b.priceMonthly
    );
    const planHierarchy = sortedPlans.map((plan) => plan.name.toLowerCase());

    const currentIndex = planHierarchy.indexOf(currentPlanName);
    const targetIndex = planHierarchy.indexOf(targetPlanName);

    if (currentIndex === targetIndex) return "Current Plan";
    if (targetIndex > currentIndex) return "Upgrade";
    if (targetIndex < currentIndex) return "Downgrade";

    return "Change Plan";
  };

  const handleUpgrade = async (plan: any) => {
    try {
      // Check if user is already on the target plan
      if (subscription && subscription.plan.id === plan.id) {
        toast.error(`You're already on the ${plan.name} plan!`);
        return;
      }

      // Handle Free plan downgrade (no payment required)
      if (plan.name.toLowerCase() === "free") {
        try {
          // Get current subscription ID first
          const subscriptionResponse = await fetch(
            "/api/subscription/my-subscription",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!subscriptionResponse.ok) {
            throw new Error("Failed to get current subscription");
          }

          const subscriptionData = await subscriptionResponse.json();
          const subscriptionId = subscriptionData.data.id;

          // Update subscription to Free plan
          const response = await fetch(
            `/api/subscription/subscriptions/${subscriptionId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                planId: plan.id,
                status: "active",
              }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(
              error.message || "Failed to downgrade to Free plan"
            );
          }

          toast.success("Successfully downgraded to Free plan!");

          // Force refresh subscription data instantly (bypasses rate limiting)
          await forceRefresh();

          return;
        } catch (error: any) {
          console.error("Free plan downgrade error:", error);
          toast.error(error.message || "Failed to downgrade to Free plan");
          return;
        }
      }

      // TODO: Implement payment gateway integration
      toast.error(
        "Payment gateway integration is being set up. Please contact support for manual upgrade."
      );
      return;

      // Store the selected plan in localStorage for callback handling
      localStorage.setItem(
        "pendingUpgrade",
        JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          timestamp: Date.now(),
        })
      );

      console.log(`Redirecting to payment URL for ${plan.name}:`, url);

      // Try to open payment page
      const newWindow = window.open(url, "_blank");

      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed == "undefined"
      ) {
        // Popup was blocked, redirect in the same window
        console.log("Popup blocked, redirecting in same window");
        window.location.href = url;
      } else {
        console.log("Payment page opened in new tab");
      }
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment");
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Subscription Plans
              </h1>
              <p className="text-gray-600 mt-1">
                Choose the plan that fits your business needs
              </p>
            </div>
          </div>
        </motion.div>

        {/* Current Plan Status */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {subscription.plan.name}
                    </h3>
                    <p className="text-gray-600">
                      {subscription.plan.priceMonthly > 0
                        ? `$${subscription.plan.priceMonthly}/month`
                        : "Free Plan"}
                    </p>
                    {subscription.isExpired && (
                      <Badge variant="destructive" className="mt-2">
                        Expired
                      </Badge>
                    )}
                    {subscription.isExpiringSoon && (
                      <Badge variant="secondary" className="mt-2">
                        Expires Soon
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {subscription.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Plans Grid */}
        {plansLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading plans...</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card
                  className={`relative ${
                    plan.popular ? "border-blue-500 shadow-lg" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.priceMonthly === 0
                          ? "Free"
                          : `${plan.priceMonthly} EGP`}
                      </span>
                      {plan.priceMonthly > 0 && (
                        <span className="text-gray-600">/month</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {(plan.features?.features || plan.features || []).map(
                        (feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center gap-3"
                          >
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        )
                      )}
                    </ul>

                    <Button
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgrading || subscription?.plan.id === plan.id}
                      className={`w-full ${
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      {upgrading ? (
                        "Processing..."
                      ) : subscription?.plan.id === plan.id ? (
                        "Current Plan"
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          {getButtonLabel(plan)}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">
                Need Help Choosing?
              </h3>
              <p className="text-gray-600 mb-4">
                Contact our support team to discuss which plan is right for your
                business.
              </p>
              <Button variant="outline">Contact Support</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
