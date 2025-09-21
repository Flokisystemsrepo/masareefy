import { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/database";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    brandId: string;
  };
}

export interface SubscriptionRequest extends AuthenticatedRequest {
  subscription?: {
    id: string;
    status: string;
    plan: {
      id: string;
      name: string;
      features: any;
    };
    currentPeriodEnd?: Date | null;
    trialEnd?: Date | null;
  };
}

// Check if user has an active subscription
export const checkSubscription = async (
  req: SubscriptionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Get user's current subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["active", "trialing"] },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // If no subscription, create a free plan subscription
    if (!subscription) {
      const freePlan = await prisma.plan.findFirst({
        where: { name: "Free" },
      });

      if (freePlan) {
        const freeSubscription = await prisma.subscription.create({
          data: {
            userId: req.user.id,
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
        req.subscription = freeSubscription;
      }
    } else {
      // Check if subscription has expired
      const now = new Date();
      const isExpired =
        subscription.currentPeriodEnd && subscription.currentPeriodEnd < now;
      const isTrialExpired =
        subscription.trialEnd && subscription.trialEnd < now;

      if (isExpired || (subscription.status === "trialing" && isTrialExpired)) {
        // Downgrade to free plan
        const freePlan = await prisma.plan.findFirst({
          where: { name: "Free" },
        });

        if (freePlan) {
          // Update existing subscription to free plan
          const updatedSubscription = await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              planId: freePlan.id,
              status: "active",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(
                Date.now() + 365 * 24 * 60 * 60 * 1000
              ), // 1 year
              paymentMethod: "free",
            },
            include: {
              plan: true,
            },
          });
          req.subscription = updatedSubscription;
        }
      } else {
        req.subscription = subscription;
      }
    }

    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    next();
  }
  return;
};

// Check if user has access to a specific feature
export const checkFeatureAccess = (featureName: string) => {
  return async (
    req: SubscriptionRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.subscription) {
        return res.status(403).json({
          success: false,
          error: "Subscription required",
        });
      }

      const { plan } = req.subscription;

      // Free plan has limited access
      if (plan.name === "Free") {
        const allowedFeatures = ["dashboard", "revenue", "cost"];
        const isAllowed = allowedFeatures.some((feature) =>
          featureName.toLowerCase().includes(feature)
        );

        if (!isAllowed) {
          return res.status(403).json({
            success: false,
            error: `Feature "${featureName}" requires a paid subscription`,
            lockedFeature: featureName,
            currentPlan: plan.name,
          });
        }
      }

      next();
    } catch (error) {
      console.error("Feature access check error:", error);
      next();
    }
    return;
  };
};

// Get subscription info for frontend
export const getSubscriptionInfo = async (
  req: SubscriptionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      console.log("getSubscriptionInfo: No user found");
      next();
      return;
    }

    // Get user's current subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["active", "trialing"] },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // If no subscription, create a free plan subscription
    if (!subscription) {
      const freePlan = await prisma.plan.findFirst({
        where: { name: "Free" },
      });

      if (freePlan) {
        const freeSubscription = await prisma.subscription.create({
          data: {
            userId: req.user.id,
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
        req.subscription = freeSubscription;
      }
    } else {
      // Check if subscription has expired
      const now = new Date();
      const isExpired =
        subscription.currentPeriodEnd && subscription.currentPeriodEnd < now;
      const isTrialExpired =
        subscription.trialEnd && subscription.trialEnd < now;

      if (isExpired || (subscription.status === "trialing" && isTrialExpired)) {
        // Downgrade to free plan
        const freePlan = await prisma.plan.findFirst({
          where: { name: "Free" },
        });

        if (freePlan) {
          // Update existing subscription to free plan
          const updatedSubscription = await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              planId: freePlan.id,
              status: "active",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(
                Date.now() + 365 * 24 * 60 * 60 * 1000
              ), // 1 year
              paymentMethod: "free",
            },
            include: {
              plan: true,
            },
          });
          req.subscription = updatedSubscription;
        }
      } else {
        req.subscription = subscription;
      }
    }

    if (!req.subscription) {
      console.log("getSubscriptionInfo: No subscription found or created");
      next();
      return;
    }

    const { plan } = req.subscription;

    // Check if subscription is expired or will expire soon
    const now = new Date();
    const isExpired =
      req.subscription.currentPeriodEnd &&
      req.subscription.currentPeriodEnd < now;
    const isExpiringSoon =
      req.subscription.currentPeriodEnd &&
      req.subscription.currentPeriodEnd > now &&
      req.subscription.currentPeriodEnd <
        new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const subscriptionInfo = {
      id: req.subscription.id,
      status: req.subscription.status,
      plan: {
        id: plan.id,
        name: plan.name,
        features: plan.features,
      },
      currentPeriodEnd: req.subscription.currentPeriodEnd,
      trialEnd: req.subscription.trialEnd,
      isExpired,
      isExpiringSoon,
      isFreePlan: plan.name === "Free",
    };

    console.log("Subscription Info for user", req.user.id, ":", {
      planName: plan.name,
      isFreePlan: plan.name === "Free",
      status: req.subscription.status,
    });

    req.subscription = { ...req.subscription, ...subscriptionInfo };
    next();
  } catch (error) {
    console.error("Subscription info error:", error);
    next();
  }
  return;
};
