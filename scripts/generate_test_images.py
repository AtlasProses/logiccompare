import json
import urllib.request
import urllib.parse
from PIL import Image
import io
import os
import sys

def optimize_and_save(img_bytes, output_path, max_size_kb=150):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    quality = 90
    while quality > 10:
        buffer = io.BytesIO()
        img.save(buffer, format="WEBP", quality=quality, method=6)
        size_kb = len(buffer.getvalue()) / 1024
        if size_kb <= max_size_kb:
            with open(output_path, "wb") as f:
                f.write(buffer.getvalue())
            print(f"Saved {output_path} at quality {quality} (Size: {size_kb:.2f} KB)")
            return True
        quality -= 5
    
    # If still too large, resize and try again
    img = img.resize((img.width // 2, img.height // 2), Image.LANCZOS)
    buffer = io.BytesIO()
    img.save(buffer, format="WEBP", quality=80, method=6)
    with open(output_path, "wb") as f:
        f.write(buffer.getvalue())
    print(f"Saved {output_path} with resizing (Size: {len(buffer.getvalue()) / 1024:.2f} KB)")
    return True

def main():
    dataset_path = r"C:\Users\MCKR-Asus\.gemini\antigravity\scratch\logiccompare\scripts\authors_dataset.json"
    output_dir = r"C:\Users\MCKR-Asus\.gemini\antigravity\brain\d3ababbd-888b-44d4-b197-e3fa90767301"
    
    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    test_authors = data[4:6] # Michael Brown, Felix Müller
    
    for author in test_authors:
        name_slug = author["name"].lower().replace(" ", "-")
        age = author["age"]
        gender = author["gender"]
        country = author["country"]
        hobbies = author["hobbies"]
        prof = author["subCategory"]
        
        # Highly optimized prompt for better quality
        base_prompt = f"A breathtaking photorealistic portrait of a {age}-year-old {gender} {prof} expert from {country}."
        scene = f"They are enjoying their hobby: {hobbies.split(',')[0]}, captured in a highly detailed, cinematic environment perfectly matching their lifestyle."
        modifiers = "Shot on DSLR, 85mm lens, f/1.8, extremely high resolution, symmetric facial features, dramatic rim lighting, hyper-realistic, masterpiece, award winning photography."
        
        prompt = f"{base_prompt} {scene} {modifiers}"
        print(f"Generating for {name_slug}...")
        
        encoded_prompt = urllib.parse.quote(prompt)
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req) as response:
                img_bytes = response.read()
                out_path = os.path.join(output_dir, f"{name_slug}.webp")
                optimize_and_save(img_bytes, out_path, 150)
        except Exception as e:
            print(f"Error fetching image for {name_slug}: {e}")

if __name__ == "__main__":
    main()
