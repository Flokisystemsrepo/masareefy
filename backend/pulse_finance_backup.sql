--
-- PostgreSQL database dump
--

\restrict Xuk0fOFWpcv485aHW3Q8dwLs2aZZpSDTNGMu7S6ZELVu4ppLLuEv1mhHLVNV3yk

-- Dumped from database version 15.14 (Homebrew)
-- Dumped by pg_dump version 15.14 (Homebrew)

-- Started on 2025-09-07 12:42:49 EEST

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
DROP INDEX public."tickets_ticketId_key";
DROP INDEX public."team_members_brandId_userId_key";
DROP INDEX public."subscriptions_stripeSubscriptionId_key";
DROP INDEX public."invoices_stripeInvoiceId_key";
DROP INDEX public."invoices_invoiceNumber_key";
DROP INDEX public."brand_users_brandId_userId_key";
DROP INDEX public.admins_email_key;
DROP INDEX public.admin_sessions_token_key;
ALTER TABLE ONLY public.wallets DROP CONSTRAINT wallets_pkey;
ALTER TABLE ONLY public.wallet_transactions DROP CONSTRAINT wallet_transactions_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.user_sessions DROP CONSTRAINT user_sessions_pkey;
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
    "trialDays" integer DEFAULT 7 NOT NULL,
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
    "trialStart" timestamp(3) without time zone
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
-- TOC entry 3979 (class 0 OID 22672)
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
\.


--
-- TOC entry 4004 (class 0 OID 48822)
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
\.


--
-- TOC entry 4003 (class 0 OID 48809)
-- Dependencies: 238
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, email, "passwordHash", "firstName", "lastName", role, permissions, "isActive", "lastLoginAt", "loginAttempts", "lockedUntil", "ipWhitelist", "createdAt", "updatedAt") FROM stdin;
cmf8k5a9q0000qwshuraovgh5	admin@admin.com	$2b$12$TLM1mMpJ.K6oPgRi6.B1W.NuIMO6N5HSeNFw4jYp3D1lMi818bLw6	Admin	User	super_admin	["users.read", "users.write", "users.delete", "brands.read", "brands.write", "brands.delete", "subscriptions.read", "subscriptions.write", "subscriptions.delete", "analytics.read", "system.read", "system.write", "security.read", "security.write", "security.delete", "tickets.read", "tickets.write", "tickets.delete"]	t	2025-09-07 00:11:16.034	0	\N	{}	2025-09-06 17:48:33.471	2025-09-07 00:11:16.035
\.


--
-- TOC entry 3997 (class 0 OID 22825)
-- Dependencies: 232
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "brandId", "userId", action, "tableName", "recordId", "oldValues", "newValues", "createdAt", "adminId") FROM stdin;
\.


