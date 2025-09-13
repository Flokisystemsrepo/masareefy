import { prisma } from "@/config/database";
import {
  CreateRevenueDto,
  UpdateRevenueDto,
  CreateCostDto,
  UpdateCostDto,
} from "@/types";

export class RevenuesCostsService {
  // ===== REVENUES =====

  // Create revenue
  static async createRevenue(data: CreateRevenueDto, createdBy: string) {
    try {
      // Convert date string to DateTime object
      const processedData = {
        ...data,
        date: new Date(data.date),
        createdBy,
      };

      const revenue = await prisma.revenue.create({
        data: processedData,
        include: {
          brand: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return revenue;
    } catch (error) {
      throw error;
    }
  }

  // Get all revenues for a brand
  static async getRevenues(
    brandId: string,
    filters?: {
      search?: string;
      page?: number;
      limit?: number;
      category?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    try {
      const {
        search,
        page = 1,
        limit = 10,
        category,
        startDate,
        endDate,
      } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { brandId };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
          { source: { contains: search, mode: "insensitive" } },
        ];
      }

      if (category) {
        where.category = category;
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date.gte = new Date(startDate);
        }
        if (endDate) {
          where.date.lte = new Date(endDate);
        }
      }

      const [revenues, total] = await Promise.all([
        prisma.revenue.findMany({
          where,
          select: {
            id: true,
            name: true,
            amount: true,
            category: true,
            date: true,
            source: true,
            receiptUrl: true,
            createdAt: true,
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.revenue.count({ where }),
      ]);

      return {
        revenues,
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

  // Get revenue by ID
  static async getRevenueById(id: string, brandId: string) {
    try {
      const revenue = await prisma.revenue.findFirst({
        where: { id, brandId },
        include: {
          brand: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!revenue) {
        throw new Error("Revenue not found");
      }

      return revenue;
    } catch (error) {
      throw error;
    }
  }

  // Update revenue
  static async updateRevenue(
    id: string,
    brandId: string,
    data: UpdateRevenueDto
  ) {
    try {
      const revenue = await prisma.revenue.findFirst({
        where: { id, brandId },
      });

      if (!revenue) {
        throw new Error("Revenue not found");
      }

      const updatedRevenue = await prisma.revenue.update({
        where: { id },
        data,
        include: {
          brand: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return updatedRevenue;
    } catch (error) {
      throw error;
    }
  }

  // Delete revenue
  static async deleteRevenue(id: string, brandId: string) {
    try {
      const revenue = await prisma.revenue.findFirst({
        where: { id, brandId },
      });

      if (!revenue) {
        throw new Error("Revenue not found");
      }

      await prisma.revenue.delete({ where: { id } });

      return { message: "Revenue deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // ===== COSTS =====

  // Create cost
  static async createCost(data: CreateCostDto, createdBy: string) {
    try {
      // Convert date string to DateTime object
      const processedData = {
        ...data,
        date: new Date(data.date),
        createdBy,
      };

      const cost = await prisma.cost.create({
        data: processedData,
        include: {
          brand: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return cost;
    } catch (error) {
      throw error;
    }
  }

  // Get all costs for a brand
  static async getCosts(
    brandId: string,
    filters?: {
      search?: string;
      page?: number;
      limit?: number;
      category?: string;
      costType?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    try {
      const {
        search,
        page = 1,
        limit = 10,
        category,
        costType,
        startDate,
        endDate,
      } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { brandId };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
          { vendor: { contains: search, mode: "insensitive" } },
        ];
      }

      if (category) {
        where.category = category;
      }

      if (costType) {
        where.costType = costType;
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date.gte = new Date(startDate);
        }
        if (endDate) {
          where.date.lte = new Date(endDate);
        }
      }

      const [costs, total] = await Promise.all([
        prisma.cost.findMany({
          where,
          select: {
            id: true,
            name: true,
            amount: true,
            category: true,
            costType: true,
            date: true,
            vendor: true,
            receiptUrl: true,
            createdAt: true,
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.cost.count({ where }),
      ]);

      return {
        costs,
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

  // Get cost by ID
  static async getCostById(id: string, brandId: string) {
    try {
      const cost = await prisma.cost.findFirst({
        where: { id, brandId },
        include: {
          brand: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!cost) {
        throw new Error("Cost not found");
      }

      return cost;
    } catch (error) {
      throw error;
    }
  }

  // Update cost
  static async updateCost(id: string, brandId: string, data: UpdateCostDto) {
    try {
      const cost = await prisma.cost.findFirst({
        where: { id, brandId },
      });

      if (!cost) {
        throw new Error("Cost not found");
      }

      const updatedCost = await prisma.cost.update({
        where: { id },
        data,
        include: {
          brand: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return updatedCost;
    } catch (error) {
      throw error;
    }
  }

  // Delete cost
  static async deleteCost(id: string, brandId: string) {
    try {
      const cost = await prisma.cost.findFirst({
        where: { id, brandId },
      });

      if (!cost) {
        throw new Error("Cost not found");
      }

      await prisma.cost.delete({ where: { id } });

      return { message: "Cost deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // ===== FINANCIAL CALCULATIONS =====

  // Get revenue metrics
  static async getRevenueMetrics(brandId: string, dateRange?: string) {
    try {
      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
      }

      const [totalRevenue, monthlyRevenue] = await Promise.all([
        // Total revenue for date range
        prisma.revenue.aggregate({
          where: {
            brandId,
            date: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        // Monthly revenue (current month)
        prisma.revenue.aggregate({
          where: {
            brandId,
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),
      ]);

      return {
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get cost metrics
  static async getCostMetrics(brandId: string, dateRange?: string) {
    try {
      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
      }

      const [totalCosts, monthlyCosts] = await Promise.all([
        // Total costs for date range
        prisma.cost.aggregate({
          where: {
            brandId,
            date: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        // Monthly costs (current month)
        prisma.cost.aggregate({
          where: {
            brandId,
            date: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),
      ]);

      return {
        totalCosts: totalCosts._sum.amount || 0,
        monthlyCosts: monthlyCosts._sum.amount || 0,
      };
    } catch (error) {
      throw error;
    }
  }
}
