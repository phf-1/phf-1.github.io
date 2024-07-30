/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


/*
 * …
 * await delay(5000); // wait for 5s
 * …
 */
const delay = ms => new Promise(res => setTimeout(res, ms));


/*
 * is(x,type) : Boolean
 *
 * type : | "Null" | "String" | "Nat" | "HTMLCanvas" | "Canvas" | "Type" | Function
 *        | ["or", type, …]
 * x : Any
 */
function is(x, type) {
    if (Array.isArray(type)) {
        const [op, ...types] = type;
        if (op === "or") {
            return types.some((type) => is(x, type));
        } else {
            error(`Unexpected type ${type}`);
        }
    } else if (type === "Null") {
        return x === null;
    } else if (type === "String") {
        return typeof x === "string";
    } else if (type === "Nat") {
        return Number.isInteger(x) && x >= 0;
    } else if (type === "HTMLCanvas") {
        return x instanceof Node && x.tagName === "CANVAS";
    } else if (type === "Canvas") {
        return x instanceof CanvasRenderingContext2D;
    } else if (type === "Type") {
        return x instanceof Function;
    } else if (type instanceof Function) {
        return x instanceof type;
    } else {
        error(`Unexpected type. type = ${type}`);
    }
}

/*
 * error(msg) throws an error with message msg ; it is a convenience function.
 */
function error(msg) {
    is(msg, "String") || error(`msg is not a string. msg = ${msg}`);
    throw new Error(msg);
}

/*
 * check(x,type, pred) : Void
 */
function check(x, type, pred = (x) => true) {
    is(x, type) || error(`x has not the type ${type}. x = ${x}`);
    pred(x) || error(`x does not verify pred. x = ${x}`);
}

/*
 * dir : Direction models a direction w.r.t. a square on the board: up, right, …
 */
class Direction {
    #val;

    constructor(val) {
        check(val, "String");
        this.#val = val;
    }

    val() {
        return this.#val;
    }

    toString() {
        return `Direction(val=${this.#val})`;
    }
}

/*
 * directions models all the possible directions.
 */
const top = new Direction("top");
const top_right = new Direction("top_right");
const right = new Direction("right");
const bottom_right = new Direction("bottom_right");
const bottom = new Direction("bottom");
const bottom_left = new Direction("bottom_left");
const left = new Direction("left");
const top_left = new Direction("top_left");
const directions = [top, top_right, right, bottom_right, bottom, bottom_left, left, top_left];

/*
 * team : Team models a team i.e. black or white.
 */
class Team {
    #val;

    constructor(val) {
        check(val, "String");
        this.#val = val;
    }

    val() {
        return this.#val;
    }

    toString() {
        return `Team(val=${this.#val})`;
    }
}

/*
 * teams models all the possible teams.
 */
const black = new Team("black");
const white = new Team("white");
const teams = [black, white];

/*
 * coord : Coord ≡ (Top, Left) models the coordinates of a square on the board starting from the top left square.
 *
 * |-------|-------|--
 * | (0,0) | (0,1) | …
 * |-------|-------|--
 * | (1,0) | (1,1) | …
 * |-------|-------|--
 * | …     | …     | …
 *
 * Top ≡ Nat
 * Left ≡ Nat
 */
class Coord {
    #top;
    #left;

    constructor(top, left) {
        check(top, "Nat");
        this.#top = top;
        check(left, "Nat");
        this.#left = left;
    }

    top() {
        return this.#top;
    }

    left() {
        return this.#left;
    }

    toString() {
        return `Coord(top=${this.#top}, left=${this.#left})`;
    }
}

/*
 * pos : Pos ≡ (Top, Left) models the coordinates of pixel starting from the top left pixel.
 */
class Pos {
    #top;

    #left;

    constructor(top, left) {
        check(top, "Nat");
        this.#top = top;
        check(left, "Nat");
        this.#left = left;
    }

    top() {
        return this.#top;
    }

    left() {
        return this.#left;
    }

    toString() {
        return `Pos(top=${this.#top}, left=${this.#left})`;
    }
}

/*
 * square : Square models a square on the board.
 *
 * A square manages a piece of a canvas.
 * It is represented on the canvas as a square of a given width and position.
 * It has a given color.
 * It can be occupied by at most one piece.
 * It has neighbors, at most one per direction.
 */
class Square {
    #canvas;

    #width;