--
-- TOC entry 4002 (class 0 OID 41272)
-- Dependencies: 237
-- Data for Name: bosta_imports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bosta_imports (id, "brandId", "fileName", "totalOrders", "expectedCash", delivered, returned, "returnRate", "deliveryRate", "processedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 4001 (class 0 OID 39422)
-- Dependencies: 236
-- Data for Name: bosta_shipments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bosta_shipments (id, "trackingNumber", "codAmount", "businessReference", "deliveredAt", "createdAt", "updatedAt", "bostaImportId", "consigneeName", "consigneePhone", "deliveryState", description, "dropOffCity", "dropOffFirstLine", "expectedDeliveryDate", "isDelivered", "isReturned", "numberOfAttempts", "originalCreatedAt", "originalUpdatedAt", "revenueCreated", sku, type) FROM stdin;
\.


--
-- TOC entry 3986 (class 0 OID 22734)
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
\.


--
-- TOC entry 3985 (class 0 OID 22725)
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
\.


--
-- TOC entry 4000 (class 0 OID 33233)
-- Dependencies: 235
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, "brandId", name, color, type, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3990 (class 0 OID 22767)
-- Dependencies: 225
-- Data for Name: costs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.costs (id, "brandId", name, amount, category, date, vendor, "receiptUrl", "createdBy", "createdAt", "updatedAt", "costType") FROM stdin;
\.


--
-- TOC entry 3996 (class 0 OID 22817)
-- Dependencies: 231
-- Data for Name: financial_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.financial_reports (id, "brandId", "reportType", data, "generatedAt", "createdBy") FROM stdin;
\.


--
-- TOC entry 3992 (class 0 OID 22783)
-- Dependencies: 227
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory (id, "brandId", "productName", category, status, description, "createdBy", "createdAt", "updatedAt", "baseSku", colors, "currentStock", location, "reorderLevel", "sellingPrice", sizes, supplier, "unitCost") FROM stdin;
\.


--
-- TOC entry 3984 (class 0 OID 22716)
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
\.


--
-- TOC entry 3988 (class 0 OID 22751)
-- Dependencies: 223
-- Data for Name: payables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payables (id, "brandId", "entityName", amount, "dueDate", status, description, "invoiceNumber", "receiptUrl", "createdBy", "createdAt", "updatedAt", "autoConvertToCost") FROM stdin;
\.


--
-- TOC entry 3982 (class 0 OID 22698)
-- Dependencies: 217
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plans (id, name, "priceMonthly", "priceYearly", features, "maxBrands", "maxUsers", "trialDays", "isActive", "createdAt", "updatedAt") FROM stdin;
cmf4835bx0000dwzp6x9f3nb5	Free	0	0	{"limits": {"users": 1, "brands": 1, "transactions": 100}, "features": ["Basic dashboard", "Add revenue entries", "Add cost entries", "Basic financial tracking", "Email support"], "lockedFeatures": ["Advanced analytics", "Team management", "Inventory management", "Project targets", "Wallet management", "Transfers", "Receivables & Payables", "Tasks management", "Reports", "Shopify integration", "Best sellers tracking"]}	1	1	0	t	2025-09-03 16:59:53.662	2025-09-03 16:59:53.662
cmf5vz5oe0000egh0tgkeyxv4	Starter	299	2990	{"limits": {"users": 2, "brands": 1, "wallets": 2, "teamMembers": 2, "transactions": -1, "inventoryItems": 100}, "features": ["Revenue & Cost tracking", "Inventory management (100 items)", "Team management (2 members)", "Wallet management (2 wallets)", "Basic reports & branding", "Email support"], "lockedFeatures": ["Shopify integration", "Bosta integration", "Business insights", "Advanced analytics"]}	1	2	7	t	2025-09-04 20:56:24.447	2025-09-04 20:56:24.447
cmf5vz5ol0001egh0lltyxnvb	Professional	499	4990	{"limits": {"users": -1, "brands": 1, "wallets": -1, "teamMembers": -1, "transactions": -1, "inventoryItems": -1}, "features": ["Everything in Starter", "Unlimited inventory items", "Unlimited team members", "Unlimited wallets", "Shopify integration", "Bosta integration", "Business insights & analytics", "Priority support"], "integrations": ["shopify", "bosta"]}	1	-1	14	t	2025-09-04 20:56:24.454	2025-09-04 20:56:24.454
\.


--
-- TOC entry 3993 (class 0 OID 22791)
-- Dependencies: 228
-- Data for Name: project_targets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_targets (id, "brandId", name, goal, "targetPieces", "currentPieces", category, deadline, status, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3987 (class 0 OID 22743)
-- Dependencies: 222
-- Data for Name: receivables; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.receivables (id, "brandId", "entityName", amount, "dueDate", status, description, "invoiceNumber", "receiptUrl", "createdBy", "createdAt", "updatedAt", "autoConvertToRevenue") FROM stdin;
\.


--
-- TOC entry 3989 (class 0 OID 22759)
-- Dependencies: 224
-- Data for Name: revenues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.revenues (id, "brandId", name, amount, category, date, source, "receiptUrl", "createdBy", "createdAt", "updatedAt", "bostaImportId", "bostaShipmentId") FROM stdin;
\.


--
-- TOC entry 3983 (class 0 OID 22708)
-- Dependencies: 218
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, "userId", "planId", status, "currentPeriodStart", "currentPeriodEnd", "stripeSubscriptionId", "stripeCustomerId", "createdAt", "updatedAt", "cancelAtPeriodEnd", "cancelledAt", "paymentMethod", "trialEnd", "trialStart") FROM stdin;
cmeyl0qpj000r2apz2sl9th9i	cmeyl0qpf000l2apzvu6yswiq	cmf4835bx0000dwzp6x9f3nb5	trialing	2025-08-30 18:15:19.35	2025-09-13 18:15:19.35	\N	\N	2025-08-30 18:15:19.351	2025-09-04 20:56:24.428	f	\N	mock	2025-09-13 18:15:19.35	2025-08-30 18:15:19.35
cmeyl51st00132apzh5zwc5u2	cmeyl51so000x2apz9nihi9pq	cmf4835bx0000dwzp6x9f3nb5	trialing	2025-08-30 18:18:40.349	2025-09-13 18:18:40.349	\N	\N	2025-08-30 18:18:40.349	2025-09-04 20:56:24.428	f	\N	mock	2025-09-13 18:18:40.349	2025-08-30 18:18:40.349
cmf494c9l0007zd1uvibifqob	cmf494c920001zd1utvhhddlu	cmf4835bx0000dwzp6x9f3nb5	trialing	2025-09-03 17:28:48.92	2025-09-10 17:28:48.92	\N	\N	2025-09-03 17:28:48.921	2025-09-04 20:56:24.428	f	\N	mock	2025-09-10 17:28:48.92	2025-09-03 17:28:48.92
cmey1nw010007819wjxrwa077	cmey1nvzm0001819wwuhwe9od	cmf5vz5ol0001egh0lltyxnvb	active	2025-08-30 09:13:33.236	2025-09-29 09:13:33.236	\N	\N	2025-08-30 09:13:26.978	2025-09-04 21:17:02.364	f	\N	mock	2025-09-06 09:13:26.977	2025-08-30 09:13:26.977
cmf5cyyqe0007qzcy81b4fhed	cmf5cyypi0001qzcy1ddu95zm	cmf4835bx0000dwzp6x9f3nb5	active	2025-09-04 12:04:22.741	2025-09-04 12:04:22.741	\N	\N	2025-09-04 12:04:22.742	2025-09-06 20:58:27.268	f	\N	mock	2025-09-04 12:04:22.741	2025-09-04 12:04:22.741
cmf8wczhj0009ck2ejyqh8mur	cmf8wczgw0003ck2ee4pspute	cmf5vz5ol0001egh0lltyxnvb	trialing	2025-09-06 23:30:28.134	2025-09-20 23:30:28.134	\N	\N	2025-09-06 23:30:28.135	2025-09-06 23:30:28.135	f	\N	mock	2025-09-20 23:30:28.134	2025-09-06 23:30:28.134
\.


--
-- TOC entry 4005 (class 0 OID 48830)
-- Dependencies: 240
-- Data for Name: system_metrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_metrics (id, date, "totalUsers", "totalBrands", "activeSubscriptions", "totalRevenue", "totalCosts", "apiCalls", "errorCount", "createdAt") FROM stdin;
cmf8k5a9z0001qwsheua9n0to	2025-09-06 17:48:33.48	0	0	0	0	0	0	0	2025-09-06 17:48:33.48
cmf8khtap0001140iwxklqw0w	2025-09-06 17:58:18.001	0	0	0	0	0	0	0	2025-09-06 17:58:18.001
\.


--
-- TOC entry 3994 (class 0 OID 22800)
-- Dependencies: 229
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, "brandId", title, description, "assignedTo", "dueDate", status, priority, "createdBy", "createdAt", "updatedAt", category) FROM stdin;
\.


