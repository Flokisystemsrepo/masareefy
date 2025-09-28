import { Request, Response, NextFunction } from "express";
import { TrialService } from "@/services/TrialService";
import { AuthenticatedRequest } from "@/types";

export interface TrialStatus {
  subscription: any;
  isTrialActive: boolean | null;
  daysRemaining: number;
  trialEnd: Date | null;
  plan: any;
}

export interface TrialRequest extends AuthenticatedRequest {
  trialStatus?: TrialStatus;
}

// Middleware to check trial status and add to request
export const checkTrialStatus = async (
  req: TrialRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const trialStatus = await TrialService.getUserTrialStatus(req.user.id);

    // If user has an expired trial, automatically downgrade them
    if (
      trialStatus &&
      trialStatus.isTrialActive &&
      trialStatus.daysRemaining <= 0
    ) {
      console.log(
        `Trial expired for user ${req.user.id}, downgrading to Free plan`
      );
      await TrialService.handleTrialExpiration(trialStatus.subscription.id);

      // Refresh trial status after downgrade
      const updatedTrialStatus = await TrialService.getUserTrialStatus(
        req.user.id
      );
      req.trialStatus = updatedTrialStatus || undefined;
    } else {
      req.trialStatus = trialStatus || undefined;
    }

    next();
  } catch (error) {
    console.error("Error checking trial status:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
    return;
  }
};

// Middleware to enforce trial restrictions for premium features
export const requireActiveSubscription = (
  req: TrialRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.trialStatus) {
      res
        .status(500)
        .json({ success: false, error: "Trial status not available" });
      return;
    }

    const { subscription, isTrialActive } = req.trialStatus;

    // Allow access if:
    // 1. User has an active paid subscription (not in trial)
    // 2. User is on free plan (no trial restrictions)
    // 3. User is in active trial
    const hasAccess =
      (subscription.status === "active" && !isTrialActive) || // Active paid subscription
      subscription.plan.name === "Free" || // Free plan
      isTrialActive; // Active trial

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        error: "Subscription required",
        message:
          "This feature requires an active subscription. Please upgrade your plan.",
        trialStatus: req.trialStatus,
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error checking subscription requirement:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
    return;
  }
};

// Middleware to check if user is in trial and show trial-specific messages
export const checkTrialExpiration = (
  req: TrialRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.trialStatus) {
      next();
      return;
    }

    const { isTrialActive, daysRemaining, trialEnd } = req.trialStatus;

    // Add trial information to response headers for frontend
    if (isTrialActive) {
      res.setHeader("X-Trial-Active", "true");
      res.setHeader("X-Trial-Days-Remaining", daysRemaining.toString());
      if (trialEnd) {
        res.setHeader("X-Trial-End", trialEnd.toISOString());
      }
    }

    next();
  } catch (error) {
    console.error("Error checking trial expiration:", error);
    next(); // Continue even if there's an error
  }
};
