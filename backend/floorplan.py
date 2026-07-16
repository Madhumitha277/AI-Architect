"""
Floor Plan Generation Module
=============================

Generates a real, connected 2D architectural floor plan (blueprint style)
from the user's area / bedroom / bathroom inputs, using procedural layout
generation, room adjacency rules, and detailed drafting symbols.

Public entry point:
    generate_floorplan(area, bedrooms, bathrooms, rooms) -> image_path
"""

import os
import math
import random
from PIL import Image, ImageDraw, ImageFont

# =====================================================================
# Font Loading Helper
# =====================================================================

def _load_font(size, bold=False):
    paths = []
    if os.name == 'nt': # Windows
        paths = [
            f"C:/Windows/Fonts/{'arialbd.ttf' if bold else 'arial.ttf'}",
            f"C:/Windows/Fonts/{'segoeuib.ttf' if bold else 'segoeui.ttf'}",
            f"C:/Windows/Fonts/{'calibrib.ttf' if bold else 'calibri.ttf'}"
        ]
    else: # Linux/Mac
        paths = [
            f"/usr/share/fonts/truetype/dejavu/{'DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'}",
            f"/usr/share/fonts/dejavu/{'DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'}",
            f"/System/Library/Fonts/SFNS.ttf"
        ]
        
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()

# =====================================================================
# Main Floor Plan Generator
# =====================================================================

