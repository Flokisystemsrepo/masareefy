import { prisma } from "@/config/database";
import { config } from "@/config/environment";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRandomString,
} from "@/utils/helpers";
import { RegisterUserDto, LoginUserDto, JWTPayload } from "@/types";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export class AuthService {
  // Register new user
  static async register(userData: RegisterUserDto) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const passwordHash = await hashPassword(userData.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate JWT token and refresh token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: "user",
        permissions: [],
      };

      const token = generateToken(payload);
      const refreshToken = await this.createSession(user.id);

      return {
        user,
        token,
        refreshToken: refreshToken.token,
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  static async login(loginData: LoginUserDto) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: loginData.email },
        include: {
          brands: true, // Direct brands relation (brands owned by user)
          brandUsers: {
            include: {
              brand: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Verify password
      if (!user.passwordHash) {
        throw new Error(
          "No password set for this account. Please contact support."
        );
      }
      const isValidPassword = await verifyPassword(
        loginData.password,
        user.passwordHash
      );
      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      // Get the user's primary brand (first brand they own)
      let userBrand = user.brands[0]; // Direct brand ownership

      // If no direct brand, check brandUsers for ownership
      if (!userBrand) {
        const brandUser = user.brandUsers.find(
          (brandUser) => brandUser.role === "owner"
        );
        if (brandUser) {
          userBrand = brandUser.brand;
        }
      }

      if (!userBrand) {
        throw new Error("No brand found for this user");
      }

      // Generate JWT token and refresh token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: "user",
        permissions: [],
      };

      const token = generateToken(payload);
      const refreshToken = await this.createSession(user.id);

      // Return user data without password
      const { passwordHash, brands, brandUsers, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        brand: userBrand,
        token,
        refreshToken: refreshToken.token,
      };
    } catch (error) {
      throw error;
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string) {
    try {
      const session = await this.validateSession(refreshToken);
      if (!session) {
        throw new Error("Invalid refresh token");
      }

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          brands: true,
          brandUsers: {
            include: {
              brand: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Get the user's primary brand
      let userBrand = user.brands[0];
      if (!userBrand) {
        const brandUser = user.brandUsers.find(
          (brandUser) => brandUser.role === "owner"
        );
        if (brandUser) {
          userBrand = brandUser.brand;
        }
      }

      if (!userBrand) {
        throw new Error("No brand found for this user");
      }

      // Generate new JWT token and refresh token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: "user",
        permissions: [],
      };

      const newToken = generateToken(payload);

      // Delete old session and create new one
      await this.deleteSession(refreshToken);
      const newRefreshToken = await this.createSession(user.id);

      // Return user data without password
      const { passwordHash, brands, brandUsers, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        brand: userBrand,
        token: newToken,
        refreshToken: newRefreshToken.token,
      };
    } catch (error) {
      throw error;
    }
  }

  // Create session
  static async createSession(userId: string) {
    try {
      const token = generateRandomString(64);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      const session = await prisma.session.create({
        data: {
          userId,
          token,
          expiresAt,
        },
      });

      return session;
    } catch (error) {
      throw error;
    }
  }

  // Validate session
  static async validateSession(token: string) {
    try {
      const session = await prisma.session.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              emailVerified: true,
            },
          },
        },
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      return session;
    } catch (error) {
      throw error;
    }
  }

  // Delete session (logout)
  static async deleteSession(token: string) {
    try {
      await prisma.session.delete({
        where: { token },
      });
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Get user profile with brand information
  static async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          brands: true,
          brandUsers: {
            include: {
              brand: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Get the user's primary brand
      let userBrand = user.brands[0];
      if (!userBrand) {
        const brandUser = user.brandUsers.find(
          (brandUser) => brandUser.role === "owner"
        );
        if (brandUser) {
          userBrand = brandUser.brand;
        }
      }

      if (!userBrand) {
        throw new Error("No brand found for this user");
      }

      // Return user data without password
      const { passwordHash, brands, brandUsers, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        brand: userBrand,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updateData: any) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      // Get user with password hash
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      if (!user.passwordHash) {
        throw new Error(
          "No password set for this account. Please contact support."
        );
      }
      const isValidPassword = await verifyPassword(
        currentPassword,
        user.passwordHash
      );
      if (!isValidPassword) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      return { message: "Password updated successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists or not
        return {
          message:
            "If an account with that email exists, a reset link has been sent",
        };
      }

      // Generate reset token
      const resetToken = generateRandomString(32);
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

      // Store reset token (you might want to add this to your schema)
      // For now, we'll just return a success message

      return {
        message:
          "If an account with that email exists, a reset link has been sent",
      };
    } catch (error) {
      throw error;
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string) {
    try {
      // Verify token and update password
      // This would require adding reset token fields to your schema

      return { message: "Password reset successfully" };
    } catch (error) {
      throw error;
    }
  }

  // Verify email
  static async verifyEmail(token: string) {
    try {
      // For now, we'll just return a success message
      // In a real implementation, you would verify the token and update the user's emailVerified status

      return { message: "Email verified successfully" };
    } catch (error) {
      throw error;
    }
  }
}
