import { Request, Response } from "express";
import { ReceivablesPayablesService } from "@/services/ReceivablesPayablesService";
import {
  CreateReceivableDto,
  UpdateReceivableDto,
  CreatePayableDto,
  UpdatePayableDto,
} from "@/types";

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    userId?: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export class ReceivablesPayablesController {
  // ===== RECEIVABLES =====

  // Create receivable
  static async createReceivable(req: AuthenticatedRequest, res: Response) {
    try {
      console.log("ReceivablesPayablesController - createReceivable called");
      console.log("Request body:", req.body);
      console.log("Request params:", req.params);
      console.log("User:", req.user);

      const { brandId } = req.params;
      const data: CreateReceivableDto = {
        ...req.body,
        brandId,
      };
      const createdBy = req.user?.id || req.user?.userId;

      console.log("Processed data:", data);
      console.log("Created by:", createdBy);

      if (!createdBy) {
        console.log("No user found, returning 401");
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const receivable = await ReceivablesPayablesService.createReceivable(
        data,
        createdBy
      );

      console.log("Receivable created successfully:", receivable);

      return res.status(201).json({
        success: true,
        message: "Receivable created successfully",
        data: receivable,
      });
    } catch (error: any) {
      console.error("Error in createReceivable:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create receivable",
      });
    }
  }

  // Get all receivables
  static async getReceivables(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { status, search, startDate, endDate, page, limit } = req.query;

      const filters = {
        status: status as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await ReceivablesPayablesService.getReceivables(
        brandId,
        filters
      );

      return res.status(200).json({
        success: true,
        message: "Receivables retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve receivables",
      });
    }
  }

  // Get receivable by ID
  static async getReceivableById(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const receivable = await ReceivablesPayablesService.getReceivableById(
        id,
        brandId
      );

      return res.status(200).json({
        success: true,
        message: "Receivable retrieved successfully",
        data: receivable,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Receivable not found",
      });
    }
  }

  // Update receivable
  static async updateReceivable(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;
      const data: UpdateReceivableDto = req.body;

      const receivable = await ReceivablesPayablesService.updateReceivable(
        id,
        brandId,
        data
      );

      return res.status(200).json({
        success: true,
        message: "Receivable updated successfully",
        data: receivable,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update receivable",
      });
    }
  }

  // Delete receivable
  static async deleteReceivable(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const result = await ReceivablesPayablesService.deleteReceivable(
        id,
        brandId
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete receivable",
      });
    }
  }

  // ===== PAYABLES =====

  // Create payable
  static async createPayable(req: AuthenticatedRequest, res: Response) {
    try {
      console.log("ReceivablesPayablesController - createPayable called");
      console.log("Request body:", req.body);
      console.log("Request params:", req.params);
      console.log("User:", req.user);

      const { brandId } = req.params;
      const data: CreatePayableDto = {
        ...req.body,
        brandId,
      };
      const createdBy = req.user?.id || req.user?.userId;

      console.log("Processed data:", data);
      console.log("Created by:", createdBy);

      if (!createdBy) {
        console.log("No user found, returning 401");
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const payable = await ReceivablesPayablesService.createPayable(
        data,
        createdBy
      );

      console.log("Payable created successfully:", payable);

      return res.status(201).json({
        success: true,
        message: "Payable created successfully",
        data: payable,
      });
    } catch (error: any) {
      console.error("Error in createPayable:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create payable",
      });
    }
  }

  // Get all payables
  static async getPayables(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { status, search, startDate, endDate, page, limit } = req.query;

      const filters = {
        status: status as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await ReceivablesPayablesService.getPayables(
        brandId,
        filters
      );

      return res.status(200).json({
        success: true,
        message: "Payables retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve payables",
      });
    }
  }

  // Get payable by ID
  static async getPayableById(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const payable = await ReceivablesPayablesService.getPayableById(
        id,
        brandId
      );

      return res.status(200).json({
        success: true,
        message: "Payable retrieved successfully",
        data: payable,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Payable not found",
      });
    }
  }

  // Update payable
  static async updatePayable(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;
      const data: UpdatePayableDto = req.body;

      const payable = await ReceivablesPayablesService.updatePayable(
        id,
        brandId,
        data
      );

      return res.status(200).json({
        success: true,
        message: "Payable updated successfully",
        data: payable,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update payable",
      });
    }
  }

  // Delete payable
  static async deletePayable(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const result = await ReceivablesPayablesService.deletePayable(
        id,
        brandId
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete payable",
      });
    }
  }

  // ===== FINANCIAL METRICS =====

  // Get financial metrics
  static async getFinancialMetrics(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { dateRange } = req.query;

      const metrics = await ReceivablesPayablesService.getFinancialMetrics(
        brandId,
        dateRange as string
      );

      return res.status(200).json({
        success: true,
        message: "Financial metrics retrieved successfully",
        data: metrics,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve financial metrics",
      });
    }
  }

  // Update statuses (admin only)
  static async updateStatuses(req: Request, res: Response) {
    try {
      const result = await ReceivablesPayablesService.updateStatuses();

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update statuses",
      });
    }
  }

  // Process due receivables and payables (admin only)
  static async processDueItems(req: Request, res: Response) {
    try {
      const result = await ReceivablesPayablesService.processDueItems();

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to process due items",
      });
    }
  }
}
