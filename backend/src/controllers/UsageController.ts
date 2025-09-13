import { Request, Response } from "express";
import { UsageTrackingService } from "../services/UsageTrackingService";

export class UsageController {
  /**
   * Get usage for a specific resource type
   */
  async getUsage(req: Request, res: Response): Promise<void> {
    try {
      const { resourceType } = req.params;
      const userId = (req as any).user?.id;
      const brandId = req.query.brandId as string;

      if (!userId || !brandId) {
        res.status(400).json({
          success: false,
          message: "User ID and Brand ID are required",
        });
        return;
      }

      const usage = await UsageTrackingService.getUsage(
        userId,
        brandId,
        resourceType
      );

      res.json({
        success: true,
        data: usage,
      });
    } catch (error) {
      console.error("Error getting usage:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get usage data",
      });
    }
  }

  /**
   * Get all usage stats for a user/brand
   */
  async getAllUsage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const brandId = req.query.brandId as string;

      if (!userId || !brandId) {
        res.status(400).json({
          success: false,
          message: "User ID and Brand ID are required",
        });
        return;
      }

      const usage = await UsageTrackingService.getAllUsage(userId, brandId);

      res.json({
        success: true,
        data: usage,
      });
    } catch (error) {
      console.error("Error getting all usage:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get usage data",
      });
    }
  }

  /**
   * Check if user can add a resource
   */
  async checkResourceLimit(req: Request, res: Response): Promise<void> {
    try {
      const { resourceType } = req.params;
      const userId = (req as any).user?.id;
      const brandId = req.query.brandId as string;

      if (!userId || !brandId) {
        res.status(400).json({
          success: false,
          message: "User ID and Brand ID are required",
        });
        return;
      }

      const result = await UsageTrackingService.canAddResource(
        userId,
        brandId,
        resourceType
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error checking resource limit:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check resource limit",
      });
    }
  }

  /**
   * Sync usage with actual database counts
   */
  async syncUsage(req: Request, res: Response): Promise<void> {
    try {
      const { resourceType } = req.params;
      const userId = (req as any).user?.id;
      const brandId = req.query.brandId as string;

      if (!userId || !brandId) {
        res.status(400).json({
          success: false,
          message: "User ID and Brand ID are required",
        });
        return;
      }

      await UsageTrackingService.syncUsage(userId, brandId, resourceType);

      res.json({
        success: true,
        message: "Usage synced successfully",
      });
    } catch (error) {
      console.error("Error syncing usage:", error);
      res.status(500).json({
        success: false,
        message: "Failed to sync usage",
      });
    }
  }
}
