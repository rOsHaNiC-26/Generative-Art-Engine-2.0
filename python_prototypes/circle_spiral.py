from turtle import *
import colorsys

bgcolor("black")
tracer(0) 
hideturtle()
speed(0)

n = 120
h = 0

def draw_shape(x, y):
    global h
    penup()
    goto(x, y)
    pendown()
    for i in range(120): # Draw a smaller segment per click
        c = colorsys.hsv_to_rgb(h, 1, 1)
        color(c)
        circle(i * 0.4)
        right(5)
        forward(3)
        h += 1 / n
    update()

def clear_screen():
    clear()
    update()

# Initial draw
draw_shape(0, 0)

# Interactivity
onscreenclick(draw_shape)
onkey(clear_screen, "c")
listen()

done()
