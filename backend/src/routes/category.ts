import { Router } from "express";
import { CategoryController } from "@/controllers/CategoryController";
import { authenticateToken } from "@/middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Category routes
router.post("/brands/:brandId/categories", CategoryController.createCategory);
router.get("/brands/:brandId/categories", CategoryController.getCategories);
router.get(
  "/brands/:brandId/categories/used",
  CategoryController.getUsedCategories
);
router.get(
  "/brands/:brandId/categories/:id",
  CategoryController.getCategoryById
);
router.put(
  "/brands/:brandId/categories/:id",
  CategoryController.updateCategory
);
router.delete(
  "/brands/:brandId/categories/:id",
  CategoryController.deleteCategory
);

export default router;
