--
-- PostgreSQL database dump
--

\restrict qbHFgkUsbBfbQ8abBfgpe9PZv333Z6U8DMD3kZzHCSiikdKIUFX5vTHuTMzsQ8H

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-21 18:20:46

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
-- TOC entry 4976 (class 0 OID 17486)
-- Dependencies: 226
-- Data for Name: costs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.costs (id, "brandId", name, amount, category, date, vendor, "receiptUrl", "createdBy", "createdAt", "updatedAt", "costType") FROM stdin;
1	2	Monthly rent payment	5000	Rent	2025-04-01 00:00:00	Landlord	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	variable
2	2	Staff salaries April	12000	Salaries	2025-03-05 00:00:00	Staff	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	variable
3	2	Facebook ads campaign	300	Marketing	2025-04-12 00:00:00	Facebook	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	variable
4	2	Regular shipping costs	150.75	Shipping	2025-03-15 00:00:00	Shipping Company	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	variable
5	2	Marketing Bundles	17000	Marketing	2025-09-09 00:00:00	Marketing Agency	\N	1	2025-05-05 09:04:22	2025-08-19 23:13:06	variable
6	2	Salaries April by me	50001	Salaries	1998-01-01 00:00:00	Staff	\N	1	2025-05-11 13:36:28	2025-08-19 23:13:06	variable
7	2	Office Rent	9900	Rent	2025-09-09 00:00:00	Landlord	\N	1	2025-05-11 17:48:51	2025-08-19 23:13:06	variable
8	2	nnnnn	399	Marketing	2025-06-10 00:00:00	Marketing Agency	\N	1	2025-06-23 02:33:04	2025-08-19 23:13:06	variable
9	14	Bosta Shipping Fees order #86398251	86.8	Shipping Fees	2024-12-22 00:00:00	Bosta	\N	1	2025-06-25 03:02:33	2025-08-19 23:13:06	variable
10	14	Bosta Shipping Fees order #79679400	91.8	Shipping Fees	2024-12-22 00:00:00	Bosta	\N	1	2025-06-25 03:02:34	2025-08-19 23:13:06	variable
11	14	Bosta Shipping Fees order #53384078	95.8	Shipping Fees	2025-01-02 00:00:00	Bosta	\N	1	2025-06-25 03:02:35	2025-08-19 23:13:06	variable
12	14	Bosta Shipping Fees order #64829760	86.8	Shipping Fees	2024-12-22 00:00:00	Bosta	\N	1	2025-06-25 03:02:36	2025-08-19 23:13:06	variable
13	14	Bosta Shipping Fees order #29045560	91.8	Shipping Fees	2024-12-25 00:00:00	Bosta	\N	1	2025-06-25 03:02:37	2025-08-19 23:13:06	variable
14	14	Bosta Shipping Fees order #21476504	100.3	Shipping Fees	2024-12-24 00:00:00	Bosta	\N	1	2025-06-25 03:02:37	2025-08-19 23:13:06	variable
15	14	Bosta Shipping Fees order #39171160	86.8	Shipping Fees	2024-12-22 00:00:00	Bosta	\N	1	2025-06-25 03:02:38	2025-08-19 23:13:06	variable
16	14	Bosta Shipping Fees order #75544473	80.8	Shipping Fees	2025-01-09 00:00:00	Bosta	\N	1	2025-06-25 03:02:39	2025-08-19 23:13:06	variable
17	14	Bosta Shipping Fees order #87875681	101.8	Shipping Fees	2024-12-22 00:00:00	Bosta	\N	1	2025-06-25 03:02:40	2025-08-19 23:13:06	variable
18	14	Bosta Shipping Fees order #87267268	89.8	Shipping Fees	2024-12-22 00:00:00	Bosta	\N	1	2025-06-25 03:02:41	2025-08-19 23:13:06	variable
19	14	Bosta Shipping Fees order #14231079	91.8	Shipping Fees	2024-12-26 00:00:00	Bosta	\N	1	2025-06-25 03:02:41	2025-08-19 23:13:06	variable
20	14	Bosta Shipping Fees order #70970583	86.8	Shipping Fees	2024-12-22 00:00:00	Bosta	\N	1	2025-06-25 03:02:42	2025-08-19 23:13:06	variable
21	1	Masareefy updates expense	5000	Masareefy updates	2025-04-26 00:00:00	Development Team	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	variable
22	1	Amer salary payment	3000	Amer salary	2025-04-26 00:00:00	Amer	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	variable
23	1	Shipping Fees payment	200	Shipping Fees	2025-04-26 00:00:00	Shipping Company	\N	1	2025-04-26 05:07:33	2025-08-19 23:13:06	variable
24	13	Shipping Fees payment	150	Shipping Fees	2025-05-11 00:00:00	Shipping Company	\N	1	2025-05-11 09:44:56	2025-08-19 23:13:06	variable
25	17	Marketing Team Salaries	8000	Marketing Team Salaries	2025-06-25 00:00:00	Marketing Team	\N	1	2025-06-25 13:00:01	2025-08-19 23:13:06	variable
26	17	Media buyer commission	2000	Media buyer commision	2025-06-25 00:00:00	Media Buyer	\N	1	2025-06-25 13:00:01	2025-08-19 23:13:06	variable
27	17	Summer 25 Shoot	5000	Summer 25 Shoot	2025-06-25 00:00:00	Photography Studio	\N	1	2025-06-25 13:00:01	2025-08-19 23:13:06	variable
28	17	Customer Service	1500	customer Service	2025-06-25 00:00:00	Customer Service Team	\N	1	2025-06-25 13:00:01	2025-08-19 23:13:06	variable
29	18	Zizoo expense	1000	zizoo	2025-06-25 00:00:00	Zizoo	\N	1	2025-06-25 13:04:48	2025-08-19 23:13:06	variable
30	18	Shoot expense	3000	shoot	2025-06-25 00:00:00	Photography Studio	\N	1	2025-06-25 13:04:48	2025-08-19 23:13:06	variable
31	19	Salary payment	4000	Salary	2025-06-27 00:00:00	Staff	\N	1	2025-06-27 15:25:30	2025-08-19 23:13:06	variable
32	19	Shoot expense	2500	Shoot	2025-06-27 00:00:00	Photography Studio	\N	1	2025-06-27 15:25:30	2025-08-19 23:13:06	variable
33	22	Shoot expense	2000	shoot	2025-07-03 00:00:00	Photography Studio	\N	1	2025-07-03 19:18:47	2025-08-19 23:13:06	variable
34	22	Salary payment	3500	salary	2025-07-03 00:00:00	Staff	\N	1	2025-07-03 19:18:47	2025-08-19 23:13:06	variable
35	22	Marketing expense	1500	marketing	2025-07-03 00:00:00	Marketing Agency	\N	1	2025-07-03 19:18:47	2025-08-19 23:13:06	variable
36	22	Ads expense	800	ads	2025-07-03 00:00:00	Ad Platform	\N	1	2025-07-03 19:18:47	2025-08-19 23:13:06	variable
37	22	Shopify subscription	29	shopify subscrition	2025-07-03 00:00:00	Shopify	\N	1	2025-07-03 19:18:47	2025-08-19 23:13:06	variable
38	22	Canva subscription	15	canva	2025-07-03 00:00:00	Canva	\N	1	2025-07-03 19:18:47	2025-08-19 23:13:06	variable
39	22	Production expense	2000	production	2025-07-03 00:00:00	Production Company	\N	1	2025-07-03 19:18:47	2025-08-19 23:13:06	variable
40	42	Salary payment	3000	salary	2025-07-14 00:00:00	Staff	\N	1	2025-07-14 15:21:22	2025-08-19 23:13:06	variable
41	42	Marketing expense	1200	Marketing	2025-07-14 00:00:00	Marketing Agency	\N	1	2025-07-14 15:21:22	2025-08-19 23:13:06	variable
42	42	Ads expense	600	ads	2025-07-14 00:00:00	Ad Platform	\N	1	2025-07-14 15:21:22	2025-08-19 23:13:06	variable
43	42	Samples expense	400	samples	2025-07-14 00:00:00	Supplier	\N	1	2025-07-14 15:21:22	2025-08-19 23:13:06	variable
44	75	Salaries payment	5000	salariies	2025-07-20 00:00:00	Staff	\N	1	2025-07-20 00:41:59	2025-09-01 20:37:04	variable
45	75	Miscellaneous expense	300	miscellaneous	2025-07-20 00:00:00	Various	\N	1	2025-07-20 00:41:59	2025-09-01 20:37:04	variable
46	75	Subscriptions	150	subscribtions	2025-07-20 00:00:00	Service Providers	\N	1	2025-07-20 00:41:59	2025-09-01 20:37:04	variable
47	75	Investment	10000	investment	2025-07-20 00:00:00	Investment Firm	\N	1	2025-07-20 00:41:59	2025-09-01 20:37:04	variable
48	75	Asset purchase	5000	asset	2025-07-20 00:00:00	Asset Supplier	\N	1	2025-07-20 00:41:59	2025-09-01 20:37:04	variable
49	75	Sadaqa	500	sadaqa	2025-07-20 00:00:00	Charity	\N	1	2025-07-20 00:41:59	2025-09-01 20:37:04	variable
50	101	Ads expense	800	ads	2025-08-08 00:00:00	Ad Platform	\N	1	2025-08-08 12:52:00	2025-08-20 15:41:39	variable
51	101	Bahr expense	200	bahr	2025-08-08 00:00:00	Bahr	\N	1	2025-08-08 12:52:00	2025-08-20 15:41:39	variable
52	101	Mohamed Ashraf expense	300	mohamed ashraf	2025-08-08 00:00:00	Mohamed Ashraf	\N	1	2025-08-08 12:52:00	2025-08-20 15:41:39	variable
53	101	Khadija expense	250	khadija	2025-08-08 00:00:00	Khadija	\N	1	2025-08-08 12:52:00	2025-08-20 15:41:39	variable
54	101	Shopify subscription	29	shopify	2025-08-08 00:00:00	Shopify	\N	1	2025-08-08 12:52:00	2025-08-20 15:41:39	variable
55	101	Shipping Fees	150	Shipping Fees	2025-08-08 00:00:00	Shipping Company	\N	1	2025-08-08 12:52:00	2025-08-20 15:41:39	variable
56	110	Marketing expense	1000	marketing	2025-08-22 00:00:00	Marketing Agency	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	variable
57	110	Office rent	2000	office rent	2025-08-22 00:00:00	Landlord	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	variable
58	110	Hanna expense	500	hanna	2025-08-22 00:00:00	Hanna	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	variable
59	110	Helmy expense	600	helmy	2025-08-22 00:00:00	Helmy	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	variable
60	110	Seif expense	400	seif	2025-08-22 00:00:00	Seif	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	variable
61	110	Shopify subscription	29	shopify	2025-08-22 00:00:00	Shopify	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	variable
62	110	ChatGPT subscription	20	chatgbt	2025-08-22 00:00:00	OpenAI	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	variable
63	110	Liabilities	1000	liabilties	2025-08-22 00:00:00	Various	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	variable
64	110	Helmys mom expense	300	helmys mom	2025-08-22 00:00:00	Helmys Mom	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	variable
65	110	Turouq rent	800	turouq rent	2025-08-22 00:00:00	Turouq	\N	1	2025-08-22 22:37:07	2025-08-23 00:07:01	variable
66	114	Subscriptions	200	Subscriptions	2025-09-01 00:00:00	Service Providers	\N	1	2025-09-01 17:17:31	2025-09-01 20:36:17	variable
67	114	Fabrics purchase	1500	Fabrics	2025-09-01 00:00:00	Fabric Supplier	\N	1	2025-09-01 17:17:31	2025-09-01 20:36:17	variable
68	114	Factory loan payment	5000	FACTORY LOAN	2025-09-01 00:00:00	Bank	\N	1	2025-09-01 17:17:31	2025-09-01 20:36:17	variable
69	114	Ads expense	800	ADS	2025-09-01 00:00:00	Ad Platform	\N	1	2025-09-01 17:17:31	2025-09-01 20:36:17	variable
70	114	Transport expense	300	Transport	2025-09-01 00:00:00	Transport Company	\N	1	2025-09-01 17:17:31	2025-09-01 20:36:17	variable
\.


-- Completed on 2025-09-21 18:20:46

--
-- PostgreSQL database dump complete
--

\unrestrict qbHFgkUsbBfbQ8abBfgpe9PZv333Z6U8DMD3kZzHCSiikdKIUFX5vTHuTMzsQ8H

