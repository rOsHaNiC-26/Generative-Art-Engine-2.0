import pygame
import math
import colorsys

# Initialize Pygame
pygame.init()

# Screen dimensions
WIDTH, HEIGHT = 1000, 800
UI_WIDTH = 250
DRAW_WIDTH = WIDTH - UI_WIDTH

# Colors
BG_COLOR = (15, 15, 15)
UI_BG = (30, 30, 35)
UI_TEXT = (220, 220, 220)
BUTTON_BG = (50, 50, 60)
BUTTON_HOVER = (70, 70, 85)
BUTTON_ACTIVE = (120, 80, 200)

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Interactive Graphics Dashboard")
font = pygame.font.SysFont("Segoe UI", 20)
title_font = pygame.font.SysFont("Segoe UI", 24, bold=True)

# Create a separate surface for persistent drawing (like turtle canvas)
draw_surface = pygame.Surface((DRAW_WIDTH, HEIGHT))
draw_surface.fill(BG_COLOR)

# State
current_mode = 1
is_paused = False
running = True
mouse_down = False
last_mouse_pos = None

# Variables for animations
frame = 0
angle = 0
global_hue = 0
size_factor = 1.0

clock = pygame.time.Clock()

# --- UI Definitions ---
buttons = [
    {"label": "1. Circle Spiral", "mode": 1, "rect": pygame.Rect(20, 80, 210, 40)},
    {"label": "2. Dynamic Drawing", "mode": 2, "rect": pygame.Rect(20, 130, 210, 40)},
    {"label": "3. Breathing Mandala", "mode": 3, "rect": pygame.Rect(20, 180, 210, 40)},
    {"label": "4. Triangle Spiral", "mode": 4, "rect": pygame.Rect(20, 230, 210, 40)},
    {"label": "5. Square Spiral", "mode": 5, "rect": pygame.Rect(20, 280, 210, 40)},
]

btn_clear = pygame.Rect(20, 350, 210, 40)
btn_pause = pygame.Rect(20, 400, 210, 40)

def hsv_to_rgb(h, s, v):
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    return (int(r * 255), int(g * 255), int(b * 255))

def clear_screen():
    global global_hue, frame, angle
    draw_surface.fill(BG_COLOR)
    global_hue = 0
    frame = 0
    angle = 0

def draw_ui():
    pygame.draw.rect(screen, UI_BG, (0, 0, UI_WIDTH, HEIGHT))
    
    title = title_font.render("Graphics Dashboard", True, UI_TEXT)
    screen.blit(title, (15, 20))
    
    for btn in buttons:
        color = BUTTON_ACTIVE if btn["mode"] == current_mode else BUTTON_BG
        # Hover effect
        if btn["rect"].collidepoint(pygame.mouse.get_pos()):
            if btn["mode"] != current_mode:
                color = BUTTON_HOVER
        pygame.draw.rect(screen, color, btn["rect"], border_radius=5)
        text = font.render(btn["label"], True, (255, 255, 255))
        screen.blit(text, (btn["rect"].x + 15, btn["rect"].y + 8))
        
    # Clear button
    c_color = BUTTON_HOVER if btn_clear.collidepoint(pygame.mouse.get_pos()) else BUTTON_BG
    pygame.draw.rect(screen, c_color, btn_clear, border_radius=5)
    screen.blit(font.render("Clear Screen [C]", True, (255, 100, 100)), (btn_clear.x + 15, btn_clear.y + 8))
    
    # Pause button
    p_color = BUTTON_HOVER if btn_pause.collidepoint(pygame.mouse.get_pos()) else BUTTON_BG
    pygame.draw.rect(screen, p_color, btn_pause, border_radius=5)
    p_text = "Resume [Space]" if is_paused else "Pause [Space]"
    screen.blit(font.render(p_text, True, (100, 200, 255)), (btn_pause.x + 15, btn_pause.y + 8))
    
    # Instructions
    inst_y = 470
    instructions = [
        "Instructions:",
        "Mode 1 & 5: Click to draw",
        "Mode 2: Drag to draw",
        "Mode 3 & 4: Auto-animates",
        "",
        "Keys:",
        "'S' : Change size (Mode 2)",
        "Up/Down : Scale (Mode 4)",
        "'C' : Clear Screen",
        "Space : Pause/Resume"
    ]
    for line in instructions:
        screen.blit(font.render(line, True, (150, 150, 150)), (20, inst_y))
        inst_y += 25

# --- Mode Logic Functions ---

def draw_circle_spiral(cx, cy):
    global global_hue
    temp_hue = global_hue
    rot = 0
    for i in range(120):
        color = hsv_to_rgb(temp_hue % 1.0, 1, 1)
        # Calculate center of the circle to mimic turtle
        radius = i * 1.5
        center_x = cx + math.cos(rot) * radius
        center_y = cy + math.sin(rot) * radius
        
        # Pygame doesn't do thick un-filled circles perfectly, so we just draw circle
        pygame.draw.circle(draw_surface, color, (int(center_x), int(center_y)), int(radius), 1)
        rot += 0.1
        temp_hue += 1/120
    global_hue = temp_hue

def draw_dynamic_point(start_pos, end_pos):
    global global_hue
    color = hsv_to_rgb(global_hue % 1.0, 1, 1)
    pygame.draw.line(draw_surface, color, start_pos, end_pos, int(size_factor * 5))
    global_hue += 0.005

