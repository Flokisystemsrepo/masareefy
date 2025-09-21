--
-- PostgreSQL database dump
--

\restrict H3rhuhTIAYK77b6fTmOAHqgf4X4hpEDwyqNhvOwTVF9NWB7wuRBn3EjCSIj9gCV

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-21 18:20:19

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
-- TOC entry 4975 (class 0 OID 17477)
-- Dependencies: 225
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, "brandId", name, color, type, "createdAt", "updatedAt") FROM stdin;
1	1	Masareefy updates	bg-blue-100 text-blue-800	expense	2025-04-26 05:07:33	2025-08-19 23:13:06
2	1	Amer salary	bg-blue-100 text-blue-800	expense	2025-04-26 05:07:33	2025-08-19 23:13:06
3	1	Shipping Fees	bg-blue-100 text-blue-800	expense	2025-04-26 05:07:33	2025-08-19 23:13:06
4	1	Marketing Team Salariees	bg-blue-100 text-blue-800	expense	2025-04-26 05:07:33	2025-08-19 23:13:06
5	1	Shoots	bg-blue-100 text-blue-800	expense	2025-04-26 05:07:33	2025-08-19 23:13:06
6	2	Rent	bg-blue-100 text-blue-800	expense	2025-04-26 05:07:33	2025-08-19 23:13:06
7	2	Salaries	bg-blue-100 text-blue-800	expense	2025-04-26 05:07:33	2025-08-19 23:13:06
8	2	Utilities	bg-blue-100 text-blue-800	expense	2025-04-26 05:07:33	2025-08-19 23:13:06
9	2	Marketing	bg-blue-100 text-blue-800	expense	2025-04-26 05:07:33	2025-08-19 23:13:06
10	2	Shipping	bg-blue-100 text-blue-800	expense	2025-04-26 05:07:33	2025-08-19 23:13:06
11	13	Shipping Fees	bg-blue-100 text-blue-800	expense	2025-05-11 09:44:56	2025-08-19 23:13:06
12	14	salary	bg-blue-100 text-blue-800	expense	2025-05-11 17:42:35	2025-08-19 23:13:06
13	14	youmna	bg-blue-100 text-blue-800	expense	2025-05-11 17:42:35	2025-08-19 23:13:06
14	14	zeyad	bg-blue-100 text-blue-800	expense	2025-05-11 17:42:35	2025-08-19 23:13:06
15	14	test rev	bg-blue-100 text-blue-800	expense	2025-05-11 17:42:35	2025-08-19 23:13:06
16	14	Shipping	bg-blue-100 text-blue-800	expense	2025-05-11 17:42:35	2025-08-19 23:13:06
17	14	Shipping Fees	bg-blue-100 text-blue-800	expense	2025-05-11 17:42:35	2025-08-19 23:13:06
18	14	new	bg-blue-100 text-blue-800	expense	2025-05-11 17:42:35	2025-08-19 23:13:06
19	17	Marketing Team Salaries	bg-blue-100 text-blue-800	expense	2025-06-25 13:00:01	2025-08-19 23:13:06
20	17	Media buyer commision	bg-blue-100 text-blue-800	expense	2025-06-25 13:00:01	2025-08-19 23:13:06
21	17	Summer 25 Shoot	bg-blue-100 text-blue-800	expense	2025-06-25 13:00:01	2025-08-19 23:13:06
22	17	customer Service	bg-blue-100 text-blue-800	expense	2025-06-25 13:00:01	2025-08-19 23:13:06
23	18	zizoo	bg-blue-100 text-blue-800	expense	2025-06-25 13:04:48	2025-08-19 23:13:06
24	18	shoot	bg-blue-100 text-blue-800	expense	2025-06-25 13:04:48	2025-08-19 23:13:06
25	19	Salary	bg-blue-100 text-blue-800	expense	2025-06-27 15:25:30	2025-08-19 23:13:06
26	19	Shoot	bg-blue-100 text-blue-800	expense	2025-06-27 15:25:30	2025-08-19 23:13:06
27	22	shoot	bg-blue-100 text-blue-800	expense	2025-07-03 19:18:47	2025-08-19 23:13:06
28	22	salary	bg-blue-100 text-blue-800	expense	2025-07-03 19:18:47	2025-08-19 23:13:06
29	22	marketing	bg-blue-100 text-blue-800	expense	2025-07-03 19:18:47	2025-08-19 23:13:06
30	22	ads	bg-blue-100 text-blue-800	expense	2025-07-03 19:18:47	2025-08-19 23:13:06
31	22	shopify subscrition	bg-blue-100 text-blue-800	expense	2025-07-03 19:18:47	2025-08-19 23:13:06
32	22	canva	bg-blue-100 text-blue-800	expense	2025-07-03 19:18:47	2025-08-19 23:13:06
33	22	production	bg-blue-100 text-blue-800	expense	2025-07-03 19:18:47	2025-08-19 23:13:06
34	42	salary	bg-blue-100 text-blue-800	expense	2025-07-14 15:21:22	2025-08-19 23:13:06
35	42	Marketing	bg-blue-100 text-blue-800	expense	2025-07-14 15:21:22	2025-08-19 23:13:06
36	42	ads	bg-blue-100 text-blue-800	expense	2025-07-14 15:21:22	2025-08-19 23:13:06
37	42	samples	bg-blue-100 text-blue-800	expense	2025-07-14 15:21:22	2025-08-19 23:13:06
38	75	salariies	bg-blue-100 text-blue-800	expense	2025-07-20 00:41:59	2025-09-01 20:37:04
39	75	miscellaneous	bg-blue-100 text-blue-800	expense	2025-07-20 00:41:59	2025-09-01 20:37:04
40	75	subscribtions	bg-blue-100 text-blue-800	expense	2025-07-20 00:41:59	2025-09-01 20:37:04
41	75	investment	bg-blue-100 text-blue-800	expense	2025-07-20 00:41:59	2025-09-01 20:37:04
42	75	asset	bg-blue-100 text-blue-800	expense	2025-07-20 00:41:59	2025-09-01 20:37:04
43	75	sadaqa	bg-blue-100 text-blue-800	expense	2025-07-20 00:41:59	2025-09-01 20:37:04
44	101	ads	bg-blue-100 text-blue-800	expense	2025-08-08 12:52:00	2025-08-20 15:41:39
45	101	bahr	bg-blue-100 text-blue-800	expense	2025-08-08 12:52:00	2025-08-20 15:41:39
46	101	mohamed ashraf	bg-blue-100 text-blue-800	expense	2025-08-08 12:52:00	2025-08-20 15:41:39
47	101	khadija	bg-blue-100 text-blue-800	expense	2025-08-08 12:52:00	2025-08-20 15:41:39
48	101	shopify	bg-blue-100 text-blue-800	expense	2025-08-08 12:52:00	2025-08-20 15:41:39
49	101	Shipping Fees	bg-blue-100 text-blue-800	expense	2025-08-08 12:52:00	2025-08-20 15:41:39
50	110	marketing	bg-blue-100 text-blue-800	expense	2025-08-22 22:37:07	2025-08-23 00:07:01
51	110	office rent	bg-blue-100 text-blue-800	expense	2025-08-22 22:37:07	2025-08-23 00:07:01
52	110	hanna	bg-blue-100 text-blue-800	expense	2025-08-22 22:37:07	2025-08-23 00:07:01
53	110	helmy	bg-blue-100 text-blue-800	expense	2025-08-22 22:37:07	2025-08-23 00:07:01
54	110	seif	bg-blue-100 text-blue-800	expense	2025-08-22 22:37:07	2025-08-23 00:07:01
55	110	shopify	bg-blue-100 text-blue-800	expense	2025-08-22 22:37:07	2025-08-23 00:07:01
56	110	chatgbt	bg-blue-100 text-blue-800	expense	2025-08-22 22:37:07	2025-08-23 00:07:01
57	110	liabilties	bg-blue-100 text-blue-800	expense	2025-08-22 22:37:07	2025-08-23 00:07:01
58	110	helmys mom	bg-blue-100 text-blue-800	expense	2025-08-22 22:37:07	2025-08-23 00:07:01
59	110	turouq rent	bg-blue-100 text-blue-800	expense	2025-08-22 22:37:07	2025-08-23 00:07:01
60	114	Subscriptions	bg-blue-100 text-blue-800	expense	2025-09-01 17:17:31	2025-09-01 20:36:17
61	114	Fabrics	bg-blue-100 text-blue-800	expense	2025-09-01 17:17:31	2025-09-01 20:36:17
62	114	FACTORY LOAN	bg-blue-100 text-blue-800	expense	2025-09-01 17:17:31	2025-09-01 20:36:17
63	114	ADS	bg-blue-100 text-blue-800	expense	2025-09-01 17:17:31	2025-09-01 20:36:17
64	114	Transport	bg-blue-100 text-blue-800	expense	2025-09-01 17:17:31	2025-09-01 20:36:17
\.


-- Completed on 2025-09-21 18:20:19

--
-- PostgreSQL database dump complete
--

\unrestrict H3rhuhTIAYK77b6fTmOAHqgf4X4hpEDwyqNhvOwTVF9NWB7wuRBn3EjCSIj9gCV

