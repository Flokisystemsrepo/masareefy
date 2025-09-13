import { PrismaClient } from "@prisma/client";
import {
  CreateWalletDto,
  UpdateWalletDto,
  CreateWalletTransactionDto,
} from "../types";
import { UsageTrackingService } from "./UsageTrackingService";

const prisma = new PrismaClient();

export class WalletService {
  // Wallet CRUD operations
  static async createWallet(
    brandId: string,
    userId: string,
    data: CreateWalletDto
  ) {
    console.log("Wallet Service - Creating wallet:", { brandId, userId, data });

    const wallet = await prisma.wallet.create({
      data: {
        brandId,
        createdBy: userId,
        name: data.name,
        balance: data.balance,
        type: data.type,
        currency: data.currency,
        color: data.color,
      },
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
    });

    console.log("Wallet Service - Wallet created successfully:", wallet);

    // Update usage tracking
    try {
      await UsageTrackingService.updateUsage(userId, brandId, "wallets", 1);
      console.log("Wallet Service - Usage tracking updated for wallets");
    } catch (error) {
      console.error("Wallet Service - Failed to update usage tracking:", error);
      // Don't fail the wallet creation if usage tracking fails
    }

    return wallet;
  }

  static async getWallets(brandId: string) {
    return await prisma.wallet.findMany({
      where: { brandId },
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
    });
  }

  static async getWalletById(brandId: string, walletId: string) {
    return await prisma.wallet.findFirst({
      where: { id: walletId, brandId },
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
    });
  }

  static async updateWallet(
    brandId: string,
    walletId: string,
    data: UpdateWalletDto
  ) {
    return await prisma.wallet.update({
      where: { id: walletId, brandId },
      data: {
        name: data.name,
        balance: data.balance,
        type: data.type,
        currency: data.currency,
        color: data.color,
      },
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
    });
  }

  static async deleteWallet(brandId: string, walletId: string, userId: string) {
    const deletedWallet = await prisma.wallet.delete({
      where: { id: walletId, brandId },
    });

    // Update usage tracking
    try {
      await UsageTrackingService.decreaseUsage(userId, brandId, "wallets", 1);
      console.log(
        "Wallet Service - Usage tracking updated for wallet deletion"
      );
    } catch (error) {
      console.error(
        "Wallet Service - Failed to update usage tracking on deletion:",
        error
      );
      // Don't fail the wallet deletion if usage tracking fails
    }

    return deletedWallet;
  }

  // Wallet Transaction operations
  static async createWalletTransaction(
    brandId: string,
    userId: string,
    data: CreateWalletTransactionDto
  ) {
    console.log("WalletService - Creating transaction:", {
      brandId,
      userId,
      data,
    });

    // Validate wallet IDs based on transaction type
    if (
      data.type === "credit" &&
      (!data.toWalletId || data.toWalletId.trim() === "")
    ) {
      throw new Error("Credit transactions require a valid toWalletId");
    }
    if (
      data.type === "debit" &&
      (!data.fromWalletId || data.fromWalletId.trim() === "")
    ) {
      throw new Error("Debit transactions require a valid fromWalletId");
    }
    if (
      data.type === "transfer" &&
      (!data.fromWalletId ||
        data.fromWalletId.trim() === "" ||
        !data.toWalletId ||
        data.toWalletId.trim() === "")
    ) {
      throw new Error(
        "Transfer transactions require valid fromWalletId and toWalletId"
      );
    }

    const transaction = await prisma.$transaction(async (tx) => {
      // Create the transaction
      const newTransaction = await tx.walletTransaction.create({
        data: {
          brandId,
          createdBy: userId,
          type: data.type,
          fromWalletId: data.fromWalletId,
          toWalletId: data.toWalletId,
          amount: data.amount,
          description: data.description,
          date: new Date(data.date),
          category: data.category,
          countAsRevenue: data.countAsRevenue || false,
          countAsCost: data.countAsCost || false,
        },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          fromWallet: {
            select: {
              id: true,
              name: true,
              balance: true,
            },
          },
          toWallet: {
            select: {
              id: true,
              name: true,
              balance: true,
            },
          },
        },
      });

      // Update wallet balances
      if (data.type === "transfer") {
        if (data.fromWalletId && data.toWalletId) {
          await tx.wallet.update({
            where: { id: data.fromWalletId },
            data: { balance: { decrement: data.amount } },
          });
          await tx.wallet.update({
            where: { id: data.toWalletId },
            data: { balance: { increment: data.amount } },
          });
        }
      } else if (data.type === "credit" && data.toWalletId) {
        await tx.wallet.update({
          where: { id: data.toWalletId },
          data: { balance: { increment: data.amount } },
        });
      } else if (data.type === "debit" && data.fromWalletId) {
        await tx.wallet.update({
          where: { id: data.fromWalletId },
          data: { balance: { decrement: data.amount } },
        });
      }

      return newTransaction;
    });

