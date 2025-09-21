import { prisma } from "../config/database";

interface UsageData {
  current: number;
  limit: number;
  isUnlimited: boolean;
}

interface AllUsageData {
  inventory: UsageData;
  team_members: UsageData;
  wallets: UsageData;
  transactions: UsageData;
}

interface ResourceLimitCheck {
  canAdd: boolean;
  current: number;
  limit: number;
  remaining: number;
}

export class UsageService {
  // Get subscription plan limits
  private static getResourceLimits(planName: string): {
    [key: string]: number;
  } {
    const limits: { [planName: string]: { [resource: string]: number } } = {
      free: {
        inventory: 10,
        team_members: 1,
        wallets: 2,
        transactions: -1, // unlimited
      },
      starter: {
        inventory: 100,
        team_members: 3,
        wallets: 5,
        transactions: -1, // unlimited
      },
      professional: {
        inventory: -1, // unlimited
        team_members: -1, // unlimited
        wallets: -1, // unlimited
        transactions: -1, // unlimited
      },
      enterprise: {
        inventory: -1, // unlimited
        team_members: -1, // unlimited
        wallets: -1, // unlimited
        transactions: -1, // unlimited
      },
    };

    return limits[planName.toLowerCase()] || limits["starter"];
  }

  // Get actual counts from database
  private static async getActualCounts(
    brandId: string
  ): Promise<{ [key: string]: number }> {
    try {
      const [inventoryCount, teamMemberCount, walletCount, transactionCount] =
        await Promise.all([
          prisma.inventory.count({ where: { brandId } }),
          prisma.teamMember.count({ where: { brandId } }),
          prisma.wallet.count({ where: { brandId } }),
          prisma.walletTransaction.count({
            where: {
              OR: [{ fromWallet: { brandId } }, { toWallet: { brandId } }],
            },
          }),
        ]);

      return {
        inventory: inventoryCount,
        team_members: teamMemberCount,
        wallets: walletCount,
        transactions: transactionCount,
      };
    } catch (error) {
      console.error("Error getting actual counts:", error);
      return {
        inventory: 0,
        team_members: 0,
        wallets: 0,
        transactions: 0,
      };
    }
  }

  // Get user's subscription plan
  private static async getUserPlan(brandId: string): Promise<string> {
    try {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        include: {
          user: {
            include: {
              subscriptions: {
                where: { status: "active" },
                include: { plan: true },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      if (brand?.user?.subscriptions?.[0]?.plan?.name) {
        return brand.user.subscriptions[0].plan.name;
      }

      return "starter"; // default plan
    } catch (error) {
      console.error("Error getting user plan:", error);
      return "starter";
    }
  }

  // Get usage for specific resource
  static async getUsage(
    resourceType: string,
    brandId: string
  ): Promise<UsageData> {
    const planName = await this.getUserPlan(brandId);
    const limits = this.getResourceLimits(planName);
    const actualCounts = await this.getActualCounts(brandId);

    const limit = limits[resourceType] || 100;
    const current = actualCounts[resourceType] || 0;

    return {
      current,
      limit: limit === -1 ? 999999 : limit,
      isUnlimited: limit === -1,
    };
  }

  // Get all usage data
  static async getAllUsage(brandId: string): Promise<AllUsageData> {
    const planName = await this.getUserPlan(brandId);
    const limits = this.getResourceLimits(planName);
    const actualCounts = await this.getActualCounts(brandId);

    const createUsageData = (resourceType: string): UsageData => {
      const limit = limits[resourceType] || 100;
      const current = actualCounts[resourceType] || 0;

      return {
        current,
        limit: limit === -1 ? 999999 : limit,
        isUnlimited: limit === -1,
      };
    };

    return {
      inventory: createUsageData("inventory"),
      team_members: createUsageData("team_members"),
      wallets: createUsageData("wallets"),
      transactions: createUsageData("transactions"),
    };
  }

  // Check if user can add resource
  static async checkResourceLimit(
    resourceType: string,
    brandId: string
  ): Promise<ResourceLimitCheck> {
    const usage = await this.getUsage(resourceType, brandId);
    const canAdd = usage.isUnlimited || usage.current < usage.limit;
    const remaining = usage.isUnlimited
      ? 999999
      : Math.max(0, usage.limit - usage.current);

    return {
      canAdd,
      current: usage.current,
      limit: usage.limit,
      remaining,
    };
  }

  // Sync usage with actual database counts
  static async syncUsage(resourceType: string, brandId: string): Promise<void> {
    // For now, this is handled by direct database queries
    // In a real implementation, you might update cached usage counts here
    console.log(`Syncing ${resourceType} usage for brand ${brandId}`);

    // Force recalculation by getting fresh data
    await this.getUsage(resourceType, brandId);
  }
}
