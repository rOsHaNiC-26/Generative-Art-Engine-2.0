import turtle as tur
import colorsys
import time
import math

tur.bgcolor("black")
tur.speed(0)
tur.tracer(0)
tur.hideturtle()
tur.width(2)
tur.setup(700, 700)

paused = False
user_scale = 1.0

def toggle_pause():
    global paused
    paused = not paused

def scale_up():
    global user_scale
    user_scale += 0.2

def scale_down():
    global user_scale
    if user_scale > 0.4:
        user_scale -= 0.2

tur.onkey(toggle_pause, "space")
tur.onkey(scale_up, "Up")
tur.onkey(scale_down, "Down")
tur.listen()

def draw_triangle_spiral(rot, scale, hue_shift):
    tur.clear()
    n = 150
    for i in range(n):
        hue = (i / n + hue_shift) % 1.0
        color = colorsys.hsv_to_rgb(hue, 1, 1)
        tur.pencolor(color)
        for j in range(3):
            tur.forward(100 * scale * user_scale)
            tur.right(70)
        tur.right(3 + rot)
    tur.update()

frame = 0
angle = 0

def animate():
    global frame, angle
    if not paused:
        scale = 1 + 0.2 * math.sin(frame / 20)
        hue_shift = (frame % 360) / 360
        draw_triangle_spiral(angle, scale, hue_shift)
        angle += 0.5
        frame += 1
    tur.ontimer(animate, 30)

animate()
tur.mainloop()