--
-- TOC entry 3995 (class 0 OID 22808)
-- Dependencies: 230
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, "brandId", "userId", role, permissions, "joinedAt") FROM stdin;
\.


--
-- TOC entry 4007 (class 0 OID 50950)
-- Dependencies: 242
-- Data for Name: ticket_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_responses (id, "ticketId", message, "isInternal", "isFromAdmin", "authorId", "authorName", "authorEmail", attachments, "createdAt", "updatedAt") FROM stdin;
cmf8ylt2q000710evsdjgrlne	cmf8xc2ld000110evin1ymtyt	thanks	f	t	cmf8k5a9q0000qwshuraovgh5	Admin User	admin@admin.com	[]	2025-09-07 00:33:18.961	2025-09-07 00:33:18.961
\.


--
-- TOC entry 4006 (class 0 OID 50939)
-- Dependencies: 241
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tickets (id, "ticketId", "fullName", email, category, subject, description, status, priority, attachments, "assignedToId", "userId", "resolvedAt", "closedAt", "createdAt", "updatedAt") FROM stdin;
cmf8vtomy0001m02cswuoi8mt	TK-000001	Test User	test@example.com	Technical Issue	Test Ticket	This is a test ticket to verify the system is working correctly.	Open	Medium	[]	\N	\N	\N	\N	2025-09-06 23:15:27.611	2025-09-06 23:15:27.611
cmf8ws2we000fck2eolp3cpja	TK-000002	Zeyad Emad	zoz@gmail.com	Feature Request	hvhjhjhvhjv	knk,nnkbvbjkbkbkbjkjjkgjkhjkghjkgjkg	Open	Medium	[]	\N	cmf8wczgw0003ck2ee4pspute	\N	\N	2025-09-06 23:42:12.398	2025-09-06 23:42:12.398
cmf8xc2ld000110evin1ymtyt	TK-000003	Zeyad Emad 	zeiad_agamy@icloud.com	Technical Issue	aaaaaaaaaa	aaasndkndklndnkldbdbjlbdjbdjbjdbdljdbjdnbd	Open	Medium	[]	\N	cmf8wczgw0003ck2ee4pspute	\N	\N	2025-09-06 23:57:45.12	2025-09-06 23:57:45.12
\.


