import { Request, Response } from "express";
import { BrandSettingsService } from "@/services/BrandSettingsService";
import { AuthenticatedRequest } from "@/types";
import Joi from "joi";

// Validation schemas
const updateBrandSettingsSchema = Joi.object({
  primaryColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  secondaryColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  accentColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  brandName: Joi.string().min(1).max(100).optional(),
  reportHeader: Joi.string().max(200).optional(),
  reportFooter: Joi.string().max(200).optional(),
  currency: Joi.string().length(3).optional(),
  dateFormat: Joi.string()
    .valid("DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD")
    .optional(),
  timezone: Joi.string().optional(),
  language: Joi.string().valid("en", "ar").optional(),
  notifications: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    sms: Joi.boolean().optional(),
  }).optional(),
  integrations: Joi.object({
    shopify: Joi.object({
      enabled: Joi.boolean().optional(),
      shopDomain: Joi.string().optional(),
      accessToken: Joi.string().optional(),
    }).optional(),
    stripe: Joi.object({
      enabled: Joi.boolean().optional(),
      publishableKey: Joi.string().optional(),
      secretKey: Joi.string().optional(),
    }).optional(),
  }).optional(),
});

const updateLogoSchema = Joi.object({
  logoUrl: Joi.string().uri().required(),
});

export class BrandSettingsController {
  // Get brand settings
  static async getBrandSettings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { brandId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      // Verify user has access to this brand
      const brand = await BrandSettingsService.getBrandSettings(brandId);

      // For now, we'll allow access if the brand exists
      // In a real app, you'd check if the user owns or has access to this brand

      res.status(200).json({
        success: true,
        data: brand,
        message: "Brand settings retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve brand settings",
      });
    }
  }

  // Update brand settings
  static async updateBrandSettings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { brandId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      // Validate request body
      const { error, value } = updateBrandSettingsSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const updatedBrand = await BrandSettingsService.updateBrandSettings(
        brandId,
        value
      );

      res.status(200).json({
        success: true,
        data: updatedBrand,
        message: "Brand settings updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update brand settings",
      });
    }
  }

  // Update brand logo
  static async updateBrandLogo(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { brandId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      // Validate request body
      const { error, value } = updateLogoSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const updatedBrand = await BrandSettingsService.updateBrandLogo(
        brandId,
        value.logoUrl
      );

      res.status(200).json({
        success: true,
        data: updatedBrand,
        message: "Brand logo updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update brand logo",
      });
    }
  }

  // Reset brand settings to defaults
  static async resetBrandSettings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { brandId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      const resetBrand = await BrandSettingsService.resetBrandSettings(brandId);

      res.status(200).json({
        success: true,
        data: resetBrand,
        message: "Brand settings reset to defaults successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reset brand settings",
      });
    }
  }
}
