-- Pulse Finance Database Schema Dump
-- Generated on: 2025-09-17T14:38:08.049Z
-- Database: PostgreSQL
-- 
-- This dump contains only the database schema (table structures, indexes, constraints)
-- No data is included - this is for creating the database structure only
--
-- Schema Migration Instructions:
-- 1. Create a new PostgreSQL database
-- 2. Run: psql -h localhost -U username -d database_name < schema-dump-2025-09-17T14-38-08-043Z.sql
-- 3. Update your .env file with the new DATABASE_URL
-- 4. Run: npx prisma generate
-- 5. Run: npx prisma db push (if needed)
--

-- Table: _prisma_migrations
CREATE TABLE "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
);

-- Table: admin_sessions
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins" ("id") ON DELETE CASCADE;

-- Table: admins
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin'::text,
    "permissions" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP,
    "ipWhitelist" TEXT[] DEFAULT ARRAY[]::text[],
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

-- Table: audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "brandId" TEXT,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT,
    PRIMARY KEY ("id")
);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins" ("id") ON DELETE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: bosta_imports
CREATE TABLE "bosta_imports" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "expectedCash" DOUBLE PRECISION NOT NULL,
    "delivered" INTEGER NOT NULL,
    "returned" INTEGER NOT NULL,
    "returnRate" DOUBLE PRECISION NOT NULL,
    "deliveryRate" DOUBLE PRECISION NOT NULL,
    "processedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "bosta_imports" ADD CONSTRAINT "bosta_imports_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;

-- Table: bosta_shipments
CREATE TABLE "bosta_shipments" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "codAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "businessReference" TEXT,
    "deliveredAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "bostaImportId" TEXT NOT NULL,
    "consigneeName" TEXT,
    "consigneePhone" TEXT,
    "deliveryState" TEXT NOT NULL,
    "description" TEXT,
    "dropOffCity" TEXT,
    "dropOffFirstLine" TEXT,
    "expectedDeliveryDate" TIMESTAMP,
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "isReturned" BOOLEAN NOT NULL DEFAULT false,
    "numberOfAttempts" INTEGER,
    "originalCreatedAt" TIMESTAMP,
    "originalUpdatedAt" TIMESTAMP,
    "revenueCreated" BOOLEAN NOT NULL DEFAULT false,
    "sku" TEXT,
    "type" TEXT,
    PRIMARY KEY ("id")
);

ALTER TABLE "bosta_shipments" ADD CONSTRAINT "bosta_shipments_bostaImportId_fkey" FOREIGN KEY ("bostaImportId") REFERENCES "bosta_imports" ("id") ON DELETE CASCADE;

-- Table: brand_users
CREATE TABLE "brand_users" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "invitedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP,
    PRIMARY KEY ("id")
);

ALTER TABLE "brand_users" ADD CONSTRAINT "brand_users_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;
ALTER TABLE "brand_users" ADD CONSTRAINT "brand_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: brands
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "brands" ADD CONSTRAINT "brands_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: categories
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'bg-blue-100 text-blue-800'::text,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "categories" ADD CONSTRAINT "categories_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;

-- Table: costs
CREATE TABLE "costs" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "vendor" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "costType" TEXT NOT NULL DEFAULT 'variable'::text,
    PRIMARY KEY ("id")
);

ALTER TABLE "costs" ADD CONSTRAINT "costs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "costs" ADD CONSTRAINT "costs_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;

-- Table: financial_reports
CREATE TABLE "financial_reports" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "financial_reports" ADD CONSTRAINT "financial_reports_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;

-- Table: inventory
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in-stock'::text,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "baseSku" TEXT NOT NULL,
    "colors" TEXT[] DEFAULT ARRAY[]::text[],
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sizes" TEXT[] DEFAULT ARRAY[]::text[],
    "supplier" TEXT,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
);

ALTER TABLE "inventory" ADD CONSTRAINT "inventory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;

-- Table: invoices
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP'::text,
    "status" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "dueDate" TIMESTAMP,
    "paidAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "description" TEXT,
    "invoiceNumber" TEXT,
    "userId" TEXT NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions" ("id") ON DELETE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: payables
CREATE TABLE "payables" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "invoiceNumber" TEXT,
    "receiptUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "autoConvertToCost" BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY ("id")
);

ALTER TABLE "payables" ADD CONSTRAINT "payables_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "payables" ADD CONSTRAINT "payables_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;

-- Table: plans
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceMonthly" DOUBLE PRECISION NOT NULL,
    "priceYearly" DOUBLE PRECISION NOT NULL,
    "features" JSONB NOT NULL,
    "maxBrands" INTEGER NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "trialDays" INTEGER NOT NULL DEFAULT 7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

-- Table: project_targets
CREATE TABLE "project_targets" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "targetPieces" INTEGER NOT NULL,
    "currentPieces" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "deadline" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "project_targets" ADD CONSTRAINT "project_targets_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;
ALTER TABLE "project_targets" ADD CONSTRAINT "project_targets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: receivables
CREATE TABLE "receivables" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "invoiceNumber" TEXT,
    "receiptUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "autoConvertToRevenue" BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY ("id")
);

