import { Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { WalletService } from "../../services/WalletService";

export class WalletController {
  // Wallet CRUD operations
  static async createWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;
      const userId = req.user?.id;
      const { name, balance, type, currency, color } = req.body;

      console.log("Wallet Controller - Creating wallet:", {
        brandId,
        userId,
        body: req.body,
      });

      if (!userId) {
        console.log("Wallet Controller - No user ID found");
        return res.status(401).json({ error: "User not authenticated" });
      }

      const wallet = await WalletService.createWallet(brandId, userId, {
        name,
        balance,
        type,
        currency,
        color,
      });

      console.log("Wallet Controller - Wallet created:", wallet);

      return res.status(201).json({
        success: true,
        data: wallet,
        message: "Wallet created successfully",
      });
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to create wallet",
      });
    }
  }

  static async getWallets(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;

      const wallets = await WalletService.getWallets(brandId);

      return res.status(200).json({
        success: true,
        data: wallets,
        message: "Wallets retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error getting wallets:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get wallets",
      });
    }
  }

  static async getWalletById(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId, id } = req.params;

      const wallet = await WalletService.getWalletById(brandId, id);

      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: "Wallet not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: wallet,
        message: "Wallet retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error getting wallet:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get wallet",
      });
    }
  }

  static async updateWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId, id } = req.params;
      const { name, balance, type, currency, color } = req.body;

      const wallet = await WalletService.updateWallet(brandId, id, {
        name,
        balance,
        type,
        currency,
        color,
      });

      return res.status(200).json({
        success: true,
        data: wallet,
        message: "Wallet updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating wallet:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to update wallet",
      });
    }
  }

  static async deleteWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId, id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      await WalletService.deleteWallet(brandId, id, userId);

      return res.status(200).json({
        success: true,
        message: "Wallet deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting wallet:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to delete wallet",
      });
    }
  }

  // Wallet Transaction operations
  static async createWalletTransaction(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const { brandId } = req.params;
      const userId = req.user?.id;
      const {
        type,
        fromWalletId,
        toWalletId,
        amount,
        description,
        date,
        category,
        countAsRevenue,
        countAsCost,
      } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const transaction = await WalletService.createWalletTransaction(
        brandId,
        userId,
        {
          type,
          fromWalletId,
          toWalletId,
          amount,
          description,
          date: date || new Date().toISOString(),
          category,
          countAsRevenue,
          countAsCost,
        }
      );

      return res.status(201).json({
        success: true,
        data: transaction,
        message: "Transaction created successfully",
      });
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to create transaction",
      });
    }
  }

  static async getWalletTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId, walletId } = req.params;
      const { type, search, page, limit } = req.query;

      const filters = {
        walletId: walletId || undefined,
        type: (type as string) || undefined,
        search: (search as string) || undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await WalletService.getWalletTransactions(
        brandId,
        filters
      );

      return res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        message: "Transactions retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error getting transactions:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get transactions",
      });
    }
  }

  static async getWalletTransactionById(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const { brandId, transactionId } = req.params;

      const transaction = await WalletService.getWalletTransactionById(
        brandId,
        transactionId
      );

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: "Transaction not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: transaction,
        message: "Transaction retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error getting transaction:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get transaction",
      });
    }
  }

  static async getWalletMetrics(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;

      const metrics = await WalletService.getWalletMetrics(brandId);

      return res.status(200).json({
        success: true,
        data: metrics,
        message: "Wallet metrics retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error getting wallet metrics:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get wallet metrics",
      });
    }
  }

  // Get all transactions for all wallets
  static async getAllTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;
      const { type, search, page, limit } = req.query;

      const filters = {
        type: (type as string) || undefined,
        search: (search as string) || undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await WalletService.getAllTransactions(brandId, filters);

      return res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        message: "Transactions retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error getting all transactions:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to get transactions",
      });
    }
  }

  // Update transaction
  static async updateTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId, transactionId } = req.params;
      const { description, category, status } = req.body;

      const transaction = await WalletService.updateTransaction(
        brandId,
        transactionId,
        {
          description,
          category,
          status,
        }
      );

      return res.status(200).json({
        success: true,
        data: transaction,
        message: "Transaction updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to update transaction",
      });
    }
  }

  // Delete transaction
  static async deleteTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId, transactionId } = req.params;

      await WalletService.deleteTransaction(brandId, transactionId);

      return res.status(200).json({
        success: true,
        message: "Transaction deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to delete transaction",
      });
    }
  }
}