    #pos;

    #color;

    #neighbors;

    #piece;

    #draw() {
        const canvas = this.#canvas;
        const pos = this.#pos;
        const width = this.#width;
        const top = pos.top();
        const left = pos.left();
        canvas.fillStyle = this.#color;
        canvas.fillRect(left, top, width, width);
        if (!this.is_empty()) {
            const image = new Image();
            image.src = `data/${this.#piece.image()}`;
            image.onload = () => {
                canvas.drawImage(image, left, top, width, width);
            };
        }
    }

    constructor(canvas, pos, width, color) {
        check(canvas, "Canvas");
        this.#canvas = canvas;

        check(pos, Pos);
        this.#pos = pos;

        check(width, "Nat");
        this.#width = width;

        check(color, "String");
        this.#color = color;

        this.#piece = null;

        this.#neighbors = new Map();

        this.#draw();
    }

    canvas() {
        return this.#canvas;
    }

    pos() {
        return this.#pos;
    }

    width() {
        return this.#width;
    }

    color() {
        return this.#color;
    }

    neighbors() {
        return this.#neighbors;
    }

    piece() {
        return this.#piece;
    }

    is_empty() {
        return !this.#piece;
    }

    add_neighbor(dir, square) {
        check(dir, Direction);
        check(square, ["or", Square, "Null"]);
        this.#neighbors.set(dir, square);
    }

    set_neighbors(neighbors) {
        neighbors.forEach((square, dir) => this.add_neighbor(dir, square));
    }

    get_neighbor(dir) {
        check(dir, Direction);
        return this.#neighbors.get(dir) || null;
    }

    add_piece(piece) {
        this.is_empty() || error(`I am already occupied.`);
        check(piece, Piece);
        this.#piece = piece;
        this.#draw();
    }

    remove_piece() {
        const piece = this.#piece;
        this.#piece = null;
        this.#draw();
        return piece;
    }

    safe() {
        const canvas = this.#canvas;
        const pos = this.#pos;
        const width = this.#width;
        const top = pos.top();
        const left = pos.left();
        canvas.fillStyle = "green";
        canvas.fillRect(left, top, width, width);        
    }

    unsafe() {
        const canvas = this.#canvas;
        const pos = this.#pos;
        const width = this.#width;
        const top = pos.top();
        const left = pos.left();
        canvas.fillStyle = "red";
        canvas.fillRect(left, top, width, width);                
    }

    toString() {
        return `Square(pos=${this.#pos}, width=${this.#width}, color=${this.#color})`;
    }
}

/*
 * piece : Piece models an abstract piece on the board.
 *
 * An abstract piece acts like all chess pieces ; provided appropriate
 * restrictions. In other words, a particular chess piece — e.g. a pawn — is an
 * abstract piece with a constraint behaviour — e.g. it may move only to one of a few
 * valid squares.
 *
 * It has a square.
 * It has a team.
 * It has a representation as a set of pixels.
 * It has a color.
 */
class Piece {
    #square;

    #color;

    #team;

    #image;

    constructor(square, team) {
        check(square, Square);
        this.#square = square;

        check(team, Team);
        this.#team = team;

        this.#color = this.#team === black ? "#000006" : "#fffff8";

        this.#image = `white_pawn.svg`;
    }

    square() {
        return this.#square;
    }

    team() {
        return this.#team;
    }

    image() {
        return this.#image;
    }

    move(square) {
        check(square, Square);
        this.#square.remove_piece();
        square.remove_piece();
        this.#square = square;
        square.add_piece(this);
    }

    color() {
        return this.#color;
    }

    toString() {
        return `Piece(team=${this.#team})`;
    }
}

class Pawn extends Piece {
    #dirs;
    #image;
    #first_move;
    constructor(square, team) {
        super(square, team);
        const dirs_white = [top_left, top, top_right];
        const dirs_black = [bottom_left, bottom, bottom_right];
        this.#dirs = team === black ? dirs_black : dirs_white;
        this.#image = team === black ? "black_pawn.svg" : "white_pawn.svg";
        this.#first_move = true;
    }

    image() {
        return this.#image;
    }

