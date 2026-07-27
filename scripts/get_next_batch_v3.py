import json
import os

def slugify(name):
    return name.lower().replace(' ', '-')

dataset_path = r"C:\Users\MCKR-Asus\.gemini\antigravity\scratch\logiccompare\scripts\new_authors_dataset.json"
img_dir = r"C:\Users\MCKR-Asus\.gemini\antigravity\scratch\logiccompare\public\images\authors"

existing_files = []
if os.path.exists(img_dir):
    existing_files = [f.replace('.webp', '') for f in os.listdir(img_dir) if f.endswith('.webp')]
existing_files = set(existing_files)

with open(dataset_path, "r", encoding="utf-8") as f:
    data = json.load(f)

queue = []
for author in data:
    slug = slugify(author['name'])
    if slug not in existing_files:
        queue.append(author)

if not queue:
    print(json.dumps({"status": "DONE"}))
else:
    batch = queue[:4]
    prompts = []
    for a in batch:
        slug = slugify(a['name'])
        age = a['age']
        gender = a['gender']
        prof = a['subCategory']
        country = a['country']
        hobbies = a['hobbies']
        
        prompt = f"A breathtaking photorealistic portrait of a {age}-year-old {gender} {prof} expert from {country}. They have distinct ethnic facial features native to {country}. They are enjoying their hobby: {hobbies}, captured in a highly detailed, cinematic environment perfectly matching their lifestyle. Shot on DSLR, 85mm lens, f/1.8, extremely high resolution, distinct facial features, dramatic rim lighting, hyper-realistic, masterpiece, award winning photography."
        prompts.append({"slug": slug, "prompt": prompt})
        
    print(json.dumps({"status": "OK", "batch": prompts}, indent=2))
