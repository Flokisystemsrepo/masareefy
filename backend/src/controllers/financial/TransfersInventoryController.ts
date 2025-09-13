import { Request, Response } from "express";
import { TransfersInventoryService } from "../../services/TransfersInventoryService";
import {
  CreateTransferDto,
  UpdateTransferDto,
  CreateInventoryDto,
  UpdateInventoryDto,
} from "../../types";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class TransfersInventoryController {
  // ===== TRANSFERS =====

  // Create transfer
  static async createTransfer(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;
      const data: CreateTransferDto = {
        ...req.body,
        brandId,
      };
      const createdBy = req.user?.id;

      if (!createdBy) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const transfer = await TransfersInventoryService.createTransfer(
        data,
        createdBy
      );

      return res.status(201).json({
        success: true,
        message: "Transfer created successfully",
        data: transfer,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create transfer",
      });
    }
  }

  // Get all transfers
  static async getTransfers(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { type, search, startDate, endDate, page, limit } = req.query;

      const filters = {
        type: type as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await TransfersInventoryService.getTransfers(
        brandId,
        filters
      );

      return res.status(200).json({
        success: true,
        message: "Transfers retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve transfers",
      });
    }
  }

  // Get transfer by ID
  static async getTransferById(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const transfer = await TransfersInventoryService.getTransferById(
        id,
        brandId
      );

      return res.status(200).json({
        success: true,
        message: "Transfer retrieved successfully",
        data: transfer,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Transfer not found",
      });
    }
  }

  // Update transfer
  static async updateTransfer(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;
      const data: UpdateTransferDto = req.body;

      const transfer = await TransfersInventoryService.updateTransfer(
        id,
        brandId,
        data
      );

      return res.status(200).json({
        success: true,
        message: "Transfer updated successfully",
        data: transfer,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update transfer",
      });
    }
  }

  // Delete transfer
  static async deleteTransfer(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const result = await TransfersInventoryService.deleteTransfer(
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
        message: error.message || "Failed to delete transfer",
      });
    }
  }

  // Get transfer metrics
  static async getTransferMetrics(req: Request, res: Response) {
    try {
      const { brandId } = req.params;

      const metrics = await TransfersInventoryService.getTransferMetrics(
        brandId
      );

      return res.status(200).json({
        success: true,
        message: "Transfer metrics retrieved successfully",
        data: metrics,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve transfer metrics",
      });
    }
  }

  // ===== INVENTORY =====

  // Create inventory item
  static async createInventoryItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;
      const data: CreateInventoryDto = {
        ...req.body,
        brandId,
      };
      const createdBy = req.user?.id;

      if (!createdBy) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const inventory = await TransfersInventoryService.createInventoryItem(
        data,
        createdBy
      );

      return res.status(201).json({
        success: true,
        message: "Inventory item created successfully",
        data: inventory,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create inventory item",
      });
    }
  }

  // Get all inventory items
  static async getInventoryItems(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const {
        search,
        category,
        supplier,
        location,
        startDate,
        endDate,
        page,
        limit,
      } = req.query;

      const filters = {
        search: search as string,
        category: category as string,
        supplier: supplier as string,
        location: location as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await TransfersInventoryService.getInventoryItems(
        brandId,
        filters
      );

      return res.status(200).json({
        success: true,
        message: "Inventory items retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve inventory items",
      });
    }
  }

  // Get inventory item by ID
  static async getInventoryItemById(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const inventory = await TransfersInventoryService.getInventoryItemById(
        id,
        brandId
      );

      return res.status(200).json({
        success: true,
        message: "Inventory item retrieved successfully",
        data: inventory,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Inventory item not found",
      });
    }
  }

  // Update inventory item
  static async updateInventoryItem(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;
      const data: UpdateInventoryDto = req.body;

      const inventory = await TransfersInventoryService.updateInventoryItem(
        id,
        brandId,
        data
      );

      return res.status(200).json({
        success: true,
        message: "Inventory item updated successfully",
        data: inventory,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update inventory item",
      });
    }
  }

  // Delete inventory item
  static async deleteInventoryItem(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const result = await TransfersInventoryService.deleteInventoryItem(
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
        message: error.message || "Failed to delete inventory item",
      });
    }
  }

  // Get inventory metrics
  static async getInventoryMetrics(req: Request, res: Response) {
    try {
      const { brandId } = req.params;

      const metrics = await TransfersInventoryService.getInventoryMetrics(
        brandId
      );

      return res.status(200).json({
        success: true,
        message: "Inventory metrics retrieved successfully",
        data: metrics,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve inventory metrics",
      });
    }
  }
}