    console.log(
      "WalletService - Transaction created successfully:",
      transaction
    );
    return transaction;
  }

  static async getWalletTransactions(
    brandId: string,
    filters?: {
      walletId?: string;
      type?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const where: any = { brandId };

    if (filters?.walletId) {
      where.OR = [
        { fromWalletId: filters.walletId },
        { toWalletId: filters.walletId },
      ];
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where.OR = [
        { description: { contains: filters.search, mode: "insensitive" } },
        {
          fromWallet: {
            name: { contains: filters.search, mode: "insensitive" },
          },
        },
        {
          toWallet: { name: { contains: filters.search, mode: "insensitive" } },
        },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
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
          fromWallet: {
            select: {
              id: true,
              name: true,
            },
          },
          toWallet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getWalletTransactionById(
    brandId: string,
    transactionId: string
  ) {
    return await prisma.walletTransaction.findFirst({
      where: { id: transactionId, brandId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        fromWallet: {
          select: {
            id: true,
            name: true,
            balance: true,
          },
        },
        toWallet: {
          select: {
            id: true,
            name: true,
            balance: true,
          },
        },
      },
    });
  }

  static async getWalletMetrics(brandId: string) {
    const [totalWallets, totalBalance, totalTransactions] = await Promise.all([
      prisma.wallet.count({ where: { brandId } }),
      prisma.wallet.aggregate({
        where: { brandId },
        _sum: { balance: true },
      }),
      prisma.walletTransaction.count({ where: { brandId } }),
    ]);

    return {
      totalWallets,
      totalBalance: totalBalance._sum.balance || 0,
      totalTransactions,
    };
  }

  // Get all transactions for all wallets
  static async getAllTransactions(
    brandId: string,
    filters?: {
      type?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    console.log(
      "WalletService - Getting all transactions for brand:",
      brandId,
      "with filters:",
      filters
    );
    const where: any = { brandId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where.OR = [
        { description: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
        {
          fromWallet: {
            name: { contains: filters.search, mode: "insensitive" },
          },
        },
        {
          toWallet: { name: { contains: filters.search, mode: "insensitive" } },
        },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
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
          fromWallet: {
            select: {
              id: true,
              name: true,
            },
          },
          toWallet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    console.log(
      "WalletService - Found transactions:",
      transactions.length,
      "total:",
      total
    );

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Update transaction
  static async updateTransaction(
    brandId: string,
    transactionId: string,
    data: {
      description?: string;
      category?: string;
      status?: "completed" | "pending" | "failed";
    }
  ) {
    return await prisma.walletTransaction.update({
      where: { id: transactionId, brandId },
      data: {
        description: data.description,
        category: data.category,
        status: data.status,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        fromWallet: {
          select: {
            id: true,
            name: true,
            balance: true,
          },
        },
        toWallet: {
          select: {
            id: true,
            name: true,
            balance: true,
          },
        },
      },
    });
  }

  // Delete transaction
  static async deleteTransaction(brandId: string, transactionId: string) {
    return await prisma.walletTransaction.delete({
      where: { id: transactionId, brandId },
    });
  }
}