def draw_square_spiral(cx, cy):
    global global_hue
    temp_hue = global_hue
    x, y = cx, cy
    direction = 0
    for i in range(150):
        color = hsv_to_rgb(temp_hue % 1.0, 1, 1)
        step = i * 2
        next_x = x + math.cos(direction) * step
        next_y = y + math.sin(direction) * step
        pygame.draw.line(draw_surface, color, (int(x), int(y)), (int(next_x), int(next_y)), 2)
        x, y = next_x, next_y
        direction += math.radians(91)
        temp_hue += 0.005
    global_hue = temp_hue

# --- Auto Animations ---

def animate_mandala():
    global frame, angle
    if is_paused: return
    
    # We clear surface dynamically for this mode so animation doesn't stack forever
    draw_surface.fill(BG_COLOR)
    
    scale = 1 + 0.2 * math.sin(frame / 20)
    cx, cy = DRAW_WIDTH // 2, HEIGHT // 2
    
    # Pygame doesn't have an easy ellipse rotation, we'll draw points for ellipses
    for j in range(0, 25, 2):
        for i in range(15):
            color = hsv_to_rgb(i / 15, j / 25, 1)
            # Center of this petal
            rot_offset = angle + (i * 24)
            # Ellipse dimensions
            width_e = 50 * scale
            height_e = 100 * scale
            y_offset = (200 - j * 4) * scale
            
            # Draw ellipse by polygon approximation
            points = []
            for t in range(0, 360, 15):
                rad_t = math.radians(t)
                ex = width_e * math.cos(rad_t)
                ey = height_e * math.sin(rad_t) + y_offset
                
                # Rotate around center
                rad_rot = math.radians(rot_offset)
                final_x = cx + ex * math.cos(rad_rot) - ey * math.sin(rad_rot)
                final_y = cy + ex * math.sin(rad_rot) + ey * math.cos(rad_rot)
                points.append((final_x, final_y))
            pygame.draw.polygon(draw_surface, color, points, 2)
            
    angle += 2
    frame += 1

def animate_triangle_spiral():
    global frame, angle
    if is_paused: return
    
    # Clear per frame for animation
    draw_surface.fill(BG_COLOR)
    scale = 1 + 0.2 * math.sin(frame / 20)
    hue_shift = (frame % 360) / 360
    
    cx, cy = DRAW_WIDTH // 2, HEIGHT // 2
    n = 150
    current_angle = angle
    
    x, y = cx, cy
    direction = 0
    
    # Pre-calculate to draw as lines
    lines = []
    for i in range(n):
        h = (i / n + hue_shift) % 1.0
        color = hsv_to_rgb(h, 1, 1)
        
        step = 10 * scale * size_factor * (i/20 + 1)
        next_x = x + math.cos(direction) * step
        next_y = y + math.sin(direction) * step
        
        lines.append(((int(x), int(y)), (int(next_x), int(next_y)), color))
        
        x, y = next_x, next_y
        direction += math.radians(140 + current_angle)
        
    for start, end, color in lines:
        pygame.draw.line(draw_surface, color, start, end, 2)
        
    angle += 0.5
    frame += 1


# --- Main Loop ---
while running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
            
        elif event.type == pygame.MOUSEBUTTONDOWN:
            mouse_pos = pygame.mouse.get_pos()
            # Check UI clicks
            if mouse_pos[0] < UI_WIDTH:
                for btn in buttons:
                    if btn["rect"].collidepoint(mouse_pos):
                        current_mode = btn["mode"]
                        clear_screen()
                if btn_clear.collidepoint(mouse_pos):
                    clear_screen()
                if btn_pause.collidepoint(mouse_pos):
                    is_paused = not is_paused
            else:
                # Drawing area clicks
                mouse_down = True
                draw_x = mouse_pos[0] - UI_WIDTH
                draw_y = mouse_pos[1]
                last_mouse_pos = (draw_x, draw_y)
                
                if current_mode == 1:
                    draw_circle_spiral(draw_x, draw_y)
                elif current_mode == 2:
                    draw_dynamic_point(last_mouse_pos, last_mouse_pos)
                elif current_mode == 5:
                    draw_square_spiral(draw_x, draw_y)
                    
        elif event.type == pygame.MOUSEBUTTONUP:
            mouse_down = False
            last_mouse_pos = None
            
        elif event.type == pygame.MOUSEMOTION:
            if mouse_down and current_mode == 2:
                mouse_pos = pygame.mouse.get_pos()
                if mouse_pos[0] >= UI_WIDTH:
                    draw_x = mouse_pos[0] - UI_WIDTH
                    draw_y = mouse_pos[1]
                    draw_dynamic_point(last_mouse_pos, (draw_x, draw_y))
                    last_mouse_pos = (draw_x, draw_y)
                    
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_c:
                clear_screen()
            elif event.key == pygame.K_SPACE:
                is_paused = not is_paused
            elif event.key == pygame.K_s and current_mode == 2:
                size_factor += 0.5
                if size_factor > 3.0: size_factor = 0.5
            elif event.key == pygame.K_UP and current_mode == 4:
                size_factor += 0.2
            elif event.key == pygame.K_DOWN and current_mode == 4:
                if size_factor > 0.4: size_factor -= 0.2
                
    # Update animations
    if current_mode == 3:
        animate_mandala()
    elif current_mode == 4:
        animate_triangle_spiral()
        
    # Render
    screen.fill(BG_COLOR)
    screen.blit(draw_surface, (UI_WIDTH, 0))
    draw_ui()
    
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
