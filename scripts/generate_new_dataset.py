import json
import random
import os

first_names = [
    "Hiroto", "Mei", "Chen", "Wei", "Jin", "Aarav", "Diya", "Fatima", "Tariq",
    "Elena", "Ivan", "Olga", "Dmitry", "Liam", "Emma", "Noah", "Olivia",
    "Santiago", "Valentina", "Mateo", "Camila", "Lars", "Freja", "Sven", "Ingrid",
    "Kenji", "Yuki", "Hassan", "Aisha", "Omar", "Zainab", "Carlos", "Sofia",
    "Diego", "Lucia", "Marcel", "Chloe", "Julien", "Amelie", "Lukas", "Hannah",
    "Mia", "Leo", "Zara", "Ali", "Kwame", "Nia", "Tariq", "Fatou"
]

last_names = [
    "Tanaka", "Suzuki", "Wang", "Li", "Zhang", "Patel", "Sharma", "Hassan",
    "Ivanov", "Smirnov", "Petrov", "Smith", "Johnson", "Williams", "Brown",
    "Garcia", "Martinez", "Rodriguez", "Lopez", "Johansen", "Nielsen", "Olsen",
    "Dubois", "Leroy", "Moreau", "Laurent", "Muller", "Schmidt", "Schneider",
    "Fischer", "Silva", "Santos", "Costa", "Oliveira", "Kim", "Park", "Choi",
    "Ali", "Mensah", "Osei", "Ndiaye", "Touré", "Cohen", "Levy"
]

countries = [
    "Japan", "China", "India", "Egypt", "UAE", "Russia", "USA", "UK", "Canada",
    "Mexico", "Colombia", "Argentina", "Sweden", "Norway", "Denmark", "France",
    "Germany", "Brazil", "Portugal", "South Korea", "Ghana", "Senegal", "Israel",
    "Italy", "Spain", "Australia", "New Zealand", "South Africa", "Nigeria"
]

hobbies = [
    "Rock climbing", "Sailing", "Chess", "Writing poetry", "Gourmet cooking",
    "Collecting rare first-edition books", "Hiking in the Alps", "Urban gardening",
    "Amateur astronomy", "Playing the cello", "Photography", "Scuba diving",
    "Pottery", "Bird watching", "Archery", "Woodworking", "Marathon running"
]

tech_subs = [
    "AI & Machine Learning", "Cloud & Serverless", "IoT & Smart Automation",
    "Automotive & EV Tech", "Cybersecurity", "EdTech & Certifications", "Consumer Gadgets"
]

finance_subs = [
    "Markets & Stocks", "Crypto & Web3", "Real Estate & Housing",
    "Mortgage & Banking", "Macroeconomics"
]

sports_subs = [
    "Premier League", "NBA & Basketball", "Match Predictions"
]

def generate_author(id_val, category, sub_category):
    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    return {
        "id": id_val,
        "name": name,
        "gender": random.choice(["Male", "Female"]),
        "age": random.randint(25, 55),
        "country": random.choice(countries),
        "category": category,
        "subCategory": sub_category,
        "hobbies": random.choice(hobbies)
    }

# Read blacklisted names
blacklist = set()
blacklist_file = r"C:\Users\MCKR-Asus\.gemini\antigravity\scratch\logiccompare\scripts\real_authors_list.json"
if os.path.exists(blacklist_file):
    with open(blacklist_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        for item in data:
            blacklist.add(item['name'].lower().strip())

# Generate 96 unique authors
authors = []
generated_names = set()

def get_unique_name():
    while True:
        a = generate_author(0, "", "")
        n = a['name'].lower().strip()
        if n not in blacklist and n not in generated_names:
            generated_names.add(n)
            return a

# 58 Tech
for _ in range(58):
    a = get_unique_name()
    a['category'] = "Technology"
    a['subCategory'] = random.choice(tech_subs)
    authors.append(a)

# 19 Finance
for _ in range(19):
    a = get_unique_name()
    a['category'] = "Finance & RE"
    a['subCategory'] = random.choice(finance_subs)
    authors.append(a)

# 19 Sports
for _ in range(19):
    a = get_unique_name()
    a['category'] = "Sports Analytics"
    a['subCategory'] = random.choice(sports_subs)
    authors.append(a)

# Shuffle and assign IDs
random.shuffle(authors)
for idx, a in enumerate(authors):
    a['id'] = idx + 1

output_file = r"C:\Users\MCKR-Asus\.gemini\antigravity\scratch\logiccompare\scripts\new_authors_dataset.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(authors, f, indent=2, ensure_ascii=False)

print(f"Generated {len(authors)} unique authors to {output_file}")