--
-- TOC entry 3991 (class 0 OID 22775)
-- Dependencies: 226
-- Data for Name: transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transfers (id, "brandId", type, "fromLocation", "toLocation", quantity, description, "transferDate", "createdBy", "createdAt", "updatedAt", "deductFromStock", "inventoryItemId") FROM stdin;
\.


--
-- TOC entry 3981 (class 0 OID 22690)
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
\.


--
-- TOC entry 3980 (class 0 OID 22681)
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
\.


--
-- TOC entry 3999 (class 0 OID 22993)
-- Dependencies: 234
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_transactions (id, "brandId", "walletId", type, "fromWalletId", "toWalletId", amount, description, date, status, "createdBy", "createdAt", "updatedAt", category, "countAsCost", "countAsRevenue") FROM stdin;
\.


--
-- TOC entry 3998 (class 0 OID 22982)
-- Dependencies: 233
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallets (id, "brandId", name, balance, type, currency, color, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3723 (class 2606 OID 22680)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3782 (class 2606 OID 48829)
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3780 (class 2606 OID 48821)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- TOC entry 3767 (class 2606 OID 22832)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3777 (class 2606 OID 41279)
-- Name: bosta_imports bosta_imports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bosta_imports
    ADD CONSTRAINT bosta_imports_pkey PRIMARY KEY (id);


--
-- TOC entry 3775 (class 2606 OID 39432)
-- Name: bosta_shipments bosta_shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bosta_shipments
    ADD CONSTRAINT bosta_shipments_pkey PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 22742)
-- Name: brand_users brand_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_users
    ADD CONSTRAINT brand_users_pkey PRIMARY KEY (id);


--
-- TOC entry 3741 (class 2606 OID 22733)
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- TOC entry 3773 (class 2606 OID 33241)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3752 (class 2606 OID 22774)
-- Name: costs costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costs
    ADD CONSTRAINT costs_pkey PRIMARY KEY (id);


--
-- TOC entry 3765 (class 2606 OID 22824)
-- Name: financial_reports financial_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_reports
    ADD CONSTRAINT financial_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 22790)
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 22724)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 3748 (class 2606 OID 22758)
-- Name: payables payables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT payables_pkey PRIMARY KEY (id);


