import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Crown, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import UpgradeModal from "./UpgradeModal";

interface SectionLockProps {
  sectionKey: string;
  children: React.ReactNode;
  className?: string;
  showUpgradeButton?: boolean;
}

const SectionLock: React.FC<SectionLockProps> = ({
  sectionKey,
  children,
  className = "",
  showUpgradeButton = true,
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const {
    hasSectionAccess,
    getSectionLockMessage,
    subscription,
    error,
    refreshSubscription,
    forceRefresh,
    loading,
    isInitialized,
  } = useSubscription();

  // Show loading state while subscription is being initialized
  if (!isInitialized || loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="filter blur-sm pointer-events-none">{children}</div>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (hasSectionAccess(sectionKey)) {
    return <div className={className}>{children}</div>;
  }

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgradeSuccess = () => {
    forceRefresh();
  };

  const handleRetry = () => {
    forceRefresh();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none">{children}</div>

      {/* Lock overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Lock icon */}
          <div className="relative">
            <Lock className="h-16 w-16 text-gray-400 mx-auto" />
            <Crown className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Section Locked
            </h3>
            <p className="text-gray-600 max-w-sm">
              {getSectionLockMessage(sectionKey)}
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry
              </Button>
            </div>
          )}

          {/* Current plan info */}
          {subscription && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                Current plan:{" "}
                <span className="font-medium">{subscription.plan.name}</span>
              </p>
              {subscription.isExpired && (
                <p className="text-sm text-red-600 mt-1">
                  Your subscription has expired
                </p>
              )}
              {subscription.isExpiringSoon && (
                <p className="text-sm text-yellow-600 mt-1">
                  Your subscription expires soon
                </p>
              )}
              {subscription.id === "fallback" && (
                <p className="text-sm text-blue-600 mt-1">
                  Using fallback mode - subscription status unavailable
                </p>
              )}
            </div>
          )}

          {/* Upgrade button */}
          {showUpgradeButton && (
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          )}
        </motion.div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={subscription?.plan.name || "Free"}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </div>
  );
};

export default SectionLock;
