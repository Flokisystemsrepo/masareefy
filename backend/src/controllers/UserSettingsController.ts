import { Request, Response } from "express";
import { UserSettingsService } from "@/services/UserSettingsService";
import { AuthenticatedRequest, UpdateUserSettingsDto } from "@/types";
import Joi from "joi";

// Validation schemas
const updateUserSettingsSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  timezone: Joi.string().optional(),
  language: Joi.string().valid("en", "ar").optional(),
  notifications: Joi.object({
    email: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    sms: Joi.boolean().optional(),
    marketing: Joi.boolean().optional(),
  }).optional(),
  privacy: Joi.object({
    profileVisibility: Joi.string().valid("public", "private").optional(),
    dataSharing: Joi.boolean().optional(),
    analytics: Joi.boolean().optional(),
  }).optional(),
  security: Joi.object({
    twoFactorEnabled: Joi.boolean().optional(),
    loginNotifications: Joi.boolean().optional(),
  }).optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(8).required(),
});

const updateProfilePictureSchema = Joi.object({
  pictureUrl: Joi.string().uri().required(),
});

const deleteAccountSchema = Joi.object({
  password: Joi.string().required(),
});

export class UserSettingsController {
  // Get user profile and settings
  static async getUserProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      const userProfile = await UserSettingsService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: userProfile,
        message: "User profile retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve user profile",
      });
    }
  }

  // Update user profile and settings
  static async updateUserProfile(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      // Validate request body
      const { error, value } = updateUserSettingsSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const updatedProfile = await UserSettingsService.updateUserProfile(
        userId,
        value
      );

      res.status(200).json({
        success: true,
        data: updatedProfile,
        message: "User profile updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update user profile",
      });
    }
  }

  // Change user password
  static async changePassword(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      // Validate request body
      const { error, value } = changePasswordSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const result = await UserSettingsService.changePassword(
        userId,
        value.currentPassword,
        value.newPassword
      );

      res.status(200).json({
        success: true,
        data: result,
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to change password",
      });
    }
  }

  // Update profile picture
  static async updateProfilePicture(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      // Validate request body
      const { error, value } = updateProfilePictureSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const updatedUser = await UserSettingsService.updateProfilePicture(
        userId,
        value.pictureUrl
      );

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "Profile picture updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update profile picture",
      });
    }
  }

  // Delete user account
  static async deleteAccount(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      // Validate request body
      const { error, value } = deleteAccountSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const result = await UserSettingsService.deleteUserAccount(
        userId,
        value.password
      );

      res.status(200).json({
        success: true,
        data: result,
        message: "Account deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete account",
      });
    }
  }
}
