/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/*
 * is(x,type) : Boolean
 */
const is = (x, type) => {
    if (Array.isArray(type)) {
        const [op, ...types] = type;
        if (op === "or") {
            return types.some((type) => is(x, type));
        } else {
            error(`Unexpected type ${type}`);
        }
    } else if (type === null) {
        return x === null;
    } else if (type === "string") {
        return typeof x === "string";
    } else if (type === "nat") {
        return Number.isInteger(x) && x >= 0;
    } else if (type === "HTMLCanvas") {
        return x instanceof Node && x.tagName === "CANVAS";
    } else if (type === "canvas") {
        return x instanceof CanvasRenderingContext2D;
    } else if (typeof x === "object") {
        return x instanceof type;
    } else {
        return false;
    }
};

/*
 * error(msg) throws an error with message msg ; it is a convenience function.
 */
const error = function (msg) {
    is(msg, "string") || error(`msg is not a string. msg = ${msg}`);
    throw new Error(msg);
};

/*
 * check(x,type, pred) : Void
 */
const check = (x, type, pred = (x) => true) => {
    is(x, type) || error(`x has not the type ${type}. x = ${x}`);
    pred(x) || error(`x does not verify pred. x = ${x}`);
};

/*
 * dir : Direction models a direction w.r.t. a square on the board: up, right, …
 */
const Direction = class {
    constructor(val) {
        check(val, "string");
        this.#val = val;
    }

    val() {
        return this.#val;
    }

    toString() {
        return `${this.constructor.name}
  val = ${this.#val}
`;
    }

    #val;
};

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
const Team = class {
    constructor(val) {
        check(val, "string");
        this.#val = val;
    }

    val() {
        return this.#val;
    }

    toString() {
        return `${this.constructor.name}
  val = ${this.#val}
`;
    }

    #val;
};

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
const Coord = class {
    constructor(top, left) {
        check(top, "nat");
        this.#top = top;
        check(left, "nat");
        this.#left = left;
    }

    top() {
        return this.#top;
    }

    left() {
        return this.#left;
    }

    toString() {
        return `${this.constructor.name}
  top = ${this.#top}
  left = ${this.#left}
`;
    }

    #top;

    #left;
};

/*
 * pos : Pos ≡ (Top, Left) models the coordinates of pixel starting from the top left pixel.
 */
const Pos = class {
    constructor(top, left) {
        check(top, "nat");
        this.#top = top;
        check(left, "nat");
        this.#left = left;
    }

    top() {
        return this.#top;
    }

    left() {
        return this.#left;
    }

    toString() {
        return `${this.constructor.name}
  top = ${this.#top}
  left = ${this.#left}
`;
    }

    #top;

    #left;
};

/*
 * square : Square models a square on the board.
 *
 * A square manages a piece of a canvas.
 * It is represented on the canvas as a square of a given width and position.
 * It has a given color.
 * It can be occupied by at most one piece.
 * It has neighbors, at most one per direction.
 */
const Square = class {
    constructor(canvas, pos, width, color) {
        check(canvas, "canvas");
        this.#canvas = canvas;

        check(pos, Pos);
        this.#pos = pos;

        check(width, "nat");
        this.#width = width;

        check(color, "string");
        this.#color = color;

        this.#piece = null; // : Piece | Null.

        this.#neighbors = {}; // : Square | Null; dir : Direction.

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

    add_neighbor(dir, square) {
        check(dir, Direction);
        check(square, ["or", Square, null]);
        this.#neighbors[dir] = square;
    }

    get_neighbor(dir) {
        check(dir, Direction);
        return this.#neighbors[dir];
    }

    add_piece(piece) {
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

    is_empty() {
        return !this.#piece;
    }

    toString() {
        return ```${this.constructor.name}(
  canvas = ${this.#canvas},
  pos = ${this.#pos},
  width = ${this.#width},
  color = ${this.#color},
  piece = ${this.#piece},
  neighbors = ${this.#neighbors}
)
```;
    }

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
        canvas.fillStyle = this.#color;
        canvas.fillRect(pos.left(), pos.top(), width, width);
        if (!this.is_empty()) {
            this.#piece.pixels()(this.#canvas, this.#pos, this.#width);
        }
    }
};

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
const Piece = class {
    constructor(square, team) {
        check(square, Square);
        this.#square = square;

        check(team, Team);
        this.#team = team;

        this.#color = this.#team === black ? "#000006" : "#fffff8";

        this.#pixels = (canvas, pos, width) => {
            check(canvas, "canvas");
            check(pos, Pos);
            check(width, "nat");
            const top = pos.top();
            const left = pos.left();
            canvas.fillStyle = this.color();
            canvas.beginPath();
            canvas.arc((left + (left + width)) / 2, (top + (top + width)) / 2, width * 0.9, 0, Math.PI * 2);
            canvas.closePath();
            canvas.fill();
        };

        square.add_piece(this);
    }

    square() {
        return this.#square;
    }

    team() {
        return this.#team;
    }

    pixels() {
        return this.#pixels;
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
        return `${this.constructor.name}
  square = ${this.#square}
  color = ${this.#color}
  team = ${this.#team}
  pixels = ${this.#pixels}
`;
    }

    #square;

    #color;

    #team;

    #pixels;
};

