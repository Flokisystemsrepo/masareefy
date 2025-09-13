import { Request, Response } from "express";
import { CategoryService } from "@/services/CategoryService";

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class CategoryController {
  // Create category
  static async createCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId } = req.params;
      const { name, color, type } = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const category = await CategoryService.createCategory({
        brandId,
        name,
        color,
        type,
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create category",
      });
    }
  }

  // Get all categories for a brand
  static async getCategories(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { type } = req.query;

      const categories = await CategoryService.getCategories(
        brandId,
        type as string
      );

      return res.status(200).json({
        success: true,
        message: "Categories retrieved successfully",
        data: categories,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve categories",
      });
    }
  }

  // Get category by ID
  static async getCategoryById(req: Request, res: Response) {
    try {
      const { brandId, id } = req.params;

      const category = await CategoryService.getCategoryById(id, brandId);

      return res.status(200).json({
        success: true,
        message: "Category retrieved successfully",
        data: category,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Category not found",
      });
    }
  }

  // Update category
  static async updateCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId, id } = req.params;
      const updateData = req.body;

      const category = await CategoryService.updateCategory(
        id,
        brandId,
        updateData
      );

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update category",
      });
    }
  }

  // Delete category
  static async deleteCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const { brandId, id } = req.params;

      await CategoryService.deleteCategory(id, brandId);

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete category",
      });
    }
  }

  // Get categories used in revenues/costs (for dropdown)
  static async getUsedCategories(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const { type } = req.query;

      const categories = await CategoryService.getUsedCategories(
        brandId,
        type as string
      );

      return res.status(200).json({
        success: true,
        message: "Used categories retrieved successfully",
        data: categories,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve used categories",
      });
    }
  }
}
