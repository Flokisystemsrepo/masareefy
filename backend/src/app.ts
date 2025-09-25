import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
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
import testUpgradeRoutes from "@/routes/test-upgrade";
import trialRoutes from "@/routes/trial";
import otpRoutes from "@/routes/otp";
import paymentRoutes from "@/routes/payment";

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

// Rate limiting - Different limits for development vs production
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.isDevelopment ? 1000 : config.rateLimitMaxRequests, // Much higher limit in development
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for development on localhost
    if (config.isDevelopment && req.ip === "127.0.0.1") {
      return true;
    }
    return false;
  },
});

// More lenient rate limit for subscription endpoints
const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isDevelopment ? 100 : 20, // Much higher limit in development
  message: {
    success: false,
    error: "Too many subscription requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Skip rate limiting for development on localhost
    if (config.isDevelopment && req.ip === "127.0.0.1") {
      return true;
    }
    return false;
  },
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

// Serve static files from the frontend build
const frontendBuildPath = path.join(__dirname, "../../dist");
app.use(express.static(frontendBuildPath));

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
app.use("/api/otp", otpRoutes);

// Admin routes (must be before routes with global auth middleware)
app.use("/api", adminRoutes);

// Ticket routes (public and admin)
app.use("/api/tickets", ticketRoutes);

// Usage tracking routes
app.use("/api/usage", authenticateToken, usageRoutes);

// Trial routes
app.use("/api/trial", trialRoutes);

// Payment routes
app.use("/api/payment", paymentRoutes);

app.use("/api/subscription", subscriptionLimiter, subscriptionRoutes);
app.use("/api/test-upgrade", testUpgradeRoutes);
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

// SPA fallback - serve React app for non-API routes
app.get("*", (req, res) => {
  // If it's an API route that doesn't exist, return 404
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      error: "API route not found",
      path: req.originalUrl,
    });
  }

  // For all other routes, serve the React app
  return res.sendFile(path.join(frontendBuildPath, "index.html"));
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
