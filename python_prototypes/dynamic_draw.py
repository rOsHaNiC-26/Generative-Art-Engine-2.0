import turtle
import colorsys

t = turtle.Turtle()
t.speed(0)
turtle.bgcolor("black")
t.hideturtle()
turtle.tracer(0) 

h = 0
size_factor = 1.0

def change_size():
    global size_factor
    size_factor += 0.5
    if size_factor > 3.0:
        size_factor = 0.5

turtle.onkey(change_size, "s")
turtle.listen()

def draw_point(x, y):
    global h
    t.goto(x, y)
    t.pendown()
    color = colorsys.hsv_to_rgb(h, 1, 1)
    t.pencolor(color)
    t.width(size_factor * 5)
    t.forward(1)
    t.left(10)
    h += 0.005
    turtle.update()

def pen_up_goto(x, y):
    t.penup()
    t.goto(x, y)
    draw_point(x, y)

def clear():
    t.clear()
    turtle.update()

turtle.onscreenclick(pen_up_goto)
turtle.ondrag(draw_point)
turtle.onkey(clear, "c")

# Draw a starting shape
for c in range(150):
    color = colorsys.hsv_to_rgb(h, 1, 1)
    t.pencolor(color)
    t.width(c / 100 + 1)
    t.forward(c)
    t.left(100)
    h += 0.005
turtle.update()

turtle.mainloop()
