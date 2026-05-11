import os
import re

source_dir = "/Users/dada/Downloads/DADA - DADA collection"
output_dir = "/Users/dada/.gemini/antigravity/scratch/dada-portfolio/public/artworks"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

def extract_artwork(file_path, output_path):
    with open(file_path, 'rb') as f:
        data = f.read()
        
        # Look for JPEG header
        start = data.find(b'\xff\xd8\xff\xe0')
        if start == -1:
            start = data.find(b'\xff\xd8\xff\xe1') # Alternative JPEG header
        
        if start != -1:
            # Look for JPEG footer
            end = data.find(b'\xff\xd9', start)
            if end != -1:
                with open(output_path, 'wb') as out:
                    out.write(data[start:end+2])
                return True
        
        # Look for PNG header
        start = data.find(b'\x89PNG\r\n\x1a\n')
        if start != -1:
            end = data.find(b'IEND', start)
            if end != -1:
                with open(output_path.replace('.jpg', '.png'), 'wb') as out:
                    out.write(data[start:end+8])
                return True
    return False

for filename in os.listdir(source_dir):
    if filename.endswith(".mp3"):
        # Clean name: "01 - DADA - Falling Stars.mp3" -> "Falling Stars.jpg"
        clean_name = filename.split(" - ")[-1].replace(".mp3", "")
        # Handle cases where title might have different formatting
        # For simplicity, we'll try to match it later or just use the clean name
        output_file = os.path.join(output_dir, clean_name + ".jpg")
        
        success = extract_artwork(os.path.join(source_dir, filename), output_file)
        if success:
            print(f"Extracted: {clean_name}")
        else:
            print(f"Failed: {filename}")
