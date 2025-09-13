import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "@/config/environment";
import { JWTPayload } from "@/types";

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, config.bcryptRounds);
};

// Password verification
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// JWT token generation
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
};

// JWT token verification
export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Generate random string
export const generateRandomString = (length: number = 32): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate invoice number
export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${timestamp}-${random}`;
};

// Calculate pagination
export const calculatePagination = (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// Format currency
export const formatCurrency = (
  amount: number,
  currency: string = "EGP"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Calculate days between dates
export const calculateDaysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
};

// Check if date is overdue
export const isOverdue = (dueDate: Date): boolean => {
  return new Date() > dueDate;
};

// Calculate overdue days
export const getOverdueDays = (dueDate: Date): number => {
  if (!isOverdue(dueDate)) return 0;
  return calculateDaysBetween(new Date(), dueDate);
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize string for search
export const sanitizeSearchString = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Generate SKU
export const generateSKU = (category: string, productName: string): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const productCode = productName.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${categoryCode}-${productCode}-${timestamp}`;
};

// Calculate progress percentage
export const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

// Get status color class
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "active":
    case "current":
    case "completed":
    case "paid":
    case "on-track":
      return "text-green-600 bg-green-100";
    case "pending":
    case "trialing":
      return "text-yellow-600 bg-yellow-100";
    case "overdue":
    case "critical":
    case "at-risk":
    case "behind":
      return "text-red-600 bg-red-100";
    case "cancelled":
    case "void":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-blue-600 bg-blue-100";
  }
};