--
-- TOC entry 3732 (class 2606 OID 22707)
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- TOC entry 3758 (class 2606 OID 22799)
-- Name: project_targets project_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_targets
    ADD CONSTRAINT project_targets_pkey PRIMARY KEY (id);


--
-- TOC entry 3746 (class 2606 OID 22750)
-- Name: receivables receivables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT receivables_pkey PRIMARY KEY (id);


--
-- TOC entry 3750 (class 2606 OID 22766)
-- Name: revenues revenues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT revenues_pkey PRIMARY KEY (id);


--
-- TOC entry 3734 (class 2606 OID 22715)
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- TOC entry 3785 (class 2606 OID 48838)
-- Name: system_metrics system_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_metrics
    ADD CONSTRAINT system_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 3760 (class 2606 OID 22807)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 3763 (class 2606 OID 22816)
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- TOC entry 3790 (class 2606 OID 50960)
-- Name: ticket_responses ticket_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT ticket_responses_pkey PRIMARY KEY (id);


--
-- TOC entry 3787 (class 2606 OID 50949)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3754 (class 2606 OID 22782)
-- Name: transfers transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_pkey PRIMARY KEY (id);


--
-- TOC entry 3729 (class 2606 OID 22697)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3727 (class 2606 OID 22689)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3771 (class 2606 OID 23001)
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3769 (class 2606 OID 22992)
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- TOC entry 3783 (class 1259 OID 48840)
-- Name: admin_sessions_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_sessions_token_key ON public.admin_sessions USING btree (token);


--
-- TOC entry 3778 (class 1259 OID 48839)
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- TOC entry 3742 (class 1259 OID 22837)
-- Name: brand_users_brandId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "brand_users_brandId_userId_key" ON public.brand_users USING btree ("brandId", "userId");


--
-- TOC entry 3736 (class 1259 OID 22976)
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- TOC entry 3739 (class 1259 OID 22836)
-- Name: invoices_stripeInvoiceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON public.invoices USING btree ("stripeInvoiceId");


--
-- TOC entry 3735 (class 1259 OID 22835)
-- Name: subscriptions_stripeSubscriptionId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON public.subscriptions USING btree ("stripeSubscriptionId");


--
-- TOC entry 3761 (class 1259 OID 22838)
-- Name: team_members_brandId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "team_members_brandId_userId_key" ON public.team_members USING btree ("brandId", "userId");


--
-- TOC entry 3788 (class 1259 OID 50961)
-- Name: tickets_ticketId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "tickets_ticketId_key" ON public.tickets USING btree ("ticketId");


--
-- TOC entry 3730 (class 1259 OID 22834)
-- Name: user_sessions_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_sessions_token_key ON public.user_sessions USING btree (token);


--
-- TOC entry 3724 (class 1259 OID 22833)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 3725 (class 1259 OID 31027)
-- Name: users_googleId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "users_googleId_key" ON public.users USING btree ("googleId");


--
-- TOC entry 3832 (class 2606 OID 48841)
-- Name: admin_sessions admin_sessions_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT "admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3819 (class 2606 OID 48846)
-- Name: audit_logs audit_logs_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3820 (class 2606 OID 22964)
-- Name: audit_logs audit_logs_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3821 (class 2606 OID 22969)
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3831 (class 2606 OID 41280)
-- Name: bosta_imports bosta_imports_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bosta_imports
    ADD CONSTRAINT "bosta_imports_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3830 (class 2606 OID 41285)
-- Name: bosta_shipments bosta_shipments_bostaImportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bosta_shipments
    ADD CONSTRAINT "bosta_shipments_bostaImportId_fkey" FOREIGN KEY ("bostaImportId") REFERENCES public.bosta_imports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3797 (class 2606 OID 22864)
-- Name: brand_users brand_users_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_users
    ADD CONSTRAINT "brand_users_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3798 (class 2606 OID 22869)
-- Name: brand_users brand_users_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brand_users
    ADD CONSTRAINT "brand_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3796 (class 2606 OID 22859)
