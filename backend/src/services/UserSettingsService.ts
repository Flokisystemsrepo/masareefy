import { PrismaClient } from "@prisma/client";
import { UpdateUserSettingsDto } from "@/types";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export class UserSettingsService {
  // Get user profile and settings
  static async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
          picture: true,
          createdAt: true,
          updatedAt: true,
          brands: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              settings: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Parse brand settings for each brand
      const brandsWithSettings = user.brands.map((brand) => ({
        ...brand,
        settings:
          typeof brand.settings === "string"
            ? JSON.parse(brand.settings)
            : brand.settings || {},
      }));

      return {
        ...user,
        brands: brandsWithSettings,
        // Default user settings (in a real app, these would be stored in a separate table)
        settings: {
          timezone: "Africa/Cairo",
          language: "en",
          notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false,
          },
          privacy: {
            profileVisibility: "private" as const,
            dataSharing: false,
            analytics: true,
          },
          security: {
            twoFactorEnabled: false,
            loginNotifications: true,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updateData: UpdateUserSettingsDto
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Prepare update data (exclude settings that would be stored separately)
      const { notifications, privacy, security, ...profileData } = updateData;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: profileData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
          picture: true,
          updatedAt: true,
        },
      });

      // In a real app, you would save the settings to a separate UserSettings table
      // For now, we'll return the updated user with default settings
      return {
        ...updatedUser,
        settings: {
          timezone: updateData.timezone || "Africa/Cairo",
          language: updateData.language || "en",
          notifications: {
            email: updateData.notifications?.email ?? true,
            push: updateData.notifications?.push ?? true,
            sms: updateData.notifications?.sms ?? false,
            marketing: updateData.notifications?.marketing ?? false,
          },
          privacy: {
            profileVisibility:
              updateData.privacy?.profileVisibility || "private",
            dataSharing: updateData.privacy?.dataSharing ?? false,
            analytics: updateData.privacy?.analytics ?? true,
          },
          security: {
            twoFactorEnabled: updateData.security?.twoFactorEnabled ?? false,
            loginNotifications: updateData.security?.loginNotifications ?? true,
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Change user password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, passwordHash: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.passwordHash) {
        throw new Error("User does not have a password set");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Update user profile picture
  static async updateProfilePicture(userId: string, pictureUrl: string) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { picture: pictureUrl },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          picture: true,
          updatedAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Delete user account
  static async deleteUserAccount(userId: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, passwordHash: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.passwordHash) {
        throw new Error("User does not have a password set");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error("Password is incorrect");
      }

      // Delete user (this will cascade delete all related data due to onDelete: Cascade)
      await prisma.user.delete({
        where: { id: userId },
      });

      return { success: true, message: "Account deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
}
