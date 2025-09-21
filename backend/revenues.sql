--
-- PostgreSQL database dump
--

\restrict FmqaI0apjZmD1qwbAG5AciUbFXh93N9eAByjxjG13P4LMVw8NgHdr3WGjlVv0xP

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-21 18:22:02

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
-- TOC entry 4978 (class 0 OID 17564)
-- Dependencies: 234
-- Data for Name: revenues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.revenues (id, "brandId", name, amount, category, date, source, "receiptUrl", "createdBy", "createdAt", "updatedAt", "bostaImportId", "bostaShipmentId") FROM stdin;
1	2	Smartphone sale	2599.98	Electronics	2025-04-01 00:00:00	Direct Sale	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	\N	\N
2	2	Miscellaneous sales	500	General Sales	2025-04-03 00:00:00	Direct Sale	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	\N	\N
3	2	Office supplies sale	611.99	Office Supplies	2025-04-10 00:00:00	Direct Sale	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	\N	\N
4	2	Shopify Order #1205	750	Online Sales	2024-10-03 00:00:00	Shopify	\N	1	2025-06-25 00:46:49	2025-08-19 23:13:06	\N	\N
5	2	Shopify Order #1206	700	Online Sales	2024-10-03 00:00:00	Shopify	\N	1	2025-06-25 00:46:49	2025-08-19 23:13:06	\N	\N
6	2	Shopify Order #1207	750	Online Sales	2024-10-03 00:00:00	Shopify	\N	1	2025-06-25 00:46:49	2025-08-19 23:13:06	\N	\N
7	2	Shopify Order #1208	1450	Online Sales	2024-10-03 00:00:00	Shopify	\N	1	2025-06-25 00:46:49	2025-08-19 23:13:06	\N	\N
8	2	Shopify Order #1209	700	Online Sales	2024-10-03 00:00:00	Shopify	\N	1	2025-06-25 00:46:49	2025-08-19 23:13:06	\N	\N
9	14	Shopify Order #1002	1140	Online Sales	2024-08-11 00:00:00	Shopify	\N	1	2025-06-25 06:06:04	2025-08-19 23:13:06	\N	\N
10	14	Shopify Order #1003	1140	Online Sales	2024-08-11 00:00:00	Shopify	\N	1	2025-06-25 06:06:04	2025-08-19 23:13:06	\N	\N
11	14	Shopify Order #1004	1145	Online Sales	2024-08-12 00:00:00	Shopify	\N	1	2025-06-25 06:06:04	2025-08-19 23:13:06	\N	\N
12	14	Shopify Order #1005	600	Online Sales	2024-08-12 00:00:00	Shopify	\N	1	2025-06-25 06:06:04	2025-08-19 23:13:06	\N	\N
13	14	Shopify Order #3455	600	Online Sales	2025-09-03 00:00:00	Shopify	\N	1	2025-09-03 08:42:03	2025-08-19 23:13:06	\N	\N
14	14	Shopify Order #3456	1150	Online Sales	2025-09-04 00:00:00	Shopify	\N	1	2025-09-04 02:00:07	2025-08-19 23:13:06	\N	\N
15	14	Shopify Order #3457	600	Online Sales	2025-09-04 00:00:00	Shopify	\N	1	2025-09-04 05:30:04	2025-08-19 23:13:06	\N	\N
16	1	Product Sales Revenue	5000	Product Sales	2025-04-26 00:00:00	Direct Sale	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	\N	\N
17	1	Service Revenue	3000	Services	2025-04-26 00:00:00	Service Contract	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	\N	\N
18	1	Consulting Revenue	2500	Consulting	2025-04-26 00:00:00	Consulting Contract	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	\N	\N
19	13	Shopify Order #3259	1150	Online Sales	2025-06-02 00:00:00	Shopify	\N	1	2025-06-24 21:36:03	2025-08-19 23:13:06	\N	\N
20	13	Shopify Order #3258	1150	Online Sales	2025-06-02 00:00:00	Shopify	\N	1	2025-06-24 21:36:03	2025-08-19 23:13:06	\N	\N
21	13	Shopify Order #3257	1150	Online Sales	2025-06-02 00:00:00	Shopify	\N	1	2025-06-24 21:36:03	2025-08-19 23:13:06	\N	\N
22	17	T-shirt Sales	8000	Clothing Sales	2025-06-25 00:00:00	Direct Sale	\N	1	2025-06-25 13:00:01	2025-08-19 23:13:06	\N	\N
23	17	Summer Collection Sales	5000	Clothing Sales	2025-06-25 00:00:00	Direct Sale	\N	1	2025-06-25 13:00:01	2025-08-19 23:13:06	\N	\N
24	17	Regular Sales	3000	General Sales	2025-06-25 00:00:00	Direct Sale	\N	1	2025-06-25 13:00:01	2025-08-19 23:13:06	\N	\N
25	18	Clothing Sales	4000	Clothing Sales	2025-06-25 00:00:00	Direct Sale	\N	1	2025-06-25 13:04:48	2025-08-19 23:13:06	\N	\N
26	18	Electronics Sales	2500	Electronics	2025-06-25 00:00:00	Direct Sale	\N	1	2025-06-25 13:04:48	2025-08-19 23:13:06	\N	\N
27	18	T-shirt Sales	1500	Clothing Sales	2025-06-25 00:00:00	Direct Sale	\N	1	2025-06-25 13:04:48	2025-08-19 23:13:06	\N	\N
28	19	T-shirt Sales	6000	Clothing Sales	2025-06-27 00:00:00	Direct Sale	\N	1	2025-06-27 15:25:30	2025-08-19 23:13:06	\N	\N
29	19	Summer 25 Collection	4000	Clothing Sales	2025-06-27 00:00:00	Direct Sale	\N	1	2025-06-27 15:25:30	2025-08-19 23:13:06	\N	\N
30	22	T-shirt Sales	5000	Clothing Sales	2025-07-03 00:00:00	Direct Sale	\N	1	2025-07-03 19:18:47	2025-08-19 23:13:06	\N	\N
31	42	T-shirt Sales	4000	Clothing Sales	2025-07-14 00:00:00	Direct Sale	\N	1	2025-07-14 15:21:22	2025-08-19 23:13:06	\N	\N
32	75	seth other 50%	27459	Partnership Revenue	2025-08-31 00:00:00	Partnership	\N	1	2025-09-03 12:14:08	2025-09-01 20:37:04	\N	\N
33	75	abdallah gamal august	11400	Salary Recovery	2025-08-31 00:00:00	Recovery	\N	1	2025-09-03 12:14:44	2025-09-01 20:37:04	\N	\N
34	101	Product Sales	5000	General Sales	2025-08-08 00:00:00	Direct Sale	\N	1	2025-08-08 12:52:00	2025-08-20 15:41:39	\N	\N
35	110	Zhuozy Products	8000	Product Sales	2025-08-22 00:00:00	Direct Sale	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	\N	\N
36	114	Gentry Sales Revenue	12675	Product Sales	2025-09-03 00:00:00	Direct Sale	\N	1	2025-09-03 14:16:48	2025-09-01 20:36:17	\N	\N
37	114	Additional Revenue	6740	General Sales	2025-09-03 00:00:00	Direct Sale	\N	1	2025-09-03 14:17:17	2025-09-01 20:36:17	\N	\N
\.


-- Completed on 2025-09-21 18:22:02

--
-- PostgreSQL database dump complete
--

\unrestrict FmqaI0apjZmD1qwbAG5AciUbFXh93N9eAByjxjG13P4LMVw8NgHdr3WGjlVv0xP

