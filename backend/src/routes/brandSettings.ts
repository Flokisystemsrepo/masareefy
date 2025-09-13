import { Router } from "express";
import { BrandSettingsController } from "@/controllers/BrandSettingsController";
import { authenticateToken } from "@/middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Brand settings routes
router.get(
  "/brands/:brandId/settings",
  BrandSettingsController.getBrandSettings
);
router.put(
  "/brands/:brandId/settings",
  BrandSettingsController.updateBrandSettings
);
router.put("/brands/:brandId/logo", BrandSettingsController.updateBrandLogo);
router.post(
  "/brands/:brandId/settings/reset",
  BrandSettingsController.resetBrandSettings
);

export default router;