    move(square) {
        check(square, Square);
        
        // The square is authorized or it is an error.
        const my_square = this.square();
        let dir = null;
        for (const a_dir of this.#dirs) {
            if (my_square.get_neighbor(a_dir) === square) {
                dir = a_dir;
                break;
            }
        }
        is(dir, Direction) || error(`No direction found to square. square = ${square}`);

        if ([top, bottom].includes(dir)) {
            square.is_empty() || error(`The next square is not empty.`);
        } else if ([top_left, top_right, bottom_left, bottom_right].includes(dir)) {
            !square.is_empty() || error(`The next square is empty.`);
            const next_piece = square.piece();
            next_piece.team() !== this.team() || error(`The next piece is in my team.`);
        }

        // The square is authorized, move to it.
        super.move(square);
    }

    toString() {
        return `Pawn(team=${this.team()})`;
    }
}

class Probe {
    #square;
    #dir;
    #team;
    #piece_type;
    constructor(square, dir, team, piece_type) {
        check(square, Square);
        check(dir, Direction);
        check(team, Team);
        check(piece_type, "Type");
        this.#square = square;
        this.#dir = dir;
        this.#team = team;
        this.#piece_type = piece_type;
    }

    start() {
        const next_square = this.#square.get_neighbor(this.#dir);
        const next_piece = next_square && next_square.piece();
        if (next_square && !next_piece) {
            next_square.safe()
            return this.#next(next_square);
        }
        if (next_square && next_piece.team() === this.#team && is(next_piece, this.#piece_type)) {
            next_square.unsafe()
            return next_square;
        }
        return null;
    }

    #next(square) {
        
        this.#square = square;
        return this.start();
    }
}

class BishopProbe extends Probe {
    constructor(square, dir, team) {
        super(square, dir, team, Bishop);
    }
}

class RookProbe extends Probe {
    constructor(square, dir, team) {
        super(square, dir, team, Rook);
    }
}

class QueenProbe extends Probe {
    constructor(square, dir, team) {
        super(square, dir, team, Queen);
    }
}

class King extends Piece {
    #dirs;

    #image;

    constructor(square, team) {
        super(square, team);
        this.#dirs = [top_left, top, top_right, bottom_left, bottom, bottom_right];
        this.#image = team === black ? "black_king.svg" : "white_king.svg";
    }

    image() {
        return this.#image;
    }

    move(square) {
        check(square, Square);
        const my_square = this.square();
        let dir = null;
        for (const a_dir of this.#dirs) {
            if (my_square.get_neighbor(a_dir) === square) {
                dir = a_dir;
                break;
            }
        }
        is(dir, Direction) || error(`No direction found to square. square = ${square}`);

        if (!square.is_empty()) {
            const piece = square.piece();
            piece.team() !== this.team() || error(`next piece is in my team`);
        }

        this.#is_safe(square) || error(`Square is not safe.`);

        super.move(square);
    }

    is_safe() {
        return this.#is_safe(this.square());
    }

    #is_safe(square) {
        const other_team = this.team() === black ? white : black;
        const diags = [bottom_right, bottom_left, top_left, top_right];
        const bishop_probes = diags.map((dir) => new BishopProbe(square, dir, other_team));
        const verts = [top, right, bottom, left];
        const rook_probes = verts.map((dir) => new RookProbe(square, dir, other_team));
        const queen_probes = directions.map((dir) => new QueenProbe(square, dir, other_team));
        const probes = queen_probes.concat(bishop_probes.concat(rook_probes));
        const threats = probes.map((probe) => probe.start());
        threats.forEach((threat) => {
            if (is(threat, Square)) {
                error(`target square is threaten by piece on square.
target square: ${square.toString()}
piece: ${threat.piece().toString()}
square: ${threat.toString()}
`);
            }
        });
        return true;
    }

    toString() {
        return `King(team=${this.team()})`;
    }
}

class Bishop extends Piece {
    #dirs;

    #image;

    constructor(square, team) {
        super(square, team);
        const dirs_white = [top_left, top, top_right];
        const dirs_black = [bottom_left, bottom, bottom_right];
        this.#dirs = team === black ? dirs_black : dirs_white;
        this.#image = team === black ? "black_bishop.svg" : "white_bishop.svg";
    }

    image() {
        return this.#image;
    }

