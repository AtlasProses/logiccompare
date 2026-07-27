import json

raw_data = """1	Aisha Rahman	Predictive AI in Cardiology	Belirtilmemiş
2	Aisha Sharma	Budget Travel & Backpacking Expert	Hindistan
3	Alexander Vance	AI Ethics & Tech Strategy Expert	ABD
4	Amara Ndiaye	West African Street Food & Senegalese Cuisine	Senegal
5	Amara Okafor	Synthetic Biology & Neural Networks	Belirtilmemiş
6	Amara Singh	Microbiome & AI Systems	Belirtilmemiş
7	Anjali Desai	South Indian Coastal & Vegan Expert	Hindistan
8	Anna Kowalska	Young Adult (YA) Uzmanı	Polonya
9	Antoine Leroy	Science & Technology Uzmanı	Fransa
10	Anya Petrovna	Astrophysics & AI Data Science	Belirtilmemiş
11	Aris Vangelis	Quantum Computing & AI	Belirtilmemiş
12	Aylin Okur	Türk Edebiyat Eleştirmeni	Türkiye
13	Beatriz Costa	Travel & Exploration Uzmanı	Portekiz
14	Benjamin Hayes	Brain-Computer Interfaces & Neurosurgery	Belirtilmemiş
15	Camille Dubois	Modern Philosophy Uzmanı	Fransa
16	Carmen Martinez	Magical Realism Uzmanı	İspanya
17	Cemre Seyyah	Gezi Blog Yazarı	Türkiye
18	Chloe Blanc	Pâtissier & Dessert Expert	Belirtilmemiş
19	Chloé Laurent	Romance & Drama Uzmanı	Fransa
20	Chloe Tremblay	Outdoor & Solo Travel Guide	Kanada
21	Claire Beaufort	AR, VR & Spatial Computing Designer	Fransa
22	Clara Schmidt	Ernährungsexpertin	Belirtilmemiş
23	David O'Connor	Particle Physics & Computational AI	Belirtilmemiş
24	Demir Şef	Anadolu Lezzetleri Uzmanı	Türkiye
25	Diego Lopez	Sports & Memoirs Uzmanı	İspanya
26	Eleanor Hughes	Plant-Based & Vegan Dessert Pastry Chef	Birleşik Krallık
27	Eleanor Sterling	FinTech & Blockchain Executive	Birleşik Krallık
28	Elena Rostova	Genetics & AI Integration	Belirtilmemiş
29	Elena Volkova	Non-Fiction & Biographies Uzmanı	Rusya
30	Emily Page	Contemporary Fiction Writer	İngiltere
31	Emma Thompson	Historical Fiction Uzmanı	Birleşik Krallık
32	Emre Yılmaz	Plate and Prose	Türkiye
33	Felix Müller	Plate and Prose	Belirtilmemiş
34	Giovanni Luigi	Sommelier & Wine Critic	Belirtilmemiş
35	Giulia Ricci	Art & Architecture Uzmanı	İtalya
36	Hannah Schmidt	Dystopian Fiction Uzmanı	Almanya
37	Hannah Weber	Plate and Prose	Belirtilmemiş
38	Hans Müller	Backexperte & Konditor	Belirtilmemiş
39	Hiroshi Tanaka	Computational Genetics & AI	Belirtilmemiş
40	Irina Ivanova	Classic Russian Literature Uzmanı	Rusya
41	Isabella Ferrari	Plate and Prose	Belirtilmemiş
42	Isabella Moore	Health & Wellness Uzmanı	Kanada
43	Isabella Rossi	Computational Neuroscience	Belirtilmemiş
44	Ivan Sokolov	Plate and Prose	Belirtilmemiş
45	James Miller	Science Fiction & Fantasy Uzmanı	Kanada
46	John Doe	Tech Reviewer & Blogger	ABD
47	John Explorer	Outdoor Enthusiast & Survivalist	ABD
48	Julian Thorne	Virology & AI Simulations	Belirtilmemiş
49	Kaan Demir	Robotics & Autonomous Systems Engineer	Türkiye
50	Kenji Sato	Precision Medicine & AI	Belirtilmemiş
51	Kerem Talu	Bioinformatics & Deep Learning	Belirtilmemiş
52	Klaus Weber	Philosophy & Psychology Uzmanı	Almanya
53	Kwame Osei	Pan-African Traditional Recipes	Gana
54	Layla Hariri	Levantine Mezze & Mediterranean Fusion	Lübnan
55	Li Wei	Edge AI & IoT Technologies	Belirtilmemiş
56	Liam Carter	Plate and Prose	Birleşik Krallık
57	Lin Yao	Dim Sum & Cantonese Cuisine Specialist	Çin
58	Lorenzo Russo	Plate and Prose	Belirtilmemiş
59	Lucas Martin	Plate and Prose	Belirtilmemiş
60	Lucas Moreau	Autonomous Robotic Surgery	Belirtilmemiş
61	Lucia Garcia	Contemporary Fiction Uzmanı	İspanya
62	Lukas Richter	Cybersecurity & Quantum Computing Analyst	Almanya
63	Marco Conti	Historical Biographies Uzmanı	İtalya
64	Marco Rossi	Viaggiatore & Scrittore Gastronomico	Belirtilmemiş
65	Marcus Sterling	Robotics & Deep Learning	Belirtilmemiş
66	Marcus Vance	High Protein & Fitness Nutritionist	ABD
67	Mariana Costa	Plate and Prose	Belirtilmemiş
68	Mark Dinn	Historical Fiction Author	İngiltere
69	Marta Wisniewska	Psychological Thrillers Uzmanı	Polonya
70	Mateo García	Plate and Prose	Belirtilmemiş
71	Maximilian Fischer	Political Science Uzmanı	Almanya
72	Michael Brown	Thriller & Suspense Uzmanı	ABD
73	Michael Chef	Barbecue Master & Grill Expert	ABD
74	Nandini Patel	Diagnostic AI in Oncology	Belirtilmemiş
75	Natalia Sokolova	Science & Nature Uzmanı	Rusya
76	Nguyen Thi Mai	Vietnamese Street Food & Pho Variations	Vietnam
77	Olivia Harris	Self-Help & Business Uzmanı	ABD
78	Olya Shevchenko	Contemporary Poetry Uzmanı	Ukrayna
79	Omar Al-Hassan	AI Hardware & Neuromorphic Chips	Belirtilmemiş
80	Pierre Dubois	Chef de Cuisine	Belirtilmemiş
81	Piotr Nowak	Military History Uzmanı	Polonya
82	Priya Kapoor	Mumbai Street Food & Spices	Hindistan
83	Rahul Sharma	Awadhi Cuisine & Culinary Historian	Hindistan
84	Sarah Davis	Romance & New Adult Uzmanı	ABD
85	Sarah Mitchell	Plate and Prose	ABD
86	Sofía Torres	Plate and Prose	Belirtilmemiş
87	Sofia Bianchi	Mystery & Thriller Uzmanı	İtalya
88	Sofia Morales	Cellular Algorithms & Software Engineering	Belirtilmemiş
89	Sofia Romano	Esperta di Moda Sostenibile	Belirtilmemiş
90	Tariq Al-Fayed	Middle Eastern Street Food & Egyptian History	Mısır
91	Thomas Wright	Medical Imaging & Machine Learning	Belirtilmemiş
92	Tiago Silva	Poetry & Classics Uzmanı	Portekiz
93	Victoria Smith	Crime Fiction Uzmanı	Birleşik Krallık
94	Wei Chen	Szechuan Street Food Master	Çin
95	William Clark	Epic Fantasy Uzmanı	Kanada
96	Yumi Tanaka	Plate and Prose	Belirtilmemiş
97	Zeynep Kaya	Applied Physics & AI Modeling	Belirtilmemiş
98	Zola Ndlovu	Cultural Immersion & Slow Travel Expert	Güney Afrika
99	Plate and Prose	Kurumsal İçerik Hesabı	Belirtilmemiş"""

parsed_data = []
for line in raw_data.strip().split('\n'):
    parts = line.split('\t')
    if len(parts) >= 4:
        parsed_data.append({
            "id": int(parts[0]),
            "name": parts[1],
            "category": parts[2],
            "country": parts[3] if parts[3] != 'Belirtilmemiş' else 'Global'
        })

with open(r'C:\Users\MCKR-Asus\.gemini\antigravity\scratch\logiccompare\scripts\real_authors_list.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_data, f, ensure_ascii=False, indent=2)
print("Saved real_authors_list.json")
