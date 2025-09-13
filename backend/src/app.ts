import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "@/config/environment";

// Import routes
import authRoutes from "@/routes/auth";
import subscriptionRoutes from "@/routes/subscription";
import financialRoutes from "@/routes/financial";
import categoryRoutes from "@/routes/category";
import brandSettingsRoutes from "@/routes/brandSettings";
import userSettingsRoutes from "@/routes/userSettings";
import bostaImportRoutes from "@/routes/bostaImport";
import adminRoutes from "@/routes/admin";
import ticketRoutes from "@/routes/tickets";
import usageRoutes from "@/routes/usage";

// Import middleware
import { authenticateToken } from "@/middleware/auth";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.nodeEnv === "development" ? true : config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient rate limit for subscription endpoints
const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes (more restrictive)
  message: {
    success: false,
    error: "Too many subscription requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Pulse Finance API is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use("/api/auth", authRoutes);

// Admin routes (must be before routes with global auth middleware)
app.use("/api", adminRoutes);

// Ticket routes (public and admin)
app.use("/api/tickets", ticketRoutes);

// Usage tracking routes
app.use("/api/usage", authenticateToken, usageRoutes);

app.use("/api/subscription", subscriptionLimiter, subscriptionRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api", categoryRoutes);
app.use("/api", brandSettingsRoutes);
app.use("/api/user", userSettingsRoutes);
app.use("/api/bosta", authenticateToken, bostaImportRoutes);

// Protected API routes (placeholder for future routes)
app.use("/api/brands", authenticateToken, (req, res) => {
  res.status(501).json({
    success: false,
    error: "Brand routes not implemented yet",
  });
});

app.use("/api/inventory", authenticateToken, (req, res) => {
  res.status(501).json({
    success: false,
    error: "Inventory routes not implemented yet",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", error);

    // Handle Prisma errors
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        error: "A record with this information already exists",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    // Handle JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }

    // Handle validation errors
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";

    return res.status(statusCode).json({
      success: false,
      error:
        config.nodeEnv === "production" ? "Internal server error" : message,
    });
  }
);

export default app;
