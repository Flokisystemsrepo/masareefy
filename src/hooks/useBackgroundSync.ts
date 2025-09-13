import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usageAPI } from "@/services/usageAPI";
import { useAuth } from "@/contexts/AuthContext";

export const useBackgroundSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user?.brandId) return;

    // Sync every 10 minutes in the background (much less aggressive)
    const syncInterval = 10 * 60 * 1000; // 10 minutes

    const performSync = async () => {
      try {
        // Only sync inventory to avoid too many API calls
        await usageAPI.syncUsage("inventory", user.brandId);
        console.log("Background inventory sync completed");
      } catch (error) {
        console.error("Background sync failed:", error);
      }
    };

    // Initial sync after 30 seconds (much longer delay)
    const initialTimeout = setTimeout(performSync, 30000);

    // Set up periodic sync
    syncIntervalRef.current = setInterval(performSync, syncInterval);

    return () => {
      clearTimeout(initialTimeout);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [user?.brandId, queryClient]);

  return null; // This hook doesn't return anything, it just runs in the background
};
