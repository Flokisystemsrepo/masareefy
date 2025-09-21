import { Router } from "express";
import { SubscriptionController } from "@/controllers/subscription/SubscriptionController";
import { authenticateToken } from "@/middleware/auth";
import { getSubscriptionInfo } from "@/middleware/subscription";

const router = Router();

// Public routes (no authentication required)
router.get("/plans", SubscriptionController.getPlans);
router.get("/plans/:planId", SubscriptionController.getPlanById);

// Protected routes (authentication required)
router.post(
  "/subscribe",
  authenticateToken,
  SubscriptionController.createSubscription
);
router.get(
  "/my-subscription",
  authenticateToken,
  getSubscriptionInfo,
  SubscriptionController.getUserSubscription
);
router.put(
  "/subscriptions/:subscriptionId",
  authenticateToken,
  SubscriptionController.updateSubscription
);
router.post(
  "/subscriptions/:subscriptionId/cancel",
  authenticateToken,
  SubscriptionController.cancelSubscription
);
router.post(
  "/subscriptions/:subscriptionId/process-payment",
  authenticateToken,
  SubscriptionController.processMockPayment
);
router.get(
  "/subscriptions/:subscriptionId/invoices",
  authenticateToken,
  SubscriptionController.getSubscriptionInvoices
);
router.get(
  "/trial-status",
  authenticateToken,
  SubscriptionController.checkTrialStatus
);

export default router;
