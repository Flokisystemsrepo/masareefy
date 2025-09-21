import { Router } from "express";
import { TrialController } from "@/controllers/TrialController";
import { authenticateToken } from "@/middleware/auth";
import { adminAuth, requireRole } from "@/middleware/adminAuth";
import { checkTrialStatus } from "@/middleware/trialCheck";

const router = Router();

// User trial endpoints
router.get(
  "/status",
  authenticateToken,
  checkTrialStatus,
  TrialController.getTrialStatus
);
router.get(
  "/notifications",
  authenticateToken,
  TrialController.getTrialNotifications
);
router.patch(
  "/notifications/:notificationId/read",
  authenticateToken,
  TrialController.markNotificationAsRead
);

// Admin trial endpoints
router.post(
  "/check-expirations",
  adminAuth,
  requireRole(["admin"]),
  TrialController.checkAllTrialExpirations
);
router.post(
  "/extend",
  adminAuth,
  requireRole(["admin"]),
  TrialController.extendTrial
);

export default router;
