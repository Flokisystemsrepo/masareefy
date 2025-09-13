import { api } from "./api";

export interface UsageData {
  current: number;
  limit: number;
  isUnlimited: boolean;
}

export interface ResourceLimitCheck {
  canAdd: boolean;
  current: number;
  limit: number;
  remaining: number;
}

export interface AllUsageData {
  inventory: UsageData;
  team_members: UsageData;
  wallets: UsageData;
  transactions: UsageData;
}

export const usageAPI = {
  /**
   * Get usage for a specific resource type
   */
  getUsage: async (
    resourceType: string,
    brandId: string
  ): Promise<UsageData> => {
    const response = await api.get(`/usage/${resourceType}?brandId=${brandId}`);
    return response.data;
  },

  /**
   * Get all usage stats for a user/brand
   */
  getAllUsage: async (brandId: string): Promise<AllUsageData> => {
    const response = await api.get(`/usage?brandId=${brandId}`);
    return response.data;
  },

  /**
   * Check if user can add a resource
   */
  checkResourceLimit: async (
    resourceType: string,
    brandId: string
  ): Promise<ResourceLimitCheck> => {
    const response = await api.get(
      `/usage/${resourceType}/check?brandId=${brandId}`
    );
    return response.data;
  },

  /**
   * Sync usage with actual database counts
   */
  syncUsage: async (resourceType: string, brandId: string): Promise<void> => {
    await api.post(`/usage/${resourceType}/sync?brandId=${brandId}`);
  },
};
