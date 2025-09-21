import { prisma } from "@/config/database";

export class AdminService {
  // ===== USER MANAGEMENT =====

  // Get all users with their brands
  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    try {
      const skip = (page - 1) * limit;

      const whereClause = search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" as const } },
              { lastName: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            brands: {
              select: {
                id: true,
                name: true,
                settings: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID with all details
  static async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          brands: {
            include: {
              _count: {
                select: {
                  revenues: true,
                  costs: true,
                  receivables: true,
                  payables: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Update user information
  static async updateUser(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      emailVerified?: boolean;
    }
  ) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          brands: true,
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Delete user and all their data
  static async deleteUser(userId: string) {
    try {
      // Delete user and all related data (cascade will handle brands, revenues, costs, etc.)
      await prisma.user.delete({
        where: { id: userId },
      });

      return {
        success: true,
        message: "User and all related data deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  // ===== BRAND MANAGEMENT =====

  // Get all brands with user information
  static async getAllBrands(
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    try {
      const skip = (page - 1) * limit;

      const whereClause = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              {
                user: {
                  OR: [
                    {
                      firstName: {
                        contains: search,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      lastName: {
                        contains: search,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      email: { contains: search, mode: "insensitive" as const },
                    },
                  ],
                },
              },
            ],
          }
        : {};

      const [brands, total] = await Promise.all([
        prisma.brand.findMany({
          where: whereClause,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: {
                revenues: true,
                costs: true,
                receivables: true,
                payables: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.brand.count({ where: whereClause }),
      ]);

      return {
        brands,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get brand by ID with all details
  static async getBrandById(brandId: string) {
    try {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          revenues: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          costs: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          receivables: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          payables: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              revenues: true,
              costs: true,
              receivables: true,
              payables: true,
            },
          },
        },
      });

      if (!brand) {
        throw new Error("Brand not found");
      }

      return brand;
    } catch (error) {
      throw error;
    }
  }

  // Update brand information
  static async updateBrand(
    brandId: string,
    data: {
      name?: string;
      logoUrl?: string;
      settings?: any;
    }
  ) {
    try {
      const brand = await prisma.brand.update({
        where: { id: brandId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return brand;
    } catch (error) {
      throw error;
    }
  }

  // Update brand subscription
  static async updateBrandSubscription(
    brandId: string,
    subscriptionData: {
      subscription_bundle?: string;
      subscription_status?: string;
      billing_start?: string;
      billing_end?: string;
    }
  ) {
    try {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
      });

      if (!brand) {
        throw new Error("Brand not found");
      }

      const currentSettings = brand.settings as any;
      const updatedSettings = {
        ...currentSettings,
        ...subscriptionData,
      };

      const updatedBrand = await prisma.brand.update({
        where: { id: brandId },
        data: {
          settings: updatedSettings,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return updatedBrand;
    } catch (error) {
      throw error;
    }
  }

  // Delete brand and all its data
  static async deleteBrand(brandId: string) {
    try {
      await prisma.brand.delete({
        where: { id: brandId },
      });

      return {
        success: true,
        message: "Brand and all related data deleted successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  // ===== FINANCIAL DATA MANAGEMENT =====

  // Get financial overview for a brand
  static async getBrandFinancialOverview(brandId: string) {
    try {
      const [
        totalRevenues,
        totalCosts,
        totalReceivables,
        totalPayables,
        recentRevenues,
        recentCosts,
      ] = await Promise.all([
        prisma.revenue.aggregate({
          where: { brandId },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.cost.aggregate({
          where: { brandId },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.receivable.aggregate({
          where: { brandId },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.payable.aggregate({
          where: { brandId },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.revenue.findMany({
          where: { brandId },
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
        prisma.cost.findMany({
          where: { brandId },
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return {
        summary: {
          totalRevenues: totalRevenues._sum.amount || 0,
          totalCosts: totalCosts._sum.amount || 0,
          totalReceivables: totalReceivables._sum.amount || 0,
          totalPayables: totalPayables._sum.amount || 0,
          revenueCount: totalRevenues._count,
          costCount: totalCosts._count,
          receivableCount: totalReceivables._count,
          payableCount: totalPayables._count,
        },
        recentRevenues,
        recentCosts,
      };
    } catch (error) {
      throw error;
    }
  }

  // ===== SYSTEM STATISTICS =====

  // Get system-wide statistics
  static async getSystemStatistics() {
    try {
      const [
        totalUsers,
        totalBrands,
        totalRevenues,
        totalCosts,
        totalReceivables,
        totalPayables,
        activeSubscriptions,
        recentUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.brand.count(),
        prisma.revenue.aggregate({
          _sum: { amount: true },
          _count: true,
        }),
        prisma.cost.aggregate({
          _sum: { amount: true },
          _count: true,
        }),
        prisma.receivable.aggregate({
          _sum: { amount: true },
          _count: true,
        }),
        prisma.payable.aggregate({
          _sum: { amount: true },
          _count: true,
        }),
        prisma.brand.count({
          where: {
            settings: {
              path: ["subscription_status"],
              equals: "active",
            },
          },
        }),
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        }),
      ]);

      return {
        users: {
          total: totalUsers,
          recent: recentUsers,
        },
        brands: {
          total: totalBrands,
          activeSubscriptions,
        },
        financial: {
          totalRevenues: totalRevenues._sum.amount || 0,
          totalCosts: totalCosts._sum.amount || 0,
          totalReceivables: totalReceivables._sum.amount || 0,
          totalPayables: totalPayables._sum.amount || 0,
          revenueCount: totalRevenues._count,
          costCount: totalCosts._count,
          receivableCount: totalReceivables._count,
          payableCount: totalPayables._count,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user's actual subscription record
  static async updateUserSubscription(
    brandId: string,
    subscriptionData: {
      subscription_bundle: string;
      subscription_status: string;
      billing_start?: string;
      billing_end?: string;
    }
  ) {
    try {
      console.log("AdminService.updateUserSubscription called with:", {
        brandId,
        subscriptionData,
      });

      // Get the brand to find the user
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        include: { user: true },
      });

      if (!brand) {
        throw new Error("Brand not found");
      }

      console.log("Found brand:", {
        id: brand.id,
        userId: brand.userId,
        userEmail: brand.user.email,
      });

      // Find the plan by name
      const plan = await prisma.plan.findFirst({
        where: { name: subscriptionData.subscription_bundle },
      });

      if (!plan) {
        throw new Error("Plan not found");
      }

      console.log("Found plan:", {
        id: plan.id,
        name: plan.name,
        priceMonthly: plan.priceMonthly,
      });

      // Check if user already has a subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: brand.userId },
      });

      if (existingSubscription) {
        // Update existing subscription
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planId: plan.id,
            status: subscriptionData.subscription_status,
            currentPeriodStart: subscriptionData.billing_start
              ? new Date(subscriptionData.billing_start)
              : existingSubscription.currentPeriodStart,
            currentPeriodEnd: subscriptionData.billing_end
              ? new Date(subscriptionData.billing_end)
              : existingSubscription.currentPeriodEnd,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new subscription
        await prisma.subscription.create({
          data: {
            userId: brand.userId,
            planId: plan.id,
            status: subscriptionData.subscription_status,
            currentPeriodStart: subscriptionData.billing_start
              ? new Date(subscriptionData.billing_start)
              : new Date(),
            currentPeriodEnd: subscriptionData.billing_end
              ? new Date(subscriptionData.billing_end)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        });
      }

      return {
        success: true,
        message: "User subscription updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}
