--
-- PostgreSQL database dump
--

\restrict GPd1cUvrhvF0JTpJ2khWvkUkNrFtDcAE2GE68hJ123rIWjVSef61Zoa3b1DpEbx

-- Dumped from database version 15.14 (Homebrew)
-- Dumped by pg_dump version 15.14 (Homebrew)

-- Started on 2025-09-18 15:33:27 EEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.wallets DROP CONSTRAINT "wallets_createdBy_fkey";
ALTER TABLE ONLY public.wallets DROP CONSTRAINT "wallets_brandId_fkey";
ALTER TABLE ONLY public.wallet_transactions DROP CONSTRAINT "wallet_transactions_walletId_fkey";
ALTER TABLE ONLY public.wallet_transactions DROP CONSTRAINT "wallet_transactions_toWalletId_fkey";
ALTER TABLE ONLY public.wallet_transactions DROP CONSTRAINT "wallet_transactions_fromWalletId_fkey";
ALTER TABLE ONLY public.wallet_transactions DROP CONSTRAINT "wallet_transactions_createdBy_fkey";
ALTER TABLE ONLY public.wallet_transactions DROP CONSTRAINT "wallet_transactions_brandId_fkey";
ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT "user_sessions_userId_fkey";
ALTER TABLE ONLY public.usage_tracking DROP CONSTRAINT "usage_tracking_userId_fkey";
ALTER TABLE ONLY public.usage_tracking DROP CONSTRAINT "usage_tracking_brandId_fkey";
ALTER TABLE ONLY public.trial_notifications DROP CONSTRAINT "trial_notifications_userId_fkey";
ALTER TABLE ONLY public.transfers DROP CONSTRAINT "transfers_createdBy_fkey";
ALTER TABLE ONLY public.transfers DROP CONSTRAINT "transfers_brandId_fkey";
ALTER TABLE ONLY public.tickets DROP CONSTRAINT "tickets_userId_fkey";
ALTER TABLE ONLY public.tickets DROP CONSTRAINT "tickets_assignedToId_fkey";
ALTER TABLE ONLY public.ticket_responses DROP CONSTRAINT "ticket_responses_ticketId_fkey";
ALTER TABLE ONLY public.ticket_responses DROP CONSTRAINT "ticket_responses_authorId_fkey";
ALTER TABLE ONLY public.team_members DROP CONSTRAINT "team_members_brandId_fkey";
ALTER TABLE ONLY public.tasks DROP CONSTRAINT "tasks_createdBy_fkey";
ALTER TABLE ONLY public.tasks DROP CONSTRAINT "tasks_brandId_fkey";
ALTER TABLE ONLY public.subscriptions DROP CONSTRAINT "subscriptions_userId_fkey";
ALTER TABLE ONLY public.subscriptions DROP CONSTRAINT "subscriptions_planId_fkey";
ALTER TABLE ONLY public.revenues DROP CONSTRAINT "revenues_createdBy_fkey";
ALTER TABLE ONLY public.revenues DROP CONSTRAINT "revenues_brandId_fkey";
ALTER TABLE ONLY public.revenues DROP CONSTRAINT "revenues_bostaShipmentId_fkey";
ALTER TABLE ONLY public.revenues DROP CONSTRAINT "revenues_bostaImportId_fkey";
ALTER TABLE ONLY public.receivables DROP CONSTRAINT "receivables_createdBy_fkey";
ALTER TABLE ONLY public.receivables DROP CONSTRAINT "receivables_brandId_fkey";
ALTER TABLE ONLY public.project_targets DROP CONSTRAINT "project_targets_createdBy_fkey";
ALTER TABLE ONLY public.project_targets DROP CONSTRAINT "project_targets_brandId_fkey";
ALTER TABLE ONLY public.payables DROP CONSTRAINT "payables_createdBy_fkey";
ALTER TABLE ONLY public.payables DROP CONSTRAINT "payables_brandId_fkey";
ALTER TABLE ONLY public.invoices DROP CONSTRAINT "invoices_userId_fkey";
ALTER TABLE ONLY public.invoices DROP CONSTRAINT "invoices_subscriptionId_fkey";
ALTER TABLE ONLY public.inventory DROP CONSTRAINT "inventory_createdBy_fkey";
ALTER TABLE ONLY public.inventory DROP CONSTRAINT "inventory_brandId_fkey";
ALTER TABLE ONLY public.financial_reports DROP CONSTRAINT "financial_reports_brandId_fkey";
ALTER TABLE ONLY public.costs DROP CONSTRAINT "costs_createdBy_fkey";
ALTER TABLE ONLY public.costs DROP CONSTRAINT "costs_brandId_fkey";
ALTER TABLE ONLY public.categories DROP CONSTRAINT "categories_brandId_fkey";
ALTER TABLE ONLY public.brands DROP CONSTRAINT "brands_userId_fkey";
ALTER TABLE ONLY public.brand_users DROP CONSTRAINT "brand_users_userId_fkey";
ALTER TABLE ONLY public.brand_users DROP CONSTRAINT "brand_users_brandId_fkey";
ALTER TABLE ONLY public.bosta_shipments DROP CONSTRAINT "bosta_shipments_bostaImportId_fkey";
ALTER TABLE ONLY public.bosta_imports DROP CONSTRAINT "bosta_imports_brandId_fkey";
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT "audit_logs_userId_fkey";
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT "audit_logs_brandId_fkey";
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT "audit_logs_adminId_fkey";
ALTER TABLE ONLY public.admin_sessions DROP CONSTRAINT "admin_sessions_adminId_fkey";
DROP INDEX public."users_googleId_key";
DROP INDEX public.users_email_key;
DROP INDEX public.user_sessions_token_key;
DROP INDEX public."usage_tracking_userId_brandId_resourceType_key";
DROP INDEX public."tickets_ticketId_key";
DROP INDEX public."team_members_brandId_userId_key";
DROP INDEX public."subscriptions_stripeSubscriptionId_key";
DROP INDEX public."phone_verifications_phone_otpCode_key";
DROP INDEX public."invoices_stripeInvoiceId_key";
DROP INDEX public."invoices_invoiceNumber_key";
DROP INDEX public."brand_users_brandId_userId_key";
DROP INDEX public.admins_email_key;
DROP INDEX public.admin_sessions_token_key;
ALTER TABLE ONLY public.wallets DROP CONSTRAINT wallets_pkey;
ALTER TABLE ONLY public.wallet_transactions DROP CONSTRAINT wallet_transactions_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT user_sessions_pkey;
ALTER TABLE ONLY public.usage_tracking DROP CONSTRAINT usage_tracking_pkey;
ALTER TABLE ONLY public.trial_notifications DROP CONSTRAINT trial_notifications_pkey;
ALTER TABLE ONLY public.transfers DROP CONSTRAINT transfers_pkey;
ALTER TABLE ONLY public.tickets DROP CONSTRAINT tickets_pkey;
ALTER TABLE ONLY public.ticket_responses DROP CONSTRAINT ticket_responses_pkey;
ALTER TABLE ONLY public.team_members DROP CONSTRAINT team_members_pkey;
ALTER TABLE ONLY public.tasks DROP CONSTRAINT tasks_pkey;
ALTER TABLE ONLY public.system_metrics DROP CONSTRAINT system_metrics_pkey;
ALTER TABLE ONLY public.subscriptions DROP CONSTRAINT subscriptions_pkey;
ALTER TABLE ONLY public.revenues DROP CONSTRAINT revenues_pkey;
ALTER TABLE ONLY public.receivables DROP CONSTRAINT receivables_pkey;
ALTER TABLE ONLY public.project_targets DROP CONSTRAINT project_targets_pkey;
ALTER TABLE ONLY public.plans DROP CONSTRAINT plans_pkey;
ALTER TABLE ONLY public.phone_verifications DROP CONSTRAINT phone_verifications_pkey;
ALTER TABLE ONLY public.payables DROP CONSTRAINT payables_pkey;
ALTER TABLE ONLY public.invoices DROP CONSTRAINT invoices_pkey;
ALTER TABLE ONLY public.inventory DROP CONSTRAINT inventory_pkey;
ALTER TABLE ONLY public.financial_reports DROP CONSTRAINT financial_reports_pkey;
ALTER TABLE ONLY public.costs DROP CONSTRAINT costs_pkey;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
ALTER TABLE ONLY public.brands DROP CONSTRAINT brands_pkey;
ALTER TABLE ONLY public.brand_users DROP CONSTRAINT brand_users_pkey;
ALTER TABLE ONLY public.bosta_shipments DROP CONSTRAINT bosta_shipments_pkey;
ALTER TABLE ONLY public.bosta_imports DROP CONSTRAINT bosta_imports_pkey;
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_pkey;
ALTER TABLE ONLY public.admins DROP CONSTRAINT admins_pkey;
ALTER TABLE ONLY public.admin_sessions DROP CONSTRAINT admin_sessions_pkey;
ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
DROP TABLE public.wallets;
DROP TABLE public.wallet_transactions;
DROP TABLE public.users;
DROP TABLE public.user_sessions;
DROP TABLE public.usage_tracking;
DROP TABLE public.trial_notifications;
DROP TABLE public.transfers;
DROP TABLE public.tickets;
DROP TABLE public.ticket_responses;
DROP TABLE public.team_members;
DROP TABLE public.tasks;
DROP TABLE public.system_metrics;
DROP TABLE public.subscriptions;
DROP TABLE public.revenues;
DROP TABLE public.receivables;
DROP TABLE public.project_targets;
DROP TABLE public.plans;
DROP TABLE public.phone_verifications;
DROP TABLE public.payables;
DROP TABLE public.invoices;
DROP TABLE public.inventory;
DROP TABLE public.financial_reports;
DROP TABLE public.costs;
DROP TABLE public.categories;
DROP TABLE public.brands;
DROP TABLE public.brand_users;
DROP TABLE public.bosta_shipments;
DROP TABLE public.bosta_imports;
DROP TABLE public.audit_logs;
DROP TABLE public.admins;
DROP TABLE public.admin_sessions;
DROP TABLE public._prisma_migrations;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 22672)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 48822)
-- Name: admin_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_sessions (
    id text NOT NULL,
    "adminId" text NOT NULL,
    token text NOT NULL,
    "ipAddress" text NOT NULL,
    "userAgent" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 48809)
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "loginAttempts" integer DEFAULT 0 NOT NULL,
    "lockedUntil" timestamp(3) without time zone,
    "ipWhitelist" text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 22825)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "brandId" text,
    "userId" text NOT NULL,
    action text NOT NULL,
    "tableName" text NOT NULL,
    "recordId" text,
    "oldValues" jsonb,
    "newValues" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "adminId" text
);


--
-- TOC entry 237 (class 1259 OID 41272)
-- Name: bosta_imports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bosta_imports (
    id text NOT NULL,
    "brandId" text NOT NULL,
    "fileName" text NOT NULL,
    "totalOrders" integer NOT NULL,
    "expectedCash" double precision NOT NULL,
    delivered integer NOT NULL,
    returned integer NOT NULL,
    "returnRate" double precision NOT NULL,
    "deliveryRate" double precision NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 39422)
-- Name: bosta_shipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bosta_shipments (
    id text NOT NULL,
    "trackingNumber" text NOT NULL,
    "codAmount" double precision DEFAULT 0 NOT NULL,
    "businessReference" text,
    "deliveredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bostaImportId" text NOT NULL,
    "consigneeName" text,
    "consigneePhone" text,
    "deliveryState" text NOT NULL,
    description text,
    "dropOffCity" text,
    "dropOffFirstLine" text,
    "expectedDeliveryDate" timestamp(3) without time zone,
    "isDelivered" boolean DEFAULT false NOT NULL,
    "isReturned" boolean DEFAULT false NOT NULL,
    "numberOfAttempts" integer,
    "originalCreatedAt" timestamp(3) without time zone,
    "originalUpdatedAt" timestamp(3) without time zone,
    "revenueCreated" boolean DEFAULT false NOT NULL,
    sku text,
    type text
);


--
-- TOC entry 221 (class 1259 OID 22734)
-- Name: brand_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brand_users (
    id text NOT NULL,
    "brandId" text NOT NULL,
    "userId" text NOT NULL,
    role text NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    "invitedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "acceptedAt" timestamp(3) without time zone
);


--
-- TOC entry 220 (class 1259 OID 22725)
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    "logoUrl" text,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 33233)
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    "brandId" text NOT NULL,
    name text NOT NULL,
    color text DEFAULT 'bg-blue-100 text-blue-800'::text NOT NULL,
    type text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 22767)
-- Name: costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.costs (
    id text NOT NULL,
    "brandId" text NOT NULL,
    name text NOT NULL,
    amount double precision NOT NULL,
    category text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    vendor text NOT NULL,
    "receiptUrl" text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "costType" text DEFAULT 'variable'::text NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 22817)
-- Name: financial_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_reports (
    id text NOT NULL,
    "brandId" text NOT NULL,
    "reportType" text NOT NULL,
    data jsonb NOT NULL,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 22783)
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory (
    id text NOT NULL,
    "brandId" text NOT NULL,
    "productName" text NOT NULL,
    category text NOT NULL,
    status text DEFAULT 'in-stock'::text NOT NULL,
    description text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "baseSku" text NOT NULL,
    colors text[] DEFAULT ARRAY[]::text[],
    "currentStock" integer DEFAULT 0 NOT NULL,
    location text,
    "reorderLevel" integer DEFAULT 0 NOT NULL,
    "sellingPrice" double precision DEFAULT 0 NOT NULL,
    sizes text[] DEFAULT ARRAY[]::text[],
    supplier text,
    "unitCost" double precision DEFAULT 0 NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 22716)
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "subscriptionId" text NOT NULL,
    amount double precision NOT NULL,
    currency text DEFAULT 'EGP'::text NOT NULL,
    status text NOT NULL,
    "stripeInvoiceId" text,
    "dueDate" timestamp(3) without time zone,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text,
    "invoiceNumber" text,
    "userId" text NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 22751)
-- Name: payables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payables (
    id text NOT NULL,
    "brandId" text NOT NULL,
    "entityName" text NOT NULL,
    amount double precision NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    description text,
    "invoiceNumber" text,
    "receiptUrl" text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "autoConvertToCost" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 245 (class 1259 OID 72157)
-- Name: phone_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.phone_verifications (
    id text NOT NULL,
    phone text NOT NULL,
    "otpCode" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 22698)
-- Name: plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plans (
    id text NOT NULL,
    name text NOT NULL,
    "priceMonthly" double precision NOT NULL,
    "priceYearly" double precision NOT NULL,
    features jsonb NOT NULL,
    "maxBrands" integer NOT NULL,
    "maxUsers" integer NOT NULL,
    "trialDays" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 22791)
-- Name: project_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_targets (
    id text NOT NULL,
    "brandId" text NOT NULL,
    name text NOT NULL,
    goal text NOT NULL,
    "targetPieces" integer NOT NULL,
    "currentPieces" integer DEFAULT 0 NOT NULL,
    category text NOT NULL,
    deadline timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 22743)
-- Name: receivables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receivables (
    id text NOT NULL,
    "brandId" text NOT NULL,
    "entityName" text NOT NULL,
    amount double precision NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    status text NOT NULL,
    description text,
    "invoiceNumber" text,
    "receiptUrl" text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "autoConvertToRevenue" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 22759)
-- Name: revenues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revenues (
    id text NOT NULL,
    "brandId" text NOT NULL,
    name text NOT NULL,
    amount double precision NOT NULL,
    category text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    source text NOT NULL,
    "receiptUrl" text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "bostaImportId" text,
    "bostaShipmentId" text
);


--
-- TOC entry 218 (class 1259 OID 22708)
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "planId" text NOT NULL,
    status text NOT NULL,
    "currentPeriodStart" timestamp(3) without time zone,
    "currentPeriodEnd" timestamp(3) without time zone,
    "stripeSubscriptionId" text,
    "stripeCustomerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "cancelledAt" timestamp(3) without time zone,
    "paymentMethod" text DEFAULT 'mock'::text NOT NULL,
    "trialEnd" timestamp(3) without time zone,
    "trialStart" timestamp(3) without time zone,
    "downgradedAt" timestamp(3) without time zone,
    "isTrialActive" boolean DEFAULT false NOT NULL,
    "trialDays" integer DEFAULT 0 NOT NULL,
    "trialNotificationSent" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 48830)
