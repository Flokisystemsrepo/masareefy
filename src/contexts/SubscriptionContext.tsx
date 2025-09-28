import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { subscriptionAPI } from "@/services/api";

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: {
    features: string[];
    limits: {
      brands: number;
      users: number;
      transactions: number;
      inventoryItems: number;
      teamMembers: number;
      wallets: number;
    };
    lockedFeatures?: string[];
    integrations?: string[];
  };
}

interface Subscription {
  id: string;
  status: string;
  plan: Plan;
  currentPeriodEnd?: string;
  trialEnd?: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isFreePlan: boolean;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  manualRefresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  hasFeatureAccess: (featureName: string) => boolean;
  isFeatureLocked: (featureName: string) => boolean;
  getLockedFeatureMessage: (featureName: string) => string;
  hasIntegrationAccess: (integrationName: string) => boolean;
  hasSectionAccess: (sectionKey: string) => boolean;
  getSectionLockMessage: (sectionKey: string) => string;
  getPlanLimit: (limitName: string) => number;
  useFallback: boolean;
  isInitialized: boolean;
  testUpgradeToGrowth: () => Promise<void>;
  testUpgradeToScale: () => Promise<void>;
  testResetToFree: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

// Fallback subscription for when API fails
const createFallbackSubscription = (): Subscription => ({
  id: "fallback",
  status: "active",
  plan: {
    id: "fallback-free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    features: {
      features: ["Basic dashboard", "Add revenue entries", "Add cost entries"],
      limits: { brands: 1, users: 1, transactions: 100 },
      lockedFeatures: [
        "Advanced analytics",
        "Team management",
        "Inventory management",
      ],
    },
  },
  isExpired: false,
  isExpiringSoon: false,
  isFreePlan: true,
});

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
}) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false); // Start as false, not loading
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastAuthToken, setLastAuthToken] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const lastSubscriptionCheck = useRef<number>(0);

  // Simple, stable refresh function with no automatic retries
  const refreshSubscription = useCallback(async () => {
    const now = Date.now();

    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      console.log("Subscription refresh already in progress, skipping");
      return;
    }

    // Rate limiting: don't check more than once every 5 seconds
    if (now - lastSubscriptionCheck.current < 5000) {
      console.log("Subscription check rate limited, skipping");
      return;
    }

    // Check if user is authenticated before making subscription requests
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No auth token, skipping subscription fetch");
      setLoading(false);
      return;
    }

    console.log("Refreshing subscription...", new Date().toISOString());

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const data = await subscriptionAPI.getMySubscription();
      console.log("Subscription API response:", data);

      if (data.success) {
        console.log("Setting new subscription:", data.data);
        console.log(
          "Subscription plan:",
          data.data.plan?.name,
          "Status:",
          data.data.status
        );
        setSubscription(data.data);
        setUseFallback(false);
        setHasInitialized(true);
      } else {
        console.error("API returned error:", data.error);
        setError(data.error || "Failed to fetch subscription");
        // Don't fallback to free plan on API error - keep current subscription
      }
    } catch (error: any) {
      console.error("Error fetching subscription:", error);

      if (
        error.message?.includes("Too many requests") ||
        error.message?.includes("429")
      ) {
        console.warn("Rate limit hit, not setting error to avoid UI spam");
        // Don't set error for rate limits to avoid UI spam
        // Don't update the timestamp but also don't retry immediately
        lastSubscriptionCheck.current = now; // Update timestamp to prevent immediate retry
        return;
      } else {
        setError(error.message || "Failed to fetch subscription");
      }

      // Don't fallback to free plan on network error - keep current subscription
    } finally {
      loadingRef.current = false;
      setLoading(false);
      lastSubscriptionCheck.current = Date.now();
    }
  }, []); // Remove loading dependency to prevent circular updates

  // Manual refresh function for explicit user action
  const manualRefresh = useCallback(async () => {
    console.log("Manual refresh requested by user");
    await refreshSubscription();
  }, [refreshSubscription]);

  // Force refresh function that bypasses rate limiting (for upgrades, etc.)
  const forceRefresh = useCallback(async () => {
    console.log("Force refresh requested - bypassing rate limits");

    // Reset rate limiting
    lastSubscriptionCheck.current = 0;
    loadingRef.current = false;

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No auth token, cannot force refresh");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await subscriptionAPI.getMySubscription();
      console.log("Force refresh - Subscription API response:", data);

      if (data.success) {
        console.log("Force refresh - Setting new subscription:", data.data);
        setSubscription(data.data);
        setUseFallback(false);
      } else {
        console.error("Force refresh - API returned error:", data.error);
        setError(data.error || "Failed to fetch subscription");
      }
    } catch (error: any) {
      console.error("Force refresh - Error fetching subscription:", error);
      setError(error.message || "Failed to fetch subscription");
    } finally {
      setLoading(false);
    }
  }, []);

  // Make forceRefresh available globally for debugging
  if (typeof window !== "undefined") {
    (window as any).forceRefreshSubscription = forceRefresh;
  }

  // Function to trigger subscription refresh from external contexts (like AuthContext)
  const triggerSubscriptionRefresh = useCallback(() => {
    console.log("External trigger for subscription refresh");
    setHasInitialized(false);
    setUseFallback(false);
    setError(null);
    lastSubscriptionCheck.current = 0; // Reset rate limiting
  }, []);

  // Make triggerSubscriptionRefresh available globally for AuthContext
  if (typeof window !== "undefined") {
    (window as any).triggerSubscriptionRefresh = triggerSubscriptionRefresh;
  }

  // Monitor authentication token changes and refresh subscription accordingly
  useEffect(() => {
    const checkTokenChange = () => {
      const currentToken = localStorage.getItem("token");

      // If token changed (login/logout), reset initialization and fetch subscription
      if (currentToken !== lastAuthToken) {
        console.log("Auth token changed, refreshing subscription context");
        setLastAuthToken(currentToken);
        setHasInitialized(false);
        setUseFallback(false);
        setError(null);

        // Reset rate limiting to allow immediate fetch
        lastSubscriptionCheck.current = 0;
      }
    };

    // Check immediately
    checkTokenChange();

    // Set up polling to detect token changes
    const tokenCheckInterval = setInterval(checkTokenChange, 1000); // Check every second

    return () => clearInterval(tokenCheckInterval);
  }, [lastAuthToken]);

  // Monitor for completed payments and force refresh subscription
  useEffect(() => {
    const checkPendingUpgrade = () => {
      const pendingUpgrade = localStorage.getItem("pendingUpgrade");
      if (pendingUpgrade) {
        try {
          const upgradeData = JSON.parse(pendingUpgrade);
          // If upgrade was initiated more than 2 minutes ago, check subscription status
          if (Date.now() - upgradeData.timestamp > 2 * 60 * 1000) {
            console.log("Checking for completed upgrade after payment timeout");
            forceRefresh().then(() => {
              // Remove the pending upgrade if refresh was successful
              localStorage.removeItem("pendingUpgrade");
            });
          }
        } catch (error) {
          console.error("Error checking pending upgrade:", error);
          localStorage.removeItem("pendingUpgrade");
        }
      }
    };

    // Check immediately
    checkPendingUpgrade();

    // Check every 30 seconds for pending upgrades
    const pendingUpgradeInterval = setInterval(checkPendingUpgrade, 30000);

    return () => clearInterval(pendingUpgradeInterval);
  }, [forceRefresh]);

  // Initialize by fetching real subscription first, only fallback if that fails
  useEffect(() => {
    if (!hasInitialized) {
      console.log("Initializing subscription context");
      setHasInitialized(true);

      // Check if user is authenticated before trying to fetch subscription
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No auth token, using fallback subscription");
        setSubscription(createFallbackSubscription());
        setUseFallback(true);
        return;
      }

      // Try to fetch real subscription immediately
      refreshSubscription().catch((error) => {
        console.error("Failed to fetch subscription on init:", error);
        // Only fallback to free plan if we can't fetch the real subscription
        setSubscription(createFallbackSubscription());
        setUseFallback(true);
      });
    }
  }, [hasInitialized, refreshSubscription]);

  // Only refresh subscription on manual user action, not on window focus/visibility changes

  const hasFeatureAccess = (featureName: string): boolean => {
    if (!subscription) return false;

    // Free plan has limited access - dashboard, revenue, cost, settings, 1 wallet, 20 inventory
    if (subscription.isFreePlan) {
      const allowedFeatures = [
        "dashboard",
        "revenue",
        "cost",
        "settings",
        "wallet", // Limited to 1
        "inventory", // Limited to 20
      ];

      // Check if the feature name matches any allowed feature
      const featureLower = featureName.toLowerCase();
      return allowedFeatures.some(
        (allowed) =>
          featureLower.includes(allowed) ||
          featureLower === allowed ||
          featureLower.includes(allowed.replace(" ", ""))
      );
    }

    // Growth plan limitations (299 EGP/month)
    if (subscription.plan.name.toLowerCase() === "growth") {
      const lockedFeatures = [
        "smart insights",
        "advanced analytics",
        "priority support",
      ];

      // Check if feature is locked for growth plan
      const featureLower = featureName.toLowerCase();
      const isLocked = lockedFeatures.some((locked) =>
        featureLower.includes(locked)
      );

      return !isLocked;
    }

    // Scale plan has access to all features (399 EGP/month)
    return true;
  };

  const isFeatureLocked = (featureName: string): boolean => {
    return !hasFeatureAccess(featureName);
  };

  const getLockedFeatureMessage = (featureName: string): string => {
    if (!subscription) return "Subscribe to Growth plan to see this feature";

    if (subscription.isFreePlan) {
      if (
        featureName.toLowerCase().includes("shopify") ||
        featureName.toLowerCase().includes("bosta") ||
        featureName.toLowerCase().includes("shipblu")
      ) {
        return "Upgrade to Growth plan (299 EGP/month) to access integrations";
      }
      if (
        featureName.toLowerCase().includes("transfers") ||
        featureName.toLowerCase().includes("receivables") ||
        featureName.toLowerCase().includes("payables")
      ) {
        return "Upgrade to Growth plan (299 EGP/month) to access this feature";
      }
      return "Upgrade to Growth plan (299 EGP/month) to access this feature";
    }

    if (subscription.plan.name.toLowerCase() === "growth") {
      if (
        featureName.toLowerCase().includes("insights") ||
        featureName.toLowerCase().includes("analytics")
      ) {
        return "Upgrade to Scale plan (399 EGP/month) to access Smart Insights";
      }
      if (featureName.toLowerCase().includes("priority support")) {
        return "Upgrade to Scale plan (399 EGP/month) for priority support";
      }
      return "Upgrade to Scale plan (399 EGP/month) to access this feature";
    }

    if (subscription.isExpired) {
      return "Renew your subscription to access this feature";
    }

    return "Subscribe to Growth plan to see this feature";
  };

  const hasIntegrationAccess = (integrationName: string): boolean => {
    if (!subscription) return false;

    // Free plan has no integration access
    if (subscription.isFreePlan) return false;

    // Growth plan (299 EGP/month) has access to all integrations
    if (subscription.plan.name.toLowerCase() === "growth") return true;

    // Scale plan (399 EGP/month) has access to all integrations
    if (subscription.plan.name.toLowerCase() === "scale") return true;

    // Legacy plans - check features array
    return (
      subscription.plan.features.integrations?.includes(integrationName) ||
      false
    );
  };

  const getPlanLimit = (limitName: string): number => {
    if (!subscription) return 0;

    // First, try to get limit from the plan's features.limits structure
    if (
      subscription.plan.features?.limits?.[
        limitName as keyof typeof subscription.plan.features.limits
      ] !== undefined
    ) {
      return subscription.plan.features.limits[
        limitName as keyof typeof subscription.plan.features.limits
      ];
    }

    // Fallback to hardcoded logic for backward compatibility
    // Free plan limits (0 EGP/forever)
    if (subscription.isFreePlan) {
      const freeLimits: { [key: string]: number } = {
        inventoryItems: 20,
        wallets: 1,
        brands: 1,
        users: 1,
        transactions: -1, // unlimited
      };
      return freeLimits[limitName] || 0;
    }

    // Growth plan limits (299 EGP/month)
    if (subscription.plan.name.toLowerCase() === "growth") {
      const growthLimits: { [key: string]: number } = {
        inventoryItems: 300,
        wallets: 5,
        brands: 1,
        users: -1, // unlimited
        transactions: -1, // unlimited
      };
      return growthLimits[limitName] || -1;
    }

    // Scale plan has unlimited access (399 EGP/month)
    if (subscription.plan.name.toLowerCase() === "scale") {
      return -1; // unlimited
    }

    // Default fallback
    return -1;
  };

  const hasSectionAccess = (sectionKey: string): boolean => {
    if (!subscription) {
      return false;
    }

    // Free plan has limited section access
    if (subscription.isFreePlan) {
      const allowedSections = [
        "dashboard",
        "revenues",
        "costs",
        "wallet", // Limited to 1
        "inventory", // Limited to 20 items
        "settings",
        "support", // Support Center should be accessible
        "my-tickets", // My Tickets should be accessible
      ];
      return allowedSections.includes(sectionKey);
    }

    // Growth plan has access to most sections
    if (subscription.plan.name.toLowerCase() === "growth") {
      const lockedSections = [
        "smart-insights", // Smart Insights (AI-powered) locked
      ];
      return !lockedSections.includes(sectionKey);
    }

    // Scale plan has access to all sections
    if (subscription.plan.name.toLowerCase() === "scale") {
      return true;
    }

    // Legacy plans - check based on features
    return true;
  };

  const getSectionLockMessage = (sectionKey: string): string => {
    if (!subscription) return "Subscribe to Growth plan to access this section";

    if (subscription.isFreePlan) {
      const sectionMessages: { [key: string]: string } = {
        receivables:
          "Upgrade to Growth plan (299 EGP/month) to access Receivables & Payables",
        transfers: "Upgrade to Growth plan (299 EGP/month) to access Transfers",
        orders: "Upgrade to Growth plan (299 EGP/month) to access Orders",
        tasks: "Upgrade to Growth plan (299 EGP/month) to access Tasks",
        support: "Upgrade to Growth plan (299 EGP/month) to access Support",
        "my-tickets":
          "Upgrade to Growth plan (299 EGP/month) to access My Tickets",
        reports: "Upgrade to Growth plan (299 EGP/month) to access Reports",
      };
      return (
        sectionMessages[sectionKey] ||
        "Upgrade to Growth plan (299 EGP/month) to access this section"
      );
    }

    if (subscription.plan.name.toLowerCase() === "growth") {
      if (sectionKey === "reports") {
        return "Upgrade to Scale plan (399 EGP/month) to access advanced Reports & Analytics";
      }
      return "Upgrade to Scale plan (399 EGP/month) to access this section";
    }

    if (subscription.isExpired) {
      return "Renew your subscription to access this section";
    }

    return "Subscribe to Growth plan to access this section";
  };

  // Test upgrade function for development/testing
  const testUpgradeToGrowth = useCallback(async () => {
    if (!subscription || !subscription.isFreePlan) {
      console.log("Only Free plan users can use test upgrade");
      return;
    }

    try {
      console.log("🧪 Testing upgrade to Growth plan...");

      const response = await subscriptionAPI.testUpgradeToGrowth();

      if (response.success) {
        setSubscription(response.data);
        console.log("✅ Test upgrade to Growth plan completed!");
        console.log("📊 New limits: 5 wallets, 300 inventory items");
        console.log("🔗 Unlocked integrations: Shopify, Bosta, Shipblu");
        console.log(
          "🔒 Still locked: Smart Insights, Advanced Analytics, Priority Support"
        );
      } else {
        console.error("❌ Test upgrade failed:", response.error);
      }
    } catch (error) {
      console.error("❌ Test upgrade failed:", error);
    }
  }, [subscription]);

  // Test upgrade function for Scale plan (development/testing)
  const testUpgradeToScale = useCallback(async () => {
    if (!subscription) {
      console.log("No subscription found");
      return;
    }

    try {
      console.log("🧪 Testing upgrade to Scale plan...");

      const response = await subscriptionAPI.testUpgradeToScale();

      if (response.success) {
        setSubscription(response.data);
        console.log("✅ Test upgrade to Scale plan completed!");
        console.log(
          "📊 New limits: UNLIMITED wallets, UNLIMITED inventory items"
        );
        console.log("🔗 Unlocked integrations: Shopify, Bosta, Shipblu");
        console.log(
          "🚀 Unlocked features: Smart Insights, Advanced Analytics, Priority Support"
        );
        console.log("🎯 FULL ACCESS - No restrictions!");
      } else {
        console.error("❌ Test upgrade failed:", response.error);
      }
    } catch (error) {
      console.error("❌ Test upgrade failed:", error);
    }
  }, [subscription]);

  // Test reset function for development/testing
  const testResetToFree = useCallback(async () => {
    try {
      console.log("🧪 Testing reset to Free plan...");

      const response = await subscriptionAPI.testResetToFree();

      if (response.success) {
        setSubscription(response.data);
        console.log("✅ Test reset to Free plan completed!");
        console.log("📊 Reset limits: 1 wallet, 20 inventory items");
        console.log(
          "🔒 Locked sections: Reports, Tasks, Orders, Transfers, Receivables & Payables"
        );
      } else {
        console.error("❌ Test reset failed:", response.error);
      }
    } catch (error) {
      console.error("❌ Test reset failed:", error);
    }
  }, []);

  const value = {
    subscription,
    loading,
    error,
    refreshSubscription,
    manualRefresh,
    forceRefresh,
    hasFeatureAccess,
    isFeatureLocked,
    getLockedFeatureMessage,
    hasIntegrationAccess,
    hasSectionAccess,
    getSectionLockMessage,
    getPlanLimit,
    useFallback,
    isInitialized: hasInitialized,
    testUpgradeToGrowth,
    testUpgradeToScale,
    testResetToFree,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
