class Canvas {
    #width
    #height

    constructor(width, height) {
        this.#width = width
        this.#height = height
    }

    get width() {
        return this.#width
    }

    get height() {
        return this.#height
    }

    draw() {
        createCanvas(this.#width, this.#height);
    }
}


class Color {
    #hex

    constructor(hex) {
        this.#hex = hex
    }

    get hex() {
        return this.#hex
    }
}

class Colors {
    #colors

    constructor() {
        this.#colors = {
            "red-500": new Color("#F44336"),
            "gray-500": new Color("#607D8B"),
            "gray-50": new Color("#ECEFF1"),
        }
    }

    color(name) {
        return this.#colors[name]
    }
}

class Pos {
    #x
    #y

    constructor(x,y) {
        this.#x = x
        this.#y = y
    }

    get x() {
        return this.#x
    }

    get y() {
        return this.#y
    }
}

class Angle {
    #turn

    constructor(turn) {
        this.#turn = turn
    }

    get radian() {
        return this.#turn * 2 * Math.PI
    }

    get turn() {
        return this.#turn
    }

    add(angle) {
        return new Angle((this.#turn + angle.turn) % 1)
    }
}

class Axis {
    #pos
    #length
    #angle
    #color

    constructor(pos, length, angle, color) {
        this.#pos = pos
        this.#length = length
        this.#angle = angle
        this.#color = color
    }

    draw() {
        stroke(this.#color)
        const pos = this.#pos
        const length = this.#length
        const angle = this.#angle
        const radian = angle.radian - Math.PI/2
        const x = pos.x + length * cos(radian)
        const y = pos.y + length * sin(radian) 
        line(pos.x, pos.y, x, y)
    }
}

class Node {
    #pos
    #radius
    #color
    #angle
    #axis

    constructor(pos, radius, color, angle) {
        this.#pos = pos
        this.#radius = radius
        this.#color = color
        this.#angle = angle
        this.#axis = new Axis(pos, radius, angle, color)
    }

    draw() {
        stroke(this.#color)
        circle(this.#pos.x, this.#pos.y, this.#radius * 2)
        this.#axis.draw()
    }

}

class Nodes {
    #list_pos
    #radius
    #color
    #time
    #speed
    #nodes

    constructor(list_pos, radius, color, speed) {
        this.#list_pos = list_pos
        this.#radius = radius
        this.#color = color
        this.#speed = speed
        this.time(0)
    }

    draw() {
        this.#nodes.forEach((node) => node.draw())
    }

    time(t) {
        this.#time = t
        this.#update()
    }

    #update() {
        const list_pos = this.#list_pos
        const radius = this.#radius
        const color = this.#color        
        this.#nodes = []        
        const turn = this.#time * this.#speed
        let angle = new Angle(turn)        
        const delta = new Angle(1/list_pos.length)
        list_pos.forEach((pos) => {
            this.#nodes.push(new Node(pos, radius, color, angle))
            angle = angle.add(delta)
        })        
    }
}

const canvas = new Canvas(400,400)
const list_pos = [
    new Pos(canvas.width/6, canvas.height/2),
    new Pos(canvas.width*2/6, canvas.height/2),
    new Pos(canvas.width*3/6, canvas.height/2),
    new Pos(canvas.width*4/6, canvas.height/2),            
    new Pos(canvas.width*5/6, canvas.height/2)
]
const radius = canvas.width / 20
const colors = new Colors()
const node_color = colors.color("gray-500").hex
const nodes = new Nodes(list_pos, radius, node_color, 1/100)
const bg_color = colors.color("gray-50").hex

function setup() {
    canvas.draw()
}

function draw() {
    background(bg_color);
    nodes.time(frameCount)
    nodes.draw()
}
