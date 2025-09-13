import { UsageData, ResourceLimitCheck } from "@/services/usageAPI";

// Emergency fallback hook that provides safe defaults without making API calls
export const useUsageTrackingFallback = (brandId: string) => {
  console.log("[UsageTrackingFallback] Using fallback implementation - no API calls");

  // Safe default usage data
  const fallbackUsage = {
    inventory: { current: 0, limit: 100, isUnlimited: false },
    team_members: { current: 0, limit: 5, isUnlimited: false },
    wallets: { current: 0, limit: 5, isUnlimited: false },
    transactions: { current: 0, limit: -1, isUnlimited: true },
  };

  // Get usage for a specific resource type
  const getUsage = (resourceType: string): UsageData | undefined => {
    return fallbackUsage[resourceType as keyof typeof fallbackUsage];
  };

  // Check if user can add a resource - always allow in fallback mode
  const canAddResource = async (resourceType: string): Promise<ResourceLimitCheck> => {
    console.log(`[UsageTrackingFallback] Allowing ${resourceType} operation`);
    return {
      canAdd: true,
      current: 0,
      limit: 1000,
      remaining: 1000,
    };
  };

  // Sync usage - no-op in fallback mode
  const syncUsage = (resourceType: string) => {
    console.log(`[UsageTrackingFallback] Skipping sync for ${resourceType}`);
  };

  // Check if user is at or near limit - always false in fallback mode
  const isAtLimit = (resourceType: string): boolean => false;
  const isNearLimit = (resourceType: string): boolean => false;

  return {
    allUsage: fallbackUsage,
    isLoading: false,
    error: null,
    canAddResource,
    syncUsage,
    getUsage,
    isAtLimit,
    isNearLimit,
    isCheckingLimit: false,
    isSyncing: false,
    isDisabled: true,
  };
};