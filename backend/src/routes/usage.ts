import { Router } from "express";
import { UsageController } from "../controllers/UsageController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const usageController = new UsageController();

// Get usage for a specific resource type
router.get(
  "/:resourceType",
  authenticateToken,
  usageController.getUsage.bind(usageController)
);

// Get all usage stats
router.get(
  "/",
  authenticateToken,
  usageController.getAllUsage.bind(usageController)
);

// Check if user can add a resource
router.get(
  "/:resourceType/check",
  authenticateToken,
  usageController.checkResourceLimit.bind(usageController)
);

// Sync usage with actual database counts
router.post(
  "/:resourceType/sync",
  authenticateToken,
  usageController.syncUsage.bind(usageController)
);

export default router;
