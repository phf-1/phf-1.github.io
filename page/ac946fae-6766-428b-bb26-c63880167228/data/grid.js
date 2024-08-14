class Color {
    #hex

    constructor(hex) {
        this.#hex = hex
    }

    get hex() {
        return this.#hex
    }
}

const red_500 = new Color("#F44336")
const blue_500 = new Color("#2196F3")
const green_500 = new Color("#4CAF50")
const purple_500 = new Color("#9C27B0")
const teal_500 = new Color("#009688")
const orange_500 = new Color("#FF9800")
const yellow_500 = new Color("#FFEB3B")
const indigo_500 = new Color("#3F51B5")
const gray_500 = new Color("#607D8B")
const white = new Color("#FFFFFF")
const gray_50 = new Color("#ECEFF1")

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

const directions = [
    top_dir,
    top_right_dir,
    right_dir,
    bottom_right_dir,
    bottom_dir,
    bottom_left_dir,
    left_dir,
    top_left_dir,
]

class Canvas {
    #width
    #height
    #parent
    #canvas

    constructor(parent) {
        this.#width = parent.offsetWidth
        this.#height = parent.offsetWidth
        this.#parent = parent
        this.#canvas = null
    }

    get width() {
        return this.#width
    }

    get height() {
        return this.#height
    }

    start() {
        if (this.#canvas === null) {
            const parent = this.#parent
            this.#canvas = parent.getElementsByTagName("canvas")[0]
            const actions = parent.getElementsByClassName("actions")[0]
            createCanvas(this.#width, this.#height, this.#canvas);
            let button = createButton("reset");
            button.elt.classList.add("button")
            button.mousePressed(reset_sketch);
            actions.appendChild(button.elt)
        }
    }
}

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

    draw_disk(color = null) {
        fill(color === null ? this.#color : color)
        const start = this.#pos
        circle(start.x, start.y, this.#radius * 2)        
    }

    draw_edges() {
        stroke(this.#color)
        const start = this.#pos        
        this.#neighbors.forEach((neighbor) => {
            if (neighbor !== null) {
                const end = neighbor.pos
                line(start.x, start.y, end.x, end.y)
            }
        })        
    }
}

class Probe {
    #color
    #dir
    #moving
    #nodes
    #head    

    constructor(node, color, dir) {
        this.#nodes = [node]
        this.#head = node
        this.#color = color
        this.#dir = dir
        this.#moving = false;
    }

    draw() {
        this.#nodes.map((node) => {
            const pos = node.pos
            fill(this.#color.hex)
            circle(pos.x, pos.y, node.radius * 2)            
        })
    }

    get moving() {
        return this.#moving
    }

    next() {
        const node = this.#head.get_neighbor(this.#dir)
        if (node === null) {
            this.#moving = false
        }
        else {
            this.#head = node
            this.#nodes.push(node)
            this.#moving = true
        }
    }
}

class Grid {
    #pos
    #width
    #color
    #nodes
    #nbr

    constructor(pos, width, color, nbr) {
        this.#pos = pos
        this.#width = width
        this.#color = color
        this.#nbr = nbr
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
                nodes[row][col] = new Node(new Pos(x, y), node_radius, color.hex)
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
                    [left_dir, (nodes[row] && nodes[row][col - 1]) || null],
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

    get nbr() {
        return this.#nbr
    }
    
    draw() {
        this.#nodes.flat().forEach((node) => node.draw_edges())
        this.#nodes.flat().forEach((node) => node.draw_disk())        
    }
}

const probe_colors = [
    red_500,
    blue_500,
    green_500,
    purple_500,
    teal_500,
    orange_500,
    yellow_500,
    indigo_500,
]


/*
 * We use the global scope.
 *
 * It may be preferable to avoid using the global scope using new p5(function(p) { p.setup = ...; p.draw = ...; })
 */

let grid
let start_node
let probes

function setup() {
    frameRate(20)
    
    // The canvas is built.
    const parent = document.getElementById("p5")
    const canvas = new Canvas(parent)
    canvas.start()

    // The grid are built.
    const parent_width = parent.offsetWidth
    const grid_center_pos = new Pos(parent_width/2,parent_width/2)
    grid = new Grid(
        grid_center_pos,
        parent_width*3/4,
        white,
        10
    )

    // The probes are built.
    start_node = grid.get(0,0);
    probes = [
        new Probe(start_node, red_500, right_dir),
        new Probe(start_node, blue_500, bottom_right_dir),
        new Probe(start_node, green_500, bottom_dir),
    ]
}

function draw() {
    background(gray_50.hex)    
    grid.draw()
    probes.forEach((probe) => probe.draw())
    start_node.draw_disk("black")        
    probes.forEach((probe) => probe.next())
    probes.every((probe) => !probe.moving) && noLoop()
}

function random_int(min, max) {
    return Math.floor(min + Math.random()*((max + 1) - min))
}

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

function reset_sketch() {
    const random_coord = () => random_int(0, grid.nbr - 1);
    const row = random_coord()
    const col = random_coord()
    start_node = grid.get(row,col);
    const list_color_dir = zip(probe_colors, directions)
    probes = list_color_dir.map(([color, dir]) => new Probe(start_node, color, dir))
    !isLooping() && loop()
}

