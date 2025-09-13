import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";

interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export const adminAuth = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || "admin-secret-key"
    ) as any;

    // Check if admin exists and is active
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        lockedUntil: true,
      },
    });

    if (!admin || !admin.isActive) {
      res.status(401).json({
        success: false,
        error: "Invalid admin credentials.",
      });
      return;
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      res.status(423).json({
        success: false,
        error: "Account is temporarily locked.",
      });
      return;
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions as string[],
    };
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token.",
    });
  }
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: AdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
      return;
    }

    if (!roles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions.",
      });
      return;
    }

    next();
  };
};

// Permission-based access control
export const requirePermission = (permission: string) => {
  return (req: AdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
      return;
    }

    if (!req.admin.permissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions.",
      });
      return;
    }

    next();
  };
};