-- Name: system_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_metrics (
    id text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "totalUsers" integer NOT NULL,
    "totalBrands" integer NOT NULL,
    "activeSubscriptions" integer NOT NULL,
    "totalRevenue" double precision NOT NULL,
    "totalCosts" double precision NOT NULL,
    "apiCalls" integer NOT NULL,
    "errorCount" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 22800)
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id text NOT NULL,
    "brandId" text NOT NULL,
    title text NOT NULL,
    description text,
    "assignedTo" text,
    "dueDate" timestamp(3) without time zone,
    status text NOT NULL,
    priority text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category text
);


--
-- TOC entry 230 (class 1259 OID 22808)
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id text NOT NULL,
    "brandId" text NOT NULL,
    "userId" text NOT NULL,
    role text NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 242 (class 1259 OID 50950)
-- Name: ticket_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_responses (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    message text NOT NULL,
    "isInternal" boolean DEFAULT false NOT NULL,
    "isFromAdmin" boolean DEFAULT false NOT NULL,
    "authorId" text,
    "authorName" text NOT NULL,
    "authorEmail" text,
    attachments jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 50939)
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id text NOT NULL,
    "ticketId" text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    category text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'Open'::text NOT NULL,
    priority text DEFAULT 'Medium'::text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb NOT NULL,
    "assignedToId" text,
    "userId" text,
    "resolvedAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 22775)
-- Name: transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transfers (
    id text NOT NULL,
    "brandId" text NOT NULL,
    type text NOT NULL,
    "fromLocation" text,
    "toLocation" text NOT NULL,
    quantity integer NOT NULL,
    description text,
    "transferDate" timestamp(3) without time zone NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deductFromStock" boolean DEFAULT false NOT NULL,
    "inventoryItemId" text
);


--
-- TOC entry 244 (class 1259 OID 69718)
-- Name: trial_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trial_notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    "subscriptionId" text NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 53417)
-- Name: usage_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage_tracking (
    id text NOT NULL,
    "userId" text NOT NULL,
    "brandId" text NOT NULL,
    "resourceType" text NOT NULL,
    "currentCount" integer DEFAULT 0 NOT NULL,
    "limit" integer DEFAULT '-1'::integer NOT NULL,
    "lastUpdated" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 216 (class 1259 OID 22690)
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 22681)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "googleId" text,
    picture text
);


--
-- TOC entry 234 (class 1259 OID 22993)
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_transactions (
    id text NOT NULL,
    "brandId" text NOT NULL,
    "walletId" text,
    type text NOT NULL,
    "fromWalletId" text,
    "toWalletId" text,
    amount double precision NOT NULL,
    description text,
    date timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category text,
    "countAsCost" boolean DEFAULT false NOT NULL,
    "countAsRevenue" boolean DEFAULT false NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 22982)
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    id text NOT NULL,
    "brandId" text NOT NULL,
    name text NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    type text NOT NULL,
    currency text DEFAULT 'EGP'::text NOT NULL,
    color text DEFAULT 'bg-gradient-to-br from-gray-800 to-gray-900'::text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 4015 (class 0 OID 22672)
-- Dependencies: 214
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4c1362ea-d5b8-4ca3-ad7a-c315ffe6b0e5	b61965200235df34a42e2ed9bb1fe4d41a736eed0ae7bfa0c16f7fe47aeb3c87	2025-08-30 12:09:14.084142+03	20250826104052_masareefy	\N	\N	2025-08-30 12:09:14.059238+03	1
44ef5f5a-1e31-465c-a594-a451590a7272	0dd8a7ab3bcc5e086ceba709e11466d65f67728af1c78d752638875afe7272af	2025-08-30 12:09:14.086467+03	20250826110118_masareefy	\N	\N	2025-08-30 12:09:14.084435+03	1
972271ba-0780-4a55-a92c-d14a1a46d3e3	015fa3b174dcab22b708df5e86a08ce46bde2f9878674e2d831a4238cdedbd2e	2025-09-05 16:43:46.684493+03	20250905134346_replace_bosta_api_with_xlsx_import	\N	\N	2025-09-05 16:43:46.664774+03	1
965b3291-7b93-43e1-95aa-3b3e886ee9dc	4d2abd437430a5f91a845e21f3ae47fd3e3f0fc58e170b550aae9505b168a49b	2025-08-30 12:09:14.090914+03	20250827141450_add_wallet_tables	\N	\N	2025-08-30 12:09:14.08678+03	1
64719b3e-e7c8-4a34-8409-46c66928bb6a	9c4d41cea369d512b971ba6d42cbf1a9081c43d0d7ab85371350ac835b382113	2025-08-30 15:45:03.138643+03	20250830124503_add_wallet_transaction_fields	\N	\N	2025-08-30 15:45:03.135647+03	1
21a41f78-521a-4462-b858-f7a7d5e2f9fb	daffc652f080dedcac59ed213e37e39a3cb3d926a708814799265c589b1d9d4a	2025-08-30 17:07:54.74039+03	20250830140754_update_inventory_schema	\N	\N	2025-08-30 17:07:54.73736+03	1
3afe853c-392d-45f6-a054-107e40ed587e	01fc00a0851987056cc7de2a55adf4e5096ab8dfd903233bb00ee374389172cf	2025-09-05 16:58:45.241116+03	20250905135845_add_bosta_revenue_linking	\N	\N	2025-09-05 16:58:45.237401+03	1
ecbaa9d7-e98f-40a8-8600-922c37b0e3cc	0de93d2f41c678751b237e3dd1e93306c9d6d6d37b54303eaa2dbe36865732cd	2025-08-30 17:39:12.526175+03	20250830143912_add_category_to_tasks	\N	\N	2025-08-30 17:39:12.523032+03	1
eae1a30d-ce45-4764-a59a-0e6aa2c3b6ba	23023dae7aa3bda3f80720d540b3e9b0caf493b923d17e2bc9453e26d74e1fd2	2025-08-30 19:21:11.925464+03	20250830162111_update_currency_to_egp	\N	\N	2025-08-30 19:21:11.923368+03	1
d4af05cd-2680-4b19-9f11-c13e0945bc5d	f797cac2045cef38e8a17bc1ec18889355937b87a29486748ea86a674734a4ba	2025-08-30 22:26:51.70904+03	20250830192651_add_google_oauth_fields	\N	\N	2025-08-30 22:26:51.703704+03	1
21cead63-6349-4c50-a87d-41bafa21e95c	350e5a1c69656ffb21535db3bdb08337dea293ad3078069530b94da4f9857085	2025-09-06 20:47:23.794975+03	20250906174723_admin_migration	\N	\N	2025-09-06 20:47:23.777666+03	1
59403a47-d317-4700-806f-753587a7f2d8	90e978fee81918e4adf66516a1b7305867722486a258b37666d78b0d93ee3ce2	2025-09-04 02:11:28.466083+03	20250903231128_add_categories_table	\N	\N	2025-09-04 02:11:28.43211+03	1
94e7b737-390d-4480-a899-f502fbd5ffd4	da93ac6c886b107d78c860ae5c54e4dce0ca541f3f3af59c72c4e68e70f55dea	2025-09-04 12:44:12.208943+03	20250904094412_add_cost_type_field	\N	\N	2025-09-04 12:44:12.207558+03	1
29eae888-1640-45e2-aefd-e780d0271c21	055d765c05f1112dee37e9c79dcdc4eb373401b9a43393f9057e0cc7b8be1011	2025-09-04 13:02:37.941383+03	20250904100237_add_auto_convert_fields	\N	\N	2025-09-04 13:02:37.939527+03	1
479ce3e2-89a7-43bc-a326-c3cdcbd89d2b	1c986e5624abde4fff74eb64e4d9e63b18bf5380460521d055f4d6bc638469b7	2025-09-07 02:08:07.857611+03	20250906230807_add_ticket_system	\N	\N	2025-09-07 02:08:07.83935+03	1
dbb50b9d-8eed-4654-a6fb-68a7e9e6005c	5ffd0e39ad74115a7f3e5f1d523b18a58e7e080c1d7dea44e27e3169aa0bd711	2025-09-04 13:50:45.278808+03	20250904105045_add_inventory_fields_to_transfers	\N	\N	2025-09-04 13:50:45.275459+03	1
6262ef57-40f0-4fa9-9646-14e1bb959c0e	9d8dc1dae9d5adbda50b220bae9f0904e3c409b977078953c49d98f1d87c09bd	2025-09-05 15:55:57.661239+03	20250905125557_add_bosta_integration	\N	\N	2025-09-05 15:55:57.645893+03	1
801c1348-da47-48c5-a659-4f5eed0e6177	cd2f75c7915e01b876d13af0d64443c047fce6e6aea2195e0ed77de12ea152da	2025-09-08 16:33:18.384646+03	20250908133318_add_usage_tracking	\N	\N	2025-09-08 16:33:18.370346+03	1
e1fc4001-4cf8-4f42-8eeb-852feb2ada94	c6c031fd50b7fc92fdecba6701f68e6af7f2d34444cf5a214393452fe2dcde0b	2025-09-18 11:14:42.805243+03	20250918081442_add_trial_tracking	\N	\N	2025-09-18 11:14:42.791994+03	1
1f242eb8-1201-4d12-8b85-588ace7589e2	77d2635c64c5997cd8293ee1853db8471afb52984de6f22bde40c3721bf4c817	2025-09-18 14:12:52.004646+03	20250918111251_add_phone_verification	\N	\N	2025-09-18 14:12:51.999606+03	1
\.


--
-- TOC entry 4040 (class 0 OID 48822)
-- Dependencies: 239
-- Data for Name: admin_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_sessions (id, "adminId", token, "ipAddress", "userAgent", "expiresAt", "createdAt") FROM stdin;
cmf8krs0w0001u04spleazmbq	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4MTk2MiwiZXhwIjoxNzU3MjEwNzYyfQ.RAKhnU3HE4C0BMncajDE7ee7ylFhmCRCZVPaIrLHQlg	test	test	2025-09-07 02:06:02.911	2025-09-06 18:06:02.912
cmf8kvoi80005u04s3i3xgo3n	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4MjE0NCwiZXhwIjoxNzU3MjEwOTQ0fQ.M4SCx7pFaNx-6BEclC1D8D7UjfbBEOU0DNK2lagJ-zI	test	test	2025-09-07 02:09:04.975	2025-09-06 18:09:04.976
cmf8lifcb0001civsc0p5mx7n	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4MzIwNiwiZXhwIjoxNzU3MjEyMDA2fQ.sKNHNJX2rf8bqWigx_XX4yKwuHsCedOLIk6yFwZLvyM	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-07 02:26:46.186	2025-09-06 18:26:46.187
cmf8lik9t0005civsxq5ow4bs	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4MzIxMiwiZXhwIjoxNzU3MjEyMDEyfQ.1FJZUq0bJ2rIaOWY8Il1h71sLPN6jGabx8L6savRDTY	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-07 02:26:52.577	2025-09-06 18:26:52.577
cmf8lmv3i0009civsywcp1tb9	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4MzQxMywiZXhwIjoxNzU3MjEyMjEzfQ.R-v-J7dH939O1U4SV91u82w3cC-RoITsOwQCtXB9LWQ	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-07 02:30:13.23	2025-09-06 18:30:13.23
cmf8lnd7q000dcivs9s948dfr	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4MzQzNiwiZXhwIjoxNzU3MjEyMjM2fQ.zwt8R_K08m90v8KM2jNE7biSEGJhE97akeitCGMiF00	127.0.0.1	test	2025-09-07 02:30:36.71	2025-09-06 18:30:36.71
cmf8lt6xj00011fesdzucy4kv	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4MzcwOCwiZXhwIjoxNzU3MjEyNTA4fQ.elNlOGdTdSwGckY1FdfdZUuaN2KmflJKGiVc0ucJfzg	127.0.0.1	test	2025-09-07 02:35:08.502	2025-09-06 18:35:08.503
cmf8lte0p00031fesjyih3pmz	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4MzcxNywiZXhwIjoxNzU3MjEyNTE3fQ._rgDidJnVtvxnLq60v4wO71lI7HbZ5wUyIWjJ1Zqs2c	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-07 02:35:17.689	2025-09-06 18:35:17.69
cmf8m0nyd0001chwoleza0hiy	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4NDA1NywiZXhwIjoxNzU3MjEyODU3fQ.ZTJPrA0y4_E1bx9Q-VTb1jeRnHJMlf9LoUDcnUVRaNI	127.0.0.1	test	2025-09-07 02:40:57.157	2025-09-06 18:40:57.158
cmf8m0ym10003chwoq3r5ny0z	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4NDA3MCwiZXhwIjoxNzU3MjEyODcwfQ.UDyOBcuYdSCXFVYtpj9oPFjg5aXeLCKgX0jhcSJiJa4	127.0.0.1	test	2025-09-07 02:41:10.968	2025-09-06 18:41:10.969
cmf8m44ge0001fhcosa9illow	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzE4NDIxOCwiZXhwIjoxNzU3MjEzMDE4fQ.BhRq2wJ0_100VVBBgxBUuPfLaj4okKijotw5WvHWdA4	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-07 02:43:38.51	2025-09-06 18:43:38.51
cmf8vty3f0003m02cd9law7cv	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzIwMDUzOSwiZXhwIjoxNzU3MjI5MzM5fQ.tXtZDUiUvGPR24zm6O1TrJjGMD9tHPMkM1A9E71huUE	::ffff:127.0.0.1	curl/8.1.2	2025-09-07 07:15:39.866	2025-09-06 23:15:39.867
cmf8vx55u0005m02c1hxkz0km	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzIwMDY4OCwiZXhwIjoxNzU3MjI5NDg4fQ.U4PI3VUQubwodx1TVzvvqF4qOEzF7gnWWXx2wJbTG7A	::ffff:127.0.0.1	curl/8.1.2	2025-09-07 07:18:08.993	2025-09-06 23:18:08.994
cmf8xps7i000310evxn8o684f	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzIwMzcwNCwiZXhwIjoxNzU3MjMyNTA0fQ.wlmmC6L8TgTLqiumJUbaQtbhfnz2MILlTg5u41WiJ9U	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-07 08:08:24.845	2025-09-07 00:08:24.846
cmf8xtgb1000510evmf3uw74y	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzIwMzg3NiwiZXhwIjoxNzU3MjMyNjc2fQ.av_y24bxZYVSPeiyyrkR5SqcRUwEIU4Fdw3yxTwtPww	::ffff:127.0.0.1	curl/8.1.2	2025-09-07 08:11:16.044	2025-09-07 00:11:16.046
cmf9kwtg20001b33q8lfmdawq	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzI0MjY2NCwiZXhwIjoxNzU3MjcxNDY0fQ.-pvSE_TbT2XjTIvwEon0K9ao9tzl2pFeK8PXF1EIjg0	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-07 18:57:44.209	2025-09-07 10:57:44.21
cmfb6afed0003ffv68d1b0w8e	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzMzOTAzNywiZXhwIjoxNzU3MzY3ODM3fQ.tuNELeLodgkPPzTuX9t_PQ5aI2EyKmg3CB09m6i1SAI	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-08 21:43:57.3	2025-09-08 13:43:57.301
cmfiokg6p0009r9g1zzfbu6un	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1Nzc5MzAwMSwiZXhwIjoxNzU3ODIxODAxfQ.ma6kF8cWO7yirSdoYnq2-8Ocaaz2IjkK2mtdNWEUdwQ	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-14 03:50:01.2	2025-09-13 19:50:01.201
cmfjf0nsg0009culispkaug5v	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzgzNzQyNywiZXhwIjoxNzU3ODY2MjI3fQ.BbzkZUSuepZaE4ssSceGhokk0HLblJLhjHRFFN_grlM	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-14 16:10:27.567	2025-09-14 08:10:27.568
cmfjf5h9j000510uv9l6jxxmr	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1NzgzNzY1MiwiZXhwIjoxNzU3ODY2NDUyfQ.l341YmCjbcKM-Onley7sxbAnQqpXg24rnav4dVmCrhU	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-14 16:14:12.39	2025-09-14 08:14:12.391
cmfpdr8690009e4yrgw70t7se	cmf8k5a9q0000qwshuraovgh5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiY21mOGs1YTlxMDAwMHF3c2h1cmFvdmdoNSIsImlhdCI6MTc1ODE5ODEwNCwiZXhwIjoxNzU4MjI2OTA0fQ.KvAlullQjPJLivhaNOQgypuUxTxIW4skg64DRQ6PqZg	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	2025-09-18 20:21:44.865	2025-09-18 12:21:44.866
\.


