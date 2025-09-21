import React from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { motion } from "framer-motion";
import { Lock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProtectedSectionProps {
  sectionKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedSection: React.FC<ProtectedSectionProps> = ({
  sectionKey,
  children,
  fallback,
}) => {
  const { hasSectionAccess, getSectionLockMessage, subscription } =
    useSubscription();

  if (hasSectionAccess(sectionKey)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getUpgradePlan = () => {
    if (!subscription) return "Growth";
    if (subscription.isFreePlan) return "Growth";
    if (subscription.plan.name.toLowerCase() === "growth") return "Scale";
    return "Growth";
  };

  const getUpgradePrice = () => {
    if (!subscription) return "299 EGP/month";
    if (subscription.isFreePlan) return "299 EGP/month";
    if (subscription.plan.name.toLowerCase() === "growth")
      return "399 EGP/month";
    return "299 EGP/month";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              🔒 Section Locked
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              {getSectionLockMessage(sectionKey)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {getUpgradePrice()}
              </div>
              <div className="text-sm text-gray-600">
                {getUpgradePlan()} Plan
              </div>
            </div>
            <div className="space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  // TODO: Implement upgrade flow
                  window.location.href = "/pricing";
                }}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProtectedSection;
