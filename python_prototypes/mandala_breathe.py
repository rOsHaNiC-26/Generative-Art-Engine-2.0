import turtle as tur
import colorsys as cs
import time
import math

# --- Setup ---
tur.setup(600, 600)
tur.bgcolor("black")
tur.speed(0)
tur.width(2)
tur.tracer(0)  # disable auto-updates for smooth animation
tur.hideturtle()

# --- Function to draw one frame of the mandala ---
def draw_mandala(rot, scale):
    tur.clear()
    for j in range(25):
        for i in range(15):
            color = cs.hsv_to_rgb(i / 15, j / 25, 1)
            tur.pencolor(color)
            tur.right(90 + rot)
            tur.circle((200 - j * 4) * scale, 90)
            tur.left(90)
            tur.circle((200 - j * 4) * scale, 90)
            tur.right(180)
            tur.circle(20 * scale, 2)
    tur.update()

# --- Animation loop ---
angle = 0
frame = 0
while True:
    # Compute scale factor using sine wave for smooth breathing
    scale = 1 + 0.2 * math.sin(frame / 20)
    
    # Draw and rotate pattern
    draw_mandala(angle, scale)
    
    # Update rotation and frame counters
    angle += 2          # rotation speed
    frame += 1          # frame counter
    time.sleep(0.03)    # control animation speed
