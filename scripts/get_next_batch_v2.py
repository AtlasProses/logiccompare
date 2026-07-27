import json
import os
import random

def slugify(name):
    return name.lower().replace(' ', '-')

dataset_path = r"C:\Users\MCKR-Asus\.gemini\antigravity\scratch\logiccompare\scripts\real_authors_list.json"
public_dir = r"C:\Users\MCKR-Asus\.gemini\antigravity\scratch\logiccompare\public\images\authors"

existing_files = []
if os.path.exists(public_dir):
    existing_files = [f.replace('.webp', '') for f in os.listdir(public_dir) if f.endswith('.webp')]
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
        name = a['name']
        prof = a['category']
        country = a['country']
        
        # We don't have age and hobbies anymore, so we make them up or keep it generic based on profession.
        age = random.randint(28, 55)
        
        prompt = f"A breathtaking photorealistic portrait of a {age}-year-old {prof} from {country}. They have distinct ethnic facial features native to {country}. They are in an environment perfectly matching their profession as a {prof}. Shot on DSLR, 85mm lens, f/1.8, extremely high resolution, distinct facial features, dramatic rim lighting, hyper-realistic, masterpiece, award winning photography."
        prompts.append({"slug": slug, "prompt": prompt, "name": name})
        
    print(json.dumps({"status": "OK", "batch": prompts}, indent=2))
