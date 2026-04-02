import turtle
import colorsys

turtle.bgcolor("black")
turtle.tracer(0)
t = turtle.Turtle()
t.speed(0)
t.width(2)
t.hideturtle()

h = 0

def draw_square_spiral(x, y):
    global h
    t.penup()
    t.goto(x, y)
    t.pendown()
    for i in range(150): # smaller version for clicking
        color = colorsys.hsv_to_rgb(h, 1, 1)
        t.pencolor(color)
        t.forward(i)
        t.left(91)
        h += 0.005
    turtle.update()

def clear():
    t.clear()
    turtle.update()

turtle.onscreenclick(draw_square_spiral)
turtle.onkey(clear, "c")
turtle.listen()

draw_square_spiral(0, 0)
turtle.done()
