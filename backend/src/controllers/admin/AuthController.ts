import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { prisma } from "../../config/database";

export class AdminAuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, ipAddress, userAgent } = req.body;

      // Find admin
      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!admin) {
        res.status(401).json({
          success: false,
          error: "Invalid credentials.",
        });
        return;
      }

      // Check if account is locked
      if (admin.lockedUntil && admin.lockedUntil > new Date()) {
        res.status(423).json({
          success: false,
          error:
            "Account is temporarily locked due to too many failed attempts.",
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        password,
        admin.passwordHash
      );

      if (!isValidPassword) {
        // Increment failed attempts
        await prisma.admin.update({
          where: { id: admin.id },
          data: {
            loginAttempts: admin.loginAttempts + 1,
            lockedUntil:
              admin.loginAttempts >= 4
                ? new Date(Date.now() + 15 * 60 * 1000)
                : null, // Lock for 15 minutes
          },
        });

        res.status(401).json({
          success: false,
          error: "Invalid credentials.",
        });
        return;
      }

      // Reset failed attempts on successful login
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });

      // Create JWT token
      const token = jwt.sign(
        { adminId: admin.id },
        process.env.ADMIN_JWT_SECRET || "admin-secret-key",
        { expiresIn: "8h" }
      );

      // Create session
      await prisma.adminSession.create({
        data: {
          adminId: admin.id,
          token: token,
          ipAddress: ipAddress || req.ip || "unknown",
          userAgent: userAgent || req.get("User-Agent") || "unknown",
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
        },
      });

      // Log admin login (skip audit log for now to avoid foreign key constraint issues)
      // TODO: Create a separate admin audit log table or make userId nullable
      // await prisma.auditLog.create({
      //   data: {
      //     userId: admin.id,
      //     adminId: admin.id,
      //     action: "admin_login",
      //     tableName: "admins",
      //     recordId: admin.id,
      //     newValues: {
      //       ipAddress: ipAddress || req.ip,
      //       userAgent: userAgent || req.get("User-Agent"),
      //     },
      //   },
      // });

      res.json({
        success: true,
        token: token,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          permissions: admin.permissions,
        },
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error.",
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (token) {
        await prisma.adminSession.deleteMany({
          where: { token },
        });
      }

      res.json({
        success: true,
        message: "Logged out successfully.",
      });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error.",
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).admin?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          error: "Admin not authenticated.",
        });
        return;
      }

      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          permissions: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      if (!admin) {
        res.status(404).json({
          success: false,
          error: "Admin not found.",
        });
        return;
      }

      res.json({
        success: true,
        admin: admin,
      });
    } catch (error) {
      console.error("Get admin profile error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error.",
      });
    }
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).admin?.id;

      if (!adminId) {
        res.status(401).json({
          success: false,
          error: "Invalid token.",
        });
        return;
      }

      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          permissions: true,
        },
      });

      if (!admin) {
        res.status(404).json({
          success: false,
          error: "Admin not found.",
        });
        return;
      }

      res.json({
        success: true,
        admin: admin,
      });
    } catch (error) {
      console.error("Verify admin token error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error.",
      });
    }
  }
}