--
-- TOC entry 4039 (class 0 OID 48809)
-- Dependencies: 238
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, email, "passwordHash", "firstName", "lastName", role, permissions, "isActive", "lastLoginAt", "loginAttempts", "lockedUntil", "ipWhitelist", "createdAt", "updatedAt") FROM stdin;
cmf8k5a9q0000qwshuraovgh5	admin@admin.com	$2b$12$TLM1mMpJ.K6oPgRi6.B1W.NuIMO6N5HSeNFw4jYp3D1lMi818bLw6	Admin	User	super_admin	["users.read", "users.write", "users.delete", "brands.read", "brands.write", "brands.delete", "subscriptions.read", "subscriptions.write", "subscriptions.delete", "analytics.read", "system.read", "system.write", "security.read", "security.write", "security.delete", "tickets.read", "tickets.write", "tickets.delete"]	t	2025-09-18 12:21:44.853	0	\N	{}	2025-09-06 17:48:33.471	2025-09-18 12:21:44.854
\.


--
-- TOC entry 4033 (class 0 OID 22825)
-- Dependencies: 232
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "brandId", "userId", action, "tableName", "recordId", "oldValues", "newValues", "createdAt", "adminId") FROM stdin;
\.


--
-- TOC entry 4038 (class 0 OID 41272)
-- Dependencies: 237
-- Data for Name: bosta_imports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bosta_imports (id, "brandId", "fileName", "totalOrders", "expectedCash", delivered, returned, "returnRate", "deliveryRate", "processedAt", "createdAt", "updatedAt") FROM stdin;
cmfilg6bp002obflp251q0tkx	cmfb4v2en0003zl8n346klzlu	Bosta Import	50	8140	9	12	57.14285714285714	42.85714285714285	2025-09-13 18:22:42.948	2025-09-13 18:22:42.949	2025-09-13 18:22:42.949
\.


--
-- TOC entry 4037 (class 0 OID 39422)
-- Dependencies: 236
-- Data for Name: bosta_shipments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bosta_shipments (id, "trackingNumber", "codAmount", "businessReference", "deliveredAt", "createdAt", "updatedAt", "bostaImportId", "consigneeName", "consigneePhone", "deliveryState", description, "dropOffCity", "dropOffFirstLine", "expectedDeliveryDate", "isDelivered", "isReturned", "numberOfAttempts", "originalCreatedAt", "originalUpdatedAt", "revenueCreated", sku, type) FROM stdin;
cmfilg6bx002qbflp8cz0pq45	10031767	1760	566a06-f6:#3482	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Abdelrhman tamer	+201070328901	created	Products:\n title: Black Jacket-Cropped Fit - L - quantity: 1 - sku: BO-1482084\ntitle: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Cairo	مدينة العبور الحي التاسع بلوك ١٨٠٠٨ عمارة ٨, Obour	\N	f	f	\N	\N	2025-09-13 13:35:11	f	\N	\N
cmfilg6by002sbflp7z903gwt	10237105	0	566a06-f6:#3452	2025-09-06 22:16:34	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Youssef mahmoud	+201220570956	returned	BostaSKU:BO-1691841 - quantity:1  -  itemPrice:575.00	Cairo	القاهره مدينة السلام دلتا واحد عماره 39, Cairo	\N	f	t	\N	\N	2025-09-06 23:05:00	f	\N	\N
cmfilg6by002ubflpujuztvwm	11101033	0	566a06-f6:#3438	2025-08-25 19:14:27	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Omar Ragab	+201018959801	returned	BostaSKU:BO-1747465 - quantity:1  -  itemPrice:1150.00	Dakahlia	شارع احمد ماهر - تقسيم خطاب - شارع ٥ -عماره ١٥, Mansoura	\N	f	t	\N	\N	2025-08-25 20:54:15	f	\N	\N
cmfilg6by002wbflpfun0vem8	12893148	1760	566a06-f6:#3474	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Moaz Mamdouh	+201279119108	received at warehouse	Products:\n title: Light grey Jacket-Cropped fit - L - quantity: 1 - sku: BO-1482087\ntitle: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Cairo	مدينة الرحاب، الرحاب، القاهرة الجديدة	\N	f	f	\N	\N	2025-09-13 16:52:14	f	\N	\N
cmfilg6by0032bflpfnkwdotk	18099996	910	566a06-f6:#3471	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Farida yasser Yasser	+201027081855	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Cairo	مدينة الفردوس، شارع أبو بكر الصدق، عمارة 11ز، gmb beauty salon sugar، مدينة 6 أكتوبر	\N	f	f	\N	\N	2025-09-13 16:52:26	f	\N	\N
cmfilg6by0034bflpjeo8zeji	2095133	910	566a06-f6:#3472	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	aly abdelrahman	+201065456839	received at warehouse	Products:\n title: Light grey Jacket-Cropped fit - M - quantity: 1 - sku: BO-1482086	Cairo	ذا سكوير، القاهرة	\N	f	f	\N	\N	2025-09-13 16:52:35	f	\N	\N
cmfilg6by0036bflpejpe6y3j	26335277	60	566a06-f6:#3458	2025-09-08 22:33:09	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Mohamed Essam	+201069881273	returned	BostaSKU:BO-1567610 - quantity:1  -  itemPrice:1200	Behira	سيدي شحاته - مسجد بدر الدين, Kafr El-Dawar	\N	f	t	\N	\N	2025-09-08 23:51:21	f	\N	\N
cmfilg6bz0038bflpne3695fd	26976001	0		2025-09-07 21:21:04	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Yahia Mahmoud	+201127589723	returned	BostaSKU:BO-1597104 - quantity:1  -  itemPrice:550	Giza	الوراق شركه الغاز	\N	f	t	\N	\N	2025-09-08 00:18:32	f	\N	\N
cmfilg6bz003abflpczv6xcwa	2725424	910	566a06-f6:#3483	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Yussuf Ibrahim	+201097082050	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - L - quantity: 1 - sku: BO-1482084	Cairo	عمارة ١٥٠ حي ٣/٤ التجمع الخامس بجوار ارابيلا و المهعد, Cairo	\N	f	f	\N	\N	2025-09-13 17:12:42	f	\N	\N
cmfilg6bz003cbflpbz2y04i2	27274931	0	566a06-f6:#3450	2025-09-04 21:17:11	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Abdelrahman Ahmed	+201204906777	returned	BostaSKU:BO-1567527 - quantity:1  -  itemPrice:600.00	El Kalioubia	شارع دار النعمه المتفرع من احمد عرابي بجوار شارع الانتاج, شبرا الخيمه	\N	f	t	\N	\N	2025-09-04 21:49:00	f	\N	\N
cmfilg6bz003ebflpwptw2pe4	28466954	910	566a06-f6:#3469	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Farah Abdeen	+201000674461	received at warehouse	Products:\n title: Light grey Jacket-Cropped fit - M - quantity: 1 - sku: BO-1482086	Alexandria	٦ حسين أحمد رشاد خلف بيت بيتزا، شارع مصدق، شقة ٥، الطابق الثاني، الدقي	\N	f	f	\N	\N	2025-09-13 16:52:25	f	\N	\N
cmfilg6bz003gbflp9lyadnff	31537511	910	566a06-f6:#3462	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Karim Ahmed	+201128710004	created	Products:\n title: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Cairo	٤٨ شارع ترعه الجندي حدايق القبه, Cairo	\N	f	f	\N	\N	2025-09-13 13:35:11	f	\N	\N
cmfilg6bz003ibflp7say1ule	33559509	1760	566a06-f6:#3480	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Abdelrhman tamer	+201070328901	created	Products:\n title: Black Jacket-Cropped Fit - M - quantity: 2 - sku: BO-1482081	Cairo	مدينة العبور الحي التاسع بلوك ١٨٠٠٨ عمارة ٨, Obour	\N	f	f	\N	\N	2025-09-13 13:35:11	f	\N	\N
cmfilg6bz003mbflpykkfrye3	37948884	0	566a06-f6:#3460	2025-09-09 23:19:48	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Ahmed Adel	+201157057130	returned	BostaSKU:BO-1567528 - quantity:1  -  itemPrice:600.00	Cairo	الشروق - دار مصر - المرحله الاولي - عماره ٤٤ - شقه ١٨, القاهره	\N	f	t	\N	\N	2025-09-09 23:48:35	f	\N	\N
cmfilg6c0003obflplgf9x2l0	39542860	0	566a06-f6:#3468	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	ziad mahmoud	+201154027089	received at warehouse	Products:\n title: Light grey Jacket-Cropped fit - M - quantity: 1 - sku: BO-1482086	Giza	31 شارع الفادي متفرع من دكتور لاشين المريوطية فيصل, فيصل	\N	f	f	\N	\N	2025-09-13 17:03:26	f	\N	\N
cmfilg6c0003qbflpn23wi5d0	40273510	0	566a06-f6:#3444	2025-08-28 20:03:33	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Yahia Mahmoud	+201127589723	returned	BostaSKU:BO-1567527 - quantity:1  -  itemPrice:600.00	Giza	الوراق, الجيزه	\N	f	t	\N	\N	2025-08-28 20:52:43	f	\N	\N
cmfilg6c0003sbflp4wvc6znl	41819567	1760	566a06-f6:#3475	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Ehab Tarek	+201023064511	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - L - quantity: 1 - sku: BO-1482084\ntitle: Light grey Jacket-Cropped fit - L - quantity: 1 - sku: BO-1482087	Giza	الجيزه سته اكتوبر سكن مصر ال 800 فدان علي طريق الواحات, سته اكتوبر	\N	f	f	\N	\N	2025-09-13 17:10:31	f	\N	\N
cmfilg6c0003wbflp7rrc09zv	43227810	980		\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Abdelrhman emad	+201203335941	created		Cairo	الرحاب ١ مجموعه ٧١ عماره ١٠ الدور التاني شقه ٢٤, El rehab	\N	f	f	\N	\N	2025-09-13 13:35:11	f	\N	\N
cmfilg6c00040bflpvxmurrvp	45610981	910	566a06-f6:#3476	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Omar Khalil	+201113654455	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - L - quantity: 1 - sku: BO-1482084	Cairo	التجمع الخامس الحي الخامس المنطقة الرابعة شارع ٢٨ عمارة ٢١٧ الدور الثاني شقة ٧, New Cairo	\N	f	f	\N	\N	2025-09-13 17:31:05	f	\N	\N
cmfilg6c10044bflprb9747nx	48199545	0	566a06-f6:#3451	2025-09-09 08:54:10	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Youssef mahmoud	+201220570956	delivered	BostaSKU:BO-1691843 - quantity:1  -  itemPrice:575.00	Cairo	القاهره مدينة السلام دلتا واحد عماره 39, Cairo	\N	t	f	\N	\N	2025-09-09 16:21:04	f	\N	\N
cmfilg6c10046bflp3yuvmeg9	49911848	0	566a06-f6:#3488	2025-09-11 23:02:26	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	محمد سعد	+201025948370	returned	BostaSKU:BO-1567528 - quantity:1  -  itemPrice:600.00	Bani Suif	بني سويف مركز سمسطا قريه بدهل, سمسطا	\N	f	t	\N	\N	2025-09-11 23:48:26	f	\N	\N
cmfilg6c10048bflpkktyzcn6	50461055	910	566a06-f6:#3464	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Fared Ezz	+201006107509	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Sharqia	المنشية بفاقوس امام مدرسة الصنايع بنات, فاقوس	\N	f	f	\N	\N	2025-09-13 16:52:06	f	\N	\N
cmfilg6c1004abflpcxo14yme	52553199	910	566a06-f6:#3465	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	maryam hatim	+201032595717	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Cairo	مدينتي B12 مجموعة 121 مبنى 62، القاهرة الجديدة الثانية	\N	f	f	\N	\N	2025-09-13 16:53:45	f	\N	\N
cmfilg6c1004cbflpaxff1gyf	54492416	1210	566a06-f6:#3459	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	karim elnemr	+201092863517	in_progress	BostaSKU:BO-1747464 - quantity:1  -  itemPrice:1150.00	Cairo	Al Marasem Development, Fifth Square Compound, القاهرة	\N	f	f	\N	\N	2025-09-09 20:49:24	f	\N	\N
cmfilg6c1004ebflpixpiso4x	55252547	910	566a06-f6:#3470	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Ibrahim Khalil	+201096862378	received at warehouse	Products:\n title: Light grey Jacket-Cropped fit - L - quantity: 1 - sku: BO-1482087	Monufia	طريق كفر عليم شارع عبدالسلام عارف بجوار سيراميك ميدو, بركة السبع	\N	f	f	\N	\N	2025-09-13 17:57:03	f	\N	\N
cmfilg6c1004gbflpahdz8mn2	58115194	910	566a06-f6:#3481	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Zaid Said	+201228825899	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - L - quantity: 1 - sku: BO-1482084	Cairo	القلوبية الشارع الجديد جامع سلامه بصيله, Sobra	\N	f	f	\N	\N	2025-09-13 16:52:34	f	\N	\N
cmfilg6c2004ibflp0w2jdrl1	60418471	1760	566a06-f6:#3463	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Laila Ahmed	+201122638847	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - L - quantity: 1 - sku: BO-1482084\ntitle: Light grey Jacket-Cropped fit - L - quantity: 1 - sku: BO-1482087	Cairo	القاهرة، مدينتي، ب10، مجموعة 102، مبنى 27، الطابق 2، الشقة 22، مدينتي	\N	f	f	\N	\N	2025-09-13 16:52:17	f	\N	\N
cmfilg6c2004kbflp9kwjrj1o	62307841	910	566a06-f6:#3477	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Mohamed Ahmed	+201094038012	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Cairo	المرج الجديده _ القلج _ مدرسه جمال الدين, القاهره	\N	f	f	\N	\N	2025-09-13 17:00:56	f	\N	\N
cmfilg6c2004mbflpoymocfh3	63389574	50	566a06-f6:#2067	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Abdelrahman Amr	+201507601232	created	BostaSKU:BO-1567614 - quantity:1 -  itemPrice:1200	Cairo	91 gesr Al suez, beside Al qubaisy , entrance number 2 , 5th floor ., Cairo	\N	f	f	\N	\N	2025-09-13 13:35:11	f	\N	\N
cmfilg6c2004obflprna93raq	66624821	910	566a06-f6:#3479	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Dana Tamer	+201284273388	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Sharqia	الشرقيه الزقازيق امام مستشفي الاحرار اعلي بي ام للادوات الطبيه, Sharqia	\N	f	f	\N	\N	2025-09-13 16:53:41	f	\N	\N
cmfilg6c2004qbflpcvpxlbwi	68432232	0	566a06-f6:#3455	2025-09-07 21:19:25	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Marach Mabado	+201126442269	returned	BostaSKU:BO-1567527 - quantity:1  -  itemPrice:600.00	Cairo	عين شمس، القاهرة	\N	f	t	\N	\N	2025-09-08 00:06:54	f	\N	\N
cmfilg6c2004sbflpdhcemo8a	69856537	0	566a06-f6:#3446	2025-08-31 22:59:19	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Yahia Mahmoud	+201127589726	returned	BostaSKU:BO-1597104 - quantity:1  -  itemPrice:600.00	Giza	الوراق, الوراق	\N	f	t	\N	\N	2025-09-01 00:07:29	f	\N	\N
cmfilg6c2004ubflpuu25koih	69911208	910	566a06-f6:#3478	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Nada Mohamed	+201096264323	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Menya	المنيا ابو فليو, Minya	\N	f	f	\N	\N	2025-09-13 16:52:23	f	\N	\N
cmfilg6c3004ybflpa1o39lmy	75573336	910	566a06-f6:#3484	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Fouad Moutaz	+201153592163	ready to dispatch	Products:\n title: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Cairo	مدينة نصر، القاهرة	\N	f	f	\N	\N	2025-09-13 18:03:28	f	\N	\N
cmfilg6c30050bflp56ma1iwl	78362534	910	566a06-f6:#3466	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Ayham AlQerbi	+201107250264	created	Products:\n title: Light grey Jacket-Cropped fit - M - quantity: 1 - sku: BO-1482086	Cairo	مدينتي b8 group 83 مبنى 42 شقة 12، القاهرة	\N	f	f	\N	\N	2025-09-13 13:35:11	f	\N	\N
cmfilg6c30052bflp60aytpd2	80784662	1210		\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	عاصم عمر علي	+201115989493	deleted	BostaSKU:BO-1567617 - quantity:1  -  itemPrice:1200	Fayoum	محافظه الفيوم مركز يوسف الصديق قرية الشيخ سليمان	\N	f	f	\N	\N	2025-08-27 16:24:31	f	\N	\N
cmfilg6c30054bflpxeli5nup	81279268	1210		\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	عاصم عمر علي	+201115989493	deleted	BostaSKU:BO-1567617 - quantity:1  -  itemPrice:1200	Cairo	القاهره المقطم شارع هدى شعراوي قطعه 9088 بجوار مطعم ابو انس السوري	\N	f	f	\N	\N	2025-08-30 11:00:41	f	\N	\N
cmfilg6c30056bflp827iobm6	83142027	910	566a06-f6:#3467	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Saad Alrouh	+201024247665	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - M - quantity: 1 - sku: BO-1482081	Giza	الشيخ زايد-كومباوند بيفرلى هيلز-عمارة ٢٦٣-شقة ٢١, Sheikh Zayed	\N	f	f	\N	\N	2025-09-13 16:52:23	f	\N	\N
cmfilg6c40058bflphsk7hjbn	84615692	1760	566a06-f6:#3473	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Alaa السيد	+201065729130	received at warehouse	Products:\n title: Light grey Jacket-Cropped fit - L - quantity: 1 - sku: BO-1482087\ntitle: Black Jacket-Cropped Fit - L - quantity: 1 - sku: BO-1482084	Ismailia	بنزينه توتال الدائري امام البوابة الجانبية لمدرسه السلام الرسمية للغات, اسماعيليه	\N	f	f	\N	\N	2025-09-13 16:52:28	f	\N	\N
cmfilg6c4005abflpekqrz18a	85821404	0	566a06-f6:#3442	2025-08-24 20:11:25	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Moaz Sayed	+201289394472	returned	BostaSKU:BO-1567527 - quantity:1  -  itemPrice:600.00	Ismailia	البوليس الدولي فيلا ٤٠٣/٢, Ismilia	\N	f	t	\N	\N	2025-08-24 23:08:24	f	\N	\N
cmfilg6c4005ebflp3zo3r7qf	89594112	0	566a06-f6:#3445	2025-09-08 22:32:57	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Fawzi Sarhan	+201119277520	returned	BostaSKU:BO-1567527 - quantity:2  -  itemPrice:600.00 \nBostaSKU:BO-1747465 - quantity:1  -  itemPrice:1150.00	Aswan	عزبه الطويل في البصيليه  الوسطي, عزبه الطويل في البصيليه الوسطي	\N	f	t	\N	\N	2025-09-08 23:51:30	f	\N	\N
cmfilg6c4005gbflp760aewi4	9664837	910	566a06-f6:#3485	\N	2025-09-13 18:22:42.958	2025-09-13 18:22:42.958	cmfilg6bp002obflp251q0tkx	Hesham Fawzy	+201060994216	received at warehouse	Products:\n title: Black Jacket-Cropped Fit - L - quantity: 1 - sku: BO-1482084	Cairo	أبو قير 293 - سبورتنج، الإسكندرية	\N	f	f	\N	\N	2025-09-13 16:52:41	f	\N	\N
cmfilg6by002ybflpkr7hoc5u	15439497	1210	566a06-f6:#3456	2025-09-06 09:45:40	2025-09-13 18:22:42.958	2025-09-13 18:22:43.012	cmfilg6bp002obflp251q0tkx	Abdelrahman Mohamed	+201111389454	delivered	BostaSKU:BO-1747465 - quantity:1  -  itemPrice:1150.00	Giza	الحي الاول المجاورة ٢ شارع شادي هاوس عماره ٢٩٨, ٦اكتوبر	\N	t	f	\N	\N	2025-09-06 18:20:53	t	\N	\N
cmfilg6by0030bflp16s10r2w	15825644	1210	566a06-f6:#3458	2025-09-06 13:22:33	2025-09-13 18:22:42.958	2025-09-13 18:22:43.012	cmfilg6bp002obflp251q0tkx	Mohamed Essam	+201069881273	delivered	BostaSKU:BO-1747465 - quantity:1  -  itemPrice:1150.00	Behira	سيدي شحاته - مسجد بدر الدين, Kafr El-Dawar	\N	t	f	\N	\N	2025-09-06 17:07:11	t	\N	\N
cmfilg6bz003kbflp4arxo2db	35756392	660	566a06-f6:#3454	2025-09-04 14:09:08	2025-09-13 18:22:42.958	2025-09-13 18:22:43.012	cmfilg6bp002obflp251q0tkx	Belal Mahmoud	+201090532231	delivered	BostaSKU:BO-1597105 - quantity:1  -  itemPrice:600.00	Giza	جزيرة محمد الوحده الصحيه شارع البنزينه, الوراق	\N	t	f	\N	\N	2025-09-04 19:50:28	t	\N	\N
cmfilg6c0003ubflpypp9xkrg	41880898	660	566a06-f6:#3448	2025-09-02 12:46:16	2025-09-13 18:22:42.958	2025-09-13 18:22:43.012	cmfilg6bp002obflp251q0tkx	adham waleed	+201027974207	delivered	BostaSKU:BO-1567528 - quantity:1  -  itemPrice:600.00	Cairo	17 شاهين حلمية الزيتون، القاهرة	\N	t	f	\N	\N	2025-09-02 18:51:26	t	\N	\N
cmfilg6c0003ybflp5fkwmxem	43411209	660	566a06-f6:#3447	2025-08-30 11:26:05	2025-09-13 18:22:42.958	2025-09-13 18:22:43.012	cmfilg6bp002obflp251q0tkx	Carlos Tawfik	+201210433863	delivered	BostaSKU:BO-1567527 - quantity:1  -  itemPrice:600.00	Cairo	التجمع الخامس، نرجس 2، القاهرة الجديدة	\N	t	f	\N	\N	2025-08-30 17:08:28	t	\N	\N
cmfilg6c00042bflpdyab04ud	48050215	660	566a06-f6:#3457	2025-09-06 12:45:35	2025-09-13 18:22:42.958	2025-09-13 18:22:43.012	cmfilg6bp002obflp251q0tkx	Mostafa Shalaby	+201011099777	delivered	BostaSKU:BO-1597105 - quantity:1  -  itemPrice:600.00	Giza	حدائق المهندسين، الشيخ زايد	\N	t	f	\N	\N	2025-09-06 14:50:00	t	\N	\N
cmfilg6c3004wbflp6eptjmd3	70880418	1210	566a06-f6:#3461	2025-09-09 15:02:44	2025-09-13 18:22:42.958	2025-09-13 18:22:43.012	cmfilg6bp002obflp251q0tkx	Hassan mohammed	+201558572006	delivered	BostaSKU:BO-1747466 - quantity:1  -  itemPrice:1150.00	Cairo	شارع حموده الخطيب, السنطه	\N	t	f	\N	\N	2025-09-10 07:04:54	t	\N	\N
cmfilg6c4005cbflpyb9v98bs	8631410	660	566a06-f6:#3449	2025-09-03 10:45:35	2025-09-13 18:22:42.958	2025-09-13 18:22:43.012	cmfilg6bp002obflp251q0tkx	Yousef Ibrahim	+201028278922	delivered	BostaSKU:BO-1597103 - quantity:1  -  itemPrice:600.00	Monufia	محافظه المنوفيه -مدينه منوف -قرية بلمشط - بجوار مسجد الجنزوري, منوف	\N	t	f	\N	\N	2025-09-04 07:04:19	t	\N	\N
\.