    move(square) {
        check(square, Square);

        // The square is authorized or it is an error.
        const my_square = this.square();
        let dir = null;
        for (const a_dir of this.#dirs) {
            if (my_square.get_neighbor(a_dir) === square) {
                dir = a_dir;
                break;
            }
        }
        is(dir, Direction) || error(`No direction found to square. square = ${square}`);

        if ([top, bottom].includes(dir)) {
            square.is_empty() || error(`The next square is not empty.`);
        } else if ([top_left, top_right, bottom_left, bottom_right].includes(dir)) {
            !square.is_empty() || error(`The next square is empty.`);
            const next_piece = square.piece();
            next_piece.team() !== this.team() || error(`The next piece is in my team.`);
        }

        // The square is authorized, move to it.
        super.move(square);
    }

    toString() {
        return `Bishop(team=${this.team()})`;
    }
}

class Rook extends Piece {
    #dirs;

    #image;

    constructor(square, team) {
        super(square, team);
        const dirs_white = [top_left, top, top_right];
        const dirs_black = [bottom_left, bottom, bottom_right];
        this.#dirs = team === black ? dirs_black : dirs_white;
        this.#image = team === black ? "black_rook.svg" : "white_rook.svg";
    }

    image() {
        return this.#image;
    }

    move(square) {
        error(`Not implemented`);
    }

    toString() {
        return `Rook(team=${this.team()})`;
    }
}

class Knight extends Piece {
    #dirs;

    #image;

    constructor(square, team) {
        super(square, team);
        const dirs_white = [top_left, top, top_right];
        const dirs_black = [bottom_left, bottom, bottom_right];
        this.#dirs = team === black ? dirs_black : dirs_white;
        this.#image = team === black ? "black_knight.svg" : "white_knight.svg";
    }

    image() {
        return this.#image;
    }

    move(square) {
        error(`Not implemented`);
    }

    toString() {
        return `Knight(team=${this.team()})`;
    }
}

class Queen extends Piece {
    #dirs;

    #image;

    constructor(square, team) {
        super(square, team);
        const dirs_white = [top_left, top, top_right];
        const dirs_black = [bottom_left, bottom, bottom_right];
        this.#dirs = team === black ? dirs_black : dirs_white;
        this.#image = team === black ? "black_queen.svg" : "white_queen.svg";
    }

    image() {
        return this.#image;
    }

    toString() {
        return `Queen(team=${this.team()})`;
    }
}

class Board {
    #squares;

    #black_king;

    #white_king;

    #indexes;

    #turn;

    #pawns() {
        const add_pawn = (square, team) => {
            const piece = new Pawn(square, team);
            square.add_piece(piece);
        };

