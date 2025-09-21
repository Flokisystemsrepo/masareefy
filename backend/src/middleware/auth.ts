import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/helpers";
import { prisma } from "@/config/database";
import { AuthenticatedRequest } from "@/types";

// JWT Authentication middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Access token required",
      });
      return;
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        emailVerified: true,
        googleId: true,
        picture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid token",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

// Brand access middleware
export const requireBrandAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { brandId } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
      });
      return;
    }

    // Check if user has access to this brand
    const brandUser = await prisma.brandUser.findUnique({
      where: {
        brandId_userId: {
          brandId,
          userId: req.user.id,
        },
      },
    });

    if (!brandUser) {
      res.status(403).json({
        success: false,
        error: "Access denied to this brand",
      });
      return;
    }

    req.brandContext = brandUser;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Role-based access control middleware
export const requireRole = (requiredRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.brandContext) {
      res.status(403).json({
        success: false,
        error: "Brand context required",
      });
      return;
    }

    if (!requiredRoles.includes(req.brandContext.role)) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

// Permission-based access control middleware
export const requirePermission = (requiredPermissions: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.brandContext) {
      res.status(403).json({
        success: false,
        error: "Brand context required",
      });
      return;
    }

    const userPermissions = req.brandContext.permissions as string[];
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

// Optional authentication middleware (for public routes that can work with or without auth)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          emailVerified: true,
          googleId: true,
          picture: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