const Pawn = class extends Piece {
    constructor(square, team) {
        super(square, team);
        const dirs_white = [top_left, top, top_right];
        const dirs_black = [bottom_left, bottom, bottom_right];
        this.#dirs = team === black ? dirs_black : dirs_white;
    }

    pixels() {
        return (canvas, pos, width) => {
            check(canvas, "canvas");
            check(pos, Pos);
            check(width, "nat");
            const top = pos.top();
            const left = pos.left();

            canvas.fillStyle = this.color();

            // Draw the base
            canvas.beginPath();
            canvas.rect(left + width * 0.3, top + width * 0.8, width * 0.4, width * 0.2);
            canvas.closePath();
            canvas.fill();

            // Draw the body
            canvas.beginPath();
            canvas.arc(left + width / 2, top + width * 0.6, width * 0.2, 0, Math.PI * 2);
            canvas.closePath();
            canvas.fill();

            // Draw the head
            canvas.beginPath();
            canvas.arc(left + width / 2, top + width * 0.3, width * 0.15, 0, Math.PI * 2);
            canvas.closePath();
            canvas.fill();
        };
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

    #dirs;
};

const King = class extends Piece {
    constructor(square, team) {
        super(square, team);
        this.#dirs = [top_left, top, top_right, bottom_left, bottom, bottom_right];
    }

    pixels() {
        return (canvas, pos, width) => {
            check(canvas, "canvas");
            check(pos, Pos);
            check(width, "nat");
            const top = pos.top();
            const left = pos.left();

            canvas.fillStyle = this.color();
            canvas.strokeStyle = this.color();

            // Draw the base
            canvas.beginPath();
            canvas.rect(left + width * 0.3, top + width * 0.8, width * 0.4, width * 0.2);
            canvas.closePath();
            canvas.fill();

            // Draw the body
            canvas.beginPath();
            canvas.arc(left + width / 2, top + width * 0.5, width * 0.25, 0, Math.PI * 2);
            canvas.closePath();
            canvas.fill();

            // Draw the cross
            // Vertical line
            canvas.beginPath();
            canvas.moveTo(left + width / 2, top + width * 0.05);
            canvas.lineTo(left + width / 2, top + width * 0.25);
            canvas.stroke();

            // Horizontal line
            canvas.beginPath();
            canvas.moveTo(left + width * 0.45, top + width * 0.15);
            canvas.lineTo(left + width * 0.55, top + width * 0.15);
            canvas.stroke();

            // Draw the head
            canvas.beginPath();
            canvas.arc(left + width / 2, top + width * 0.35, width * 0.1, 0, Math.PI * 2);
            canvas.closePath();
            canvas.fill();
        };
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

    #is_safe(square) {
        return true;
    }

    #dirs;
};

const Board = class {
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
        this.#pieces = [];
        this.#build_space(canvas.getContext("2d"), indexes, square_len);
        this.#pawns();
        this.#kings();
    }

    move(start, end) {
        const start_piece = this.#coord_to_piece(start);
        const end_square = this.#coord_to_square(end);
        start_piece.move(end_square);
    }

    #squares;

    #pieces;

    #indexes;

    #pawns() {
        const add_pawn = (square, team) => {
            const piece = new Pawn(square, team);
            this.#pieces.push(piece);
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
            this.#pieces.push(piece);
        };
        add_king(this.#squares[0][4], black);
        add_king(this.#squares[7][4], white);
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
                const neighbors = [
                    [top, (squares[row - 1] && squares[row - 1][col]) || null],
                    [top_right, (squares[row - 1] && squares[row - 1][col + 1]) || null],
                    [right, (squares[row] && squares[row][col + 1]) || null],
                    [bottom_right, (squares[row + 1] && squares[row + 1][col + 1]) || null],
                    [bottom, (squares[row + 1] && squares[row + 1][col]) || null],
                    [bottom_left, (squares[row + 1] && squares[row + 1][col - 1]) || null],
                    [left, (squares[row - 1] && squares[row - 1][col - 1]) || null],
                    [top_left, (squares[row - 1] && squares[row - 1][col - 1]) || null],
                ];
                neighbors.forEach(([dir, neighbor]) => {
                    square.add_neighbor(dir, neighbor);
                });
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
};

const start = function () {
    const canvas = document.getElementById("chess");
    const board = new Board(canvas);
    const moves = [
        [
            [1, 4],
            [2, 4],
        ],
        [
            [0, 4],
            [1, 4],
        ],
    ];
    let time = 0;
    moves.forEach(([start, end]) => {
        time += 1000;
        setTimeout(() => board.move(start, end), time);
    });
};

start();