--
-- TOC entry 4022 (class 0 OID 22734)
-- Dependencies: 221
-- Data for Name: brand_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brand_users (id, "brandId", "userId", role, permissions, "invitedAt", "acceptedAt") FROM stdin;
cmeykujhu00052apzetprpe5l	cmeykujhn00032apzvkyerxnk	cmeykujhe00012apzrecdj0fz	owner	[]	2025-08-30 18:10:30.066	2025-08-30 18:10:30.065
cmeyl0qph000p2apzahxsg5sq	cmeyl0qpg000n2apz8ijpl7kj	cmeyl0qpf000l2apzvu6yswiq	owner	[]	2025-08-30 18:15:19.35	2025-08-30 18:15:19.349
cmeyl51sr00112apzjcwuihe2	cmeyl51sq000z2apznxjvtoio	cmeyl51so000x2apz9nihi9pq	owner	[]	2025-08-30 18:18:40.348	2025-08-30 18:18:40.347
cmf494c9i0005zd1ub85e8ts2	cmf494c9d0003zd1ubfmj7823	cmf494c920001zd1utvhhddlu	owner	[]	2025-09-03 17:28:48.918	2025-09-03 17:28:48.918
cmf5cyyqc0005qzcy4pqxtpd8	cmf5cyyq80003qzcy4d6sutkg	cmf5cyypi0001qzcy1ddu95zm	owner	[]	2025-09-04 12:04:22.74	2025-09-04 12:04:22.739
cmf8wczhd0007ck2e3h1rnzi6	cmf8wczh40005ck2enc8fe2ia	cmf8wczgw0003ck2ee4pspute	owner	[]	2025-09-06 23:30:28.128	2025-09-06 23:30:28.128
cmfb4v2et0005zl8n8cr9aiy0	cmfb4v2en0003zl8n346klzlu	cmfb4v2ec0001zl8npyncsuls	owner	[]	2025-09-08 13:04:01.014	2025-09-08 13:04:01.013
cmfpdt8bi000ge4yr3r0rly92	cmfpdt8bh000ee4yr6ukaboge	cmfpdt8bf000ce4yrxcotbg94	owner	[]	2025-09-18 12:23:18.366	2025-09-18 12:23:18.366
\.


--
-- TOC entry 4021 (class 0 OID 22725)
-- Dependencies: 220
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") FROM stdin;
cmeykujhn00032apzvkyerxnk	cmeykujhe00012apzrecdj0fz	Nike	\N	{}	2025-08-30 18:10:30.06	2025-08-30 18:10:30.06
cmeyl0qpg000n2apz8ijpl7kj	cmeyl0qpf000l2apzvu6yswiq	asoss	\N	{}	2025-08-30 18:15:19.349	2025-08-30 18:15:19.349
cmeyl51sq000z2apznxjvtoio	cmeyl51so000x2apz9nihi9pq	Byme	\N	{}	2025-08-30 18:18:40.347	2025-08-30 18:18:40.347
cmf494c9d0003zd1ubfmj7823	cmf494c920001zd1utvhhddlu	azoz	\N	{}	2025-09-03 17:28:48.913	2025-09-03 17:28:48.913
cmf5cyyq80003qzcy4d6sutkg	cmf5cyypi0001qzcy1ddu95zm	byManon Updated	https://example.com/logo.png	{}	2025-09-04 12:04:22.736	2025-09-06 19:28:16.748
cmf8wczh40005ck2enc8fe2ia	cmf8wczgw0003ck2ee4pspute	blankk	\N	{}	2025-09-06 23:30:28.12	2025-09-06 23:30:28.12
cmfb4v2en0003zl8n346klzlu	cmfb4v2ec0001zl8npyncsuls	byBlankk	\N	{}	2025-09-08 13:04:01.007	2025-09-08 13:04:01.007
cmfpdt8bh000ee4yr6ukaboge	cmfpdt8bf000ce4yrxcotbg94	byOmar	\N	{}	2025-09-18 12:23:18.365	2025-09-18 12:23:18.365
\.


--
-- TOC entry 4036 (class 0 OID 33233)
-- Dependencies: 235
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, "brandId", name, color, type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4026 (class 0 OID 22767)
-- Dependencies: 225
-- Data for Name: costs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.costs (id, "brandId", name, amount, category, date, vendor, "receiptUrl", "createdBy", "createdAt", "updatedAt", "costType") FROM stdin;
\.


--
-- TOC entry 4032 (class 0 OID 22817)
-- Dependencies: 231
-- Data for Name: financial_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.financial_reports (id, "brandId", "reportType", data, "generatedAt", "createdBy") FROM stdin;
\.


--
-- TOC entry 4028 (class 0 OID 22783)
-- Dependencies: 227
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory (id, "brandId", "productName", category, status, description, "createdBy", "createdAt", "updatedAt", "baseSku", colors, "currentStock", location, "reorderLevel", "sellingPrice", sizes, supplier, "unitCost") FROM stdin;
cmfk5uhyq000j7bgqgzb9vo6a	cmfb4v2en0003zl8n346klzlu	Sample Product 1	Electronics	in-stock	Sample product description	cmfb4v2ec0001zl8npyncsuls	2025-09-14 20:41:29.709	2025-09-14 20:41:29.709	SKU-001	{Red,Blue,Green}	100	Warehouse A	0	299.99	{S,M,L,XL}	Tech Supplier	199.99
cmfh6zpbk000va8unoz1i1b4e	cmfb4v2en0003zl8n346klzlu	Imported from Shopify - BO-1482084	Imported from Shopify	in-stock	Imported from Shopify - jacket	cmfb4v2ec0001zl8npyncsuls	2025-09-12 18:50:13.616	2025-09-12 18:50:13.616	BO-1482084	{}	0	Imported	10	850	{}	Shopify Import	1200
cmfh6zpbv000xa8un28izkjgu	cmfb4v2en0003zl8n346klzlu	Light Blue denim (New Item)	Imported from Shopify	in-stock	Crafted from premium cotton denim in a striking light blue hue. The denim has been carefully washed to achieve a soft, worn-in texture while maintaining a Baggy structured feel. Durable yet comfortable ,making it a must-have for denim lovers.	cmfb4v2ec0001zl8npyncsuls	2025-09-12 18:50:13.627	2025-09-12 18:50:13.627	BO-1747465	{}	0	Imported	10	1150	{32}	blankk	1150
cmfh6zpc6000za8unkgilacp1	cmfb4v2en0003zl8n346klzlu	Imported from Shopify - BO-1747464	Imported from Shopify	in-stock	Imported from Shopify - light-blue-denim	cmfb4v2ec0001zl8npyncsuls	2025-09-12 18:50:13.639	2025-09-12 18:50:13.639	BO-1747464	{}	0	Imported	10	1150	{}	Shopify Import	1150
cmfh6zpck0011a8unx64tos7k	cmfb4v2en0003zl8n346klzlu	Imported from Shopify - BO-1747463	Imported from Shopify	in-stock	Imported from Shopify - light-blue-denim	cmfb4v2ec0001zl8npyncsuls	2025-09-12 18:50:13.652	2025-09-12 18:50:13.652	BO-1747463	{}	0	Imported	10	1150	{}	Shopify Import	1150
cmfh6zpct0013a8un7c33h9m3	cmfb4v2en0003zl8n346klzlu	Imported from Shopify - BO-1747466	Imported from Shopify	in-stock	Imported from Shopify - light-blue-denim	cmfb4v2ec0001zl8npyncsuls	2025-09-12 18:50:13.661	2025-09-12 18:50:13.661	BO-1747466	{}	0	Imported	10	1150	{}	Shopify Import	1150
cmfh6zpd30015a8un7f4gnntm	cmfb4v2en0003zl8n346klzlu	Light grey Jacket-Cropped fit	Imported from Shopify	in-stock	Imported from Shopify - light-grey-jacket-cropped-fit	cmfb4v2ec0001zl8npyncsuls	2025-09-12 18:50:13.672	2025-09-12 18:50:13.672	BO-1482086	{}	0	Imported	10	850	{m}	blankk	1200
cmfh6zpdf0017a8ungam8w386	cmfb4v2en0003zl8n346klzlu	Imported from Shopify - BO-1482087	Imported from Shopify	in-stock	Imported from Shopify - light-grey-jacket-cropped-fit	cmfb4v2ec0001zl8npyncsuls	2025-09-12 18:50:13.683	2025-09-12 18:50:13.683	BO-1482087	{}	0	Imported	10	850	{}	Shopify Import	1200
cmfk5uhyr000l7bgq2l028qg7	cmfb4v2en0003zl8n346klzlu	Sample Product 2	Clothing	in-stock	Another sample product	cmfb4v2ec0001zl8npyncsuls	2025-09-14 20:41:29.709	2025-09-14 20:41:29.709	SKU-002	{Black,White}	50	Warehouse B	0	49.99	{XS,S,M,L}	Fashion Supplier	29.99
\.


