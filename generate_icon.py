from PIL import Image, ImageDraw
import os

def create_gradient(width, height, start_color, end_color):
    base = Image.new('RGB', (width, height), start_color)
    top = Image.new('RGB', (width, height), end_color)
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        mask_data.extend([int(255 * (y / height))] * width)
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base

def draw_shield(draw, width, height):
    # Shield shape coordinates
    margin = width * 0.15
    w = width
    h = height
    
    # Simple shield shape: top flat, sides curved to bottom point
    points = [
        (margin, h * 0.15),  # Top left
        (w - margin, h * 0.15),  # Top right
        (w - margin, h * 0.5),   # Mid right (start of curve)
        (w / 2, h * 0.9),    # Bottom tip
        (margin, h * 0.5)    # Mid left (start of curve)
    ]
    
    # Draw shield background (White) with some padding
    # Actually, let's make the shield white and Cross Blue? Or Shield outline white?
    # User wanted "Beautiful". Let's do White Shield on Blue bg.
    
    # Bezier curves are hard with simple polygon. Let's use a polygon approximation for curve
    # Or just a simple shield shape using arcs and lines.
    
    # Simpler approach: Draw a big white circle and a white square on top? No.
    # Let's draw a path.
    
    # Coordinates for a shield path
    # Top-Left: (margin, margin)
    # Top-Right: (w-margin, margin)
    # Bottom-Tip: (w/2, h-margin)
    
    # Since PIL doesn't do complex paths easily without many points,
    # let's do a simple engaging shape: A "Rounded React" square or Circle?
    # User asked for medical context.
    
    # Let's draw a White Cross directly on the Blue Gradient Background. 
    # It's clean, medical, and recognizable. "Swiss Style".
    # And maybe a thin white circle ring around it.
    
    # Draw Ring
    center = (w // 2, h // 2)
    radius = w * 0.4
    draw.ellipse((center[0]-radius, center[1]-radius, center[0]+radius, center[1]+radius), outline="white", width=int(w*0.03))
    
    # Draw Cross
    cross_width = w * 0.15
    cross_length = w * 0.6
    
    # Vertical bar
    draw.rectangle(
        (center[0] - cross_width/2, center[1] - cross_length/2, 
         center[0] + cross_width/2, center[1] + cross_length/2), 
        fill="white"
    )
    
    # Horizontal bar
    draw.rectangle(
        (center[0] - cross_length/2, center[1] - cross_width/2, 
         center[0] + cross_length/2, center[1] + cross_width/2), 
        fill="white"
    )

def generate_icon(path, size=(1024, 1024)):
    # 1. Background: Deep Blue Gradient
    # Deep Medical Blue: #0052D4 -> #4364F7 -> #6FB1FC
    bg = create_gradient(size[0], size[1], (0, 82, 212), (111, 177, 252))
    
    # 2. Draw Graphics
    draw = ImageDraw.Draw(bg)
    draw_shield(draw, size[0], size[1])
    
    # 3. Save
    bg.save(path, quality=95)
    print(f"Generated icon at {path}")

if __name__ == "__main__":
    assets_dir = "mobile/assets"
    icons = ["icon.png", "adaptive-icon.png", "splash-icon.png"]
    
    for icon_name in icons:
        path = os.path.join(assets_dir, icon_name)
        generate_icon(path)
