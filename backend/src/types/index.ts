import { Request } from "express";
import { User, Brand, BrandUser, Plan, Subscription } from "@prisma/client";

// User type without password for API responses
export type UserWithoutPassword = Omit<User, "passwordHash">;

// Extended Request interface with user and brand context
export interface AuthenticatedRequest extends Request {
  user?: UserWithoutPassword;
  brandContext?: BrandUser;
}

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

// DTOs for API requests
export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface MultiStepRegistrationDto {
  // Step 1: Plan Selection
  planId: string;

  // Step 2: User Details
  email: string;
  firstName: string;
  lastName: string;

  // Step 3: Brand Details
  brandName: string;
  password: string;

  // Step 4: Payment
  paymentMethod?: "mock" | "stripe";
}

export interface Step1PlanSelectionDto {
  planId: string;
}

export interface Step2UserDetailsDto {
  planId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Step3BrandDetailsDto {
  planId: string;
  email: string;
  firstName: string;
  lastName: string;
  brandName: string;
  password: string;
}

export interface Step4PaymentDto {
  planId: string;
  email: string;
  firstName: string;
  lastName: string;
  brandName: string;
  password: string;
  paymentMethod?: "mock" | "stripe";
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface CreateBrandDto {
  name: string;
  description?: string;
  industry?: string;
}

export interface CreateReceivableDto {
  brandId: string;
  entityName: string;
  amount: number;
  dueDate: Date;
  description?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  autoConvertToRevenue?: boolean;
}

export interface UpdateReceivableDto {
  entityName?: string;
  amount?: number;
  dueDate?: Date;
  status?: "current" | "overdue" | "critical" | "paid";
  description?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  autoConvertToRevenue?: boolean;
}

export interface CreatePayableDto {
  brandId: string;
  entityName: string;
  amount: number;
  dueDate: Date;
  description?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  autoConvertToCost?: boolean;
}

export interface UpdatePayableDto {
  entityName?: string;
  amount?: number;
  dueDate?: Date;
  status?: "current" | "overdue" | "critical" | "paid";
  description?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  autoConvertToCost?: boolean;
}

export interface CreateRevenueDto {
  brandId: string;
  name: string;
  amount: number;
  category: string;
  date: Date;
  source: string;
  receiptUrl?: string;
}

export interface UpdateRevenueDto {
  name?: string;
  amount?: number;
  category?: string;
  date?: Date;
  source?: string;
  receiptUrl?: string;
}

export interface CreateCostDto {
  brandId: string;
  name: string;
  amount: number;
  category: string;
  costType: "fixed" | "variable";
  date: Date;
  vendor: string;
  receiptUrl?: string;
}

export interface UpdateCostDto {
  name?: string;
  amount?: number;
  category?: string;
  costType?: "fixed" | "variable";
  date?: Date;
  vendor?: string;
  receiptUrl?: string;
}

export interface CreateTransferDto {
  brandId: string;
  type: "customer" | "inventory";
  fromLocation?: string;
  toLocation: string;
  quantity: number;
  description?: string;
  transferDate: Date;
  inventoryItemId?: string;
  deductFromStock?: boolean;
}

export interface UpdateTransferDto {
  type?: "customer" | "inventory";
  fromLocation?: string;
  toLocation?: string;
  quantity?: number;
  description?: string;
  transferDate?: Date;
  inventoryItemId?: string;
  deductFromStock?: boolean;
}

export interface CreateInventoryDto {
  brandId: string;
  productName: string;
  baseSku: string;
  category: string;
  supplier?: string;
  unitCost: number;
  sellingPrice: number;
  currentStock: number;
  reorderLevel: number;
  description?: string;
  location?: string;
  sizes?: string[];
  colors?: string[];
  status?: "in-stock" | "low-stock" | "out-of-stock";
}

export interface UpdateInventoryDto {
  productName?: string;
  baseSku?: string;
  category?: string;
  supplier?: string;
  unitCost?: number;
  sellingPrice?: number;
  currentStock?: number;
  reorderLevel?: number;
  description?: string;
  location?: string;
  sizes?: string[];
  colors?: string[];
  status?: "in-stock" | "low-stock" | "out-of-stock";
}

export interface CreateProjectTargetDto {
  brandId: string;
  name: string;
  goal: string;
  targetPieces: number;
  currentPieces: number;
  category: string;
  deadline: Date;
  status: "on-track" | "at-risk" | "behind" | "completed";
}

export interface UpdateProjectTargetDto {
  name?: string;
  goal?: string;
  targetPieces?: number;
  currentPieces?: number;
  category?: string;
  deadline?: Date;
  status?: "on-track" | "at-risk" | "behind" | "completed";
}

// Team DTOs
export interface CreateTeamMemberDto {
  brandId: string;
  userId?: string; // Optional, will use createdBy if not provided
  role: string;
  permissions: string[];
}

export interface UpdateTeamMemberDto {
  role?: string;
  permissions?: string[];
}

// Task DTOs
export interface CreateTaskDto {
  brandId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  assignedTo?: string;
  category?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  status?: "pending" | "in-progress" | "completed";
  dueDate?: Date;
  assignedTo?: string;
  category?: string;
}

// Financial Response Types
export interface FinancialMetrics {
  totalReceivables: number;
  totalPayables: number;
  totalRevenue: number;
  totalCosts: number;
  netIncome: number;
  overdueReceivables: number;
  overduePayables: number;
}

export interface InventoryMetrics {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface TransferMetrics {
  totalTransfers: number;
  pendingTransfers: number;
  completedTransfers: number;
  cancelledTransfers: number;
}

// Subscription DTOs
export interface CreateSubscriptionDto {
  planId: string;
  paymentMethod?: "mock" | "stripe";
  trialDays?: number;
}

export interface UpdateSubscriptionDto {
  planId?: string;
  status?: "active" | "cancelled" | "past_due" | "unpaid";
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionWithPlan extends Subscription {
  plan: Plan;
}

// API response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Audit log interface
export interface AuditLogDto {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

// Wallet DTOs
export interface CreateWalletDto {
  name: string;
  balance: number;
  type: "FOUNDER" | "BUSINESS" | "PERSONAL" | "CUSTOM";
  currency: string;
  color: string;
}

export interface UpdateWalletDto {
  name?: string;
  balance?: number;
  type?: "FOUNDER" | "BUSINESS" | "PERSONAL" | "CUSTOM";
  currency?: string;
  color?: string;
}

export interface CreateWalletTransactionDto {
  type: "transfer" | "credit" | "debit";
  fromWalletId?: string;
  toWalletId?: string;
  amount: number;
  description?: string;
  date: string;
  category?: string;
  countAsRevenue?: boolean;
  countAsCost?: boolean;
}

// Brand Settings DTOs
export interface CreateBrandSettingsDto {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  brandName: string;
  reportHeader: string;
  reportFooter: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  integrations: {
    shopify: {
      enabled: boolean;
      shopDomain: string;
      accessToken: string;
    };
    stripe: {
      enabled: boolean;
      publishableKey: string;
      secretKey: string;
    };
  };
}

export interface UpdateBrandSettingsDto {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  brandName?: string;
  reportHeader?: string;
  reportFooter?: string;
  currency?: string;
  dateFormat?: string;
  timezone?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  integrations?: {
    shopify?: {
      enabled?: boolean;
      shopDomain?: string;
      accessToken?: string;
    };
    stripe?: {
      enabled?: boolean;
      publishableKey?: string;
      secretKey?: string;
    };
  };
}

// User Settings DTOs
export interface UpdateUserSettingsDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy?: {
    profileVisibility: "public" | "private";
    dataSharing: boolean;
    analytics: boolean;
  };
  security?: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
  };
}