--
-- TOC entry 4020 (class 0 OID 22716)
-- Dependencies: 219
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, "subscriptionId", amount, currency, status, "stripeInvoiceId", "dueDate", "paidAt", "createdAt", "updatedAt", description, "invoiceNumber", "userId") FROM stdin;
cmey1nw070009819wlnk99blc	cmey1nw010007819wjxrwa077	29	USD	paid	\N	2025-09-06 09:13:26.977	\N	2025-08-30 09:13:26.983	2025-08-30 09:13:33.245	Initial subscription to Starter plan	INV-45206983-OI3D	cmey1nvzm0001819wwuhwe9od
cmeyl0qpl000t2apzguc58c3h	cmeyl0qpj000r2apz2sl9th9i	79	EGP	pending	\N	2025-09-13 18:15:19.35	\N	2025-08-30 18:15:19.353	2025-08-30 18:15:19.353	Initial subscription to Professional plan	INV-77719352-19CD	cmeyl0qpf000l2apzvu6yswiq
cmeyl51sw00152apz1brn67kp	cmeyl51st00132apzh5zwc5u2	79	EGP	pending	\N	2025-09-13 18:18:40.349	\N	2025-08-30 18:18:40.352	2025-08-30 18:18:40.352	Initial subscription to Professional plan	INV-77920351-MWFQ	cmeyl51so000x2apz9nihi9pq
cmf494c9t0009zd1u7p2cdixe	cmf494c9l0007zd1uvibifqob	299	EGP	pending	\N	2025-09-10 17:28:48.92	\N	2025-09-03 17:28:48.93	2025-09-03 17:28:48.93	Initial subscription to Starter plan	INV-20528929-GEIP	cmf494c920001zd1utvhhddlu
cmf5cyyql0009qzcyb8ai96eq	cmf5cyyqe0007qzcy81b4fhed	0	EGP	pending	\N	2025-09-04 12:04:22.741	\N	2025-09-04 12:04:22.749	2025-09-04 12:04:22.749	Initial subscription to Free plan	INV-87462748-U59E	cmf5cyypi0001qzcy1ddu95zm
cmf8wczhp000bck2ervyfa9vh	cmf8wczhj0009ck2ejyqh8mur	499	EGP	pending	\N	2025-09-20 23:30:28.134	\N	2025-09-06 23:30:28.141	2025-09-06 23:30:28.141	Initial subscription to Professional plan	INV-01428141-TAA4	cmf8wczgw0003ck2ee4pspute
cmfb4v2f50009zl8nkpdfg8jt	cmfb4v2ey0007zl8nb1jvxw6p	299	EGP	pending	\N	2025-09-15 13:04:01.017	\N	2025-09-08 13:04:01.026	2025-09-08 13:04:01.026	Initial subscription to Starter plan	INV-36641025-GZ0L	cmfb4v2ec0001zl8npyncsuls
cmfpdt8bl000ke4yrzdxwbe1z	cmfpdt8bj000ie4yryiz6evwb	299	EGP	pending	\N	2025-09-25 12:23:18.367	\N	2025-09-18 12:23:18.37	2025-09-18 12:23:18.37	Initial subscription to Growth plan	INV-98198369-1066	cmfpdt8bf000ce4yrxcotbg94
\.


--
-- TOC entry 4024 (class 0 OID 22751)
-- Dependencies: 223
-- Data for Name: payables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payables (id, "brandId", "entityName", amount, "dueDate", status, description, "invoiceNumber", "receiptUrl", "createdBy", "createdAt", "updatedAt", "autoConvertToCost") FROM stdin;
\.


--
-- TOC entry 4046 (class 0 OID 72157)
-- Dependencies: 245
-- Data for Name: phone_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.phone_verifications (id, phone, "otpCode", "expiresAt", verified, attempts, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4018 (class 0 OID 22698)
-- Dependencies: 217
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plans (id, name, "priceMonthly", "priceYearly", features, "maxBrands", "maxUsers", "trialDays", "isActive", "createdAt", "updatedAt") FROM stdin;
cmf4835bx0000dwzp6x9f3nb5	Free	0	0	{"limits": {"users": 1, "brands": 1, "wallets": 1, "teamMembers": 1, "transactions": -1, "inventoryItems": 20}, "features": ["Dashboard stat cards only", "Revenue & Cost tracking", "Basic financial reports", "Settings access", "Email support", "1 Wallet", "20 Inventory items"], "lockedFeatures": ["Team management", "Project targets", "Transfers", "Receivables & Payables", "Tasks management", "Reports", "Shopify integration", "Bosta integration", "Shipblu integration", "Business insights", "Advanced analytics"]}	1	1	0	t	2025-09-03 16:59:53.662	2025-09-14 20:30:54.787
cmfo26dig0000k4kbu1rhls62	Growth	299	2990	{"limits": {"users": -1, "brands": 1, "wallets": 5, "teamMembers": -1, "transactions": -1, "inventoryItems": 300}, "features": ["Everything in Free", "Receivables & Payables", "Transfers", "Team collaboration", "Advanced reporting", "Tasks & support tickets", "5 Wallets", "300 Inventory items", "Shopify integration", "Bosta integration", "Shipblu integration", "Standard support"], "integrations": ["shopify", "bosta", "shipblu"], "lockedFeatures": ["Smart insights", "Advanced analytics", "Priority support"]}	1	-1	7	t	2025-09-17 14:09:50.057	2025-09-17 14:09:50.057
cmfo26dik0001k4kbipjbiafh	Scale	399	3990	{"limits": {"users": -1, "brands": 1, "wallets": -1, "teamMembers": -1, "transactions": -1, "inventoryItems": -1}, "features": ["Everything in Growth", "Unlimited wallets", "Unlimited inventory items", "Smart Insights", "Priority support", "Onboarding assistance"], "integrations": ["shopify", "bosta", "shipblu"]}	1	-1	14	t	2025-09-17 14:09:50.06	2025-09-17 14:09:50.06
\.


--
-- TOC entry 4029 (class 0 OID 22791)
-- Dependencies: 228
-- Data for Name: project_targets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_targets (id, "brandId", name, goal, "targetPieces", "currentPieces", category, deadline, status, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4023 (class 0 OID 22743)
-- Dependencies: 222
-- Data for Name: receivables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.receivables (id, "brandId", "entityName", amount, "dueDate", status, description, "invoiceNumber", "receiptUrl", "createdBy", "createdAt", "updatedAt", "autoConvertToRevenue") FROM stdin;
cmfjerk0w0001gn9pdb2gf9i3	cmfb4v2en0003zl8n346klzlu	Rec 1	1222	2025-09-14 00:00:00	converted	asas	1212		cmfb4v2ec0001zl8npyncsuls	2025-09-14 08:03:22.783	2025-09-14 14:18:38.712	t
\.


--
-- TOC entry 4025 (class 0 OID 22759)
-- Dependencies: 224
-- Data for Name: revenues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.revenues (id, "brandId", name, amount, category, date, source, "receiptUrl", "createdBy", "createdAt", "updatedAt", "bostaImportId", "bostaShipmentId") FROM stdin;
cmfbgej2j00078ahk51g6kkhf	cmfb4v2en0003zl8n346klzlu	Test Rev	2003	biils	2025-09-08 00:00:00	Ecomm		cmfb4v2ec0001zl8npyncsuls	2025-09-08 18:27:04.843	2025-09-08 18:27:04.843	\N	\N
cmfilg6d8005jbflp87talbqg	cmfb4v2en0003zl8n346klzlu	Bosta Delivery - 15439497	1210	Delivery	2025-09-06 09:45:40	Bosta Import	\N	cmfb4v2ec0001zl8npyncsuls	2025-09-13 18:22:43.004	2025-09-13 18:22:43.004	cmfilg6bp002obflp251q0tkx	cmfilg6by002ybflpkr7hoc5u
cmfilg6d8005lbflp5d8gnq7r	cmfb4v2en0003zl8n346klzlu	Bosta Delivery - 15825644	1210	Delivery	2025-09-06 13:22:33	Bosta Import	\N	cmfb4v2ec0001zl8npyncsuls	2025-09-13 18:22:43.004	2025-09-13 18:22:43.004	cmfilg6bp002obflp251q0tkx	cmfilg6by0030bflp16s10r2w
cmfilg6d8005nbflpps2zva4i	cmfb4v2en0003zl8n346klzlu	Bosta Delivery - 35756392	660	Delivery	2025-09-04 14:09:08	Bosta Import	\N	cmfb4v2ec0001zl8npyncsuls	2025-09-13 18:22:43.004	2025-09-13 18:22:43.004	cmfilg6bp002obflp251q0tkx	cmfilg6bz003kbflp4arxo2db
cmfilg6d8005pbflp8liyys92	cmfb4v2en0003zl8n346klzlu	Bosta Delivery - 41880898	660	Delivery	2025-09-02 12:46:16	Bosta Import	\N	cmfb4v2ec0001zl8npyncsuls	2025-09-13 18:22:43.004	2025-09-13 18:22:43.004	cmfilg6bp002obflp251q0tkx	cmfilg6c0003ubflpypp9xkrg
cmfilg6d8005rbflpdydsixu8	cmfb4v2en0003zl8n346klzlu	Bosta Delivery - 43411209	660	Delivery	2025-08-30 11:26:05	Bosta Import	\N	cmfb4v2ec0001zl8npyncsuls	2025-09-13 18:22:43.004	2025-09-13 18:22:43.004	cmfilg6bp002obflp251q0tkx	cmfilg6c0003ybflp5fkwmxem
cmfilg6d8005tbflp0x43ft44	cmfb4v2en0003zl8n346klzlu	Bosta Delivery - 48050215	660	Delivery	2025-09-06 12:45:35	Bosta Import	\N	cmfb4v2ec0001zl8npyncsuls	2025-09-13 18:22:43.004	2025-09-13 18:22:43.004	cmfilg6bp002obflp251q0tkx	cmfilg6c00042bflpdyab04ud
cmfilg6d8005vbflp2v59mzoz	cmfb4v2en0003zl8n346klzlu	Bosta Delivery - 70880418	1210	Delivery	2025-09-09 15:02:44	Bosta Import	\N	cmfb4v2ec0001zl8npyncsuls	2025-09-13 18:22:43.004	2025-09-13 18:22:43.004	cmfilg6bp002obflp251q0tkx	cmfilg6c3004wbflp6eptjmd3
cmfilg6d8005xbflp1nyme0po	cmfb4v2en0003zl8n346klzlu	Bosta Delivery - 8631410	660	Delivery	2025-09-03 10:45:35	Bosta Import	\N	cmfb4v2ec0001zl8npyncsuls	2025-09-13 18:22:43.004	2025-09-13 18:22:43.004	cmfilg6bp002obflp251q0tkx	cmfilg6c4005cbflpyb9v98bs
cmfjeuxny0003culian86henc	cmfb4v2en0003zl8n346klzlu	Order MO-140497 - Zeyad Emad	388.87	Sales	2025-09-14 08:06:00.415	Manual Order	\N	cmfb4v2ec0001zl8npyncsuls	2025-09-14 08:06:00.43	2025-09-14 08:06:00.43	\N	\N
cmfjs65f50002ki14rqrubwsi	cmfb4v2en0003zl8n346klzlu	Receivable: Rec 1	1222	Receivables	2025-09-14 00:00:00	Auto-converted Receivable	\N	cmfb4v2ec0001zl8npyncsuls	2025-09-14 14:18:38.705	2025-09-14 14:18:38.705	\N	\N
cmfjuihfa00017bgqgpxblp4u	cmfb4v2en0003zl8n346klzlu	recs	1212	biils	2025-09-14 00:00:00	asasas		cmfb4v2ec0001zl8npyncsuls	2025-09-14 15:24:13.365	2025-09-18 08:50:19.633	\N	\N
\.


--
-- TOC entry 4019 (class 0 OID 22708)
-- Dependencies: 218
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, "userId", "planId", status, "currentPeriodStart", "currentPeriodEnd", "stripeSubscriptionId", "stripeCustomerId", "createdAt", "updatedAt", "cancelAtPeriodEnd", "cancelledAt", "paymentMethod", "trialEnd", "trialStart", "downgradedAt", "isTrialActive", "trialDays", "trialNotificationSent") FROM stdin;
cmeyl0qpj000r2apz2sl9th9i	cmeyl0qpf000l2apzvu6yswiq	cmf4835bx0000dwzp6x9f3nb5	trialing	2025-08-30 18:15:19.35	2025-09-13 18:15:19.35	\N	\N	2025-08-30 18:15:19.351	2025-09-17 14:09:50.044	f	\N	mock	2025-09-13 18:15:19.35	2025-08-30 18:15:19.35	\N	f	0	f
cmeyl51st00132apzh5zwc5u2	cmeyl51so000x2apz9nihi9pq	cmf4835bx0000dwzp6x9f3nb5	trialing	2025-08-30 18:18:40.349	2025-09-13 18:18:40.349	\N	\N	2025-08-30 18:18:40.349	2025-09-17 14:09:50.044	f	\N	mock	2025-09-13 18:18:40.349	2025-08-30 18:18:40.349	\N	f	0	f
cmf494c9l0007zd1uvibifqob	cmf494c920001zd1utvhhddlu	cmf4835bx0000dwzp6x9f3nb5	trialing	2025-09-03 17:28:48.92	2025-09-10 17:28:48.92	\N	\N	2025-09-03 17:28:48.921	2025-09-17 14:09:50.044	f	\N	mock	2025-09-10 17:28:48.92	2025-09-03 17:28:48.92	\N	f	0	f
cmey1nw010007819wjxrwa077	cmey1nvzm0001819wwuhwe9od	cmf4835bx0000dwzp6x9f3nb5	active	2025-08-30 09:13:33.236	2025-09-29 09:13:33.236	\N	\N	2025-08-30 09:13:26.978	2025-09-17 14:09:50.044	f	\N	mock	2025-09-06 09:13:26.977	2025-08-30 09:13:26.977	\N	f	0	f
cmf5cyyqe0007qzcy81b4fhed	cmf5cyypi0001qzcy1ddu95zm	cmf4835bx0000dwzp6x9f3nb5	active	2025-09-04 12:04:22.741	2025-09-04 12:04:22.741	\N	\N	2025-09-04 12:04:22.742	2025-09-17 14:09:50.044	f	\N	mock	2025-09-04 12:04:22.741	2025-09-04 12:04:22.741	\N	f	0	f
cmf8wczhj0009ck2ejyqh8mur	cmf8wczgw0003ck2ee4pspute	cmf4835bx0000dwzp6x9f3nb5	trialing	2025-09-06 23:30:28.134	2025-09-20 23:30:28.134	\N	\N	2025-09-06 23:30:28.135	2025-09-17 14:09:50.044	f	\N	mock	2025-09-20 23:30:28.134	2025-09-06 23:30:28.134	\N	f	0	f
cmfb4v2ey0007zl8nb1jvxw6p	cmfb4v2ec0001zl8npyncsuls	cmfo26dig0000k4kbu1rhls62	active	2025-09-17 14:12:16.232	2025-10-17 14:12:16.232	\N	\N	2025-09-08 13:04:01.018	2025-09-17 14:12:16.232	f	\N	test	2025-09-15 13:04:01.017	2025-09-08 13:04:01.017	\N	f	0	f
cmfpdt8bj000ie4yryiz6evwb	cmfpdt8bf000ce4yrxcotbg94	cmfo26dig0000k4kbu1rhls62	trialing	2025-09-18 12:23:18.367	2025-09-25 12:23:18.367	\N	\N	2025-09-18 12:23:18.367	2025-09-18 12:23:18.367	f	\N	mock	2025-09-25 12:23:18.367	2025-09-18 12:23:18.367	\N	f	0	f
\.


--
-- TOC entry 4041 (class 0 OID 48830)
-- Dependencies: 240
-- Data for Name: system_metrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_metrics (id, date, "totalUsers", "totalBrands", "activeSubscriptions", "totalRevenue", "totalCosts", "apiCalls", "errorCount", "createdAt") FROM stdin;
cmf8k5a9z0001qwsheua9n0to	2025-09-06 17:48:33.48	0	0	0	0	0	0	0	2025-09-06 17:48:33.48
cmf8khtap0001140iwxklqw0w	2025-09-06 17:58:18.001	0	0	0	0	0	0	0	2025-09-06 17:58:18.001
\.


--
-- TOC entry 4030 (class 0 OID 22800)
-- Dependencies: 229
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, "brandId", title, description, "assignedTo", "dueDate", status, priority, "createdBy", "createdAt", "updatedAt", category) FROM stdin;
\.


