import json
import os
import shutil

public_dir = r"C:\Users\MCKR-Asus\.gemini\antigravity\scratch\logiccompare\public\images\authors"
new_data_path = r"C:\Users\MCKR-Asus\.gemini\antigravity\scratch\logiccompare\scripts\new_authors_dataset.json"

def slugify(name):
    return name.lower().replace(' ', '-')

# Load the new dataset
with open(new_data_path, 'r', encoding='utf-8') as f:
    authors = json.load(f)

# Get existing .webp files
existing_files = [f for f in os.listdir(public_dir) if f.endswith('.webp')]
existing_files.sort()  # Just to be deterministic

print(f"Found {len(existing_files)} existing .webp files to remap.")

# Take the first N authors from the new dataset (N = len(existing_files))
mapped_authors = authors[:len(existing_files)]
remaining_authors = authors[len(existing_files):]

# Rename the files
for idx, old_file in enumerate(existing_files):
    old_path = os.path.join(public_dir, old_file)
    new_slug = slugify(mapped_authors[idx]['name'])
    new_file = f"{new_slug}.webp"
    new_path = os.path.join(public_dir, new_file)
    
    # Rename in place
    if old_path != new_path:
        # if the target exists, this will raise an error in Windows, but it shouldn't exist
        if os.path.exists(new_path):
            os.remove(new_path)
        os.rename(old_path, new_path)
        print(f"Renamed: {old_file} -> {new_file}")
    else:
        print(f"Kept name: {old_file}")

print("Mapping complete!")
