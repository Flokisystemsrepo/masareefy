import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Users,
  Wallet,
  BarChart3,
  ArrowRight,
  Crown,
  Zap,
} from "lucide-react";

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  resourceType: string;
  currentPlan: string;
  limit: number;
  current: number;
}

const getResourceInfo = (resourceType: string) => {
  switch (resourceType) {
    case "inventory":
      return {
        title: "Inventory Management",
        description: "You've reached your inventory item limit",
        icon: <Package className="h-5 w-5" />,
        feature: "Unlimited inventory items",
      };
    case "team_members":
      return {
        title: "Team Management",
        description: "You've reached your team member limit",
        icon: <Users className="h-5 w-5" />,
        feature: "Unlimited team members",
      };
    case "wallets":
      return {
        title: "Wallet Management",
        description: "You've reached your wallet limit",
        icon: <Wallet className="h-5 w-5" />,
        feature: "Unlimited wallets",
      };
    case "smart_insights":
      return {
        title: "Smart Insights",
        description: "Smart insights are not available in your current plan",
        icon: <BarChart3 className="h-5 w-5" />,
        feature: "Advanced analytics & insights",
      };
    default:
      return {
        title: "Feature Limit",
        description: "You've reached your limit for this feature",
        icon: <Zap className="h-5 w-5" />,
        feature: "Unlimited access",
      };
  }
};

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  resourceType,
  currentPlan,
  limit,
  current,
}) => {
  const resourceInfo = getResourceInfo(resourceType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade Required
          </DialogTitle>
          <DialogDescription>{resourceInfo.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Usage */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {resourceInfo.icon}
                <div className="flex-1">
                  <h4 className="font-medium">{resourceInfo.title}</h4>
                  <p className="text-sm text-gray-600">
                    Current: {current} / {limit}
                  </p>
                </div>
                <Badge variant="destructive">Limit Reached</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Benefits */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">
              {currentPlan.toLowerCase() === "free"
                ? "Upgrade to Growth Plan to get:"
                : "Upgrade to Scale Plan to get:"}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                {resourceInfo.feature}
              </div>
              {currentPlan.toLowerCase() === "free" ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Shopify integration
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Bosta integration
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Shipblu integration
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Transfers & Receivables
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Unlimited wallets
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Unlimited inventory
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Smart Insights
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Priority support
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pricing */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentPlan.toLowerCase() === "free" ? "299 EGP" : "399 EGP"}
                </div>
                <div className="text-sm text-gray-600">per month</div>
                <div className="text-xs text-green-600 mt-1">
                  {currentPlan.toLowerCase() === "free"
                    ? "Growth Plan - All integrations included"
                    : "Scale Plan - Unlimited everything"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button onClick={onUpgrade} className="bg-blue-600 hover:bg-blue-700">
            Upgrade Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
