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
      // Convert date string to DateTime object
      const processedData = {
        ...data,
        dueDate: new Date(data.dueDate),
        createdBy,
        status: "current",
      };

      const receivable = await prisma.receivable.create({
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

      // Convert date string to DateTime object if dueDate is provided
      const processedData = {
        ...data,
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      };

      // Check if receivable is converted and has linked revenue
      if (receivable.convertedRevenueId) {
        // Use sync method to update both receivable and revenue
        await this.syncReceivableWithRevenue(id, processedData);
        return await prisma.receivable.findFirst({
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
      } else {
        // Regular update for non-converted receivables
        const updatedReceivable = await prisma.receivable.update({
          where: { id },
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

        return updatedReceivable;
      }
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
      // Convert date string to DateTime object
      const processedData = {
        ...data,
        dueDate: new Date(data.dueDate),
        createdBy,
        status: "current",
      };

      const payable = await prisma.payable.create({
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

      // Convert date string to DateTime object if dueDate is provided
      const processedData = {
        ...data,
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      };

      // Check if payable is converted and has linked cost
      if (payable.convertedCostId) {
        // Use sync method to update both payable and cost
        await this.syncPayableWithCost(id, processedData);
        return await prisma.payable.findFirst({
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
      } else {
        // Regular update for non-converted payables
        const updatedPayable = await prisma.payable.update({
          where: { id },
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

        return updatedPayable;
      }
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
      const netIncome = totalRevenue - totalCosts;

      // Calculate break-even point (revenue needed to cover costs)
      const breakEvenPoint = totalCosts;

      // Calculate profit margin percentage
      const profitMargin =
        totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

      // Calculate cost percentage of revenue
      const costPercentage =
        totalRevenue > 0 ? (totalCosts / totalRevenue) * 100 : 0;

      // Get previous period data for growth calculations
      const previousStartDate = new Date(
        startDate.getTime() - (now.getTime() - startDate.getTime())
      );

      const [previousRevenueResult, previousCostsResult] = await Promise.all([
        prisma.revenue.aggregate({
          where: {
            brandId,
            createdAt: {
              gte: previousStartDate,
              lt: startDate,
            },
          },
          _sum: { amount: true },
        }),
        prisma.cost.aggregate({
          where: {
            brandId,
            createdAt: {
              gte: previousStartDate,
              lt: startDate,
            },
          },
          _sum: { amount: true },
        }),
      ]);

      const previousRevenue = previousRevenueResult._sum.amount || 0;
      const previousCosts = previousCostsResult._sum.amount || 0;

      // Calculate growth percentages
      const revenueGrowth =
        previousRevenue > 0
          ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
          : 0;
      const costGrowth =
        previousCosts > 0
          ? ((totalCosts - previousCosts) / previousCosts) * 100
          : 0;

      return {
        totalReceivables,
        totalPayables,
        totalRevenue,
        totalCosts,
        netIncome,
        overdueReceivables,
        overduePayables,
        breakEvenPoint,
        profitMargin,
        costPercentage,
        revenueGrowth,
        costGrowth,
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

  // Process due receivables and payables - convert to revenue/cost
  static async processDueItems() {
    try {
      const now = new Date();
      const results = {
        receivablesProcessed: 0,
        payablesProcessed: 0,
        errors: [] as string[],
      };

      // Process receivables that are due and marked for auto-conversion
      const dueReceivables = await prisma.receivable.findMany({
        where: {
          dueDate: { lte: now },
          autoConvertToRevenue: true,
          status: { in: ["current", "overdue"] },
        },
        include: {
          brand: true,
          creator: true,
        },
      });

      for (const receivable of dueReceivables) {
        try {
          await prisma.$transaction(async (tx) => {
            // Create revenue entry
            const revenue = await tx.revenue.create({
              data: {
                brandId: receivable.brandId,
                name: `Receivable: ${receivable.entityName}`,
                amount: receivable.amount,
                category: "Receivables",
                date: receivable.dueDate,
                source: "Auto-converted Receivable",
                createdBy: receivable.createdBy,
                sourceReceivableId: receivable.id,
              },
            });

            // Update receivable status to "converted" and link to revenue
            await tx.receivable.update({
              where: { id: receivable.id },
              data: {
                status: "converted",
                convertedRevenueId: revenue.id,
              },
            });
          });

          results.receivablesProcessed++;
        } catch (error: any) {
          results.errors.push(
            `Failed to process receivable ${receivable.id}: ${error.message}`
          );
        }
      }

      // Process payables that are due and marked for auto-conversion
      const duePayables = await prisma.payable.findMany({
        where: {
          dueDate: { lte: now },
          autoConvertToCost: true,
          status: { in: ["current", "overdue"] },
        },
        include: {
          brand: true,
          creator: true,
        },
      });

      for (const payable of duePayables) {
        try {
          await prisma.$transaction(async (tx) => {
            // Create cost entry
            const cost = await tx.cost.create({
              data: {
                brandId: payable.brandId,
                name: `Payable: ${payable.entityName}`,
                amount: payable.amount,
                category: "Payables",
                date: payable.dueDate,
                vendor: payable.entityName,
                createdBy: payable.createdBy,
                sourcePayableId: payable.id,
              },
            });

            // Update payable status to "converted" and link to cost
            await tx.payable.update({
              where: { id: payable.id },
              data: {
                status: "converted",
                convertedCostId: cost.id,
              },
            });
          });

          results.payablesProcessed++;
        } catch (error: any) {
          results.errors.push(
            `Failed to process payable ${payable.id}: ${error.message}`
          );
        }
      }

      return {
        success: true,
        message: `Processed ${results.receivablesProcessed} receivables and ${results.payablesProcessed} payables`,
        data: results,
      };
    } catch (error: any) {
      throw new Error(`Failed to process due items: ${error.message}`);
    }
  }

  // Sync receivable with its converted revenue
  static async syncReceivableWithRevenue(
    receivableId: string,
    updateData: any
  ) {
    try {
      const receivable = await prisma.receivable.findUnique({
        where: { id: receivableId },
        include: { brand: true, creator: true },
      });

      if (!receivable || !receivable.convertedRevenueId) {
        return {
          success: false,
          message: "Receivable not found or not converted",
        };
      }

      await prisma.$transaction(async (tx) => {
        // Update receivable
        await tx.receivable.update({
          where: { id: receivableId },
          data: updateData,
        });

        // Update linked revenue
        await tx.revenue.update({
          where: { id: receivable.convertedRevenueId! },
          data: {
            name: `Receivable: ${
              updateData.entityName || receivable.entityName
            }`,
            amount: updateData.amount || receivable.amount,
            date: updateData.dueDate || receivable.dueDate,
            receiptUrl: updateData.receiptUrl || receivable.receiptUrl,
          },
        });
      });

      return {
        success: true,
        message: "Receivable and revenue synced successfully",
      };
    } catch (error: any) {
      throw new Error(
        `Failed to sync receivable with revenue: ${error.message}`
      );
    }
  }

  // Sync payable with its converted cost
  static async syncPayableWithCost(payableId: string, updateData: any) {
    try {
      const payable = await prisma.payable.findUnique({
        where: { id: payableId },
        include: { brand: true, creator: true },
      });

      if (!payable || !payable.convertedCostId) {
        return {
          success: false,
          message: "Payable not found or not converted",
        };
      }

      await prisma.$transaction(async (tx) => {
        // Update payable
        await tx.payable.update({
          where: { id: payableId },
          data: updateData,
        });

        // Update linked cost
        await tx.cost.update({
          where: { id: payable.convertedCostId! },
          data: {
            name: `Payable: ${updateData.entityName || payable.entityName}`,
            amount: updateData.amount || payable.amount,
            date: updateData.dueDate || payable.dueDate,
            vendor: updateData.entityName || payable.entityName,
            receiptUrl: updateData.receiptUrl || payable.receiptUrl,
          },
        });
      });

      return { success: true, message: "Payable and cost synced successfully" };
    } catch (error: any) {
      throw new Error(`Failed to sync payable with cost: ${error.message}`);
    }
  }

  // Sync revenue with its source receivable
  static async syncRevenueWithReceivable(revenueId: string, updateData: any) {
    try {
      const revenue = await prisma.revenue.findUnique({
        where: { id: revenueId },
      });

      if (!revenue || !revenue.sourceReceivableId) {
        return {
          success: false,
          message: "Revenue not found or not from receivable",
        };
      }

      await prisma.$transaction(async (tx) => {
        // Update revenue
        await tx.revenue.update({
          where: { id: revenueId },
          data: updateData,
        });

        // Update linked receivable
        await tx.receivable.update({
          where: { id: revenue.sourceReceivableId! },
          data: {
            entityName:
              updateData.name?.replace("Receivable: ", "") || undefined,
            amount: updateData.amount,
            dueDate: updateData.date,
            receiptUrl: updateData.receiptUrl,
          },
        });
      });

      return {
        success: true,
        message: "Revenue and receivable synced successfully",
      };
    } catch (error: any) {
      throw new Error(
        `Failed to sync revenue with receivable: ${error.message}`
      );
    }
  }

  // Sync cost with its source payable
  static async syncCostWithPayable(costId: string, updateData: any) {
    try {
      const cost = await prisma.cost.findUnique({
        where: { id: costId },
      });

      if (!cost || !cost.sourcePayableId) {
        return {
          success: false,
          message: "Cost not found or not from payable",
        };
      }

      await prisma.$transaction(async (tx) => {
        // Update cost
        await tx.cost.update({
          where: { id: costId },
          data: updateData,
        });

        // Update linked payable
        await tx.payable.update({
          where: { id: cost.sourcePayableId! },
          data: {
            entityName:
              updateData.name?.replace("Payable: ", "") || updateData.vendor,
            amount: updateData.amount,
            dueDate: updateData.date,
            receiptUrl: updateData.receiptUrl,
          },
        });
      });

      return { success: true, message: "Cost and payable synced successfully" };
    } catch (error: any) {
      throw new Error(`Failed to sync cost with payable: ${error.message}`);
    }
  }
}