--
-- TOC entry 4031 (class 0 OID 22808)
-- Dependencies: 230
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, "brandId", "userId", role, permissions, "joinedAt") FROM stdin;
\.


--
-- TOC entry 4043 (class 0 OID 50950)
-- Dependencies: 242
-- Data for Name: ticket_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_responses (id, "ticketId", message, "isInternal", "isFromAdmin", "authorId", "authorName", "authorEmail", attachments, "createdAt", "updatedAt") FROM stdin;
cmf8ylt2q000710evsdjgrlne	cmf8xc2ld000110evin1ymtyt	thanks	f	t	cmf8k5a9q0000qwshuraovgh5	Admin User	admin@admin.com	[]	2025-09-07 00:33:18.961	2025-09-07 00:33:18.961
cmf9lc7bj0003b33qchym2osp	cmf8xc2ld000110evin1ymtyt	good ?	f	t	cmf8k5a9q0000qwshuraovgh5	Admin User	admin@admin.com	[]	2025-09-07 11:09:42.031	2025-09-07 11:09:42.031
cmfjf0wcj000bculilzwxa711	cmfjf03ue0007culi28xl9ml8	message recievced	f	t	cmf8k5a9q0000qwshuraovgh5	Admin User	admin@admin.com	[]	2025-09-14 08:10:38.659	2025-09-14 08:10:38.659
cmfjf54ui000110uv8dikpj0c	cmfjf03ue0007culi28xl9ml8	thank you	f	f	\N	Zoz Emad	ziz@gmail.com	[]	2025-09-14 08:13:56.298	2025-09-14 08:13:56.298
cmfjf58qj000310uveu83p2vr	cmfjf03ue0007culi28xl9ml8	thank you	f	f	\N	Zoz Emad	ziz@gmail.com	[]	2025-09-14 08:14:01.339	2025-09-14 08:14:01.339
cmfjrzusy0003odhszcoi3va4	cmfjf03ue0007culi28xl9ml8	so much	f	f	\N	Zoz Emad	ziz@gmail.com	[]	2025-09-14 14:13:45.008	2025-09-14 14:13:45.008
\.


--
-- TOC entry 4042 (class 0 OID 50939)
-- Dependencies: 241
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tickets (id, "ticketId", "fullName", email, category, subject, description, status, priority, attachments, "assignedToId", "userId", "resolvedAt", "closedAt", "createdAt", "updatedAt") FROM stdin;
cmf8vtomy0001m02cswuoi8mt	TK-000001	Test User	test@example.com	Technical Issue	Test Ticket	This is a test ticket to verify the system is working correctly.	Open	Medium	[]	\N	\N	\N	\N	2025-09-06 23:15:27.611	2025-09-06 23:15:27.611
cmf8ws2we000fck2eolp3cpja	TK-000002	Zeyad Emad	zoz@gmail.com	Feature Request	hvhjhjhvhjv	knk,nnkbvbjkbkbkbjkjjkgjkhjkghjkgjkg	Open	Medium	[]	\N	cmf8wczgw0003ck2ee4pspute	\N	\N	2025-09-06 23:42:12.398	2025-09-06 23:42:12.398
cmf8xc2ld000110evin1ymtyt	TK-000003	Zeyad Emad 	zeiad_agamy@icloud.com	Technical Issue	aaaaaaaaaa	aaasndkndklndnkldbdbjlbdjbdjbjdbdljdbjdnbd	Open	Medium	[]	\N	cmf8wczgw0003ck2ee4pspute	\N	\N	2025-09-06 23:57:45.12	2025-09-06 23:57:45.12
cmfjf03ue0007culi28xl9ml8	TK-000004	Zoz Emad	ziz@gmail.com	Billing	test	test	Open	High	[]	\N	cmfb4v2ec0001zl8npyncsuls	\N	\N	2025-09-14 08:10:01.718	2025-09-14 08:10:01.718
\.


--
-- TOC entry 4027 (class 0 OID 22775)
-- Dependencies: 226
-- Data for Name: transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transfers (id, "brandId", type, "fromLocation", "toLocation", quantity, description, "transferDate", "createdBy", "createdAt", "updatedAt", "deductFromStock", "inventoryItemId") FROM stdin;
cmfjetj920006gn9psaosdfsp	cmfb4v2en0003zl8n346klzlu	inventory	a	b	99	aaa	2025-09-14 00:00:00	cmfb4v2ec0001zl8npyncsuls	2025-09-14 08:04:55.095	2025-09-14 08:04:55.095	t	cmfir320a0005fuo8g4agyyvw
\.


