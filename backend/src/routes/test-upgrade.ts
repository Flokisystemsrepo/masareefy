import { Router } from "express";
import { TestUpgradeController } from "../controllers/subscription/TestUpgradeController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Test upgrade routes (development/testing only)
router.post(
  "/upgrade-to-growth",
  authenticateToken,
  TestUpgradeController.upgradeToGrowth
);
router.post(
  "/upgrade-to-scale",
  authenticateToken,
  TestUpgradeController.upgradeToScale
);
router.post(
  "/reset-to-free",
  authenticateToken,
  TestUpgradeController.resetToFree
);

export default router;


