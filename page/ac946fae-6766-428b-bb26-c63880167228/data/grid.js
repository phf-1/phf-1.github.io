class Canvas {
    #width
    #height
    #canvas
    #parent
    #actions

    constructor(width, height, canvas_id) {
        this.#width = width
        this.#height = height
        this.#parent = document.getElementById(canvas_id)
        this.#canvas = this.#parent.getElementsByTagName("canvas")[0]
        this.#actions = this.#parent.getElementsByClassName("actions")[0]
    }

    get width() {
        return this.#width
    }

    get height() {
        return this.#height
    }

    draw() {
        createCanvas(this.#width, this.#height, this.#canvas);
        let button = createButton("reset");
        button.elt.classList.add("button")
        button.mousePressed(resetSketch);        
        this.#actions.appendChild(button.elt)
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
            "blue-500": new Color("#2196F3"),
            "green-500": new Color("#4CAF50"),            
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

class Direction {
    #dir

    constructor(dir) {
        this.#dir = dir
    }

    get dir() {
        return dir
    }
}

const top_dir = new Direction("top");
const top_right_dir = new Direction("top_right");
const right_dir = new Direction("right");
const bottom_right_dir = new Direction("bottom_right");
const bottom_dir = new Direction("bottom");
const bottom_left_dir = new Direction("bottom_left");
const left_dir = new Direction("left");
const top_left_dir = new Direction("top_left");
const directions = [top_dir, top_right_dir, right_dir, bottom_right_dir, bottom_dir, bottom_left_dir, left_dir, top_left_dir];

class Node {
    #pos
    #radius
    #color
    #neighbors

    constructor(pos, radius, color) {
        this.#pos = pos
        this.#radius = radius
        this.#color = color
        this.#neighbors = new Map()
    }

    get pos() {
        return this.#pos
    }

    get radius() {
        return this.#radius
    }

    add_neighbor(dir, node) {
        this.#neighbors.set(dir, node);
    }

    set_neighbors(neighbors) {
        this.#neighbors = new Map()
        neighbors.forEach((node, dir) => {
            this.add_neighbor(dir, node)
        });
    }

    get_neighbors() {
        return this.#neighbors
    }

    get_neighbor(dir) {
        return this.#neighbors.get(dir) || null;
    }
    
    draw() {
        fill(this.#color)
        circle(this.#pos.x, this.#pos.y, this.#radius * 2)
        stroke(this.#color)
        const start = this.#pos
        this.#neighbors.forEach((sibling) => {
            if (sibling !== null) {
                const end = sibling.pos
                line(start.x, start.y, end.x, end.y)
            }
        })
    }
}

class Probe {
    #node
    #color
    #dir
    #moving

    constructor(node, color, dir) {
        this.#node = node
        this.#color = color
        this.#dir = dir
        this.#moving = false;
    }

    draw() {
        const node = this.#node
        const pos = node.pos
        const radius = node.radius
        fill(this.#color.hex)
        circle(pos.x, pos.y, radius * 2)
    }

    get moving() {
        return this.#moving
    }

    next() {
        const node = this.#node.get_neighbor(this.#dir)
        if (node === null) {
            this.#moving = false
            return 
        }
        else {
            this.#node = node
            this.#moving = true
        }
    }
}

class Nodes {
    #pos
    #width
    #color
    #nodes

    constructor(pos, width, color, nbr) {
        this.#pos = pos
        this.#width = width
        this.#color = color
        const square_width = width / nbr
        const node_radius = (square_width / 2) * 0.6
        const top_left = new Pos(pos.x - width/2, pos.y - width/2)
        this.#nodes = []        
        const nodes = this.#nodes
        let x
        let y
        for (let row = 0; row < nbr; row++) {
            nodes.push([])
            y = top_left.y + row * square_width + square_width/2            
            for (let col = 0; col < nbr; col++) {                
                x = top_left.x + col * square_width + square_width/2
                nodes[row][col] = new Node(new Pos(x, y), node_radius, color)
            }
        }

        for (let row = 0; row < nbr; row++) {
            for (let col = 0; col < nbr; col++) {
                const node = nodes[row][col];
                const list_dir_node = [
                    [top_dir, (nodes[row - 1] && nodes[row - 1][col]) || null],
                    [top_right_dir, (nodes[row - 1] && nodes[row - 1][col + 1]) || null],
                    [right_dir, (nodes[row] && nodes[row][col + 1]) || null],
                    [bottom_right_dir, (nodes[row + 1] && nodes[row + 1][col + 1]) || null],
                    [bottom_dir, (nodes[row + 1] && nodes[row + 1][col]) || null],
                    [bottom_left_dir, (nodes[row + 1] && nodes[row + 1][col - 1]) || null],
                    [left_dir, (nodes[row - 1] && nodes[row - 1][col - 1]) || null],
                    [top_left_dir, (nodes[row - 1] && nodes[row - 1][col - 1]) || null],
                ];
                const neighbors = new Map(list_dir_node);
                node.set_neighbors(neighbors);                
            }
        }
    }

    get(row, col) {
        return this.#nodes[row][col]
    }
    
    draw() {
        this.#nodes.flat().forEach((node) => node.draw())
    }
}

/*
 * We use the global scope.
 *
 * It may be preferable to avoid using the global scope using new p5(function(p) { p.setup = ...; p.draw = ...; })
 */

const width = 400
const canvas = new Canvas(width, width, "p5")
const colors = new Colors()
const node_color = colors.color("gray-500").hex
const nodes = new Nodes(new Pos(width/2,width/2), width*3/4, node_color, 10)
let probes = []
function resetSketch() {
    const start_node = nodes.get(0,0);
    probes = [
        new Probe(start_node, colors.color("red-500"), right_dir),
        new Probe(start_node, colors.color("blue-500"), bottom_right_dir),
        new Probe(start_node, colors.color("green-500"), bottom_dir),  
    ]
    !isLooping() && loop()
}
const bg_color = colors.color("gray-50").hex

function setup() {
    canvas.draw()    
    resetSketch()    
}

function draw() {
    background(bg_color);
    nodes.draw()
    probes.forEach((probe) => probe.draw())
    if (frameCount % 10 === 0) {
        probes.forEach((probe) => probe.next())
        !probes.some((probe) => probe.moving) && noLoop()
    }
}