def generate_floorplan(area, bedrooms, bathrooms, rooms):
    os.makedirs("static", exist_ok=True)
    
    # Normalize inputs
    bedrooms = max(1, int(bedrooms))
    bathrooms = max(1, int(bathrooms))
    area = max(400, int(area))
    
    # 1. Determine plot size and aspect ratio
    aspect = random.uniform(1.25, 1.45)
    width_ft = math.sqrt(area * aspect)
    height_ft = area / width_ft
    
    # Standardize dimensions to nearest half foot
    width_ft = round(width_ft * 2) / 2.0
    height_ft = round(height_ft * 2) / 2.0
    
    # Ensure minimum dimensions
    width_ft = max(width_ft, 25.0)
    height_ft = max(height_ft, 18.0)
    
    # 2. Divide width into Public and Private Zones
    # More bedrooms mean a larger private zone
    if bedrooms == 1:
        pub_frac = random.uniform(0.48, 0.52)
    elif bedrooms == 2:
        pub_frac = random.uniform(0.38, 0.42)
    else:
        pub_frac = random.uniform(0.32, 0.35)
        
    W_pub = round((width_ft * pub_frac) * 2) / 2.0
    W_priv = width_ft - W_pub
    
    rects = {}
    
    # 3. Layout Public Zone (x: 0 -> W_pub, y: 0 -> height_ft)
    H_living = round((height_ft * random.uniform(0.55, 0.62)) * 2) / 2.0
    rects["Living Room"] = (0.0, 0.0, W_pub, H_living)
    
    H_kit_din = height_ft - H_living
    if area >= 700:
        W_kit = round((W_pub * random.uniform(0.45, 0.55)) * 2) / 2.0
        rects["Kitchen"] = (0.0, H_living, W_kit, H_kit_din)
        rects["Dining Room"] = (W_kit, H_living, W_pub - W_kit, H_kit_din)
    else:
        rects["Kitchen"] = (0.0, H_living, W_pub, H_kit_din)
        
    # 4. Layout Private Zone (x: W_pub -> width_ft, y: 0 -> height_ft)
    hallway_pos = random.choice(["center", "top", "bottom"])
    H_hall = 3.5
    
    top_rooms = []
    bottom_rooms = []
    
    # Build list of private rooms using custom/allocated weights
    bed_sz = rooms.get("bedroom_size", 130)
    bath_sz = rooms.get("bathroom_size", 45)
    
    m_bed_item = ("Master Bedroom", bed_sz * 1.1)
    m_bath_item = ("Master Bathroom", bath_sz * 1.1)
    
    # Base allocations
    bottom_rooms = [m_bed_item, m_bath_item]
    top_rooms = []
    
    for i in range(2, bedrooms + 1):
        bed_name = f"Bedroom {i}"
        bath_name = f"Bathroom {i}"
        
        # Put even bedrooms in the top zone, odd in the bottom zone
        if i % 2 == 0:
            top_rooms.append((bed_name, bed_sz))
            if i <= bathrooms:
                top_rooms.append((bath_name, bath_sz))
        else:
            bottom_rooms.append((bed_name, bed_sz))
            if i <= bathrooms:
                bottom_rooms.append((bath_name, bath_sz))
                
    # If there are extra bathrooms, distribute them
    assigned_baths = min(bedrooms, bathrooms)
    for j in range(assigned_baths + 1, bathrooms + 1):
        bath_name = f"Bathroom {j}"
        if j % 2 == 0:
            top_rooms.append((bath_name, bath_sz))
        else:
            bottom_rooms.append((bath_name, bath_sz))
            
    # For 1 BHK, add a Study Room in the top zone to fill the space
    if bedrooms == 1 and not top_rooms:
        top_rooms.append(("Study Room", bed_sz * 0.8))
        
    # Process hallway positions
    if hallway_pos == "center":
        y_hall_top = H_living - H_hall
        y_hall_bottom = H_living
        rects["Hallway"] = (W_pub, y_hall_top, W_priv, H_hall)
        
        h_top_zone = y_hall_top
        h_bottom_zone = height_ft - y_hall_bottom
        
    elif hallway_pos == "top":
        y_hall_top = 0.0
        y_hall_bottom = H_hall
        rects["Hallway"] = (W_pub, y_hall_top, W_priv, H_hall)
        h_bottom_zone = height_ft - H_hall
        h_top_zone = 0.0
        
        bottom_rooms = bottom_rooms + top_rooms
        top_rooms = []
        
    else: # bottom hallway
        y_hall_top = height_ft - H_hall
        y_hall_bottom = height_ft
        rects["Hallway"] = (W_pub, y_hall_top, W_priv, H_hall)
        h_top_zone = y_hall_top
        h_bottom_zone = 0.0
        
        top_rooms = bottom_rooms + top_rooms
        bottom_rooms = []
        
    # Helper to slice zone horizontally (x-split)
    def slice_zone(x_start, y_start, z_width, z_height, room_list):
        if not room_list:
            return
        
        widths = {}
        remaining_w = z_width
        unallocated = []
        
        # Enforce minimum size for bathrooms (ensures realistic proportions)
        for name, wt in room_list:
            if "bathroom" in name.lower() or "bath" in name.lower():
                w_bath = min(6.0, remaining_w * 0.3)
                widths[name] = w_bath
                remaining_w -= w_bath
            else:
                unallocated.append((name, wt))
                
        if unallocated:
            total_wt = sum(wt for _, wt in unallocated)
            for name, wt in unallocated:
                widths[name] = remaining_w * (wt / total_wt)
                
        cx = x_start
        room_keys = [r[0] for r in room_list]
        # Keep bathrooms adjacent to their respective bedrooms
        if random.random() < 0.5:
            room_keys.reverse()
            
        for name in room_keys:
            rw = round(widths[name] * 2) / 2.0
            rects[name] = (cx, y_start, rw, z_height)
            cx += rw
            
    if h_top_zone > 0:
        slice_zone(W_pub, 0.0, W_priv, h_top_zone, top_rooms)
    if h_bottom_zone > 0:
        slice_zone(W_pub, y_hall_bottom if hallway_pos == "center" else H_hall, W_priv, h_bottom_zone, bottom_rooms)
        
    # Rotate layout randomly (50% chance) to support vertical layout
    rotate_layout = random.choice([True, False])
    if rotate_layout:
        rotated_rects = {}
        for name, (x, y, w, h) in rects.items():
            rotated_rects[name] = (y, x, h, w)
        rects = rotated_rects
        width_ft, height_ft = height_ft, width_ft
        
    # 5. Extract Unique Wall Segments
    tol = 0.02
    v_walls = [] # list of (x, y0, y1, is_exterior)
    h_walls = [] # list of (y, x0, x1, is_exterior)
    
    for name, (rx, ry, rw, rh) in rects.items():
        # Top wall
        h_walls.append((ry, rx, rx + rw, abs(ry) < tol or abs(ry - height_ft) < tol))
        # Bottom wall
        h_walls.append((ry + rh, rx, rx + rw, abs(ry + rh) < tol or abs(ry + rh - height_ft) < tol))
        # Left wall
        v_walls.append((rx, ry, ry + rh, abs(rx) < tol or abs(rx - width_ft) < tol))
        # Right wall
        v_walls.append((rx + rw, ry, ry + rh, abs(rx + rw) < tol or abs(rx + rw - width_ft) < tol))

    # Merge overlapping walls to get clean segment list
    def merge_segments(wall_list):
        by_coord = {}
        for coord, s, e, is_ext in wall_list:
            c = round(coord * 2) / 2.0
            if c not in by_coord:
                by_coord[c] = []
            by_coord[c].append((s, e, is_ext))
            
        merged = []
        for coord, segs in by_coord.items():
            segs.sort(key=lambda x: x[0])
            if not segs:
                continue
            
            curr_s, curr_e, curr_ext = segs[0]
            for s, e, is_ext in segs[1:]:
                if s <= curr_e + 0.1: # overlap or touch
                    curr_e = max(curr_e, e)
                    curr_ext = curr_ext or is_ext
                else:
                    merged.append((coord, curr_s, curr_e, curr_ext))
                    curr_s, curr_e, curr_ext = s, e, is_ext
            merged.append((coord, curr_s, curr_e, curr_ext))
        return merged

    v_walls = merge_segments(v_walls)
    h_walls = merge_segments(h_walls)
    
    # 6. Doors & Windows Placement
    def get_shared_wall(r1, r2):
        x1, y1, w1, h1 = rects[r1]
        x2, y2, w2, h2 = rects[r2]
        # Check vertical overlap
        if abs(x1 + w1 - x2) < 0.1:
            y_start = max(y1, y2)
            y_end = min(y1 + h1, y2 + h2)
            if y_end - y_start >= 3.0:
                return ("v", x2, y_start, y_end)
        elif abs(x2 + w2 - x1) < 0.1:
            y_start = max(y1, y2)
            y_end = min(y1 + h1, y2 + h2)
            if y_end - y_start >= 3.0:
                return ("v", x1, y_start, y_end)
        # Check horizontal overlap
        if abs(y1 + h1 - y2) < 0.1:
            x_start = max(x1, x2)
            x_end = min(x1 + w1, x2 + w2)
            if x_end - x_start >= 3.0:
                return ("h", y2, x_start, x_end)
        elif abs(y2 + h2 - y1) < 0.1:
            x_start = max(x1, x2)
            x_end = min(x1 + w1, x2 + w2)
            if x_end - x_start >= 3.0:
                return ("h", y1, x_start, x_end)
        return None

    doors = [] # list of (orientation, coord, start, end, type)
    
    # Place doors for bedrooms and bathrooms
    for rname in rects.keys():
        if "bedroom" in rname.lower() or "bathroom" in rname.lower() or "study" in rname.lower():
            connected = False
            if "Hallway" in rects:
                sw = get_shared_wall(rname, "Hallway")
                if sw:
                    orient, coord, s, e = sw
                    doors.append((orient, coord, (s+e)/2 - 1.4, (s+e)/2 + 1.4, "door"))
                    connected = True
            
            if not connected and "Living Room" in rects:
                sw = get_shared_wall(rname, "Living Room")
                if sw:
                    orient, coord, s, e = sw
                    doors.append((orient, coord, (s+e)/2 - 1.4, (s+e)/2 + 1.4, "door"))
                    connected = True
                    
            if rname == "Master Bathroom" and "Master Bedroom" in rects:
                sw = get_shared_wall("Master Bathroom", "Master Bedroom")
                if sw:
                    orient, coord, s, e = sw
                    doors.append((orient, coord, (s+e)/2 - 1.4, (s+e)/2 + 1.4, "door"))

    # Connect Kitchen and Living / Dining Room with open doorway
    if "Dining Room" in rects:
        sw = get_shared_wall("Kitchen", "Dining Room")
        if sw:
            orient, coord, s, e = sw
            doors.append((orient, coord, s + 1.0, e - 1.0, "open"))
        sw = get_shared_wall("Living Room", "Dining Room")
        if sw:
            orient, coord, s, e = sw
            doors.append((orient, coord, s + 1.5, e - 1.5, "open"))
    else:
        sw = get_shared_wall("Kitchen", "Living Room")
        if sw:
            orient, coord, s, e = sw
            doors.append((orient, coord, s + 1.5, e - 1.5, "open"))

    # Main Entrance door on Living Room exterior wall
    main_entrance = None
    living_rect = rects["Living Room"]
    lx, ly, lw, lh = living_rect
    if abs(ly) < tol:
        main_entrance = ("h", 0.0, lx + lw/2 - 1.5, lx + lw/2 + 1.5)
    elif abs(ly + lh - height_ft) < tol:
        main_entrance = ("h", height_ft, lx + lw/2 - 1.5, lx + lw/2 + 1.5)
    elif abs(lx) < tol:
        main_entrance = ("v", 0.0, ly + lh/2 - 1.5, ly + lh/2 + 1.5)
    elif abs(lx + lw - width_ft) < tol:
        main_entrance = ("v", width_ft, ly + lh/2 - 1.5, ly + lh/2 + 1.5)
        
    if main_entrance:
        doors.append((main_entrance[0], main_entrance[1], main_entrance[2], main_entrance[3], "main_door"))

    # Place Windows on exterior walls
    windows = [] # list of (orient, coord, start, end)
    for name, (rx, ry, rw, rh) in rects.items():
        if "hallway" in name.lower() or "bathroom" in name.lower():
            continue
            
        # Top
        if abs(ry) < tol and rw >= 6.0:
            windows.append(("h", 0.0, rx + rw/2 - 2.0, rx + rw/2 + 2.0))
        # Bottom
        if abs(ry + rh - height_ft) < tol and rw >= 6.0:
            windows.append(("h", height_ft, rx + rw/2 - 2.0, rx + rw/2 + 2.0))
        # Left
        if abs(rx) < tol and rh >= 6.0:
            windows.append(("v", 0.0, ry + rh/2 - 2.0, ry + rh/2 + 2.0))
        # Right
        if abs(rx + rw - width_ft) < tol and rh >= 6.0:
            windows.append(("v", width_ft, ry + rh/2 - 2.0, ry + rh/2 + 2.0))

    # Add small vents for Bathrooms
    for name, (rx, ry, rw, rh) in rects.items():
        if "bathroom" in name.lower():
            if abs(ry) < tol:
                windows.append(("h", 0.0, rx + rw/2 - 0.8, rx + rw/2 + 0.8))
            elif abs(ry + rh - height_ft) < tol:
                windows.append(("h", height_ft, rx + rw/2 - 0.8, rx + rw/2 + 0.8))
            elif abs(rx) < tol:
                windows.append(("v", 0.0, ry + rh/2 - 0.8, ry + rh/2 + 0.8))
            elif abs(rx + rw - width_ft) < tol:
                windows.append(("v", width_ft, ry + rh/2 - 0.8, ry + rh/2 + 0.8))

    # 7. PIL Drawing setup
    scale = max(18.0, min(28.0, 1000.0 / width_ft))
    
    margin_left = 130
    margin_top = 130
    margin_right = 130
    margin_bottom = 130
    
    canvas_w = int(width_ft * scale) + margin_left + margin_right
    canvas_h = int(height_ft * scale) + margin_top + margin_bottom
    
    img = Image.new("RGB", (canvas_w, canvas_h), "white")
    draw = ImageDraw.Draw(img)
    
    def ft_to_px(x_ft, y_ft):
        return (margin_left + x_ft * scale, margin_top + y_ft * scale)
        
    # Draw fine draft grid
    grid_color = (235, 240, 245)
    for x in range(0, canvas_w, int(scale)):
        draw.line([(x, 0), (x, canvas_h)], fill=grid_color, width=1)
    for y in range(0, canvas_h, int(scale)):
        draw.line([(0, y), (canvas_w, y)], fill=grid_color, width=1)

    # Load fonts
    font_regular = _load_font(12, bold=False)
    font_bold = _load_font(13, bold=True)
    font_title = _load_font(20, bold=True)

    # 8. Draw Room Fills (pastel colors)
    FILL_COLORS = {
        "living": (253, 254, 254),
        "kitchen": (255, 250, 240),
        "dining": (245, 250, 240),
        "bedroom": (244, 248, 255),
        "study": (248, 248, 250),
        "bathroom": (240, 252, 250),
        "hallway": (248, 248, 248),
    }
    
    def get_kind(name):
        n = name.lower()
        for k in FILL_COLORS.keys():
            if k in n: return k
        return "other"
        
    for name, (rx, ry, rw, rh) in rects.items():
        px0, py0 = ft_to_px(rx, ry)
        px1, py1 = ft_to_px(rx + rw, ry + rh)
        kind = get_kind(name)
        draw.rectangle([px0, py0, px1, py1], fill=FILL_COLORS.get(kind, (250, 250, 250)))

    # 9. Draw Furniture
    def draw_bed(rx, ry, rw, rh):
        bw = min(5.5 * scale, rw * scale * 0.7)
        bl = min(6.0 * scale, rh * scale * 0.7)
        bx0 = margin_left + (rx + rw/2) * scale - bw/2
        by0 = margin_top + ry * scale + 4
        bx1 = bx0 + bw
        by1 = by0 + bl
        
        draw.rectangle([bx0, by0, bx1, by1], fill="white", outline=(180, 185, 190), width=2)
        pw = bw * 0.38
        pl = bl * 0.18
        draw.rectangle([bx0 + bw*0.08, by0 + 8, bx0 + bw*0.08 + pw, by0 + 8 + pl], fill="white", outline=(180, 185, 190), width=1)
        draw.rectangle([bx1 - bw*0.08 - pw, by0 + 8, bx1 - bw*0.08, by0 + 8 + pl], fill="white", outline=(180, 185, 190), width=1)
        draw.line([(bx0, by0 + bl*0.75), (bx1, by0 + bl*0.75)], fill=(180, 185, 190), width=1)

    def draw_sofa(rx, ry, rw, rh):
        sd = 2.8 * scale
        sw = min(rw * scale * 0.75, 10.0 * scale)
        sh = min(rh * scale * 0.75, 10.0 * scale)
        
        sx0 = margin_left + rx * scale + 10
        sy0 = margin_top + ry * scale + 10
        
        draw.rectangle([sx0, sy0, sx0 + sw, sy0 + sd], fill="white", outline=(180, 185, 190), width=2)
        draw.rectangle([sx0, sy0 + sd, sx0 + sd, sy0 + sh], fill="white", outline=(180, 185, 190), width=2)
        for i in range(1, int(sw / (2.5 * scale))):
            cx = sx0 + i * (2.5 * scale)
            if cx < sx0 + sw - 20:
                draw.line([(cx, sy0), (cx, sy0 + sd)], fill=(200, 205, 210), width=1)
        for i in range(1, int(sh / (2.5 * scale))):
            cy = sy0 + sd + i * (2.5 * scale)
            if cy < sy0 + sh - 20:
                draw.line([(sx0, cy), (sx0 + sd, cy)], fill=(200, 205, 210), width=1)
                
        tx0 = sx0 + sd + 15
        ty0 = sy0 + sd + 15
        tw = min(3.5 * scale, sw - sd - 20)
        th = min(2.2 * scale, sh - sd - 20)
        if tw > 10 and th > 10:
            draw.rectangle([tx0, ty0, tx0 + tw, ty0 + th], fill="white", outline=(180, 185, 190), width=1)

    def draw_bath(rx, ry, rw, rh):
        tx0 = margin_left + rx * scale + 8
        ty0 = margin_top + ry * scale + 8
        draw.rectangle([tx0, ty0, tx0 + 1.8 * scale, ty0 + 0.8 * scale], fill="white", outline=(180, 185, 190), width=2)
        draw.ellipse([tx0 + 0.3 * scale, ty0 + 0.8 * scale, tx0 + 1.5 * scale, ty0 + 2.2 * scale], fill="white", outline=(180, 185, 190), width=2)
        
        sx1 = margin_left + (rx + rw) * scale - 8
        sy1 = margin_top + (ry + rh) * scale - 8
        sw = 3.2 * scale
        draw.rectangle([sx1 - sw, sy1 - sw, sx1, sy1], fill="white", outline=(180, 185, 190), width=2)
        draw.line([(sx1 - sw, sy1 - sw), (sx1, sy1)], fill=(200, 205, 210), width=1)
        draw.line([(sx1 - sw, sy1), (sx1, sy1 - sw)], fill=(200, 205, 210), width=1)
        draw.ellipse([sx1 - sw/2 - 4, sy1 - sw/2 - 4, sx1 - sw/2 + 4, sy1 - sw/2 + 4], fill="white", outline=(180, 185, 190), width=1)

    def draw_kitchen(rx, ry, rw, rh):
        cd = 2.0 * scale
        kx0 = margin_left + rx * scale
        ky0 = margin_top + ry * scale
        kx1 = margin_left + (rx + rw) * scale
        ky1 = margin_top + (ry + rh) * scale
        
        draw.rectangle([kx0, ky0, kx1, ky0 + cd], fill="white", outline=(180, 185, 190), width=2)
        draw.rectangle([kx0, ky0 + cd, kx0 + cd, ky1], fill="white", outline=(180, 185, 190), width=2)
        
        sw = 2.2 * scale
        sh = 1.6 * scale
        sx0 = kx0 + rw * scale / 2 - sw/2
        sy0 = ky0 + cd/2 - sh/2
        draw.rectangle([sx0, sy0, sx0 + sw, sy0 + sh], fill="white", outline=(180, 185, 190), width=1)
        for cx, cy in [(sx0 + sw*0.25, sy0 + sh*0.25), (sx0 + sw*0.75, sy0 + sh*0.25),
                       (sx0 + sw*0.25, sy0 + sh*0.75), (sx0 + sw*0.75, sy0 + sh*0.75)]:
            draw.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill="white", outline=(150, 155, 160), width=1)
            
        sink_w = 1.6 * scale
        sink_h = 2.2 * scale
        sink_x0 = kx0 + cd/2 - sink_w/2
        sink_y0 = ky0 + cd + 20
        draw.rectangle([sink_x0, sink_y0, sink_x0 + sink_w, sink_y0 + sink_h], fill="white", outline=(180, 185, 190), width=1)
        draw.line([(sink_x0, sink_y0 + sink_h/2), (sink_x0 + sink_w, sink_y0 + sink_h/2)], fill=(180, 185, 190), width=1)

    def draw_dining(rx, ry, rw, rh):
        tw = 4.5 * scale
        th = 2.8 * scale
        tx0 = margin_left + (rx + rw/2) * scale - tw/2
        ty0 = margin_top + (ry + rh/2) * scale - th/2
        tx1 = tx0 + tw
        ty1 = ty0 + th
        
        draw.rectangle([tx0, ty0, tx1, ty1], fill="white", outline=(180, 185, 190), width=2)
        cw = 1.2 * scale
        cd = 1.0 * scale
        draw.rectangle([tx0 + tw*0.15, ty0 - cd, tx0 + tw*0.15 + cw, ty0], fill="white", outline=(180, 185, 190), width=1)
        draw.rectangle([tx1 - tw*0.15 - cw, ty0 - cd, tx1 - tw*0.15, ty0], fill="white", outline=(180, 185, 190), width=1)
        draw.rectangle([tx0 + tw*0.15, ty1, tx0 + tw*0.15 + cw, ty1 + cd], fill="white", outline=(180, 185, 190), width=1)
        draw.rectangle([tx1 - tw*0.15 - cw, ty1, tx1 - tw*0.15 + cw, ty1 + cd], fill="white", outline=(180, 185, 190), width=1)

    for name, (rx, ry, rw, rh) in rects.items():
        if "bedroom" in name.lower():
            draw_bed(rx, ry, rw, rh)
        elif "living" in name.lower():
            draw_sofa(rx, ry, rw, rh)
        elif "bathroom" in name.lower():
            draw_bath(rx, ry, rw, rh)
        elif "kitchen" in name.lower():
            draw_kitchen(rx, ry, rw, rh)
        elif "dining" in name.lower():
            draw_dining(rx, ry, rw, rh)

    # 10. Draw Wall lines (except at doors and windows)
    wall_color = (44, 62, 80)
    ext_wall_color = (24, 32, 40)
    
    def get_segments_with_gaps(coord, start, end, gaps):
        if not gaps:
            return [(start, end)]
        valid_gaps = []
        for gs, ge in gaps:
            gs_cl = max(start, min(end, gs))
            ge_cl = max(start, min(end, ge))
            if ge_cl - gs_cl > 0.05:
                valid_gaps.append((gs_cl, ge_cl))
        valid_gaps.sort(key=lambda x: x[0])
        
        segments = []
        curr = start
        for gs, ge in valid_gaps:
            if gs - curr > 0.05:
                segments.append((curr, gs))
            curr = ge
        if end - curr > 0.05:
            segments.append((curr, end))
        return segments

    # Draw vertical walls
    for x, y0, y1, is_ext in v_walls:
        gaps = []
        for orient, coord, gs, ge, dtype in doors:
            if orient == "v" and abs(coord - x) < 0.1:
                gaps.append((gs, ge))
        for orient, coord, gs, ge in windows:
            if orient == "v" and abs(coord - x) < 0.1:
                gaps.append((gs, ge))
                
        sub_segs = get_segments_with_gaps(x, y0, y1, gaps)
        for sy0, sy1 in sub_segs:
            p0 = ft_to_px(x, sy0)
            p1 = ft_to_px(x, sy1)
            w_px = 7 if is_ext else 4
            draw.line([p0, p1], fill=ext_wall_color if is_ext else wall_color, width=w_px)

    # Draw horizontal walls
    for y, x0, x1, is_ext in h_walls:
        gaps = []
        for orient, coord, gs, ge, dtype in doors:
            if orient == "h" and abs(coord - y) < 0.1:
                gaps.append((gs, ge))
        for orient, coord, gs, ge in windows:
            if orient == "h" and abs(coord - y) < 0.1:
                gaps.append((gs, ge))
                
        sub_segs = get_segments_with_gaps(y, x0, x1, gaps)
        for sx0, sx1 in sub_segs:
            p0 = ft_to_px(sx0, y)
            p1 = ft_to_px(sx1, y)
            w_px = 7 if is_ext else 4
            draw.line([p0, p1], fill=ext_wall_color if is_ext else wall_color, width=w_px)

    # 11. Draw Doors and Windows symbols
    for orient, coord, s, e, dtype in doors:
        p0 = ft_to_px(s, coord) if orient == "h" else ft_to_px(coord, s)
        p1 = ft_to_px(e, coord) if orient == "h" else ft_to_px(coord, e)
        d_len = abs(e - s) * scale
        
        draw.line([p0, p1], fill="white", width=9)
        
        if dtype == "open":
            draw.line([p0, p1], fill=(150, 160, 170), width=1)
            continue
            
        if orient == "h":
            hinge = p0
            swing_up = coord > height_ft / 2.0
            leaf_y = hinge[1] - d_len if swing_up else hinge[1] + d_len
            draw.line([hinge, (hinge[0], leaf_y)], fill=(80, 90, 100), width=2)
            box = [hinge[0] - d_len, hinge[1] - d_len, hinge[0] + d_len, hinge[1] + d_len]
            if swing_up:
                draw.arc(box, start=270, end=360, fill=(120, 130, 140), width=1)
            else:
                draw.arc(box, start=0, end=90, fill=(120, 130, 140), width=1)
        else:
            hinge = p0
            swing_left = coord > width_ft / 2.0
            leaf_x = hinge[0] - d_len if swing_left else hinge[0] + d_len
            draw.line([hinge, (leaf_x, hinge[1])], fill=(80, 90, 100), width=2)
            box = [hinge[0] - d_len, hinge[1] - d_len, hinge[0] + d_len, hinge[1] + d_len]
            if swing_left:
                draw.arc(box, start=90, end=180, fill=(120, 130, 140), width=1)
            else:
                draw.arc(box, start=0, end=90, fill=(120, 130, 140), width=1)

    # Draw Windows
    for orient, coord, s, e in windows:
        p0 = ft_to_px(s, coord) if orient == "h" else ft_to_px(coord, s)
        p1 = ft_to_px(e, coord) if orient == "h" else ft_to_px(coord, e)
        
        draw.line([p0, p1], fill="white", width=9)
        
        if orient == "h":
            draw.line([p0, p1], fill=(52, 152, 219), width=2)
            draw.line([(p0[0], p0[1]-3), (p1[0], p1[1]-3)], fill=ext_wall_color, width=1)
            draw.line([(p0[0], p0[1]+3), (p1[0], p1[1]+3)], fill=ext_wall_color, width=1)
            draw.line([(p0[0], p0[1]-4), (p0[0], p0[1]+4)], fill=ext_wall_color, width=1)
            draw.line([(p1[0], p1[1]-4), (p1[0], p1[1]+4)], fill=ext_wall_color, width=1)
        else:
            draw.line([p0, p1], fill=(52, 152, 219), width=2)
            draw.line([(p0[0]-3, p0[1]), (p1[0]-3, p1[1])], fill=ext_wall_color, width=1)
            draw.line([(p0[0]+3, p0[1]), (p1[0]+3, p1[1])], fill=ext_wall_color, width=1)
            draw.line([(p0[0]-4, p0[1]), (p0[0]+4, p0[1])], fill=ext_wall_color, width=1)
            draw.line([(p1[0]-4, p1[1]), (p1[0]+4, p1[1])], fill=ext_wall_color, width=1)

    # 12. Draw Room Labels and Dimensions
    def to_ft_in(val):
        feet = int(val)
        inches = int(round((val - feet) * 12))
        if inches == 12:
            feet += 1
            inches = 0
        return f"{feet}'-{inches}\""

    for name, (rx, ry, rw, rh) in rects.items():
        px0, py0 = ft_to_px(rx, ry)
        px1, py1 = ft_to_px(rx + rw, ry + rh)
        cx = (px0 + px1) / 2
        cy = (py0 + py1) / 2
        
        room_area = rw * rh
        dim_str = f"{to_ft_in(rw)} x {to_ft_in(rh)}"
        area_str = f"{int(room_area)} SQ FT"
        
        lines = [name.upper(), area_str, dim_str]
        y_text = cy - 20
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font_bold if line == lines[0] else font_regular)
            tw = bbox[2] - bbox[0]
            draw.text((cx - tw/2, y_text), line, fill=(44, 62, 80), font=font_bold if line == lines[0] else font_regular)
            y_text += 15

    # 13. Gridlines bubbles
    bubble_color = (180, 190, 200)
    grid_dashed = (180, 185, 190)
    
    grid_coords_x = sorted(list(set([round(x[0], 1) for x in rects.values()] + [round(x[0]+x[2], 1) for x in rects.values()])))
    for idx, gx in enumerate(grid_coords_x):
        px, _ = ft_to_px(gx, 0)
        draw.line([(px, margin_top - 40), (px, canvas_h - margin_bottom + 40)], fill=grid_dashed, width=1)
        bx = px
        by = margin_top - 40
        draw.ellipse([bx - 12, by - 12, bx + 12, by + 12], fill="white", outline=bubble_color, width=1)
        draw.text((bx - 4, by - 7), str(idx + 1), fill=(80, 90, 100), font=font_bold)
        
    grid_coords_y = sorted(list(set([round(x[1], 1) for x in rects.values()] + [round(x[1]+x[3], 1) for x in rects.values()])))
    for idx, gy in enumerate(grid_coords_y):
        _, py = ft_to_px(0, gy)
        draw.line([(margin_left - 40, py), (canvas_w - margin_right + 40), py], fill=grid_dashed, width=1)
        bx = margin_left - 40
        by = py
        draw.ellipse([bx - 12, by - 12, bx + 12, by + 12], fill="white", outline=bubble_color, width=1)
        letter = chr(65 + idx)
        draw.text((bx - 5, by - 7), letter, fill=(80, 90, 100), font=font_bold)

    # 14. Dimension Lines
    dim_y = margin_top - 70
    p0 = ft_to_px(0, 0)
    p1 = ft_to_px(width_ft, 0)
    draw.line([(p0[0], dim_y), (p1[0], dim_y)], fill="black", width=1)
    draw.line([(p0[0] - 5, dim_y + 5), (p0[0] + 5, dim_y - 5)], fill="black", width=2)
    draw.line([(p1[0] - 5, dim_y + 5), (p1[0] + 5, dim_y - 5)], fill="black", width=2)
    txt = f"{to_ft_in(width_ft)} OVERALL WIDTH"
    bbox = draw.textbbox((0, 0), txt, font=font_bold)
    tw = bbox[2] - bbox[0]
    draw.text(((p0[0] + p1[0])/2 - tw/2, dim_y - 18), txt, fill="black", font=font_bold)

    dim_x = margin_left - 70
    p0 = ft_to_px(0, 0)
    p1 = ft_to_px(0, height_ft)
    draw.line([(dim_x, p0[1]), (dim_x, p1[1])], fill="black", width=1)
    draw.line([(dim_x - 5, p0[1] + 5), (dim_x + 5, p0[1] - 5)], fill="black", width=2)
    draw.line([(dim_x - 5, p1[1] + 5), (dim_x + 5, p1[1] - 5)], fill="black", width=2)
    txt = f"{to_ft_in(height_ft)} OVERALL LENGTH"
    bbox = draw.textbbox((0, 0), txt, font=font_bold)
    tw = bbox[2] - bbox[0]
    txt_img = Image.new("RGBA", (tw + 10, 20), (255, 255, 255, 0))
    txt_draw = ImageDraw.Draw(txt_img)
    txt_draw.text((5, 2), txt, fill="black", font=font_bold)
    txt_img = txt_img.rotate(90, expand=True)
    img.paste(txt_img, (int(dim_x - txt_img.width - 5), int((p0[1] + p1[1])/2 - txt_img.height/2)), txt_img)

    # 15. Border Frame & Title Block
    draw.rectangle([15, 15, canvas_w - 15, canvas_h - 15], outline=(44, 62, 80), width=2)
    draw.rectangle([22, 22, canvas_w - 22, canvas_h - 22], outline=(44, 62, 80), width=1)
    
    tb_w = 280
    tb_h = 100
    tbx0 = canvas_w - margin_right + 30
    tby0 = canvas_h - margin_bottom + 20
    tbx0 = min(tbx0, canvas_w - tb_w - 30)
    tby0 = min(tby0, canvas_h - tb_h - 30)
    
    draw.rectangle([tbx0, tby0, tbx0 + tb_w, tby0 + tb_h], fill="white", outline=(44, 62, 80), width=2)
    draw.line([(tbx0, tby0 + 30), (tbx0 + tb_w, tby0 + 30)], fill=(44, 62, 80), width=1)
    draw.line([(tbx0, tby0 + 65), (tbx0 + tb_w, tby0 + 65)], fill=(44, 62, 80), width=1)
    draw.line([(tbx0 + 140, tby0 + 30), (tbx0 + 140, tby0 + tb_h)], fill=(44, 62, 80), width=1)
    
    draw.text((tbx0 + 10, tby0 + 7), "AI ARCHITECTURAL BLUEPRINT", fill=(44, 62, 80), font=font_bold)
    draw.text((tbx0 + 10, tby0 + 35), "PROJECT: RESIDENCE", fill=(80, 90, 100), font=font_regular)
    draw.text((tbx0 + 10, tby0 + 48), f"AREA: {area} SQFT", fill=(80, 90, 100), font=font_regular)
    draw.text((tbx0 + 150, tby0 + 35), "SHEET: A-101", fill=(80, 90, 100), font=font_regular)
    draw.text((tbx0 + 150, tby0 + 48), "SCALE: 1/4\" = 1'-0\"", fill=(80, 90, 100), font=font_regular)
    draw.text((tbx0 + 10, tby0 + 72), f"BHK: {bedrooms} BED | {bathrooms} BATH", fill=(80, 90, 100), font=font_regular)
    draw.text((tbx0 + 150, tby0 + 72), "DATE: 2026-07-14", fill=(80, 90, 100), font=font_regular)

    # 16. North Arrow and Scale Bar
    nx = canvas_w - margin_right - 40
    ny = margin_top - 80
    draw.ellipse([nx - 18, ny - 18, nx + 18, ny + 18], fill="white", outline="black", width=2)
    draw.line([(nx, ny + 14), (nx, ny - 14)], fill="black", width=2)
    draw.polygon([(nx - 5, ny - 5), (nx + 5, ny - 5), (nx, ny - 14)], fill="black")
    draw.text((nx - 4, ny + 20), "N", fill="black", font=font_bold)
    
    bx0 = margin_left
    by = canvas_h - margin_bottom + 50
    draw.line([(bx0, by), (bx0 + 10 * scale, by)], fill="black", width=3)
    draw.line([(bx0, by - 5), (bx0, by + 5)], fill="black", width=2)
    draw.line([(bx0 + 5 * scale, by - 5), (bx0 + 5 * scale, by + 5)], fill="black", width=2)
    draw.line([(bx0 + 10 * scale, by - 5), (bx0 + 10 * scale, by + 5)], fill="black", width=2)
    draw.text((bx0, by + 8), "0", fill="black", font=font_regular)
    draw.text((bx0 + 5 * scale - 5, by + 8), "5'", fill="black", font=font_regular)
    draw.text((bx0 + 10 * scale - 8, by + 8), "10' SCALE", fill="black", font=font_regular)

    image_path = "static/floor_plan.png"
    img.save(image_path)
    return image_path
