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
  getPlanLimit: (limitName: string) => number;
  useFallback: boolean;
  isInitialized: boolean;
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

    // Rate limiting: don't check more than once every 30 seconds
    if (now - lastSubscriptionCheck.current < 30000) {
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

    console.log("Refreshing subscription...");

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const data = await subscriptionAPI.getMySubscription();
      console.log("Subscription API response:", data);

      if (data.success) {
        console.log("Setting new subscription:", data.data);
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

    // Free plan has limited access - only dashboard, revenue, cost, and settings
    if (subscription.isFreePlan) {
      const allowedFeatures = ["dashboard", "revenue", "cost", "settings"];

      // Check if the feature name matches any allowed feature
      const featureLower = featureName.toLowerCase();
      return allowedFeatures.some(
        (allowed) =>
          featureLower.includes(allowed) ||
          featureLower === allowed ||
          featureLower.includes(allowed.replace(" ", ""))
      );
    }

    // Starter plan limitations
    if (subscription.plan.name.toLowerCase() === "starter") {
      const lockedFeatures = [
        "shopify",
        "bosta",
        "business insights",
        "smart insights",
        "advanced analytics",
      ];

      // Check if feature is locked for starter plan
      const featureLower = featureName.toLowerCase();
      const isLocked = lockedFeatures.some((locked) =>
        featureLower.includes(locked)
      );

      return !isLocked;
    }

    // Professional plan has access to all features
    return true;
  };

  const isFeatureLocked = (featureName: string): boolean => {
    return !hasFeatureAccess(featureName);
  };

  const getLockedFeatureMessage = (featureName: string): string => {
    if (!subscription) return "Subscribe to pro to see this feature";

    if (subscription.isFreePlan) {
      return `Subscribe to pro to see ${featureName}`;
    }

    if (subscription.plan.name.toLowerCase() === "starter") {
      if (
        featureName.toLowerCase().includes("shopify") ||
        featureName.toLowerCase().includes("bosta")
      ) {
        return "Upgrade to Professional to access integrations";
      }
      if (
        featureName.toLowerCase().includes("insights") ||
        featureName.toLowerCase().includes("analytics")
      ) {
        return "Upgrade to Professional to access business insights";
      }
      return "Upgrade to Professional to access this feature";
    }

    if (subscription.isExpired) {
      return "Renew your subscription to access this feature";
    }

    return "Subscribe to pro to see this feature";
  };

  const hasIntegrationAccess = (integrationName: string): boolean => {
    if (!subscription) return false;

    if (subscription.isFreePlan) return false;
    if (subscription.plan.name.toLowerCase() === "starter") return false;

    return (
      subscription.plan.features.integrations?.includes(integrationName) ||
      false
    );
  };

  const getPlanLimit = (limitName: string): number => {
    if (!subscription) return 0;

    if (subscription.isFreePlan) {
      return 0; // Free plan has no access to most features
    }

    if (subscription.plan.name.toLowerCase() === "starter") {
      const starterLimits: { [key: string]: number } = {
        inventoryItems: 100,
        teamMembers: 2,
        wallets: 2,
        brands: 1,
        users: 2,
        transactions: -1, // unlimited
      };
      return starterLimits[limitName] || -1;
    }

    // Professional plan has unlimited access
    return (
      subscription.plan.features.limits[
        limitName as keyof typeof subscription.plan.features.limits
      ] || -1
    );
  };

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
    getPlanLimit,
    useFallback,
    isInitialized: hasInitialized,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
