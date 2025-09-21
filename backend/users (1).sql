--
-- PostgreSQL database dump
--

\restrict KykLGmblMGsLWRliPdlxogGpr6Tmbh6VX9Tk15Vh8Aqt3PnMQM0R9BCvKd7aHBc

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-21 18:21:06

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
-- TOC entry 4976 (class 0 OID 17658)
-- Dependencies: 244
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, "passwordHash", "firstName", "lastName", "emailVerified", "createdAt", "updatedAt", "googleId", picture) FROM stdin;
1	admin@masareefy.app	8b9d000a0f8d8712fd6c40ff157b87ef	Masareefy	System	t	2025-04-26 05:07:33	2025-08-03 10:40:17	\N	\N
2	zeyad@masareefy.app	776d51c869ea46b51c09f26d47a447ee	Zeyad		t	2025-04-26 05:07:33	2025-07-26 19:29:06	\N	\N
3	amr@masareefy.app	d85ba4d571c91f12045923d94b75c89e	Amr		t	2025-04-26 05:07:33	2025-07-05 04:01:49	\N	\N
4	team2@example.com	0ace6e086e9420d3cfe1be70995a45d3	Maged		t	2025-04-26 05:07:33	2025-05-11 06:57:59	\N	\N
5	another@example.com	0ace6e086e9420d3cfe1be70995a45d3	Mohamed		t	2025-04-26 05:07:33	2025-05-11 06:57:56	\N	\N
32	zeiad_agamy@icloud.com	ea7827fc72abfc1fbc678d5709a55509	Zya		t	2025-06-10 16:30:18	2025-06-10 16:30:18	\N	\N
33	amrprince739@gmail.com	d913b215e1fa05e316233c8a4f28897d	Amr	prince	t	2025-06-19 23:13:04	2025-06-19 23:13:04	\N	\N
34	nounihaytham@gmail.com	c3f3fb3ece58beb4ac98ffa34a52b3ec	Hana	Haytham	t	2025-07-02 13:00:12	2025-07-02 13:00:12	\N	\N
35	masareefy@gmail.com	c23517f73c1d0dada1c9e165844190fa	Zeyad	Emad	t	2025-07-03 19:10:56	2025-07-03 19:10:56	\N	\N
36	fathybadawi@gmail.com	5b318db6ed640d1f97047999c231e1b7	fathy	badawi	t	2025-07-04 10:16:08	2025-07-04 10:16:08	\N	\N
37	phantom.eg.co@gmail.com	a504569e965039f6aefe3a666faba64f	Mostafa	sharafeldin	t	2025-07-04 16:40:12	2025-07-04 16:40:12	\N	\N
38	voski.eg@gmail.com	34c2444d33ea48c80ffdf36ce8af3ee5	Mohamed	sobhy	t	2025-07-04 20:46:39	2025-07-09 17:00:41	\N	\N
39	abdelrahmankhairat@gmail.com	b6de36e1bd3fc5ab386515adf27f3e91	Abdelrahman	Khairat	t	2025-07-07 14:06:46	2025-07-07 14:06:46	\N	\N
40	Adhamaly700@gmail.com	a86e57bad14121f30384ded9312849d8	Adham	mohamed	t	2025-07-07 16:38:47	2025-07-07 16:38:47	\N	\N
41	ms7454181@gmail.com	6d0f3644f95d05640a633da9885a24b7	Mohamed	ashry	t	2025-07-07 16:43:47	2025-07-07 16:43:47	\N	\N
42	support@iksandar.com	633b4203117fb4e1d509bae8e7c54413	Iskandar	Ibrahim Ashman	t	2025-07-07 17:56:31	2025-07-07 17:56:31	\N	\N
43	codeeg994@gmail.com	323c8bda3a3524a7123c00a372a08b09	adham	mohamed	t	2025-07-07 20:28:18	2025-07-09 16:18:54	\N	\N
44	oawad636@gmail.com	f2c8d5e95e8be217e9fc2d33cbef36a9	Omar	Awad	t	2025-07-09 03:22:29	2025-07-09 17:13:54	\N	\N
45	mh283793@gmail.com	cd4e5d7d72d1e974c39ddca37ffb4fad	Mohamed	Hisham	t	2025-07-12 10:01:12	2025-07-12 10:01:12	\N	\N
47	yomnaahmedd5522@gmail.com	70b6d0c96597cdc58e8dce84a2928ef9	yumyum		t	2025-07-13 08:59:01	2025-07-14 08:59:11	\N	\N
48	mohamed.k.d1999@gmail.com	de497c9fa70b89472809d3a6d4ce919a	Mohamed	khaled	t	2025-07-14 04:23:40	2025-07-14 04:23:40	\N	\N
49	dalla.b@yahoo.com	c156721e597efbb778c8921aae0ff6cd	abdallah	amr	t	2025-07-14 10:00:06	2025-07-14 10:00:06	\N	\N
50	yossefgalal213@gmail.com	6d496c48f58c2da366dfe6300126a0c7	Yossef	Galal	t	2025-07-14 16:07:52	2025-07-14 16:07:52	\N	\N
51	magdyzz.au@gmail.com	e142d5ee3eec086da2eff21884ff87ea	Ahmed	Magdy	t	2025-07-14 19:01:12	2025-07-14 19:01:12	\N	\N
52	amirtadrous2011@gmail.com	5c684de2879280ef5777a40bbce0ccb4	Amir	Tadrous	t	2025-07-14 20:04:11	2025-07-14 20:04:11	\N	\N
53	ahmedhussien760500@gmail.com	a615837c97a722d934cca3458b307bda	Ahmed	Hussien	t	2025-07-14 20:05:09	2025-07-14 20:05:09	\N	\N
54	sameerdriny@gmail.com	5c7f9a3cc09778b87fcad6c661efe7e1	Sameer	El-driny	t	2025-07-14 20:59:58	2025-07-14 20:59:58	\N	\N
55	sentrecy@gmail.com	ed9c475021035ab41c12b44a62c4610d	Ahmed	mahmoud sentrecy	t	2025-07-14 21:25:57	2025-07-14 21:25:57	\N	\N
56	keladakerolos5@gmail.com	3148fb53e82d07003650509c6e667db0	kerolos	Kelada	t	2025-07-14 22:13:41	2025-07-14 22:13:41	\N	\N
57	hossam333galal@gmail.com	40cf4ab62b501ae74dd5a731f6abf8e2	Hossam	Galal	t	2025-07-14 22:23:31	2025-07-14 22:23:31	\N	\N
58	ziad.adel.mahmoud@gmail.com	377d982c8e36db70b2d388837ffa8355	Ziad	Ismail	t	2025-07-14 23:08:34	2025-07-14 23:08:34	\N	\N
59	ahmad_hamed95@yahoo.com	d579021393d93b2e70964d590aea8f0a	ahmad	hamed	t	2025-07-14 23:16:03	2025-07-14 23:16:03	\N	\N
60	ar@gettayar.com	d9c14432d5d8ba2da869cf91e0d42d61	Abanob	ramzy	t	2025-07-14 23:20:38	2025-07-14 23:20:38	\N	\N
61	omarhamedd1@gmail.com	b9844a23527ea04d342a0f176c4eb4dd	Omar	Hamed	t	2025-07-15 00:31:44	2025-07-15 00:31:44	\N	\N
62	mevurashop@gmail.com	92c8eeada0785674b99085b814cb8205	Ahmed	osama	t	2025-07-15 00:43:01	2025-07-15 00:43:01	\N	\N
63	waleednada412@gmail.com	fcc883f09633d1a0315a9648ad9715f2	Waleed	Nada	t	2025-07-15 02:20:15	2025-07-15 02:20:15	\N	\N
64	murenzo.co@gmail.com	301fbfb18d35325a7ed098e261b2a3e9	Mahmoud	Eissa	t	2025-07-15 03:34:09	2025-07-15 03:34:09	\N	\N
65	yaseis12345@gmail.com	f0ee38f7c72677f5ac670a20f297e3cd	Yassin	Mohamed ahmed	t	2025-07-15 13:22:25	2025-07-15 13:22:25	\N	\N
66	saeedhassan@me.com	7e7d9978e484f080c152cf507efcfc91	Saeed	Soudan	t	2025-07-15 14:52:53	2025-07-15 14:52:53	\N	\N
67	nizarnosseir@gmail.com	bc99455c5a40515b17fd167d4aaa4a06	Nizar	Nosseir	t	2025-07-15 18:50:04	2025-07-15 18:50:04	\N	\N
68	elarabikarim5@gmail.com	0d6f58ae69784c8308004b5cf375586b	Karim	El-Arabi	t	2025-07-15 21:00:59	2025-07-15 21:00:59	\N	\N
69	mah.elgendy81178@gmail.con	c06b36d59d6595bcdff9ee669cfe42f3	Mahmoud	Elgendy	t	2025-07-16 03:08:10	2025-07-16 03:08:10	\N	\N
70	mo.store812024@gmail.com	e9bbf9cdbc46ef7f8f4689ccb0d74eeb	anas	naser amer	t	2025-07-16 07:13:10	2025-07-16 07:13:10	\N	\N
71	am.abdellatiff@gmail.com	58fee18357a46a12847bfad2b149c400	Abdelrahman	Abdellatiff	t	2025-07-16 14:37:56	2025-07-16 14:37:56	\N	\N
72	Mostafa@inmindcomm.com	798516a7c732001ff7d7fde10fbfd885	Mostafa	Khaled	t	2025-07-16 16:07:02	2025-07-16 16:07:02	\N	\N
73	aboudimaan4@gmail.com	e7f60ccb748588a9593e687a06b5c9cc	Abdulrahman	Mohamed Maan	t	2025-07-16 21:36:20	2025-07-16 21:36:20	\N	\N
74	dina.salem1021@gmail.com	3310c9c9965a649a73b4efcff62adaa4	Dina	hassan Salem	t	2025-07-16 21:52:43	2025-07-16 21:52:43	\N	\N
75	w2230559@gmail.com	c78285003254564d23f4b00b0d53fd77	AHMAD	HASAN HASAN	t	2025-07-16 22:12:31	2025-07-16 22:12:31	\N	\N
76	info@7elm-eg.online	c888e9bd15403f69059355a823236c29	7elm		t	2025-07-17 11:43:55	2025-07-17 11:43:55	\N	\N
77	yostinamourad.ym@gmail.com	f54c55b9261f792625a44239e25d6fd1	Yostina	Mourad	t	2025-07-17 13:26:36	2025-07-17 13:26:36	\N	\N
78	amrhka1942004@gmail.com	024d12c02a17f7cfb22aab287c881958	amr	hehsam	t	2025-07-17 17:53:22	2025-07-17 17:53:22	\N	\N
79	safarisaharaegypt@gmail.com	77d05945271e082d2eac66d8cfa36dad	Omar	Khaled	t	2025-07-17 19:08:10	2025-07-17 19:08:10	\N	\N
80	bellosedits2@gmail.com	25ed3ec61457178a80055a4a73b3b0be	belal	zardoumii	t	2025-07-20 00:41:59	2025-07-20 00:41:59	\N	\N
81	vaengroup.eg@gmail.com	ef46278068528cb4737e39f1270853a3	George	Khalil	t	2025-07-20 13:46:59	2025-07-20 13:46:59	\N	\N
82	momenwhosak@icloud.com	7fcc77f95eabd73d5d52392494d0ecf9	momen		t	2025-07-22 04:03:05	2025-07-22 04:28:36	\N	\N
83	amir.aborahma202@gmail.com	6ee44e80636c066b34aa664bafd9ca9f	Amir	ayman	t	2025-07-22 22:27:44	2025-07-22 22:27:44	\N	\N
84	mostafasayed632019@Gmail.com	5eb8a9f2102e2c25fae952eb7c9a0904	Mustafa	sayed	t	2025-07-24 21:36:05	2025-07-24 21:36:05	\N	\N
85	viorkaeg@gmail.com	57b387dd5714112a5d1e2bae0cc8d795	viorkaeg		t	2025-07-29 23:50:19	2025-07-29 23:50:19	\N	\N
86	peter.ramez.anwar@gmail.com	03b6442547a6fec76ec513f3d972d77e	Peter		t	2025-07-30 04:02:55	2025-07-30 04:02:55	\N	\N
87	abdullahdiyaa07@gmail.com	84817b0de5d1fd7090bc6c99326b6ed2	Abdullah	Diyaa Abdelkawy	t	2025-07-30 20:04:43	2025-07-30 20:04:43	\N	\N
88	mohamedhelmy231@gmail.com	8004c41130b3510f3bcb03a51ac6c337	mohamed	helmy	t	2025-07-31 02:26:03	2025-07-31 02:26:03	\N	\N
89	noureldein1705@gmail.com	209e495c856784cefb8213b2b9a0fa99	Noureldein	Shaban	t	2025-07-31 03:35:27	2025-07-31 03:35:27	\N	\N
90	prodigyanagency@gmail.com	c7b223b54c6156783211492eab8bfb15	Omar	elshafey	t	2025-07-31 03:53:25	2025-07-31 03:53:25	\N	\N
91	Graygrayeg@gmail.com	2c3737432d2e45d18824c6bd589bbc30	seif	helmy	t	2025-07-31 04:59:49	2025-07-31 04:59:49	\N	\N
92	doniaemad021@gmail.com	766fab17722ef5d4a5e5c3f0d1073d39	Donia	emad tarek abobasha	t	2025-07-31 05:53:41	2025-07-31 05:53:41	\N	\N
93	fotohbasem12@gmail.com	e7b68bba9b4d77fe9df9b35552a96019	basem	mohamed fotoh	t	2025-07-31 18:39:14	2025-07-31 18:39:14	\N	\N
94	skykee.eg@gmail.com	df67e7eeaef7db76f7a8dcc0859bcdb7	seif	helmy ahmed	t	2025-07-31 21:22:18	2025-07-31 21:22:18	\N	\N
95	01200317949ziad@gmail.com	20211c96e85c909cf32f17fd33e0b206	ziad	helmy	t	2025-07-31 23:01:59	2025-07-31 23:01:59	\N	\N
96	noire.eg25@gmail.com	d27566c3088e599fa33288179513471a	marwan	ahmed	t	2025-08-01 00:46:56	2025-08-01 00:46:56	\N	\N
97	gebalyjr@gmail.com	9fd534ecee27272b059930b8144e8c37	Yousef	Elgebaly	t	2025-08-01 04:23:35	2025-08-01 04:23:35	\N	\N
98	zavya.eg@gmail.com	7ddbbf5e2e09a4c88583bc2091e0319a	Habiba		t	2025-08-01 12:29:09	2025-08-01 12:29:09	\N	\N
99	noureldinamr20@gmail.com	963d15d902af4dbc8275c127403036a6	nour	amr	t	2025-08-01 19:30:13	2025-08-01 19:30:13	\N	\N
100	cobrasthreads@gmail.com	9d157b0d8852f3d5523eae2fdcf2df86	ahmed	helmy	t	2025-08-03 17:29:29	2025-08-03 17:29:29	\N	\N
101	craftedvision0@gmail.com	b194cf44b07de0f5a46674b0a631c173	Khadija	Mohamed	t	2025-08-03 19:28:08	2025-08-03 19:28:08	\N	\N
102	mostafa.m.hanno@gmail.com	d9994349f6f6747b8fdabd12b7edd9df	mostafa	hanno	t	2025-08-03 19:38:29	2025-08-03 19:38:29	\N	\N
103	modapixel05@gmail.com	2c63ddb156925e3242ce65699d93c547	moaz	badawy	t	2025-08-03 19:54:48	2025-08-03 19:54:48	\N	\N
104	amradel5455@gmail.com	a1b5926b81e69d9c3fc5dddcd13bef32	Amr	Adel	t	2025-08-05 04:30:17	2025-08-05 04:30:17	\N	\N
105	team@eltalaka.com	3b5eac469ab0a73a8e42a5579cf4ce1e	Abdallah		t	2025-08-07 18:20:10	2025-08-07 18:20:10	\N	\N
106	mohamedahmedd9629@gmail.com	6b78a95297e51c2cd09f47f21e9a66fb	Mohamed	Ahmed	t	2025-08-08 12:52:00	2025-08-08 12:52:00	\N	\N
107	amelazab@icloud.com	694b00f19fd582e3f43d4bb28b0e2fc2	Amr		t	2025-08-10 12:25:15	2025-08-10 12:25:15	\N	\N
108	info@elmokhber.com	ee4a75b8243e87635475887904887032	Amr	Ibrahim	t	2025-08-10 12:29:58	2025-08-10 12:29:58	\N	\N
109	ahmedmahernoureddine@gmail.com	9313652e1c2f0be03fdd258de604dc7e	Ahmed	Maher	t	2025-08-11 08:49:23	2025-08-11 08:49:23	\N	\N
110	mohamednasr_116@yahoo.com	ff66bb8038c94a36bcf6b4e18ec189be	Mohamed	Nasr Eid	t	2025-08-12 14:52:09	2025-08-12 14:52:09	\N	\N
111	maatperfumes@gmail.com	756dcfac84a444ad88dfb6cb281ec791	mostafa	zahran	t	2025-08-13 01:31:05	2025-08-13 01:31:05	\N	\N
112	yousef0987612345@gmail.com	144a3fd615807b1c9079c2e653592938	yousef	sabry	t	2025-08-13 19:22:51	2025-08-13 19:22:51	\N	\N
113	abdilrhmansaber4@gmail.com	7010004e9a3869e8430fd48577197b2f	عبدالرحمن	صابر عطا بربري	t	2025-08-20 03:37:04	2025-08-20 03:37:04	\N	\N
114	affiliatemarketing7151996@gmail.com	751b1029df8dcb77c22c29aab0df8b4d	Mohamed	Ahmed	t	2025-08-22 22:05:36	2025-08-22 22:05:36	\N	\N
115	hamselnahass@gmail.com	f4da490b4db38b3ec267855411852990	Hams		t	2025-08-22 22:37:07	2025-08-22 22:37:07	\N	\N
116	sarahaly180@gmail.com	d9cd77b6a84ac0bcf8afc4000265ead0	sarah	aly	t	2025-08-23 12:44:47	2025-08-23 12:44:47	\N	\N
117	marwan8april@gmail.com	fc151701d8b038909d5f675057b6feee	Marwan	magdy	t	2025-08-28 09:47:44	2025-08-28 09:47:44	\N	\N
118	nouralexandria@gmail.com	12481f17aa936516eadb16a20e372de6	Nour	Ashraf fahmy	t	2025-09-01 17:11:34	2025-09-01 17:11:34	\N	\N
119	alhassan.gazzaz@gmail.com	03df3995793a1f4c433e22c1332a2654	Hassan	Gazzaz	t	2025-09-01 17:17:31	2025-09-01 17:17:31	\N	\N
120	zeiadwaelofficial@gmail.com	c85c16bdb96736687fd97d5e38b80059	Zeiad	Wael	t	2025-09-02 13:05:37	2025-09-02 13:05:37	\N	\N
121	mohamed.2002foshy@gmail.com	3fa8ec1f19c62eda314dccf32da380fc	Mohamed	Islam	t	2025-09-11 13:50:10	2025-09-11 13:50:10	\N	\N
122	nileshop.eg@gmail.com	d1ca434bc1fb8fe746a1b1a2265854d8	Abdelrahman		t	2025-09-17 20:09:13	2025-09-17 20:09:13	\N	\N
123	zeyadmostafa199@gmail.com	feedd4efcf88d219a1c8a616fbc5441b	Zeyad	Sallam	t	2025-09-18 14:06:42	2025-09-18 14:06:42	\N	\N
\.


-- Completed on 2025-09-21 18:21:07

--
-- PostgreSQL database dump complete
--

\unrestrict KykLGmblMGsLWRliPdlxogGpr6Tmbh6VX9Tk15Vh8Aqt3PnMQM0R9BCvKd7aHBc

