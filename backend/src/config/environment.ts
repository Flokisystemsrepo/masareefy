import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // Authentication
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12"),

  // Kashier
  kashierApiKey: process.env.KASHIER_API_KEY!,
  kashierMerchantId: process.env.KASHIER_MERCHANT_ID!,

  // Email
  sendgridApiKey: process.env.SENDGRID_API_KEY!,
  fromEmail: process.env.FROM_EMAIL || "noreply@pulsefinance.com",
  fromName: process.env.FROM_NAME || "Pulse Finance",

  // AWS S3
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  awsRegion: process.env.AWS_REGION || "us-east-1",
  awsS3Bucket: process.env.AWS_S3_BUCKET!,

  // Redis
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  // Security
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),

  // Development vs Production rate limiting
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
};

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

// Optional environment variables (with defaults)
const optionalEnvVars = {
  SENDGRID_API_KEY: "test_sendgrid_key",
  AWS_ACCESS_KEY_ID: "test_aws_key",
  AWS_SECRET_ACCESS_KEY: "test_aws_secret",
  AWS_S3_BUCKET: "test_bucket",
  KASHIER_API_KEY: "test_key",
  KASHIER_MERCHANT_ID: "test_merchant",
};

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Set default values for optional environment variables
for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
  if (!process.env[key]) {
    process.env[key] = defaultValue;
  }
}

export default config;
