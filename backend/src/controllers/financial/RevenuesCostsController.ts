import { Request, Response } from "express";
import { RevenuesCostsService } from "@/services/RevenuesCostsService";
import {
  CreateRevenueDto,
  UpdateRevenueDto,
  CreateCostDto,
  UpdateCostDto,
} from "@/types";

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class RevenuesCostsController {
  // ===== REVENUES =====

  // Create revenue
  static async createRevenue(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;
      const data: CreateRevenueDto = {
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

      const revenue = await RevenuesCostsService.createRevenue(data, createdBy);

      return res.status(201).json({
        success: true,
        message: "Revenue created successfully",
        data: revenue,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create revenue",
      });
    }
  }

  // Get all revenues
  static async getRevenues(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { search, page, limit, category, startDate, endDate } = req.query;

      const filters = {
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        category: category as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };

      const result = await RevenuesCostsService.getRevenues(brandId, filters);

      return res.status(200).json({
        success: true,
        message: "Revenues retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve revenues",
      });
    }
  }

  // Get revenue by ID
  static async getRevenueById(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const revenue = await RevenuesCostsService.getRevenueById(id, brandId);

      return res.status(200).json({
        success: true,
        message: "Revenue retrieved successfully",
        data: revenue,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Revenue not found",
      });
    }
  }

  // Update revenue
  static async updateRevenue(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;
      const data: UpdateRevenueDto = req.body;

      const revenue = await RevenuesCostsService.updateRevenue(
        id,
        brandId,
        data
      );

      return res.status(200).json({
        success: true,
        message: "Revenue updated successfully",
        data: revenue,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update revenue",
      });
    }
  }

  // Delete revenue
  static async deleteRevenue(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const result = await RevenuesCostsService.deleteRevenue(id, brandId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete revenue",
      });
    }
  }

  // ===== COSTS =====

  // Create cost
  static async createCost(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;
      const data: CreateCostDto = {
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

      const cost = await RevenuesCostsService.createCost(data, createdBy);

      return res.status(201).json({
        success: true,
        message: "Cost created successfully",
        data: cost,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create cost",
      });
    }
  }

  // Get all costs
  static async getCosts(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { search, page, limit, category, costType, startDate, endDate } =
        req.query;

      const filters = {
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        category: category as string,
        costType: costType as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };

      const result = await RevenuesCostsService.getCosts(brandId, filters);

      return res.status(200).json({
        success: true,
        message: "Costs retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve costs",
      });
    }
  }

  // Get cost by ID
  static async getCostById(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const cost = await RevenuesCostsService.getCostById(id, brandId);

      return res.status(200).json({
        success: true,
        message: "Cost retrieved successfully",
        data: cost,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Cost not found",
      });
    }
  }

  // Update cost
  static async updateCost(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;
      const data: UpdateCostDto = req.body;

      const cost = await RevenuesCostsService.updateCost(id, brandId, data);

      return res.status(200).json({
        success: true,
        message: "Cost updated successfully",
        data: cost,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update cost",
      });
    }
  }

  // Delete cost
  static async deleteCost(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const result = await RevenuesCostsService.deleteCost(id, brandId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete cost",
      });
    }
  }

  // ===== METRICS =====

  // Get revenue metrics
  static async getRevenueMetrics(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { dateRange } = req.query;

      const metrics = await RevenuesCostsService.getRevenueMetrics(
        brandId,
        dateRange as string
      );

      return res.status(200).json({
        success: true,
        message: "Revenue metrics retrieved successfully",
        data: metrics,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve revenue metrics",
      });
    }
  }

  // Get cost metrics
  static async getCostMetrics(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { dateRange } = req.query;

      const metrics = await RevenuesCostsService.getCostMetrics(
        brandId,
        dateRange as string
      );

      return res.status(200).json({
        success: true,
        message: "Cost metrics retrieved successfully",
        data: metrics,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve cost metrics",
      });
    }
  }
}
