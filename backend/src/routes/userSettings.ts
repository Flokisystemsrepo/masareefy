import { Router } from "express";
import { UserSettingsController } from "@/controllers/UserSettingsController";
import { authenticateToken } from "@/middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// User settings routes
router.get("/profile", UserSettingsController.getUserProfile);
router.put("/profile", UserSettingsController.updateUserProfile);
router.put("/password", UserSettingsController.changePassword);
router.put("/picture", UserSettingsController.updateProfilePicture);
router.delete("/account", UserSettingsController.deleteAccount);

export default router;
