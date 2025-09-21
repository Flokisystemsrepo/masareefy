--
-- PostgreSQL database dump
--

\restrict dxRh0tRN13uatP6sOHumdoe2XtLbrjdOoxBXgqJu7oKyCeefLQYseilh95xh2xj

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-21 18:17:31

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4975 (class 0 OID 17468)
-- Dependencies: 224
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('1', '1', 'Al-Rahman Store', NULL, '{"billing_end": "2029-12-12", "billing_start": "2025-07-14", "business_address": "Egypt", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-04-26 05:07:33', '2025-08-19 23:13:06');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('2', '1', 'Al-Noor Trading', NULL, '{"billing_end": "2029-12-12", "billing_start": "2025-07-14", "business_address": "Alexandria, Egypt", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-04-26 05:07:33', '2025-08-19 23:13:06');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('13', '1', 'Muslce Mania', NULL, '{"billing_end": "2029-12-12", "billing_start": "2025-07-14", "business_address": "Alexandria, Egypt", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-05-11 09:44:56', '2025-08-19 23:13:06');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('14', '1', 'Zeyad Store', NULL, '{"billing_end": "2029-12-12", "billing_start": "2025-07-14", "business_address": "New Cairo, Egypt", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-05-11 17:42:35', '2025-08-19 23:13:06');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('17', '1', 'New Business', NULL, '{"billing_end": "2029-12-12", "billing_start": "2025-07-14", "business_address": "New Cairo", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-06-25 13:00:01', '2025-08-19 23:13:06');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('18', '1', 'Another Business', NULL, '{"billing_end": "2029-12-12", "billing_start": "2025-07-14", "business_address": "Another Business", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-06-25 13:04:48', '2025-08-19 23:13:06');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('19', '1', 'Demo bussiness', NULL, '{"billing_end": "2029-12-12", "billing_start": "2025-07-14", "business_address": "rehab", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-06-27 15:25:30', '2025-08-19 23:13:06');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('22', '1', 'last business', NULL, '{"billing_end": "2029-12-12", "billing_start": "2025-07-14", "business_address": "nginx new", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-07-03 19:18:47', '2025-08-19 23:13:06');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('42', '1', 'Dima Store', NULL, '{"billing_end": "2029-12-12", "billing_start": "2025-07-14", "business_address": "18 Business Area", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-07-14 15:21:22', '2025-08-19 23:13:06');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('75', '80', 'bellos edits', NULL, '{"billing_end": "2025-10-01", "billing_start": "2025-09-01", "business_address": "Egypt", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-07-20 00:41:59', '2025-09-01 20:37:04');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('101', '106', 'Dolixe', NULL, '{"billing_end": "2025-09-20", "billing_start": "2025-08-20", "business_address": "Egypt", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-08-08 12:52:00', '2025-08-20 15:41:39');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('110', '115', 'Zhuo&Co.', NULL, '{"billing_end": "2025-09-25", "billing_start": "2025-08-23", "business_address": "Egypt", "subscription_bundle": "starter", "subscription_status": "active"}', '2025-08-22 22:37:07', '2025-08-23 00:07:01');
INSERT INTO public.brands (id, "userId", name, "logoUrl", settings, "createdAt", "updatedAt") VALUES ('114', '119', 'Gentry', NULL, '{"billing_end": "2025-10-04", "billing_start": "2025-09-01", "business_address": "Egypt", "subscription_bundle": "pro", "subscription_status": "active"}', '2025-09-01 17:17:31', '2025-09-01 20:36:17');


-- Completed on 2025-09-21 18:17:32

--
-- PostgreSQL database dump complete
--

\unrestrict dxRh0tRN13uatP6sOHumdoe2XtLbrjdOoxBXgqJu7oKyCeefLQYseilh95xh2xj

