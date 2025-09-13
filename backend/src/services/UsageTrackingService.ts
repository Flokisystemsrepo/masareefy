import { prisma } from "../config/database";

export class UsageTrackingService {
  /**
   * Get current usage for a specific resource type
   */
  static async getUsage(
    userId: string,
    brandId: string,
    resourceType: string
  ): Promise<{ current: number; limit: number; isUnlimited: boolean }> {
    try {
      // Get user's subscription to determine limits
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: "active",
        },
        include: {
          plan: true,
        },
      });

      if (!subscription) {
        throw new Error("No active subscription found");
      }

      const planFeatures = subscription.plan.features as any;
      const limits = planFeatures.limits || {};

      // Map resource types to plan limit field names
      const limitFieldMap: Record<string, string> = {
        inventory: "inventoryItems",
        team_members: "teamMembers",
        wallets: "wallets",
        transactions: "transactions",
      };

      // Get current usage from database
      const usage = await prisma.usageTracking.findUnique({
        where: {
          userId_brandId_resourceType: {
            userId,
            brandId,
            resourceType,
          },
        },
      });

      const current = usage?.currentCount || 0;
      const limitField = limitFieldMap[resourceType] || resourceType;
      const limit = limits[limitField] || -1;
      const isUnlimited = limit === -1;

      return {
        current,
        limit,
        isUnlimited,
      };
    } catch (error) {
      console.error("Error getting usage:", error);
      throw error;
    }
  }

  /**
   * Update usage count for a resource type
   */
  static async updateUsage(
    userId: string,
    brandId: string,
    resourceType: string,
    increment: number = 1
  ): Promise<void> {
    try {
      await prisma.usageTracking.upsert({
        where: {
          userId_brandId_resourceType: {
            userId,
            brandId,
            resourceType,
          },
        },
        update: {
          currentCount: {
            increment,
          },
          lastUpdated: new Date(),
        },
        create: {
          userId,
          brandId,
          resourceType,
          currentCount: increment,
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      console.error("Error updating usage:", error);
      throw error;
    }
  }

  /**
   * Decrease usage count for a resource type
   */
  static async decreaseUsage(
    userId: string,
    brandId: string,
    resourceType: string,
    decrement: number = 1
  ): Promise<void> {
    try {
      await prisma.usageTracking.upsert({
        where: {
          userId_brandId_resourceType: {
            userId,
            brandId,
            resourceType,
          },
        },
        update: {
          currentCount: {
            decrement,
          },
          lastUpdated: new Date(),
        },
        create: {
          userId,
          brandId,
          resourceType,
          currentCount: Math.max(0, -decrement),
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      console.error("Error decreasing usage:", error);
      throw error;
    }
  }

  /**
   * Check if user can add more of a resource type
   */
  static async canAddResource(
    userId: string,
    brandId: string,
    resourceType: string
  ): Promise<{
    canAdd: boolean;
    current: number;
    limit: number;
    remaining: number;
  }> {
    try {
      const usage = await this.getUsage(userId, brandId, resourceType);

      const canAdd = usage.isUnlimited || usage.current < usage.limit;
      const remaining = usage.isUnlimited
        ? -1
        : Math.max(0, usage.limit - usage.current);

      return {
        canAdd,
        current: usage.current,
        limit: usage.limit,
        remaining,
      };
    } catch (error) {
      console.error("Error checking resource limit:", error);
      throw error;
    }
  }

  /**
   * Sync usage with actual database counts
   */
  static async syncUsage(
    userId: string,
    brandId: string,
    resourceType: string
  ): Promise<void> {
    try {
      let actualCount = 0;

      switch (resourceType) {
        case "inventory":
          actualCount = await prisma.inventory.count({
            where: { brandId },
          });
          break;
        case "team_members":
          actualCount = await prisma.brandUser.count({
            where: { brandId },
          });
          break;
        case "wallets":
          actualCount = await prisma.wallet.count({
            where: { brandId },
          });
          break;
        case "transactions":
          actualCount = await prisma.walletTransaction.count({
            where: { brandId },
          });
          break;
        default:
          throw new Error(`Unknown resource type: ${resourceType}`);
      }

      await prisma.usageTracking.upsert({
        where: {
          userId_brandId_resourceType: {
            userId,
            brandId,
            resourceType,
          },
        },
        update: {
          currentCount: actualCount,
          lastUpdated: new Date(),
        },
        create: {
          userId,
          brandId,
          resourceType,
          currentCount: actualCount,
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      console.error("Error syncing usage:", error);
      throw error;
    }
  }

  /**
   * Get all usage stats for a user/brand
   */
  static async getAllUsage(
    userId: string,
    brandId: string
  ): Promise<
    Record<string, { current: number; limit: number; isUnlimited: boolean }>
  > {
    try {
      const resourceTypes = [
        "inventory",
        "team_members",
        "wallets",
        "transactions",
      ];
      const usage: Record<string, any> = {};

      for (const resourceType of resourceTypes) {
        const resourceUsage = await this.getUsage(
          userId,
          brandId,
          resourceType
        );
        usage[resourceType] = resourceUsage;
      }
      return usage;
    } catch (error) {
      console.error("Error getting all usage:", error);
      throw error;
    }
  }
}