        this.#squares[1].forEach((square) => {
            add_pawn(square, black);
        });

        this.#squares[6].forEach((square) => {
            add_pawn(square, white);
        });
    }

    #kings() {
        const add_king = (square, team) => {
            const piece = new King(square, team);
            square.add_piece(piece);
            return piece;
        };
        this.#black_king = add_king(this.#squares[0][4], black);
        this.#white_king = add_king(this.#squares[7][4], white);
    }

    #queens() {
        const add_queen = (square, team) => {
            const piece = new Queen(square, team);
            square.add_piece(piece);
        };
        add_queen(this.#squares[0][3], black);
        add_queen(this.#squares[7][3], white);
    }

    #bishops() {
        const add_bishop = (square, team) => {
            const piece = new Bishop(square, team);
            square.add_piece(piece);
        };
        add_bishop(this.#squares[0][2], black);
        add_bishop(this.#squares[0][5], black);
        add_bishop(this.#squares[7][2], white);
        add_bishop(this.#squares[7][5], white);
    }

    #rooks() {
        const add_rook = (square, team) => {
            const piece = new Rook(square, team);
            square.add_piece(piece);
        };
        add_rook(this.#squares[0][0], black);
        add_rook(this.#squares[0][7], black);
        add_rook(this.#squares[7][0], white);
        add_rook(this.#squares[7][7], white);
    }

    #knights() {
        const add_knight = (square, team) => {
            const piece = new Knight(square, team);
            square.add_piece(piece);
        };
        add_knight(this.#squares[0][1], black);
        add_knight(this.#squares[0][6], black);
        add_knight(this.#squares[7][1], white);
        add_knight(this.#squares[7][6], white);
    }

    #choose_color(row, col) {
        const light = "#BCAAA4";
        const dark = "#6D4C41";
        if (row % 2 == 0 && col % 2 == 0) {
            return light;
        } else if (row % 2 == 0 && col % 2 == 1) {
            return dark;
        } else if (row % 2 == 1 && col % 2 == 0) {
            return dark;
        } else {
            return light;
        }
    }

    #build_space(canvas, indexes, square_len) {
        indexes.forEach((row) => {
            this.#squares.push([]);
            indexes.forEach((col) => {
                const top = row * square_len;
                const left = col * square_len;
                const color = this.#choose_color(row, col);
                const square = new Square(canvas, new Pos(top, left), square_len, color);
                this.#squares[row][col] = square;
            });
        });

        indexes.forEach((row) => {
            indexes.forEach((col) => {
                const squares = this.#squares;
                const square = squares[row][col];
                const list_dir_square = [
                    [top, (squares[row - 1] && squares[row - 1][col]) || null],
                    [top_right, (squares[row - 1] && squares[row - 1][col + 1]) || null],
                    [right, (squares[row] && squares[row][col + 1]) || null],
                    [bottom_right, (squares[row + 1] && squares[row + 1][col + 1]) || null],
                    [bottom, (squares[row + 1] && squares[row + 1][col]) || null],
                    [bottom_left, (squares[row + 1] && squares[row + 1][col - 1]) || null],
                    [left, (squares[row - 1] && squares[row - 1][col - 1]) || null],
                    [top_left, (squares[row - 1] && squares[row - 1][col - 1]) || null],
                ];
                const neighbors = new Map(list_dir_square);
                square.set_neighbors(neighbors);
            });
        });
    }

    #coord_to_square(coord) {
        const [top, left] = coord;
        const indexes = this.#indexes;
        indexes.includes(top) || error(`Unexpected top. top = ${top}`);
        indexes.includes(left) || error(`Unexpected left. left = ${left}`);
        const square = this.#squares[top][left];
        return square;
    }

    #coord_to_piece(coord) {
        const square = this.#coord_to_square(coord);
        const piece = square.piece();
        piece !== null || error(`No piece at coord. coord = (${coord})`);
        return piece;
    }

    constructor(canvas) {
        check(canvas, "HTMLCanvas");
        const width = canvas.width;
        const height = canvas.height;
        width === height || error("width !== height");
        width % 8 === 0 || error("width % 8 !== 0");
        const square_len = width / 8;
        const indexes = Array.from({ length: 8 }, (item, index) => index);
        this.#indexes = indexes;
        this.#squares = [];
        this.#build_space(canvas.getContext("2d"), indexes, square_len);
        this.#pawns();
        this.#kings();
        this.#bishops();
        this.#queens();
        this.#rooks();
        this.#knights();
        this.#turn = white;
    }

    move(start, end) {
        const start_piece = this.#coord_to_piece(start);
        start_piece.team() === this.#turn || error(`It is ${this.#turn.val()} turn.`);
        const end_square = this.#coord_to_square(end);
        start_piece.move(end_square);
        if (this.#turn === black) {
            this.#black_king.is_safe() || error(`Black king is not safe.`);
        } else {
            this.#white_king.is_safe() || error(`White king is not safe.`);
        }
        this.#turn = this.#turn === white ? black : white;
    }
}

function build() {
    let canvas
    let board
    let msg
    const init = function () {
        canvas = document.getElementById("chess");
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);        
        board = new Board(canvas);
        msg = document.getElementById("msg")
        msg.innerText = ""
    }

    init()
    
    return {
        init: () => init(),
        attacked_square: () => {
            const moves = [
                [
                    [6, 4],
                    [5, 4],
                ],
                [
                    [0, 3],
                    [3, 7],
                ],
                [
                    [7, 4],
                    [6, 4],
                ],                                
            ];
            let time = 0;
            moves.forEach(([start, end]) => {
                time += 1000;
                setTimeout(() => {
                    try {
                        board.move(start, end);   
                    } catch(error) {
                        msg.innerText = error.message
                    }
                }, time);
            });            
        },
        pinned: () => {
            const moves = [
                [
                    [6, 4],
                    [5, 4],
                ],
                [
                    [0, 3],
                    [4, 7],
                ],
                [
                    [6, 5],
                    [5, 5],
                ],
            ];
            let time = 0;
            moves.forEach(([start, end]) => {
                time += 1000;
                setTimeout(() => {
                    try {
                        board.move(start, end);   
                    } catch(error) {
                        msg.innerText = error.message
                    }
                }, time);
            });            
        }        
    }
}

window.chess = build();
