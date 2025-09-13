import { PrismaClient } from "@prisma/client";
import {
  CreateTransferDto,
  UpdateTransferDto,
  CreateInventoryDto,
  UpdateInventoryDto,
} from "../types";

const prisma = new PrismaClient();

export class TransfersInventoryService {
  // ===== TRANSFERS =====

  // Create transfer
  static async createTransfer(data: CreateTransferDto, createdBy: string) {
    try {
      const processedData = {
        ...data,
        transferDate: new Date(data.transferDate),
        createdBy,
      };

      // If it's an inventory transfer with stock deduction enabled
      if (
        data.type === "inventory" &&
        data.deductFromStock &&
        data.inventoryItemId
      ) {
        // Use a transaction to ensure both operations succeed or fail together
        const result = await prisma.$transaction(async (tx) => {
          // First, check if the inventory item exists and has enough stock
          const inventoryItem = await tx.inventory.findFirst({
            where: {
              id: data.inventoryItemId,
              brandId: data.brandId,
            },
          });

          if (!inventoryItem) {
            throw new Error("Inventory item not found");
          }

          if (inventoryItem.currentStock < data.quantity) {
            throw new Error(
              `Insufficient stock. Available: ${inventoryItem.currentStock}, Required: ${data.quantity}`
            );
          }

          // Create the transfer
          const transfer = await tx.transfer.create({
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

          // Deduct the quantity from inventory
          await tx.inventory.update({
            where: { id: data.inventoryItemId },
            data: {
              currentStock: inventoryItem.currentStock - data.quantity,
            },
          });

          return transfer;
        });

        return result;
      } else {
        // Regular transfer creation without stock deduction
        const transfer = await prisma.transfer.create({
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

        return transfer;
      }
    } catch (error) {
      throw error;
    }
  }

  // Get all transfers for a brand
  static async getTransfers(
    brandId: string,
    filters?: {
      type?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const {
        type,
        search,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { brandId };

      if (type) {
        where.type = type;
      }

      if (search) {
        where.OR = [
          { fromLocation: { contains: search, mode: "insensitive" } },
          { toLocation: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      // Date filtering
      if (startDate || endDate) {
        where.transferDate = {};
        if (startDate) {
          where.transferDate.gte = new Date(startDate);
        }
        if (endDate) {
          where.transferDate.lte = new Date(endDate);
        }
      }

      const [transfers, total] = await Promise.all([
        prisma.transfer.findMany({
          where,
          select: {
            id: true,
            type: true,
            fromLocation: true,
            toLocation: true,
            quantity: true,
            description: true,
            transferDate: true,
            inventoryItemId: true,
            deductFromStock: true,
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
        prisma.transfer.count({ where }),
      ]);

      return {
        transfers,
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

  // Get transfer by ID
  static async getTransferById(id: string, brandId: string) {
    try {
      const transfer = await prisma.transfer.findFirst({
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

      if (!transfer) {
        throw new Error("Transfer not found");
      }

      return transfer;
    } catch (error) {
      throw error;
    }
  }

  // Update transfer
  static async updateTransfer(
    id: string,
    brandId: string,
    data: UpdateTransferDto
  ) {
    try {
      const transfer = await prisma.transfer.findFirst({
        where: { id, brandId },
      });

      if (!transfer) {
        throw new Error("Transfer not found");
      }

      const processedData = { ...data };
      if (data.transferDate) {
        processedData.transferDate = new Date(data.transferDate);
      }

      const updatedTransfer = await prisma.transfer.update({
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

      return updatedTransfer;
    } catch (error) {
      throw error;
    }
  }

  // Delete transfer
  static async deleteTransfer(id: string, brandId: string) {
    try {
      const transfer = await prisma.transfer.findFirst({
        where: { id, brandId },
      });

      if (!transfer) {
        throw new Error("Transfer not found");
      }

      await prisma.transfer.delete({
        where: { id },
      });

      return { message: "Transfer deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Get transfer metrics
  static async getTransferMetrics(brandId: string) {
    try {
      const [totalTransfers, monthlyTransfers] = await Promise.all([
        // Total transfers
        prisma.transfer.count({
          where: { brandId },
        }),
        // Monthly transfers (current month)
        prisma.transfer.count({
          where: {
            brandId,
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

      return {
        totalTransfers,
        monthlyTransfers,
      };
    } catch (error) {
      throw error;
    }
  }

  // ===== INVENTORY =====

  // Create inventory item
  static async createInventoryItem(
    data: CreateInventoryDto,
    createdBy: string
  ) {
    try {
      const processedData = {
        ...data,
        createdBy,
      };

      const inventory = await prisma.inventory.create({
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

      return inventory;
    } catch (error) {
      throw error;
    }
  }

  // Get all inventory items for a brand
  static async getInventoryItems(
    brandId: string,
    filters?: {
      search?: string;
      category?: string;
      supplier?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const {
        search,
        category,
        supplier,
        location,
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = filters || {};
      const skip = (page - 1) * limit;

      const where: any = { brandId };

      if (search) {
        where.OR = [
          { productName: { contains: search, mode: "insensitive" } },
          { baseSku: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
          { supplier: { contains: search, mode: "insensitive" } },
          { status: { contains: search, mode: "insensitive" } },
        ];
      }

      if (category) {
        where.category = category;
      }

      if (supplier) {
        where.supplier = supplier;
      }

      if (location) {
        where.location = location;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate + "T23:59:59.999Z");
        }
      }

      const [inventory, total] = await Promise.all([
        prisma.inventory.findMany({
          where,
          select: {
            id: true,
            productName: true,
            baseSku: true,
            category: true,
            supplier: true,
            unitCost: true,
            sellingPrice: true,
            currentStock: true,
            reorderLevel: true,
            description: true,
            location: true,
            sizes: true,
            colors: true,
            status: true,
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
        prisma.inventory.count({ where }),
      ]);

      return {
        inventory,
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

  // Get inventory item by ID
  static async getInventoryItemById(id: string, brandId: string) {
    try {
      const inventory = await prisma.inventory.findFirst({
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

      if (!inventory) {
        throw new Error("Inventory item not found");
      }

      return inventory;
    } catch (error) {
      throw error;
    }
  }

  // Update inventory item
  static async updateInventoryItem(
    id: string,
    brandId: string,
    data: UpdateInventoryDto
  ) {
    try {
      const inventory = await prisma.inventory.findFirst({
        where: { id, brandId },
      });

      if (!inventory) {
        throw new Error("Inventory item not found");
      }

      const updatedInventory = await prisma.inventory.update({
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

      return updatedInventory;
    } catch (error) {
      throw error;
    }
  }

  // Delete inventory item
  static async deleteInventoryItem(id: string, brandId: string) {
    try {
      const inventory = await prisma.inventory.findFirst({
        where: { id, brandId },
      });

      if (!inventory) {
        throw new Error("Inventory item not found");
      }

      await prisma.inventory.delete({
        where: { id },
      });

      return { message: "Inventory item deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Get inventory metrics
  static async getInventoryMetrics(brandId: string) {
    try {
      const [totalItems, totalValue, lowStockItems, outOfStockItems] =
        await Promise.all([
          // Total items
          prisma.inventory.count({
            where: { brandId },
          }),
          // Total value
          prisma.inventory.aggregate({
            where: { brandId },
            _sum: { sellingPrice: true },
          }),
          // Low stock items (current stock <= reorder level and > 0)
          prisma.inventory.count({
            where: {
              brandId,
              currentStock: {
                gt: 0,
              },
            },
          }),
          // Out of stock items
          prisma.inventory.count({
            where: {
              brandId,
              currentStock: 0,
            },
          }),
        ]);

      return {
        totalItems,
        totalValue: totalValue._sum.sellingPrice || 0,
        lowStockItems,
        outOfStockItems,
      };
    } catch (error) {
      throw error;
    }
  }
}