ALTER TABLE "receivables" ADD CONSTRAINT "receivables_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;

-- Table: revenues
CREATE TABLE "revenues" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "source" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "bostaImportId" TEXT,
    "bostaShipmentId" TEXT,
    PRIMARY KEY ("id")
);

ALTER TABLE "revenues" ADD CONSTRAINT "revenues_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_bostaShipmentId_fkey" FOREIGN KEY ("bostaShipmentId") REFERENCES "bosta_shipments" ("id") ON DELETE CASCADE;
ALTER TABLE "revenues" ADD CONSTRAINT "revenues_bostaImportId_fkey" FOREIGN KEY ("bostaImportId") REFERENCES "bosta_imports" ("id") ON DELETE CASCADE;

-- Table: subscriptions
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP,
    "paymentMethod" TEXT NOT NULL DEFAULT 'mock'::text,
    "trialEnd" TIMESTAMP,
    "trialStart" TIMESTAMP,
    PRIMARY KEY ("id")
);

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans" ("id") ON DELETE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: system_metrics
CREATE TABLE "system_metrics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalUsers" INTEGER NOT NULL,
    "totalBrands" INTEGER NOT NULL,
    "activeSubscriptions" INTEGER NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "totalCosts" DOUBLE PRECISION NOT NULL,
    "apiCalls" INTEGER NOT NULL,
    "errorCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

-- Table: tasks
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "category" TEXT,
    PRIMARY KEY ("id")
);

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: team_members
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "joinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

ALTER TABLE "team_members" ADD CONSTRAINT "team_members_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;

-- Table: ticket_responses
CREATE TABLE "ticket_responses" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "isFromAdmin" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "attachments" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "ticket_responses" ADD CONSTRAINT "ticket_responses_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE CASCADE;
ALTER TABLE "ticket_responses" ADD CONSTRAINT "ticket_responses_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "admins" ("id") ON DELETE CASCADE;

-- Table: tickets
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open'::text,
    "priority" TEXT NOT NULL DEFAULT 'Medium'::text,
    "attachments" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "assignedToId" TEXT,
    "userId" TEXT,
    "resolvedAt" TIMESTAMP,
    "closedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "admins" ("id") ON DELETE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: transfers
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fromLocation" TEXT,
    "toLocation" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT,
    "transferDate" TIMESTAMP NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "deductFromStock" BOOLEAN NOT NULL DEFAULT false,
    "inventoryItemId" TEXT,
    PRIMARY KEY ("id")
);

ALTER TABLE "transfers" ADD CONSTRAINT "transfers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: usage_tracking
CREATE TABLE "usage_tracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "limit" INTEGER NOT NULL DEFAULT '-1'::integer,
    "lastUpdated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;
ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: user_sessions
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Table: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "googleId" TEXT,
    "picture" TEXT,
    PRIMARY KEY ("id")
);

-- Table: wallet_transactions
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "walletId" TEXT,
    "type" TEXT NOT NULL,
    "fromWalletId" TEXT,
    "toWalletId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed'::text,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "category" TEXT,
    "countAsCost" BOOLEAN NOT NULL DEFAULT false,
    "countAsRevenue" BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY ("id")
);

ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets" ("id") ON DELETE CASCADE;
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES "wallets" ("id") ON DELETE CASCADE;
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES "wallets" ("id") ON DELETE CASCADE;

-- Table: wallets
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP'::text,
    "color" TEXT NOT NULL DEFAULT 'bg-gradient-to-br from-gray-800 to-gray-900'::text,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
);

ALTER TABLE "wallets" ADD CONSTRAINT "wallets_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands" ("id") ON DELETE CASCADE;
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE CASCADE;

-- Indexes
CREATE UNIQUE INDEX admin_sessions_token_key ON public.admin_sessions USING btree (token);
CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);
CREATE UNIQUE INDEX "brand_users_brandId_userId_key" ON public.brand_users USING btree ("brandId", "userId");
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");
CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON public.invoices USING btree ("stripeInvoiceId");
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON public.subscriptions USING btree ("stripeSubscriptionId");
CREATE UNIQUE INDEX "team_members_brandId_userId_key" ON public.team_members USING btree ("brandId", "userId");
CREATE UNIQUE INDEX "tickets_ticketId_key" ON public.tickets USING btree ("ticketId");
CREATE UNIQUE INDEX "usage_tracking_userId_brandId_resourceType_key" ON public.usage_tracking USING btree ("userId", "brandId", "resourceType");
CREATE UNIQUE INDEX user_sessions_token_key ON public.user_sessions USING btree (token);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE UNIQUE INDEX "users_googleId_key" ON public.users USING btree ("googleId");

-- Schema dump completed successfully!
-- 
-- Next steps:
-- 1. Create a new PostgreSQL database
-- 2. Update DATABASE_URL in .env file
-- 3. Run: npx prisma generate
-- 4. Import this schema: psql -h localhost -U username -d database_name < schema-dump-2025-09-17T14-38-08-043Z.sql
-- 5. Run: npx prisma db push (if needed)
-- 6. Verify with: npx prisma studio
