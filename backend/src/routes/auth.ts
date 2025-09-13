import { Router } from "express";
import { AuthController } from "@/controllers/auth/AuthController";
import { MultiStepRegistrationController } from "@/controllers/auth/MultiStepRegistrationController";
import { authenticateToken } from "@/middleware/auth";

const router = Router();

// Public routes
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.get("/verify-email/:token", AuthController.verifyEmail);
router.get("/health", AuthController.healthCheck);

// Multi-step registration routes (replaces old /register endpoint)
router.post(
  "/register/step1-plan",
  MultiStepRegistrationController.validatePlanSelection
);
router.post(
  "/register/step2-user",
  MultiStepRegistrationController.validateUserDetails
);
router.post(
  "/register/step3-brand",
  MultiStepRegistrationController.validateBrandDetails
);
router.post(
  "/register/step4-complete",
  MultiStepRegistrationController.completeRegistration
);
router.post(
  "/register/process-payment/:subscriptionId",
  MultiStepRegistrationController.processPayment
);

// Google OAuth routes
router.post("/google/signup", MultiStepRegistrationController.googleSignUp);
router.post("/google/login", AuthController.googleLogin);

// Protected routes
router.get("/profile", authenticateToken, AuthController.getProfile);
router.put("/profile", authenticateToken, AuthController.updateProfile);
router.put(
  "/change-password",
  authenticateToken,
  AuthController.changePassword
);
router.post("/logout", authenticateToken, AuthController.logout);

export default router;
