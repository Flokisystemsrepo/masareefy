import { Request, Response } from "express";
import { TrialService } from "@/services/TrialService";
import { TrialRequest } from "@/middleware/trialCheck";

export class TrialController {
  // Get user's trial status
  static async getTrialStatus(req: TrialRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      const trialStatus = await TrialService.getUserTrialStatus(req.user.id);

      res.status(200).json({
        success: true,
        data: trialStatus,
      });
    } catch (error) {
      console.error("Error getting trial status:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get trial status",
      });
      return;
    }
  }

  // Get user's trial notifications
  static async getTrialNotifications(
    req: TrialRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      const notifications = await TrialService.getUserTrialNotifications(
        req.user.id
      );

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error("Error getting trial notifications:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get trial notifications",
      });
      return;
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(
    req: TrialRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      const { notificationId } = req.params;

      if (!notificationId) {
        res
          .status(400)
          .json({ success: false, error: "Notification ID is required" });
        return;
      }

      await TrialService.markNotificationAsRead(notificationId, req.user.id);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark notification as read",
      });
      return;
    }
  }

  // Admin endpoint to check all trial expirations
  static async checkAllTrialExpirations(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      await TrialService.checkTrialExpirations();

      res.status(200).json({
        success: true,
        message: "Trial expiration check completed",
      });
    } catch (error) {
      console.error("Error checking trial expirations:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check trial expirations",
      });
      return;
    }
  }

  // Admin endpoint to extend trial
  static async extendTrial(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId, additionalDays } = req.body;

      if (!subscriptionId || !additionalDays) {
        res.status(400).json({
          success: false,
          error: "Subscription ID and additional days are required",
        });
        return;
      }

      if (additionalDays <= 0) {
        res.status(400).json({
          success: false,
          error: "Additional days must be greater than 0",
        });
        return;
      }

      await TrialService.extendTrial(subscriptionId, additionalDays);

      res.status(200).json({
        success: true,
        message: `Trial extended by ${additionalDays} days`,
      });
    } catch (error) {
      console.error("Error extending trial:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to extend trial",
      });
      return;
    }
  }
}
