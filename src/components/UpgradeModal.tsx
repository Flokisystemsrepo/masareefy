import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Check,
  X,
  CreditCard,
  Zap,
  Shield,
  Users,
  BarChart3,
  Package,
  Truck,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { subscriptionAPI } from "@/services/api";

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: {
    features: string[];
    limits: {
      inventoryItems: number;
      teamMembers: number;
      wallets: number;
    };
    integrations?: string[];
  };
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  onUpgradeSuccess: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onUpgradeSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const { toast } = useToast();

  // Fetch available plans and current subscription when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      fetchCurrentSubscription();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      console.log("Fetching plans...");
      const response = await subscriptionAPI.getPlans();
      console.log("Plans response:", response);

      if (response.success) {
        // Filter out the Free plan and current plan
        const upgradePlans = response.data.filter(
          (plan: Plan) =>
            plan.name.toLowerCase() !== "free" &&
            plan.name.toLowerCase() !== currentPlan.toLowerCase()
        );
        console.log("Available upgrade plans:", upgradePlans);
        setAvailablePlans(upgradePlans);
      } else {
        console.error("API returned success: false", response);
        toast({
          title: "Error",
          description: response.error || "Failed to load available plans",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast({
        title: "Error",
        description: "Failed to load available plans",
        variant: "destructive",
      });
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      console.log("Fetching current subscription...");
      const response = await subscriptionAPI.getMySubscription();
      console.log("Current subscription response:", response);

      if (response.success) {
        setCurrentSubscription(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch current subscription:", error);
      // Don't show error toast for this as it's not critical for the upgrade flow
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      toast({
        title: "No Plan Selected",
        description: "Please select a plan before upgrading.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpgrading(true);

      // Get the selected plan details
      const plan = availablePlans.find((p) => p.id === selectedPlan);
      if (!plan) {
        throw new Error("Plan not found");
      }

      console.log("Selected plan:", plan);
      console.log("Plan name:", plan.name);
      console.log("Plan name lowercase:", plan.name.toLowerCase());

      // Use our HPP flow instead of hardcoded URLs
      const response = await fetch("/api/payments/hpp-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          planId: selectedPlan,
          planName: plan.name,
          amount: plan.priceMonthly,
          currency: "EGP",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate payment URL");
      }

      const data = await response.json();
      const paymentLink = data.url;

      console.log("Payment link:", paymentLink);

      // Store the selected plan in localStorage for callback handling
      localStorage.setItem(
        "pendingUpgrade",
        JSON.stringify({
          planId: selectedPlan,
          planName: plan.name,
          timestamp: Date.now(),
        })
      );

      // Try to open payment page
      const newWindow = window.open(paymentLink, "_blank");

      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed == "undefined"
      ) {
        // Popup was blocked, redirect in the same window
        console.log("Popup blocked, redirecting in same window");
        window.location.href = paymentLink;
      } else {
        console.log("Payment page opened in new tab");
      }

      // Close the modal
      onClose();
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes("Revenue") || feature.includes("Cost"))
      return <BarChart3 className="h-4 w-4" />;
    if (feature.includes("Inventory")) return <Package className="h-4 w-4" />;
    if (feature.includes("Team")) return <Users className="h-4 w-4" />;
    if (feature.includes("Wallet")) return <CreditCard className="h-4 w-4" />;
    if (feature.includes("Shopify")) return <Zap className="h-4 w-4" />;
    if (feature.includes("Bosta")) return <Truck className="h-4 w-4" />;
    if (feature.includes("Insights") || feature.includes("Analytics"))
      return <Brain className="h-4 w-4" />;
    return <Check className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade Your Plan
          </DialogTitle>
          <p className="text-gray-600 text-center">
            Choose the perfect plan for your business needs
          </p>
        </DialogHeader>

        {loadingPlans ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading plans...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {availablePlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={`relative cursor-pointer transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : "hover:shadow-md"
                  } ${
                    plan.name === "Professional"
                      ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
                      : ""
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.name === "Professional" && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl font-bold">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-blue-600">
                        EGP {plan.priceMonthly}
                      </span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      or EGP {plan.priceYearly}/year (Save 17%)
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {plan.features.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getFeatureIcon(feature)}
                          </div>
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {plan.features.integrations &&
                      plan.features.integrations.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="font-medium text-sm text-gray-900 mb-2">
                            Integrations:
                          </h4>
                          <div className="flex gap-2">
                            {plan.features.integrations.map((integration) => (
                              <span
                                key={integration}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize"
                              >
                                {integration}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    <Button
                      className={`w-full mt-6 ${
                        selectedPlan === plan.id
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan.id);
                      }}
                    >
                      {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>

          <Button
            onClick={handleUpgrade}
            disabled={!selectedPlan || upgrading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {upgrading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Crown className="h-4 w-4 mr-2" />
                </motion.div>
                Upgrading...
              </>
            ) : !selectedPlan ? (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Select a Plan First
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
