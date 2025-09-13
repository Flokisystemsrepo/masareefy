import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryAPI } from "@/services/api";
import { usageAPI } from "@/services/usageAPI";
import { useAuth } from "@/contexts/AuthContext";

export const useInventoryUsage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get actual inventory count - disabled to prevent auth issues
  const { data: inventoryData } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => inventoryAPI.getAll(),
    enabled: false, // Disabled to prevent auth issues
    staleTime: 2 * 60 * 1000, // 2 minutes - longer cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Get usage data - disabled to prevent auth issues
  const { data: usageData } = useQuery({
    queryKey: ["usage", user?.brandId],
    queryFn: () => usageAPI.getAllUsage(user?.brandId || ""),
    enabled: false, // Disabled to prevent auth issues
    staleTime: 5 * 60 * 1000, // 5 minutes - much longer cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Calculate actual inventory count
  const actualInventoryCount = useMemo(() => {
    // Handle both array and object responses
    if (Array.isArray(inventoryData)) {
      return inventoryData.length;
    }
    if (inventoryData?.inventory && Array.isArray(inventoryData.inventory)) {
      return inventoryData.inventory.length;
    }
    if (inventoryData?.data && Array.isArray(inventoryData.data)) {
      return inventoryData.data.length;
    }
    return 0;
  }, [inventoryData]);

  // Get stored usage count
  const storedUsageCount = useMemo(() => {
    return usageData?.inventory?.current || 0;
  }, [usageData]);

  // Check if counts are out of sync
  const isOutOfSync = useMemo(() => {
    return actualInventoryCount !== storedUsageCount;
  }, [actualInventoryCount, storedUsageCount]);

  // Background sync disabled to prevent auth issues
  // useEffect(() => {
  //   if (isOutOfSync && user?.brandId && actualInventoryCount >= 0) {
  //     // Much longer debounce to prevent auth issues
  //     const timeoutId = setTimeout(() => {
  //       console.log(`Syncing inventory usage: actual=${actualInventoryCount}, stored=${storedUsageCount}`);
  //       usageAPI
  //         .syncUsage("inventory", user.brandId)
  //         .then(() => {
  //           console.log("Inventory usage synced successfully");
  //           // Don't immediately invalidate - let cache expire naturally
  //         })
  //         .catch((error) => {
  //           console.error("Failed to sync inventory usage:", error);
  //         });
  //     }, 10000); // Much longer delay (10 seconds) to prevent API spam

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [isOutOfSync, user?.brandId, actualInventoryCount, queryClient]);

  // Return the actual count for display (more reliable than stored count)
  // Use fallback count when no data is available to prevent auth issues
  const displayCount = actualInventoryCount || 0;

  return {
    currentCount: displayCount,
    actualCount: actualInventoryCount,
    storedCount: storedUsageCount,
    isOutOfSync,
    isLoading: !inventoryData && !usageData,
    inventoryData,
    usageData,
  };
};
