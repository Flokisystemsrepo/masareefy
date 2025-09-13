import { prisma } from "@/config/database";
import {
  CreateReceivableDto,
  UpdateReceivableDto,
  CreatePayableDto,
  UpdatePayableDto,
  FinancialMetrics,
} from "@/types";

export class ReceivablesPayablesService {
  // ===== RECEIVABLES =====

  // Create receivable
  static async createReceivable(data: CreateReceivableDto, createdBy: string) {
    try {
      const receivable = await prisma.receivable.create({
        data: {
          ...data,
          createdBy,
          status: "current",
        },
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

      return receivable;
    } catch (error) {
      throw error;
    }
  }

  // Get all receivables for a brand
  static async getReceivables(
    brandId: string,
    filters?: {
      status?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const {
        status,
        search,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { brandId };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { entityName: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { invoiceNumber: { contains: search, mode: "insensitive" } },
        ];
      }

      // Date filtering
      if (startDate || endDate) {
        where.dueDate = {};
        if (startDate) {
          where.dueDate.gte = new Date(startDate);
        }
        if (endDate) {
          where.dueDate.lte = new Date(endDate);
        }
      }

      const [receivables, total] = await Promise.all([
        prisma.receivable.findMany({
          where,
          include: {
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
        prisma.receivable.count({ where }),
      ]);

      return {
        receivables,
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

  // Get receivable by ID
  static async getReceivableById(id: string, brandId: string) {
    try {
      const receivable = await prisma.receivable.findFirst({
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

      if (!receivable) {
        throw new Error("Receivable not found");
      }

      return receivable;
    } catch (error) {
      throw error;
    }
  }

  // Update receivable
  static async updateReceivable(
    id: string,
    brandId: string,
    data: UpdateReceivableDto
  ) {
    try {
      const receivable = await prisma.receivable.findFirst({
        where: { id, brandId },
      });

      if (!receivable) {
        throw new Error("Receivable not found");
      }

      const updatedReceivable = await prisma.receivable.update({
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

      return updatedReceivable;
    } catch (error) {
      throw error;
    }
  }

  // Delete receivable
  static async deleteReceivable(id: string, brandId: string) {
    try {
      const receivable = await prisma.receivable.findFirst({
        where: { id, brandId },
      });

      if (!receivable) {
        throw new Error("Receivable not found");
      }

      await prisma.receivable.delete({ where: { id } });

      return { message: "Receivable deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // ===== PAYABLES =====

  // Create payable
  static async createPayable(data: CreatePayableDto, createdBy: string) {
    try {
      const payable = await prisma.payable.create({
        data: {
          ...data,
          createdBy,
          status: "current",
        },
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

      return payable;
    } catch (error) {
      throw error;
    }
  }

  // Get all payables for a brand
  static async getPayables(
    brandId: string,
    filters?: {
      status?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const {
        status,
        search,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { brandId };

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { entityName: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { invoiceNumber: { contains: search, mode: "insensitive" } },
        ];
      }

      // Date filtering
      if (startDate || endDate) {
        where.dueDate = {};
        if (startDate) {
          where.dueDate.gte = new Date(startDate);
        }
        if (endDate) {
          where.dueDate.lte = new Date(endDate);
        }
      }

      const [payables, total] = await Promise.all([
        prisma.payable.findMany({
          where,
          include: {
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
        prisma.payable.count({ where }),
      ]);

      return {
        payables,
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

  // Get payable by ID
  static async getPayableById(id: string, brandId: string) {
    try {
      const payable = await prisma.payable.findFirst({
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

      if (!payable) {
        throw new Error("Payable not found");
      }

      return payable;
    } catch (error) {
      throw error;
    }
  }

  // Update payable
  static async updatePayable(
    id: string,
    brandId: string,
    data: UpdatePayableDto
  ) {
    try {
      const payable = await prisma.payable.findFirst({
        where: { id, brandId },
      });

      if (!payable) {
        throw new Error("Payable not found");
      }

      const updatedPayable = await prisma.payable.update({
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

      return updatedPayable;
    } catch (error) {
      throw error;
    }
  }

  // Delete payable
  static async deletePayable(id: string, brandId: string) {
    try {
      const payable = await prisma.payable.findFirst({
        where: { id, brandId },
      });

      if (!payable) {
        throw new Error("Payable not found");
      }

      await prisma.payable.delete({ where: { id } });

      return { message: "Payable deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // ===== FINANCIAL METRICS =====

  // Get financial metrics for a brand
  static async getFinancialMetrics(
    brandId: string,
    dateRange?: string
  ): Promise<FinancialMetrics> {
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

      const [
        receivablesResult,
        payablesResult,
        revenuesResult,
        costsResult,
        overdueReceivablesResult,
        overduePayablesResult,
      ] = await Promise.all([
        // Total receivables
        prisma.receivable.aggregate({
          where: {
            brandId,
            status: { not: "paid" },
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        // Total payables
        prisma.payable.aggregate({
          where: {
            brandId,
            status: { not: "paid" },
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        // Total revenues
        prisma.revenue.aggregate({
          where: {
            brandId,
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        // Total costs
        prisma.cost.aggregate({
          where: {
            brandId,
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        // Overdue receivables
        prisma.receivable.aggregate({
          where: {
            brandId,
            status: { in: ["overdue", "critical"] },
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        // Overdue payables
        prisma.payable.aggregate({
          where: {
            brandId,
            status: { in: ["overdue", "critical"] },
            createdAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),
      ]);

      const totalReceivables = receivablesResult._sum.amount || 0;
      const totalPayables = payablesResult._sum.amount || 0;
      const totalRevenue = revenuesResult._sum.amount || 0;
      const totalCosts = costsResult._sum.amount || 0;
      const overdueReceivables = overdueReceivablesResult._sum.amount || 0;
      const overduePayables = overduePayablesResult._sum.amount || 0;

      return {
        totalReceivables,
        totalPayables,
        totalRevenue,
        totalCosts,
        netIncome: totalRevenue - totalCosts,
        overdueReceivables,
        overduePayables,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update status based on due dates
  static async updateStatuses() {
    try {
      const now = new Date();

      // Update overdue receivables
      await prisma.receivable.updateMany({
        where: {
          dueDate: { lt: now },
          status: "current",
        },
        data: { status: "overdue" },
      });

      // Update critical receivables (30+ days overdue)
      const criticalDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      await prisma.receivable.updateMany({
        where: {
          dueDate: { lt: criticalDate },
          status: "overdue",
        },
        data: { status: "critical" },
      });

      // Update overdue payables
      await prisma.payable.updateMany({
        where: {
          dueDate: { lt: now },
          status: "current",
        },
        data: { status: "overdue" },
      });

      // Update critical payables (30+ days overdue)
      await prisma.payable.updateMany({
        where: {
          dueDate: { lt: criticalDate },
          status: "overdue",
        },
        data: { status: "critical" },
      });

      return { message: "Statuses updated successfully" };
    } catch (error) {
      throw error;
    }
  }
}