--
-- TOC entry 4045 (class 0 OID 69718)
-- Dependencies: 244
-- Data for Name: trial_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trial_notifications (id, "userId", "subscriptionId", type, message, "isRead", "sentAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 4044 (class 0 OID 53417)
-- Dependencies: 243
-- Data for Name: usage_tracking; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usage_tracking (id, "userId", "brandId", "resourceType", "currentCount", "limit", "lastUpdated", "createdAt", "updatedAt") FROM stdin;
cmfb6rh6t0001tid6a1hgw311	cmf5cyypi0001qzcy1ddu95zm	cmf5cyyq80003qzcy4d6sutkg	inventory	0	-1	2025-09-08 13:57:12.769	2025-09-08 13:57:12.769	2025-09-08 13:57:12.769
cmfb6rw5p0001gej4aizc68lf	cmf5cyypi0001qzcy1ddu95zm	cmf5cyyq80003qzcy4d6sutkg	team_members	1	-1	2025-09-08 13:57:32.173	2025-09-08 13:57:32.173	2025-09-08 13:57:32.173
cmfb6rw5s0003gej4yvbk8jk3	cmf5cyypi0001qzcy1ddu95zm	cmf5cyyq80003qzcy4d6sutkg	wallets	0	-1	2025-09-08 13:57:32.176	2025-09-08 13:57:32.176	2025-09-08 13:57:32.176
cmfb6rw5y0005gej41tw63ahm	cmf5cyypi0001qzcy1ddu95zm	cmf5cyyq80003qzcy4d6sutkg	transactions	0	100	2025-09-08 13:57:32.183	2025-09-08 13:57:32.183	2025-09-08 13:57:32.183
cmfb6rw68000dgej4hfmec5eo	cmfb4v2ec0001zl8npyncsuls	cmfb4v2en0003zl8n346klzlu	transactions	0	-1	2025-09-08 14:06:38.88	2025-09-08 13:57:32.193	2025-09-08 14:06:38.882
cmfb6rw610007gej41tzppee5	cmfb4v2ec0001zl8npyncsuls	cmfb4v2en0003zl8n346klzlu	inventory	22	100	2025-09-11 08:19:20.702	2025-09-08 13:57:32.186	2025-09-11 08:19:20.706
cmfb6rw640009gej4lbdvfxxu	cmfb4v2ec0001zl8npyncsuls	cmfb4v2en0003zl8n346klzlu	team_members	1	2	2025-09-11 08:19:20.715	2025-09-08 13:57:32.188	2025-09-11 08:19:20.716
cmfb6rw66000bgej4aoe37ta0	cmfb4v2ec0001zl8npyncsuls	cmfb4v2en0003zl8n346klzlu	wallets	1	2	2025-09-14 20:32:43.162	2025-09-08 13:57:32.19	2025-09-14 20:32:43.164
\.


--
-- TOC entry 4017 (class 0 OID 22690)
-- Dependencies: 216
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, "userId", token, "expiresAt", "createdAt") FROM stdin;
cmey1t9pi0001bu85czz2o2ej	cmey1nvzm0001819wwuhwe9od	7bVxA0RvBSPBnszlKXyH3vHJ37Tm7mEdkPvhgWSc6i7Awh8tQ40SGGPs6LJBGddF	2025-09-29 09:17:38.02	2025-08-30 09:17:38.021
cmey1u98u0001l3y5uoilwx9e	cmey1nvzm0001819wwuhwe9od	BUEbMlBh3KHG2NTRCdMEXyNbatBwPUI3dsi1C0zXhYJDu3etXWGCbO4rTksnXm84	2025-09-29 09:18:24.077	2025-08-30 09:18:24.078
cmey3q0ty0007105enlf2997j	cmey1nvzm0001819wwuhwe9od	LVhz1mrJiKAlmlU6JoGSbNojUyPzwV7LygvNcOzF2C5ykQcAKpgFd05mUyMl30of	2025-09-29 10:11:05.782	2025-08-30 10:11:05.783
cmey3q5ms0009105emryf3tg1	cmey1nvzm0001819wwuhwe9od	L7JUdjtZS0qyLbESozNNi68sywcXhC3wMkpb9ZPunvCiI44cL3049lLCi5qiYJ58	2025-09-29 10:11:12.004	2025-08-30 10:11:12.005
cmey3tscb000f105e6kgc1far	cmey1nvzm0001819wwuhwe9od	u9viluSEOXpbS73ifmzzUGG4gbFhkRxblNQSFAn5rVrCaqpKmnTHRlCnQcpn5OgD	2025-09-29 10:14:01.401	2025-08-30 10:14:01.401
cmey3ypd20001pq183zr9jo4r	cmey1nvzm0001819wwuhwe9od	9wXK0n5wUEMG3s1SmnBG3cN0yZXY3F5FkAjd3vaqrwopaRcpDugQZFVuhVqrNVR8	2025-09-29 10:17:50.82	2025-08-30 10:17:50.821
cmey40rdp0003pq18juqrlsru	cmey1nvzm0001819wwuhwe9od	Z2PVCp0Fhx84l8tVd9SVSHElPxjZqURWOTdSyLj1eNwORhnP9xf1ZxEGc9Ay2aD9	2025-09-29 10:19:26.749	2025-08-30 10:19:26.75
cmey4c4ae00014rl5icdtp84k	cmey1nvzm0001819wwuhwe9od	l3wTCghZR70FkS0nBnhBEJ2cVBdby2uanUSSAmfHc4IAoj03JlJGLEBy3JBupGLQ	2025-09-29 10:28:16.692	2025-08-30 10:28:16.693
cmey4ffph00094rl56l2wsrn2	cmey1nvzm0001819wwuhwe9od	u5yxgnzA3qCNhJa6wAiZ32LKQrrwvPY427Sy9IJYNwHDatAMMWmNm1SDzHVHUbuO	2025-09-29 10:30:51.461	2025-08-30 10:30:51.462
cmey5ap3v0001gex70hnpp3uh	cmey1nvzm0001819wwuhwe9od	oB2TAgfCWCdUyemV0rojmGH3jZWf8dxJO7FcmshsyBayjm6LK90IJSwdNajwSJYd	2025-09-29 10:55:09.978	2025-08-30 10:55:09.979
cmey5mnnl0005gex7yof0qx1n	cmey1nvzm0001819wwuhwe9od	XCH9uOL4OiZgs630DEVToY0dbEfViF0tPPe1hQiCBXoxCAUXBRdM5EB8wRVEwpUf	2025-09-29 11:04:27.966	2025-08-30 11:04:27.968
cmey5ypkt0001phcwslgdfgvz	cmey1nvzm0001819wwuhwe9od	8cCOECm1Z1WWZTb5Q9hjjTwzHeINu2vQ450UKNx0Uh5fii9zstEEC8roiix3OvH0	2025-09-29 11:13:50.332	2025-08-30 11:13:50.333
cmey9a5pv0001clj1umevu8cv	cmey1nvzm0001819wwuhwe9od	Cn5Q6t70QaoRbikiQCIZno2gNekEDufIx5phVCfjZ27WJ1tmSDohefYSSrVv6edT	2025-09-29 12:46:43.314	2025-08-30 12:46:43.315
cmey9ntlo00014up4zf8bzgyr	cmey1nvzm0001819wwuhwe9od	nnFtqHLFDlwCewR0ljBDfqdp7PsnogTBMQb46lHghsNI5FFv2xYNFrh4tXXGlHOp	2025-09-29 12:57:20.794	2025-08-30 12:57:20.794
cmey9pztr0001q4qbguqqrd2l	cmey1nvzm0001819wwuhwe9od	VYTojjkMxblsXO3nUM1LZHWXgfU3SjuyvQVhpzJaHMXqdbeRBg3d2jNvXyvL8BCV	2025-09-29 12:59:02.168	2025-08-30 12:59:02.169
cmeyatm7700065xnuet2i7bfs	cmey1nvzm0001819wwuhwe9od	gCXdAX4kO1aicEJiRDBwMm365OZSEfheoMKhiWR3tkyttyBjwFrGTJ4YxHUqVtxl	2025-09-29 13:29:50.752	2025-08-30 13:29:50.754
cmeyavvn20001e6acbrgn54hj	cmey1nvzm0001819wwuhwe9od	GGi0w8P7jC5OrJCGFpT11ObXYz4zZslvCdWUIT6ifUcMQQGFFbZ2wIroPhRhZ1jS	2025-09-29 13:31:36.299	2025-08-30 13:31:36.3
cmeyay7me0005e6acr4jbh643	cmey1nvzm0001819wwuhwe9od	G6qwKmKv5x3u5dHXQLVriLdQf3NUQFE1oTmmYvgucCBc9TJAujVzWQkUhgoqeP08	2025-09-29 13:33:25.142	2025-08-30 13:33:25.143
cmeydbpyz0001qr96qny50l4a	cmey1nvzm0001819wwuhwe9od	1GMB4R9gS9qv6tsZNcmwlZsYM4fLGwlQ0YzVyTGKiudlHAVH0BuIfp1J7yUBrnPB	2025-09-29 14:39:54.683	2025-08-30 14:39:54.683
cmeyf4npi0001imvr6cz6w7ti	cmey1nvzm0001819wwuhwe9od	EUQZ2DtrxxOiZQcIctyzi424271IllRrHzxukg7eK8WO7HL1A9L8gzkXGFDrsR9A	2025-09-29 15:30:24.389	2025-08-30 15:30:24.39
cmf3qp1y100019rm2cudxmvza	cmey1nvzm0001819wwuhwe9od	gjEa7YE1dfni5puugxcASJyJTuUoc36UOoL86KM9W9B32aZbTX6VTRXHYkNs479a	2025-10-03 08:53:02.616	2025-09-03 08:53:02.617
cmf4h09ph000fzd1uanoklxla	cmey1nvzm0001819wwuhwe9od	isdkwO8r23nscvXRDmfzxBhgdNi87Hb1OanoRleTkDbBLlTLu5ouKJ49IeuPHWiM	2025-10-03 21:09:35.907	2025-09-03 21:09:35.908
cmf57mg720001pehpsl46k6t2	cmey1nvzm0001819wwuhwe9od	dIHCiNOqh85h5f2RCwqWkRU6HTyKgKQoNOSkfBIvhodxAGIk0H7HXB8CaV9EQg3A	2025-10-04 09:34:40.765	2025-09-04 09:34:40.766
cmf57v2jv0001p8g8g4g6mvew	cmey1nvzm0001819wwuhwe9od	Ot7qFwAQrNeqDN3zu9E4ZHrXXQffbc1qiB48Lels7ERluS07Va3ajji4BMJEzW3j	2025-10-04 09:41:22.985	2025-09-04 09:41:22.985
cmf5831ko0001h76mvdh97w2q	cmey1nvzm0001819wwuhwe9od	EhXcLgzL8tduZm4xcKKdLRd97ncGkDibPE1spY2a6enUYKGHq5Xt4PRVHzi1m1CI	2025-10-04 09:47:34.965	2025-09-04 09:47:34.966
cmf59wi2b00016sf9yn6ekpr5	cmey1nvzm0001819wwuhwe9od	HY7hkvabXC0tmG0QBrlBbC7yUSMNkqT0As3VYdXN6IYkoCBSHcPX9KSIHjf54Q9V	2025-10-04 10:38:28.978	2025-09-04 10:38:28.979
cmf5cyyzy000bqzcyo13pl3br	cmf5cyypi0001qzcy1ddu95zm	L1q9ZD9v1gOYBbZCt5OS2Rfuq1btnAYvoxkseGmweG4Lju8qpSyJUCfaDO7G7KuD	2025-10-04 12:04:23.086	2025-09-04 12:04:23.086
cmf5vuean000dqzcyab73cs8a	cmey1nvzm0001819wwuhwe9od	WIcG5637B54RbyGq9K15NGzR6lRVAYIjCaF6fa6cYk9Ymi3qW0bfROx7TKTZRwqV	2025-10-04 20:52:42.333	2025-09-04 20:52:42.335
cmf5wt5mc0001bo7709fq20ab	cmey1nvzm0001819wwuhwe9od	rdQixFR1OYKq3UBDkjSDAE4FFiH2VutaHMAGqaf4rfPHUSwGzAVtp8OMHy4dpQ9Y	2025-10-04 21:19:44.051	2025-09-04 21:19:44.052
cmf5wxb4v0003jmg33l88btb8	cmey1nvzm0001819wwuhwe9od	KYiRq7JjiztuL4UH2YaMUZFDs3vHKcO9dMmEniosRKup5ZILXy6etvWlvgNFAyyQ	2025-10-04 21:22:57.821	2025-09-04 21:22:57.822
cmf5wxpk10001dtbfoccgjml4	cmey1nvzm0001819wwuhwe9od	QvnI3bMOzi4looMJhxirk8DG9RLVXEWbnsmfmTTjvjuDMdRTUUpdMCeeQKlspLWJ	2025-10-04 21:23:16.512	2025-09-04 21:23:16.513
cmf6upt3t0001iki5d56goiie	cmey1nvzm0001819wwuhwe9od	02C0Vj0sMwWFSobFd5rONMn12DhHLVqN0myxp06glojMub6Jfa9Fx7IdzHwPwSYk	2025-10-05 13:08:54.808	2025-09-05 13:08:54.809
cmf6w6uom000114dvq900rxhp	cmey1nvzm0001819wwuhwe9od	FVfkNK3qW1gIDj1N6bPTgDCW1IeXeP6B4BPk6ySdYumMSzNQ46R4Y10PerMj6NDi	2025-10-05 13:50:09.622	2025-09-05 13:50:09.623
cmf87fks10001m2ui6mz1uyfu	cmey1nvzm0001819wwuhwe9od	od1EaSy8BjD7jGkFo4d9PHzUtR33VXFuCHhqsDqlk0hKdM534KcZE6Ncr5LIzoIr	2025-10-06 11:52:38.64	2025-09-06 11:52:38.641
cmf8ghbsl0001ah3zhn1p2di2	cmey1nvzm0001819wwuhwe9od	vYDwyzwSvcapyywySaabW78ndXGyCUvOKUK8XbwYrr31SpgnKHwiFc8XPliLUTq7	2025-10-06 16:05:56.851	2025-09-06 16:05:56.852
cmf8gk9e10003ah3zghofzhnx	cmey1nvzm0001819wwuhwe9od	FeevKQ16RMjUy7D5fSvz4F04b4Rvw6zNCEiPfCLCFZV7mr2WdxzHQj9InQeItx0H	2025-10-06 16:08:13.705	2025-09-06 16:08:13.706
cmf8ja3f50001r3rgd2nciorz	cmey1nvzm0001819wwuhwe9od	gwlMnceZvHvxVoAHrvKDyyvmtP3a7CD2fp0daqMdUJRg5KtQvYBARK5Yh84MZYhe	2025-10-06 17:24:18.256	2025-09-06 17:24:18.256
cmf8wczs4000dck2ex5htu6e1	cmf8wczgw0003ck2ee4pspute	d6eGxldJ3uYyBYn6BDTwHrbfhRBy548iZGyNOHEmnjpH5DNZealE5U9zvdDm62QJ	2025-10-06 23:30:28.515	2025-09-06 23:30:28.516
cmfb6hbd10001xbs3jzb33jtg	cmfb4v2ec0001zl8npyncsuls	lLSBpJWRz46ShJUfHSp2GAfF31J7KSmpyrhxtcDQ4gwJptBMeRSEOcZ8TsDCX1GL	2025-10-08 13:49:18.658	2025-09-08 13:49:18.659
cmfb74qan0001169vnr1rlac6	cmfb4v2ec0001zl8npyncsuls	oO4DdPeuCQfN23R3V8q1isQsypVnXwO983BFwlV14M2fdIUxGZWQ46nrYJ9bXAPP	2025-10-08 14:07:31.102	2025-09-08 14:07:31.103
cmfb8za21001xdcvbnpo9y9zg	cmfb4v2ec0001zl8npyncsuls	qD7NLyEVYsyjBJGTiMYoQCxUPPoWw9fDO6Z1SP6xOFuS3Qarw5mWnglkabSj1dO6	2025-10-08 14:59:16.004	2025-09-08 14:59:16.008
cmfbgdb4900058ahk23pnhry4	cmfb4v2ec0001zl8npyncsuls	z2WRjMlzfXspmmrI433SOS32Td1rOrJ3jzujpHkOVsSNhYlHt5QTRZ5LseHEqPe3	2025-10-08 18:26:07.881	2025-09-08 18:26:07.882
cmfbhaswx000h8ahk50d59vei	cmfb4v2ec0001zl8npyncsuls	virIctNvE1KkCRFD3dMb82EqbavlHc5nTshiZDlwk2qrYnFFhr92WOFjRItNzZUD	2025-10-08 18:52:10.591	2025-09-08 18:52:10.592
cmfbhi4h3000l8ahk3wrcb5nt	cmfb4v2ec0001zl8npyncsuls	SMeJafdTLOB9Za8ntJe4Y0BqARrQngOooZ61e3lSbq5ozBMcfGR1D8viBAltuxZy	2025-10-08 18:57:52.166	2025-09-08 18:57:52.167
cmff4pde6000ni2yvy5jv1b1y	cmfb4v2ec0001zl8npyncsuls	v9E2DLRTV0fJIqORuAaHKFjtkp5SyHmhbw91pdHabSAMvVhKwTA1HLQoJMXjnOWD	2025-10-11 08:10:40.014	2025-09-11 08:10:40.015
cmff58zf60007hk6heh5f5kkw	cmfb4v2ec0001zl8npyncsuls	Dag6Co9K5PRhCcJg0cwRJTwx0tKWdLZvfAPHpkF8rOzqa11D3rUtm5IupiRSJPwS	2025-10-11 08:25:55.026	2025-09-11 08:25:55.026
cmff59c7r000dhk6ha9xhrqpl	cmfb4v2ec0001zl8npyncsuls	0wrGaaZM6bUQEt4im8B9U8dil8G1Q37Wjh3kr2UYLqapKF3coVlaI6FgoxA2Loem	2025-10-11 08:26:11.607	2025-09-11 08:26:11.607
cmff5qy070005agg9z6oabvbp	cmfb4v2ec0001zl8npyncsuls	M7UvYhVZkd3LOHw7tTaE8wWztjOpeZiTjR3WcEYAZijRrD7bvts0caMlKQ6sp7Yt	2025-10-11 08:39:52.998	2025-09-11 08:39:52.999
cmff5rdvw000bagg9xlih0cne	cmfb4v2ec0001zl8npyncsuls	liF9lZ62Xm8WOa8DSK18xra18wT7GznBtzlXq3e3aJISINAPp02cmW5b2fbaGrig	2025-10-11 08:40:13.58	2025-09-11 08:40:13.581
cmff5wixn000fagg97duq49w3	cmfb4v2ec0001zl8npyncsuls	A20TsgcRjKUylf3qYMARM6ahkJcIiXsYA9ouPfyP09JHV8TJoLwT8lAlIzLI39ay	2025-10-11 08:44:13.403	2025-09-11 08:44:13.404
cmff5xkzx000jagg9i7fe1l0t	cmfb4v2ec0001zl8npyncsuls	s6gxSO12mGKOyQdq5fPl1aYi39jrGhqEuJHwbqxZJhILGnNfqRZncvsrRrZ8FRay	2025-10-11 08:45:02.733	2025-09-11 08:45:02.734
cmff62dop000nagg984z9flst	cmfb4v2ec0001zl8npyncsuls	D8YEkDT4IG2i2YuFXVhSlgTIaaYpaqkTsfwa8OOIcbfZhOX0dI71gA3oSgSpuluN	2025-10-11 08:48:46.537	2025-09-11 08:48:46.537
cmffdlalu00019klka93ca5pc	cmfb4v2ec0001zl8npyncsuls	UmBICTRPI2cZBdyV1hnhmyYQbjIHevqSFalHGPoBv9dwXAvldFNKqxZxko62WPGB	2025-10-11 12:19:26.318	2025-09-11 12:19:26.319
cmffnsomo000181wy2b8pm5dc	cmfb4v2ec0001zl8npyncsuls	W9uCAr7WrjVPvS81Rsvw87ptyAoqmpH63hrgrhzNW5za5zqIPXgU4vSiOM0auKxz	2025-10-11 17:05:07.244	2025-09-11 17:05:07.245
cmffouk4z0001oj7vdv4def36	cmfb4v2ec0001zl8npyncsuls	X4KTTSV1pmNp5jBG6EP36P4uPfS2dykZTggh4uIrShqQpOeygVFfk5v9rpqwvJPW	2025-10-11 17:34:34.351	2025-09-11 17:34:34.352
cmfh48kh90003tz7wp4l77g1c	cmfb4v2ec0001zl8npyncsuls	fRFJSwMVBO5R7OUOOawp89XpBy6nhneglSJJHPhcYGXfKDbHTZVoTBgF7nCQ37W8	2025-10-12 17:33:08.396	2025-09-12 17:33:08.396
cmfh4wpk20001oglzbhcp8o6a	cmfb4v2ec0001zl8npyncsuls	mx3As30U7Ay2VPibMfbL7xL2x8uKMbnMYDRWw6Wqjz2o2q40Hz7fMO3rj3buLJQc	2025-10-12 17:51:54.72	2025-09-12 17:51:54.721
cmfh6vek50001t7bggdofqpp5	cmfb4v2ec0001zl8npyncsuls	ZPjhtZsTkpPbNNB589xnfd0KIMfHCCn2WduagA0cj1wxe7wUMSKjecnOaGp1x8mk	2025-10-12 18:46:53.044	2025-09-12 18:46:53.045
cmfhf6ed30001hcameki72cuj	cmfb4v2ec0001zl8npyncsuls	Rho3kQVBNbXGoCoMbo70mdnzrDHJpnmQGHBxJqPEgjhN5BjKAb1LCYfbLEHDOIs0	2025-10-12 22:39:22.928	2025-09-12 22:39:22.93
cmfilvd2g0001r9g1cthd8xn1	cmfb4v2ec0001zl8npyncsuls	lNFCfHxia2fKT9LGEWQYzJh08wMEe1G4Oab4HPVvfl9QvYRurDs30yr67epdriXB	2025-10-13 18:34:31.527	2025-09-13 18:34:31.528
cmfim90e60007r9g168jqcnsa	cmfb4v2ec0001zl8npyncsuls	FR6UaBGuuwBwkBT3gv8FrpULA7hsfwi6MgQHi2FhmHmZ18P6YYxi1mf9u1SQ4QZX	2025-10-13 18:45:08.285	2025-09-13 18:45:08.287
cmfiopk0v000br9g1upkva01l	cmfb4v2ec0001zl8npyncsuls	zlXOPvPikEdf3kHgZhalmBIWLN7behS9V0pDhoqucvrT0Pj4xOUdI2vlu5KosIiy	2025-10-13 19:53:59.453	2025-09-13 19:53:59.455
cmfjegifl0003xfmgeyl47xaz	cmfb4v2ec0001zl8npyncsuls	6tivIE3SdWZvs5CjNkyOjpLC4l3CSibjVjQ3jCZVgRxiYMvO55pUtn4ELLDf3O3S	2025-10-14 07:54:47.505	2025-09-14 07:54:47.506
cmfjenxsr0001ah417wq0st40	cmfb4v2ec0001zl8npyncsuls	DM9LxasMv1NKELCJlzpe9upGMZCww62DaKHATKg9rm7D4KbEBXJHbGMJzB9zzidh	2025-10-14 08:00:34.01	2025-09-14 08:00:34.011
cmfjf191d0001ipiccbbrwtbb	cmfb4v2ec0001zl8npyncsuls	nbsNqpmk6tFAlGFS3fBGaSkZQ4FQHrILaEh94hzmp9Q5HwLe0YDcpUKP5JYTMoUC	2025-10-14 08:10:55.103	2025-09-14 08:10:55.104
cmfk77roq000n7bgqxv7macsz	cmfb4v2ec0001zl8npyncsuls	8sZeouXYZ19zsOaVwQIBADBqg5vUVPqSp5JzeVxwPnkEPGfvMlWunCmh2dnGlwxf	2025-10-14 21:19:48.457	2025-09-14 21:19:48.458
cmfk7ik9n0001r0jcipmlx8uy	cmfb4v2ec0001zl8npyncsuls	1Uvw9NdI7O7UKoy3we5owj2SyotGQhwcKYmLpGprInJk3aHc1lPv8N9ftFhxYdL1	2025-10-14 21:28:12.057	2025-09-14 21:28:12.058
cmfl4rkw40001vxgd56uvvd7d	cmfb4v2ec0001zl8npyncsuls	cn3506CDNrmRrMOmGQQbVAXGNQBSgn9HQ7BHwHlVa8s95NOfiIwH05OSr2G8fjxK	2025-10-15 12:59:00.098	2025-09-15 12:59:00.099
cmfo2a39q000710a220ubck7n	cmfb4v2ec0001zl8npyncsuls	5xlVusixd9ZUm910uTuTbMauT3zJ3Q1bsG8aTpFPPdfrOxpkozOib8i0aFJxrm4n	2025-10-17 14:12:43.406	2025-09-17 14:12:43.407
cmfpdtel5000me4yrdzdciuvr	cmfpdt8bf000ce4yrxcotbg94	iXyncDkXOve5hlIlBaxkpwR4L2LQUHPscIMy3oaHM0G62rJ49Xsk1vuTIiIsLnUg	2025-10-18 12:23:26.489	2025-09-18 12:23:26.489
\.


