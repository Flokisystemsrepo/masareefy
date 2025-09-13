import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usageAPI, UsageData, ResourceLimitCheck } from "@/services/usageAPI";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useUsageTracking = (brandId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Emergency disable mechanism to prevent auth issues
  const [isDisabled, setIsDisabled] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Get all usage data with emergency fallback
  const {
    data: allUsage,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["usage", brandId],
    queryFn: async () => {
      try {
        console.log("[UsageTracking] Attempting to fetch usage data");
        const result = await usageAPI.getAllUsage(brandId);
        setErrorCount(0); // Reset error count on success
        return result;
      } catch (error: any) {
        console.error("[UsageTracking] Error fetching usage:", error);
        const newErrorCount = errorCount + 1;
        setErrorCount(newErrorCount);
        
        // If too many errors, disable to prevent auth issues
        if (newErrorCount >= 3) {
          console.warn("[UsageTracking] Too many errors, disabling usage tracking");
          setIsDisabled(true);
        }
        
        // Return fallback data to prevent crashes
        return {
          inventory: { current: 0, limit: 100, isUnlimited: false },
          team_members: { current: 0, limit: 5, isUnlimited: false },
          wallets: { current: 0, limit: 5, isUnlimited: false },
          transactions: { current: 0, limit: -1, isUnlimited: true },
        };
      }
    },
    enabled: !!user && !!brandId && !isDisabled,
    staleTime: 10 * 60 * 1000, // 10 minutes - very long cache
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false, // No retries to prevent cascading failures
  });

  // Check resource limit mutation
  const checkLimitMutation = useMutation({
    mutationFn: ({ resourceType }: { resourceType: string }) =>
      usageAPI.checkResourceLimit(resourceType, brandId),
    retry: 1, // Reduce retry attempts
  });

  // Sync usage mutation
  const syncUsageMutation = useMutation({
    mutationFn: ({ resourceType }: { resourceType: string }) =>
      usageAPI.syncUsage(resourceType, brandId),
    onSuccess: (_, { resourceType }) => {
      // Force immediate refetch by invalidating and removing from cache
      queryClient.invalidateQueries({ queryKey: ["usage", brandId] });
      queryClient.removeQueries({ queryKey: ["usage", brandId] });
      toast.success(`${resourceType} usage synced successfully`);
    },
    onError: (error, { resourceType }) => {
      console.error(`Failed to sync ${resourceType} usage:`, error);
      toast.error(`Failed to sync ${resourceType} usage`);
    },
  });

  // Check if user can add a resource with safety checks
  const canAddResource = async (
    resourceType: string
  ): Promise<ResourceLimitCheck> => {
    // If disabled, allow all operations to prevent blocking users
    if (isDisabled) {
      console.log("[UsageTracking] Disabled, allowing operation");
      return {
        canAdd: true,
        current: 0,
        limit: 1000,
        remaining: 1000,
      };
    }
    
    try {
      const result = await checkLimitMutation.mutateAsync({ resourceType });
      return result;
    } catch (error: any) {
      console.error("[UsageTracking] Error checking resource limit:", error);
      
      // If it looks like an auth error, disable and allow
      if (error.message?.includes('401') || error.message?.includes('Authentication') || 
          error.message?.includes('Unauthorized')) {
        console.warn("[UsageTracking] Auth error detected, disabling tracking and allowing operation");
        setIsDisabled(true);
        return {
          canAdd: true,
          current: 0,
          limit: 1000,
          remaining: 1000,
        };
      }
      
      // For other errors, be conservative
      const usage = getUsage(resourceType);
      return {
        canAdd: false,
        current: usage?.current || 0,
        limit: usage?.limit || 100,
        remaining: 0,
      };
    }
  };

  // Sync usage for a resource type with safety checks
  const syncUsage = (resourceType: string) => {
    if (isDisabled) {
      console.log("[UsageTracking] Disabled, skipping sync");
      return;
    }
    
    console.log(`[UsageTracking] Syncing ${resourceType}`);
    syncUsageMutation.mutate({ resourceType });
  };

  // Get usage for a specific resource type
  const getUsage = (resourceType: string): UsageData | undefined => {
    return allUsage?.[resourceType as keyof typeof allUsage];
  };

  // Check if user is at or near limit
  const isAtLimit = (resourceType: string): boolean => {
    const usage = getUsage(resourceType);
    if (!usage || usage.isUnlimited) return false;
    return usage.current >= usage.limit;
  };

  const isNearLimit = (resourceType: string): boolean => {
    const usage = getUsage(resourceType);
    if (!usage || usage.isUnlimited) return false;
    const percentage = (usage.current / usage.limit) * 100;
    return percentage >= 80;
  };

  return {
    allUsage,
    isLoading: isLoading && !isDisabled,
    error: isDisabled ? null : error, // Hide errors when disabled
    canAddResource,
    syncUsage,
    getUsage,
    isAtLimit,
    isNearLimit,
    isCheckingLimit: checkLimitMutation.isPending && !isDisabled,
    isSyncing: syncUsageMutation.isPending && !isDisabled,
    isDisabled, // Expose disabled state for debugging
  };
};
