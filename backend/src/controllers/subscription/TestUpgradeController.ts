import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../../middleware/auth";

const prisma = new PrismaClient();

export class TestUpgradeController {
  // Test upgrade to Growth plan
  static async upgradeToGrowth(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Find the Growth plan
      const growthPlan = await prisma.plan.findFirst({
        where: { name: "Growth" },
      });

      if (!growthPlan) {
        return res.status(404).json({
          success: false,
          error: "Growth plan not found",
        });
      }

      // Find existing subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: userId },
      });

      let subscription;
      if (existingSubscription) {
        // Update existing subscription
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planId: growthPlan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            paymentMethod: "test",
          },
          include: {
            plan: true,
          },
        });
      } else {
        // Create new subscription
        subscription = await prisma.subscription.create({
          data: {
            userId: userId,
            planId: growthPlan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            paymentMethod: "test",
          },
          include: {
            plan: true,
          },
        });
      }

      console.log(`✅ Test upgrade to Growth plan for user ${userId}`);

      return res.json({
        success: true,
        message: "Successfully upgraded to Growth plan",
        data: {
          id: subscription.id,
          status: subscription.status,
          plan: {
            id: subscription.plan.id,
            name: subscription.plan.name,
            features: subscription.plan.features,
          },
          currentPeriodEnd: subscription.currentPeriodEnd,
          isExpired: false,
          isExpiringSoon: false,
          isFreePlan: false,
        },
      });
    } catch (error) {
      console.error("Test upgrade to Growth error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to upgrade to Growth plan",
      });
    }
  }

  // Test upgrade to Scale plan
  static async upgradeToScale(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Find the Scale plan
      const scalePlan = await prisma.plan.findFirst({
        where: { name: "Scale" },
      });

      if (!scalePlan) {
        return res.status(404).json({
          success: false,
          error: "Scale plan not found",
        });
      }

      // Find existing subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: userId },
      });

      let subscription;
      if (existingSubscription) {
        // Update existing subscription
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planId: scalePlan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            paymentMethod: "test",
          },
          include: {
            plan: true,
          },
        });
      } else {
        // Create new subscription
        subscription = await prisma.subscription.create({
          data: {
            userId: userId,
            planId: scalePlan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            paymentMethod: "test",
          },
          include: {
            plan: true,
          },
        });
      }

      console.log(`✅ Test upgrade to Scale plan for user ${userId}`);

      return res.json({
        success: true,
        message: "Successfully upgraded to Scale plan",
        data: {
          id: subscription.id,
          status: subscription.status,
          plan: {
            id: subscription.plan.id,
            name: subscription.plan.name,
            features: subscription.plan.features,
          },
          currentPeriodEnd: subscription.currentPeriodEnd,
          isExpired: false,
          isExpiringSoon: false,
          isFreePlan: false,
        },
      });
    } catch (error) {
      console.error("Test upgrade to Scale error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to upgrade to Scale plan",
      });
    }
  }

  // Reset to Free plan
  static async resetToFree(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Find the Free plan
      const freePlan = await prisma.plan.findFirst({
        where: { name: "Free" },
      });

      if (!freePlan) {
        return res.status(404).json({
          success: false,
          error: "Free plan not found",
        });
      }

      // Find existing subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: userId },
      });

      let subscription;
      if (existingSubscription) {
        // Update existing subscription
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planId: freePlan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            paymentMethod: "free",
          },
          include: {
            plan: true,
          },
        });
      } else {
        // Create new subscription
        subscription = await prisma.subscription.create({
          data: {
            userId: userId,
            planId: freePlan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            paymentMethod: "free",
          },
          include: {
            plan: true,
          },
        });
      }

      console.log(`✅ Reset to Free plan for user ${userId}`);

      return res.json({
        success: true,
        message: "Successfully reset to Free plan",
        data: {
          id: subscription.id,
          status: subscription.status,
          plan: {
            id: subscription.plan.id,
            name: subscription.plan.name,
            features: subscription.plan.features,
          },
          currentPeriodEnd: subscription.currentPeriodEnd,
          isExpired: false,
          isExpiringSoon: false,
          isFreePlan: true,
        },
      });
    } catch (error) {
      console.error("Reset to Free error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to reset to Free plan",
      });
    }
  }
}
