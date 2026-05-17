import os
import sys
import subprocess

try:
    from PIL import Image
    import numpy as np
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "numpy"])
    from PIL import Image
    import numpy as np

clients_dir = 'public/clients'
nums = [1, 2, 7, 8, 9, 10]

for num in nums:
    path = f"{clients_dir}/{num}.png"
    if not os.path.exists(path):
        # Some might be jpg
        path = f"{clients_dir}/{num}.jpg"
        if not os.path.exists(path):
            continue
            
    img = Image.open(path).convert('RGBA')
    data = np.array(img).astype(float)
    
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    brightness = (r * 0.299 + g * 0.587 + b * 0.114)
    
    # Check corners to determine if background is dark or light
    h, w = brightness.shape
    corners = [brightness[0,0], brightness[0,w-1], brightness[h-1,0], brightness[h-1,w-1]]
    bg_brightness = sum(corners) / 4.0
    
    if bg_brightness > 127:
        # Light background, dark text
        alpha = 255 - brightness
    else:
        # Dark background, light text
        alpha = brightness
        
    # High contrast to make text solid and background completely transparent
    alpha = (alpha - 80) * 3
    alpha = np.clip(alpha, 0, 255)
    
    # Multiply by original alpha if it exists
    alpha = alpha * (a / 255.0)
    
    # Create new image with pure white text and calculated alpha
    new_data = np.zeros_like(data)
    new_data[:,:,0] = 255
    new_data[:,:,1] = 255
    new_data[:,:,2] = 255
    new_data[:,:,3] = alpha
    
    processed_img = Image.fromarray(new_data.astype(np.uint8))
    
    # Crop to bounding box (remove empty space)
    bbox = processed_img.getbbox()
    if bbox:
        # Add a tiny bit of padding
        padding = 10
        bbox = (max(0, bbox[0]-padding), max(0, bbox[1]-padding), 
                min(w, bbox[2]+padding), min(h, bbox[3]+padding))
        processed_img = processed_img.crop(bbox)
        
    processed_img.save(f"{clients_dir}/clean_{num}.png")
    print(f"Processed {path} -> clean_{num}.png")
