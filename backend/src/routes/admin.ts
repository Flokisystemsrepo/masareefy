import express from "express";
import { AdminAuthController } from "../controllers/admin/AuthController";
import { AdminController } from "../controllers/admin/AdminController";
import {
  adminAuth,
  requireRole,
  requirePermission,
} from "../middleware/adminAuth";

const router = express.Router();
const adminAuthController = new AdminAuthController();
const adminController = new AdminController();

// Admin Authentication Routes
router.post(
  "/admin/auth/login",
  adminAuthController.login.bind(adminAuthController)
);
router.post(
  "/admin/auth/logout",
  adminAuth,
  adminAuthController.logout.bind(adminAuthController)
);
router.get(
  "/admin/auth/profile",
  adminAuth,
  adminAuthController.getProfile.bind(adminAuthController)
);
router.get(
  "/admin/auth/verify",
  adminAuth,
  adminAuthController.verifyToken.bind(adminAuthController)
);

// Admin Dashboard Routes
router.get(
  "/admin/dashboard/overview",
  adminAuth,
  adminController.getOverview.bind(adminController)
);
router.get(
  "/admin/analytics",
  adminAuth,
  adminController.getAnalytics.bind(adminController)
);

// User Management Routes
router.get(
  "/admin/users",
  adminAuth,
  requirePermission("users.read"),
  adminController.getAllUsers.bind(adminController)
);
router.put(
  "/admin/users/:id",
  adminAuth,
  requirePermission("users.write"),
  adminController.updateUser.bind(adminController)
);
router.delete(
  "/admin/users/:id",
  adminAuth,
  requirePermission("users.delete"),
  adminController.deleteUser.bind(adminController)
);

// Brand management routes
router.put(
  "/admin/brands/:id",
  adminAuth,
  requirePermission("brands.write"),
  adminController.updateBrand.bind(adminController)
);
router.delete(
  "/admin/brands/:id",
  adminAuth,
  requirePermission("brands.delete"),
  adminController.deleteBrand.bind(adminController)
);

// Subscription management routes
router.put(
  "/admin/subscriptions/:id",
  adminAuth,
  requirePermission("subscriptions.write"),
  adminController.updateSubscription.bind(adminController)
);
router.delete(
  "/admin/subscriptions/:id",
  adminAuth,
  requirePermission("subscriptions.delete"),
  adminController.deleteSubscription.bind(adminController)
);

// Brand Management Routes
router.get(
  "/admin/brands",
  adminAuth,
  requirePermission("brands.read"),
  adminController.getAllBrands.bind(adminController)
);

// Subscription Management Routes
router.get(
  "/admin/subscriptions",
  adminAuth,
  requirePermission("subscriptions.read"),
  adminController.getAllSubscriptions.bind(adminController)
);

// System Health Routes
router.get(
  "/admin/system/health",
  adminAuth,
  requirePermission("system.read"),
  adminController.getSystemHealth.bind(adminController)
);

// Security Routes
router.get(
  "/admin/security/overview",
  adminAuth,
  requirePermission("security.read"),
  adminController.getSecurityOverview.bind(adminController)
);

export default router;
