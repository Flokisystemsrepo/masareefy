import { Request, Response } from "express";
import { SubscriptionService } from "@/services/SubscriptionService";
import {
  AuthenticatedRequest,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from "@/types";
import { SubscriptionRequest } from "@/middleware/subscription";
import Joi from "joi";

// Validation schemas
const createSubscriptionSchema = Joi.object({
  planId: Joi.string().required(),
  paymentMethod: Joi.string().valid("mock", "stripe").default("mock"),
  trialDays: Joi.number().min(0).max(30).optional(),
});

const updateSubscriptionSchema = Joi.object({
  planId: Joi.string().optional(),
  status: Joi.string()
    .valid("active", "cancelled", "past_due", "unpaid", "trialing")
    .optional(),
  cancelAtPeriodEnd: Joi.boolean().optional(),
  currentPeriodStart: Joi.string().optional(),
  currentPeriodEnd: Joi.string().optional(),
  paymentMethod: Joi.string().optional(),
  isTrialActive: Joi.boolean().optional(),
  trialDays: Joi.number().optional(),
  trialStart: Joi.string().optional(),
  trialEnd: Joi.string().optional(),
});

const cancelSubscriptionSchema = Joi.object({
  cancelAtPeriodEnd: Joi.boolean().default(true),
});

export class SubscriptionController {
  // Get all available plans
  static async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await SubscriptionService.getPlans();

      res.status(200).json({
        success: true,
        data: plans,
        message: "Plans fetched successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch plans",
      });
    }
  }

  // Get plan by ID
  static async getPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const plan = await SubscriptionService.getPlanById(planId);

      res.status(200).json({
        success: true,
        data: plan,
        message: "Plan fetched successfully",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : "Plan not found",
      });
    }
  }

  // Create subscription
  static async createSubscription(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      // Validate request body
      const { error, value } = createSubscriptionSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const subscription = await SubscriptionService.createSubscription(
        req.user.id,
        value
      );

      res.status(201).json({
        success: true,
        data: subscription,
        message: "Subscription created successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create subscription",
      });
    }
  }

  // Get user's current subscription
  static async getUserSubscription(
    req: SubscriptionRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      // Use subscription data from middleware (includes isFreePlan, isExpired, etc.)
      const subscription = req.subscription;

      res.status(200).json({
        success: true,
        data: subscription,
        message: subscription
          ? "Subscription fetched successfully"
          : "No active subscription found",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch subscription",
      });
    }
  }

  // Update subscription
  static async updateSubscription(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const { subscriptionId } = req.params;

      // Log the incoming request
      console.log("📝 Subscription update request:", {
        subscriptionId,
        body: req.body,
        user: req.user?.id
      });

      // Validate request body
      const { error, value } = updateSubscriptionSchema.validate(req.body);
      if (error) {
        console.error("❌ Validation error:", error.details[0].message);
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      console.log("✅ Validated data:", value);

      const subscription = await SubscriptionService.updateSubscription(
        subscriptionId,
        value
      );

      res.status(200).json({
        success: true,
        data: subscription,
        message: "Subscription updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update subscription",
      });
    }
  }

  // Cancel subscription
  static async cancelSubscription(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const { subscriptionId } = req.params;

      // Validate request body
      const { error, value } = cancelSubscriptionSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const subscription = await SubscriptionService.cancelSubscription(
        subscriptionId,
        value.cancelAtPeriodEnd
      );

      res.status(200).json({
        success: true,
        data: subscription,
        message: "Subscription cancelled successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel subscription",
      });
    }
  }

  // Process mock payment
  static async processMockPayment(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const { subscriptionId } = req.params;

      const subscription = await SubscriptionService.processMockPayment(
        subscriptionId
      );

      res.status(200).json({
        success: true,
        data: subscription,
        message: "Payment processed successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process payment",
      });
    }
  }

  // Get subscription invoices
  static async getSubscriptionInvoices(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const { subscriptionId } = req.params;

      const invoices = await SubscriptionService.getSubscriptionInvoices(
        subscriptionId
      );

      res.status(200).json({
        success: true,
        data: invoices,
        message: "Invoices fetched successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch invoices",
      });
    }
  }

  // Check trial status
  static async checkTrialStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const trialStatus = await SubscriptionService.checkTrialStatus(
        req.user.id
      );

      res.status(200).json({
        success: true,
        data: trialStatus,
        message: "Trial status checked successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check trial status",
      });
    }
  }
}