-- Name: brands brands_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT "brands_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3829 (class 2606 OID 33242)
-- Name: categories categories_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3807 (class 2606 OID 22904)
-- Name: costs costs_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costs
    ADD CONSTRAINT "costs_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3808 (class 2606 OID 22909)
-- Name: costs costs_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.costs
    ADD CONSTRAINT "costs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3818 (class 2606 OID 22959)
-- Name: financial_reports financial_reports_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_reports
    ADD CONSTRAINT "financial_reports_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3811 (class 2606 OID 22924)
-- Name: inventory inventory_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "inventory_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3812 (class 2606 OID 22929)
-- Name: inventory inventory_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "inventory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3794 (class 2606 OID 22854)
-- Name: invoices invoices_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public.subscriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3795 (class 2606 OID 22977)
-- Name: invoices invoices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3801 (class 2606 OID 22884)
-- Name: payables payables_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT "payables_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3802 (class 2606 OID 22889)
-- Name: payables payables_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT "payables_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3813 (class 2606 OID 22934)
-- Name: project_targets project_targets_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_targets
    ADD CONSTRAINT "project_targets_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3814 (class 2606 OID 22939)
-- Name: project_targets project_targets_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_targets
    ADD CONSTRAINT "project_targets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3799 (class 2606 OID 22874)
-- Name: receivables receivables_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT "receivables_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3800 (class 2606 OID 22879)
-- Name: receivables receivables_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT "receivables_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3803 (class 2606 OID 43170)
-- Name: revenues revenues_bostaImportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT "revenues_bostaImportId_fkey" FOREIGN KEY ("bostaImportId") REFERENCES public.bosta_imports(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3804 (class 2606 OID 43175)
-- Name: revenues revenues_bostaShipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT "revenues_bostaShipmentId_fkey" FOREIGN KEY ("bostaShipmentId") REFERENCES public.bosta_shipments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3805 (class 2606 OID 22894)
-- Name: revenues revenues_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT "revenues_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3806 (class 2606 OID 22899)
-- Name: revenues revenues_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revenues
    ADD CONSTRAINT "revenues_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3792 (class 2606 OID 22849)
-- Name: subscriptions subscriptions_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES public.plans(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3793 (class 2606 OID 22844)
-- Name: subscriptions subscriptions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3815 (class 2606 OID 22944)
-- Name: tasks tasks_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3816 (class 2606 OID 22949)
-- Name: tasks tasks_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3817 (class 2606 OID 22954)
-- Name: team_members team_members_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT "team_members_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3835 (class 2606 OID 50977)
-- Name: ticket_responses ticket_responses_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT "ticket_responses_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3836 (class 2606 OID 50972)
-- Name: ticket_responses ticket_responses_ticketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT "ticket_responses_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3833 (class 2606 OID 50962)
-- Name: tickets tickets_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3834 (class 2606 OID 50967)
-- Name: tickets tickets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3809 (class 2606 OID 22914)
-- Name: transfers transfers_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT "transfers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3810 (class 2606 OID 22919)
-- Name: transfers transfers_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT "transfers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3791 (class 2606 OID 22839)
-- Name: user_sessions user_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3824 (class 2606 OID 23012)
-- Name: wallet_transactions wallet_transactions_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3825 (class 2606 OID 23032)
-- Name: wallet_transactions wallet_transactions_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3826 (class 2606 OID 23022)
-- Name: wallet_transactions wallet_transactions_fromWalletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3827 (class 2606 OID 23027)
-- Name: wallet_transactions wallet_transactions_toWalletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3828 (class 2606 OID 23017)
-- Name: wallet_transactions wallet_transactions_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3822 (class 2606 OID 23002)
-- Name: wallets wallets_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT "wallets_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3823 (class 2606 OID 23007)
-- Name: wallets wallets_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT "wallets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2025-09-07 12:42:49 EEST

--
-- PostgreSQL database dump complete
--

\unrestrict Xuk0fOFWpcv485aHW3Q8dwLs2aZZpSDTNGMu7S6ZELVu4ppLLuEv1mhHLVNV3yk