--
-- TOC entry 4016 (class 0 OID 22681)
-- Dependencies: 215
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, "passwordHash", "firstName", "lastName", "emailVerified", "createdAt", "updatedAt", "googleId", picture) FROM stdin;
cmey1nvzm0001819wwuhwe9od	z@gmail.com	$2a$12$KZnvSvVQwOeb2vMX6knM0OkU/ApuMLSUj1y4b7ekqYamyVdF4KUWe	Zeyad	Emad	f	2025-08-30 09:13:26.961	2025-08-30 09:13:26.961	\N	\N
cmeykujhe00012apzrecdj0fz	test@example.com	$2a$12$sAFatwvlnYi/KNIadqdC6eKftZB7X58ePQVPVd8CRI2mTflJXQnmi	Ahmed	Sayed	f	2025-08-30 18:10:30.05	2025-08-30 18:10:30.05	\N	\N
cmeyl0qpf000l2apzvu6yswiq	zey@example.com	$2a$12$b9d3FUpUD0MYKpiJw72yzeHZXmUOsmuVRzdPs25hkt30OmRaUoJfe	Ahmed	Sayed	f	2025-08-30 18:15:19.348	2025-08-30 18:15:19.348	\N	\N
cmeyl51so000x2apz9nihi9pq	menna@gmail.com	$2a$12$PGTfVnNilQ55bLreNKwOQOPpBhsHrRC5lRS6xJT1BwSvuLCIkBdp2	Menna	Hossam	f	2025-08-30 18:18:40.344	2025-08-30 18:18:40.344	\N	\N
cmf494c920001zd1utvhhddlu	emad@gmail.com	$2a$12$H3BlqeHwbPFkGt20/lxKF.YHsf4KvZy9pXLUK4bxxnW9bQ.OEQl0e	sayed	emad	f	2025-09-03 17:28:48.902	2025-09-03 17:28:48.902	\N	\N
cmf5cyypi0001qzcy1ddu95zm	m@gmail.com	$2a$12$rqYEUG9SH6Veo3W8PcO9JOpgC1tSByF7oYC85iP43FVdWMOgkpGoy	Menna Updated	Hossam Updated	f	2025-09-04 12:04:22.71	2025-09-06 19:06:43.193	\N	\N
cmf8wczgw0003ck2ee4pspute	zoz@gmail.com	$2a$12$Uua9rks5NWYcXuoPo3v1wO/AyFbvGCFoAGYGNrZmK7zHD8SAiyQSi	Zeyad	Emad	f	2025-09-06 23:30:28.112	2025-09-06 23:30:28.112	\N	\N
cmfb4v2ec0001zl8npyncsuls	ziz@gmail.com	$2a$12$k6Ce0l1kqiZGJJpuMz8smu1hGnGNaLHlJswWgTFyiw5JLEL4u7opG	Zoz	Emad	f	2025-09-08 13:04:00.995	2025-09-08 13:04:00.995	\N	\N
cmfpdt8bf000ce4yrxcotbg94	omar@gmail.com	$2a$12$VKlQz3Cg.X3wUJ0s3sjNx.tajb9FqYJB7uCQ/ucMCiWbZLkNv86N6	Omar	Moatazz	f	2025-09-18 12:23:18.362	2025-09-18 12:23:18.362	\N	\N
\.


--
-- TOC entry 4035 (class 0 OID 22993)
-- Dependencies: 234
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_transactions (id, "brandId", "walletId", type, "fromWalletId", "toWalletId", amount, description, date, status, "createdBy", "createdAt", "updatedAt", category, "countAsCost", "countAsRevenue") FROM stdin;
\.


--
-- TOC entry 4034 (class 0 OID 22982)
-- Dependencies: 233
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallets (id, "brandId", name, balance, type, currency, color, "createdBy", "createdAt", "updatedAt") FROM stdin;
cmf9m32xv00015n4xykfga81x	cmf8wczh40005ck2enc8fe2ia	Bussiness Wallet	80000	BUSINESS	EGP	bg-gradient-to-br from-gray-500 to-gray-600	cmf8wczgw0003ck2ee4pspute	2025-09-07 11:30:36.067	2025-09-07 11:30:36.067
cmfk5j5yh00057bgqzeks18f9	cmfb4v2en0003zl8n346klzlu	AAA	8687	CUSTOM	EGP	bg-gradient-to-br from-blue-500 to-blue-600	cmfb4v2ec0001zl8npyncsuls	2025-09-14 20:32:40.934	2025-09-14 20:32:40.934
\.


--
-- TOC entry 3748 (class 2606 OID 22680)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3807 (class 2606 OID 48829)
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3805 (class 2606 OID 48821)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- TOC entry 3792 (class 2606 OID 22832)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3802 (class 2606 OID 41279)
-- Name: bosta_imports bosta_imports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bosta_imports
    ADD CONSTRAINT bosta_imports_pkey PRIMARY KEY (id);


--
-- TOC entry 3800 (class 2606 OID 39432)
-- Name: bosta_shipments bosta_shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bosta_shipments
    ADD CONSTRAINT bosta_shipments_pkey PRIMARY KEY (id);


--
-- TOC entry 3769 (class 2606 OID 22742)
-- Name: brand_users brand_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_users
    ADD CONSTRAINT brand_users_pkey PRIMARY KEY (id);


--
-- TOC entry 3766 (class 2606 OID 22733)
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- TOC entry 3798 (class 2606 OID 33241)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3777 (class 2606 OID 22774)
-- Name: costs costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costs
    ADD CONSTRAINT costs_pkey PRIMARY KEY (id);


--
-- TOC entry 3790 (class 2606 OID 22824)
-- Name: financial_reports financial_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_reports
    ADD CONSTRAINT financial_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 3781 (class 2606 OID 22790)
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- TOC entry 3763 (class 2606 OID 22724)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 3773 (class 2606 OID 22758)
-- Name: payables payables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT payables_pkey PRIMARY KEY (id);


--
-- TOC entry 3823 (class 2606 OID 72166)
-- Name: phone_verifications phone_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.phone_verifications
    ADD CONSTRAINT phone_verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3757 (class 2606 OID 22707)
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- TOC entry 3783 (class 2606 OID 22799)
-- Name: project_targets project_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_targets
    ADD CONSTRAINT project_targets_pkey PRIMARY KEY (id);


--
-- TOC entry 3771 (class 2606 OID 22750)
-- Name: receivables receivables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT receivables_pkey PRIMARY KEY (id);


--
-- TOC entry 3775 (class 2606 OID 22766)
-- Name: revenues revenues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_pkey PRIMARY KEY (id);


--
-- TOC entry 3759 (class 2606 OID 22715)
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 3810 (class 2606 OID 48838)
-- Name: system_metrics system_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_metrics
    ADD CONSTRAINT system_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 3785 (class 2606 OID 22807)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 3788 (class 2606 OID 22816)
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- TOC entry 3815 (class 2606 OID 50960)
-- Name: ticket_responses ticket_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT ticket_responses_pkey PRIMARY KEY (id);


--
-- TOC entry 3812 (class 2606 OID 50949)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3779 (class 2606 OID 22782)
-- Name: transfers transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_pkey PRIMARY KEY (id);


--
-- TOC entry 3820 (class 2606 OID 69727)
-- Name: trial_notifications trial_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trial_notifications
    ADD CONSTRAINT trial_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3817 (class 2606 OID 53427)
-- Name: usage_tracking usage_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_tracking
    ADD CONSTRAINT usage_tracking_pkey PRIMARY KEY (id);


--
-- TOC entry 3754 (class 2606 OID 22697)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3752 (class 2606 OID 22689)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3796 (class 2606 OID 23001)
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3794 (class 2606 OID 22992)
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- TOC entry 3808 (class 1259 OID 48840)
-- Name: admin_sessions_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_sessions_token_key ON public.admin_sessions USING btree (token);


--
-- TOC entry 3803 (class 1259 OID 48839)
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- TOC entry 3767 (class 1259 OID 22837)
-- Name: brand_users_brandId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "brand_users_brandId_userId_key" ON public.brand_users USING btree ("brandId", "userId");


--
-- TOC entry 3761 (class 1259 OID 22976)
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- TOC entry 3764 (class 1259 OID 22836)
-- Name: invoices_stripeInvoiceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON public.invoices USING btree ("stripeInvoiceId");


--
-- TOC entry 3821 (class 1259 OID 72167)
-- Name: phone_verifications_phone_otpCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "phone_verifications_phone_otpCode_key" ON public.phone_verifications USING btree (phone, "otpCode");


--
-- TOC entry 3760 (class 1259 OID 22835)
-- Name: subscriptions_stripeSubscriptionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON public.subscriptions USING btree ("stripeSubscriptionId");


--
-- TOC entry 3786 (class 1259 OID 22838)
-- Name: team_members_brandId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "team_members_brandId_userId_key" ON public.team_members USING btree ("brandId", "userId");


--
-- TOC entry 3813 (class 1259 OID 50961)
-- Name: tickets_ticketId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "tickets_ticketId_key" ON public.tickets USING btree ("ticketId");


--
-- TOC entry 3818 (class 1259 OID 53428)
-- Name: usage_tracking_userId_brandId_resourceType_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "usage_tracking_userId_brandId_resourceType_key" ON public.usage_tracking USING btree ("userId", "brandId", "resourceType");


--
-- TOC entry 3755 (class 1259 OID 22834)
-- Name: user_sessions_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_sessions_token_key ON public.user_sessions USING btree (token);


--
-- TOC entry 3749 (class 1259 OID 22833)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 3750 (class 1259 OID 31027)
-- Name: users_googleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "users_googleId_key" ON public.users USING btree ("googleId");


--
-- TOC entry 3865 (class 2606 OID 48841)
-- Name: admin_sessions admin_sessions_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT "admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3852 (class 2606 OID 48846)
-- Name: audit_logs audit_logs_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3853 (class 2606 OID 22964)
-- Name: audit_logs audit_logs_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3854 (class 2606 OID 22969)
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3864 (class 2606 OID 41280)
-- Name: bosta_imports bosta_imports_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bosta_imports
    ADD CONSTRAINT "bosta_imports_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3863 (class 2606 OID 41285)
-- Name: bosta_shipments bosta_shipments_bostaImportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bosta_shipments
    ADD CONSTRAINT "bosta_shipments_bostaImportId_fkey" FOREIGN KEY ("bostaImportId") REFERENCES public.bosta_imports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3830 (class 2606 OID 22864)
-- Name: brand_users brand_users_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_users
    ADD CONSTRAINT "brand_users_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3831 (class 2606 OID 22869)
-- Name: brand_users brand_users_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_users
    ADD CONSTRAINT "brand_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3829 (class 2606 OID 22859)
-- Name: brands brands_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT "brands_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3862 (class 2606 OID 33242)
-- Name: categories categories_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3840 (class 2606 OID 22904)
-- Name: costs costs_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costs
    ADD CONSTRAINT "costs_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3841 (class 2606 OID 22909)
-- Name: costs costs_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costs
    ADD CONSTRAINT "costs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3851 (class 2606 OID 22959)
-- Name: financial_reports financial_reports_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_reports
    ADD CONSTRAINT "financial_reports_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3844 (class 2606 OID 22924)
-- Name: inventory inventory_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "inventory_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3845 (class 2606 OID 22929)
-- Name: inventory inventory_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "inventory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3827 (class 2606 OID 22854)
-- Name: invoices invoices_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3828 (class 2606 OID 22977)
-- Name: invoices invoices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3834 (class 2606 OID 22884)
-- Name: payables payables_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT "payables_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3835 (class 2606 OID 22889)
-- Name: payables payables_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT "payables_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3846 (class 2606 OID 22934)
-- Name: project_targets project_targets_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_targets
    ADD CONSTRAINT "project_targets_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3847 (class 2606 OID 22939)
-- Name: project_targets project_targets_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_targets
    ADD CONSTRAINT "project_targets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3832 (class 2606 OID 22874)
-- Name: receivables receivables_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT "receivables_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3833 (class 2606 OID 22879)
-- Name: receivables receivables_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT "receivables_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3836 (class 2606 OID 43170)
-- Name: revenues revenues_bostaImportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT "revenues_bostaImportId_fkey" FOREIGN KEY ("bostaImportId") REFERENCES public.bosta_imports(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3837 (class 2606 OID 43175)
-- Name: revenues revenues_bostaShipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT "revenues_bostaShipmentId_fkey" FOREIGN KEY ("bostaShipmentId") REFERENCES public.bosta_shipments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3838 (class 2606 OID 22894)
-- Name: revenues revenues_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT "revenues_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3839 (class 2606 OID 22899)
-- Name: revenues revenues_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT "revenues_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3825 (class 2606 OID 22849)
-- Name: subscriptions subscriptions_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3826 (class 2606 OID 22844)
-- Name: subscriptions subscriptions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3848 (class 2606 OID 22944)
-- Name: tasks tasks_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3849 (class 2606 OID 22949)
-- Name: tasks tasks_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3850 (class 2606 OID 22954)
-- Name: team_members team_members_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT "team_members_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3868 (class 2606 OID 50977)
-- Name: ticket_responses ticket_responses_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT "ticket_responses_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3869 (class 2606 OID 50972)
-- Name: ticket_responses ticket_responses_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT "ticket_responses_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3866 (class 2606 OID 50962)
-- Name: tickets tickets_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3867 (class 2606 OID 50967)
-- Name: tickets tickets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3842 (class 2606 OID 22914)
-- Name: transfers transfers_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT "transfers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3843 (class 2606 OID 22919)
-- Name: transfers transfers_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT "transfers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3872 (class 2606 OID 69728)
-- Name: trial_notifications trial_notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trial_notifications
    ADD CONSTRAINT "trial_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3870 (class 2606 OID 53434)
-- Name: usage_tracking usage_tracking_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_tracking
    ADD CONSTRAINT "usage_tracking_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3871 (class 2606 OID 53429)
-- Name: usage_tracking usage_tracking_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_tracking
    ADD CONSTRAINT "usage_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3824 (class 2606 OID 22839)
-- Name: user_sessions user_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3857 (class 2606 OID 23012)
-- Name: wallet_transactions wallet_transactions_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3858 (class 2606 OID 23032)
-- Name: wallet_transactions wallet_transactions_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3859 (class 2606 OID 23022)
-- Name: wallet_transactions wallet_transactions_fromWalletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3860 (class 2606 OID 23027)
-- Name: wallet_transactions wallet_transactions_toWalletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3861 (class 2606 OID 23017)
-- Name: wallet_transactions wallet_transactions_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3855 (class 2606 OID 23002)
-- Name: wallets wallets_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT "wallets_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3856 (class 2606 OID 23007)
-- Name: wallets wallets_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT "wallets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2025-09-18 15:33:27 EEST

--
-- PostgreSQL database dump complete
--

\unrestrict GPd1cUvrhvF0JTpJ2khWvkUkNrFtDcAE2GE68hJ123rIWjVSef61Zoa3b1DpEbx

