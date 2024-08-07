/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


const ACK = Symbol("ACK");


/*
 * …
 * await delay(5000); // wait for 5s
 * …
 */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));


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
        return x.tagName === "CANVAS";
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
 * A Struct s is a read only data structure with properties.
 */
class Struct {}


/*
 * A Message msg represents content to be delivered to some address.
 */
class Message extends Struct {
    #address;
    #content;

    constructor(address, content) {
        super();
        this.#address = address;
        this.#content = content;
    }

    get address() {
        return this.#address;
    }

    get content() {
        return this.#content;
    }

    toString() {
        return `Struct.Message(address=${this.#address} content=${this.#content})`;
    }
}


/*
 * dir : Direction models a direction w.r.t. a square on the board: up, right, …
 */
class Direction extends Struct {
    #val;

    constructor(val) {
        super();
        check(val, "String");
        this.#val = val;
    }

    get val() {
        return this.#val;
    }

    toString() {
        return `Struct.Direction(val=${this.#val})`;
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
class Team extends Struct {
    #val;

    constructor(val) {
        super();
        check(val, "String");
        this.#val = val;
    }

    get val() {
        return this.#val;
    }

    toString() {
        return `Struct.Team(val=${this.#val})`;
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
class Coord extends Struct {
    #top;
    #left;

    constructor(top, left) {
        super();
        check(top, "Nat");
        this.#top = top;
        check(left, "Nat");
        this.#left = left;
    }

    get top() {
        return this.#top;
    }

    get left() {
        return this.#left;
    }

    toString() {
        return `Struct.Coord(top=${this.#top} left=${this.#left})`;
    }
}


/*
 * pos : Pos ≡ (Top, Left) models the coordinates of pixel starting from the top left pixel.
 */
class Pos extends Struct {
    #top;
    #left;

    constructor(top, left) {
        super();
        check(top, "Nat");
        this.#top = top;
        check(left, "Nat");
        this.#left = left;
    }

    get top() {
        return this.#top;
    }

    get left() {
        return this.#left;
    }

    toString() {
        return `Struct.Pos(top=${this.#top} left=${this.#left})`;
    }
}


/*
 * send(message) delivers message.content to message.address
 *
 * await send(message) : ACK | Error | Any
 *
 * ACK means that the message has been received but nothing has been returned.
 *
 * Error means that the message has been received but the receiving actor could not
 * proceed and returned an error instead of the expected result, if any.
 *
 * Any means that the message has been received and the receiving actor proceeded
 * with the message and returned a result.
 *
 */
async function send(message) {
    try {
        const result = await message.address.behaviour(message.content);
        if (result === undefined) {
            return ACK;
        } else {
            return result;
        }
    } catch (error) {
        return error;
    }
}


/*
 * An Actor represents the fundamental unit of computation i.e. a thing is modelled
 * by an actor. It has a state, a behaviour -- i.e. λ(state, message) → state' -- and
 * communication -- i.e. it can send messages.
 */
class Actor {
    /*
     * State
     *
     * The internal data of the Actor known to itself only.
     *
     * #var_1;
     * ...
     *
     */

    /*
     * Constructor
     *
     * A function that introduces a new actor and initialiazes its state.
     *
     */
    constructor(/* init values */) {
        // State is initialized.
        // this.#var_1 = init_value
        // ...
    }

    /*
     * Interface
     *
     * If a client c has an address of an Actor a, then: it can call a.hello().
     * hello implementation runs in c computational context. hello is necessary to
     * hide implementation details especially ansychronous mechanichs from calling
     * clients. For instance, an asynchronous implementation of hello may look like:
     *
     * a:
     *   async hello() {
     *     return await send(new Hello(this))
     *   }
     *
     * It involves a choice: using an asynchronous call or not.
     *
     * In case of an asynchronous call, it involves the creation of the appropriate
     * message and its sending.
     *
     * In case of a synchronous call, the implementation looks like:
     *
     * a:
     *   hello() {
     *     return "world"
     *   }
     *
     * If the client assumes an asynchronous implementation by default -- i.e. await
     * a.func(...) --, then: the client code is robust to the async/synch choice of
     * implementation since the client code would workd in both cases, which is not
     * true if the client assumes a synchronous implementation.
     *
     * In other words, the client should call an actor interface using await keyword.
     */

    /*
     * Behaviour
     *
     * Defines how the actor reacts to asynchronous messages. A side effects of the
     * behaviour may be that messages are sent and actors are created.
     *
     */
    async behaviour(message) {
        /*
         * The client may wait for the answer:
         * if (message isinstanceof Hello) { return "world"; }
         *
         * The client should not wait for an answer:
         * if (message isinstanceof Params) { this.do_things(); }
         *
         */
        error(`Unexpected message ${message}.`);
    }
}


class Images extends Actor {
    #images;
    #of

    constructor() {
        super()
        this.#images = null
        this.#of = (name) => {
            if (is(this.#images, "Null")) {
                error(`You must call init() first.`)
            }
            else {
                this.#of = (name) => {
                    return this.#images[name];
                }
                return this.of(name)
            }
        }
    }

    async init() {
        this.#images = await this.#fetch_images()
    }

    of(name) {
        return this.#of(name)
    }

    async #fetch_images() {
        let images = [
            "black_bishop",
            "black_king",
            "black_knight",
            "black_pawn",
            "black_queen",
            "black_rook",
            "white_bishop",
            "white_king",
            "white_knight",
            "white_pawn",
            "white_queen",
            "white_rook",
        ]

        images = images.map((name) => {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.src = `data/${name}.svg`
                img.onload = () => resolve([name, img])
                img.onerror = () => reject(`image ${name} has not been fetched.`)
            })
        });

        return Promise.all(images)
            .catch((err) => error(err))
            .then((values) => Object.fromEntries(values))
    }

}


const images = new Images()
await images.init()


/*
 * square : Square models a square on the board.
 *
 * A square manages a piece of a canvas.
 * It is represented on the canvas as a square of a given width and position.
 * It has a given color.
 * It can be occupied by at most one piece.
 * It has neighbors, at most one per direction.
 */
class Square extends Actor {
    #canvas;
    #color;
    #neighbors;
    #piece;
    #pos;
    #width;
    #paints;

    constructor(canvas, pos, width, color) {
        super();
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

        this.#paints = [];

        this.#draw();
    }

    toString() {
        return `Actor.Square(pos=${this.#pos} width=${this.#width} color=${this.#color})`;
    }

    canvas() {
        return this.#canvas;
    }

    pos() {
        return this.#pos;
    }

    coord() {
        const pos = this.#pos;
        const width = this.#width;
        return new Coord(pos.top / width, pos.left / width)
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

    draw() {
        this.#draw();
    }

    safe() {
        this.#draw(true);
    }

    target() {
        this.#draw("target");
    }

    unsafe() {
        this.#draw(false);
    }

    #paint() {
        let paint = this.#paints.shift()
        while (paint) {
            paint()
            paint = this.#paints.shift()
        }
    }

    #draw(safe = null) {
        const canvas = this.#canvas;
        const pos = this.#pos;
        const width = this.#width;
        const top = pos.top;
        const left = pos.left;
        this.#paints.push(
            () => {
                canvas.fillStyle = this.#color
                canvas.fillRect(left, top, width, width)
            }
        )

        if (safe === null) {
            // continue
        } else if (safe === "target") {
            this.#paints.push(
                () => {
                    canvas.fillStyle = "#90CAF9";
                    canvas.fillRect(left, top, width, width)
                }
            )            
        } else if (safe) {
            this.#paints.push(
                () => {
                    canvas.fillStyle = "#C5E1A5";
                    canvas.fillRect(left, top, width, width)
                }
            )
        } else {
            this.#paints.push(
                () => {
                    canvas.fillStyle = "#EF9A9A80";
                    canvas.fillRect(left, top, width, width)
                }
            )
        }
        this.#paints.push(() => {
            !this.is_empty() && canvas.drawImage(this.#piece.image(), left, top, width, width)
        })
        window.requestAnimationFrame(() => {
            this.#paint()
        })
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
class Piece extends Actor {
    #square;
    #color;
    #team;
    #image;

    constructor(square, team) {
        super();
        check(square, Square);
        this.#square = square;

        check(team, Team);
        this.#team = team;

        this.#color = this.#team === black ? "#000006" : "#fffff8";

        this.#image = `white_pawn.svg`;
    }

    toString() {
        return `Actor.Piece(team=${this.#team})`;
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
        this.#image = images.of(team === black ? "black_pawn" : "white_pawn");
        this.#first_move = true;
    }

    toString() {
        return `Actor.Piece.Pawn(team=${this.team()})`;
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
}

class Probe extends Actor {
    #square;
    #dir;
    #team;
    #type;

    constructor(square, dir, team, piece_type) {
        super();
        check(square, Square);
        check(dir, Direction);
        check(team, Team);
        check(piece_type, "Type");
        this.#square = square;
        this.#dir = dir;
        this.#team = team;
        this.#type = piece_type;
    }

    toString() {
        return `Actor.Probe(square=${this.#square} dir=${this.#dir} team=${this.#team} type=${this.#type})`;
    }

    start() {
        const next_square = this.#square.get_neighbor(this.#dir);
        const next_piece = next_square && next_square.piece();
        if (next_square && !next_piece) {
            next_square.safe();
            return this.#next(next_square);
        }
        if (next_square && next_piece.team() === this.#team && is(next_piece, this.#type)) {
            next_square.unsafe();
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
        this.#image = images.of(team === black ? "black_king" : "white_king");
    }

    toString() {
        return `Actor.Piece.King(team=${this.team()})`;
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

        if (! this.#is_safe(square)) {            
            const coord = square.coord()
            const msg = `I cannot move to square, because it is threatened.
The threatened square is located at: ${coord}.
`
            square.target()
            error(msg);
        }

        super.move(square);
    }

    move_piece(piece, square) {
        check(piece, Piece);
        if (piece === this) {
            this.move(square);
            return
        }
        this.team() === piece.team() || error(`I cannot move a piece not in my team.`);
        const piece_type = Object.getPrototypeOf(piece).constructor;
        const piece_square = piece.square();
        piece.move(square);
        if (! this.is_safe()) {
            square.remove_piece();
            const new_piece = new piece_type(piece_square, this.team());
            piece_square.add_piece(new_piece);
            const msg = `Piece cannot be move from its square, else: I would be threatened.`
            error(msg);
        }
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
        return !threats.some((threat) => is(threat, Square));
    }
}

class Bishop extends Piece {
    #dirs;
    #image;

    constructor(square, team) {
        super(square, team);
        this.#image = images.of(team === black ? "black_bishop" : "white_bishop");
    }

    toString() {
        return `Actor.Piece.Bishop(team=${this.team()})`;
    }

    image() {
        return this.#image;
    }
}

class Rook extends Piece {
    #dirs;
    #image;

    constructor(square, team) {
        super(square, team);
        this.#image = images.of(team === black ? "black_rook" : "white_rook");
    }

    toString() {
        return `Actor.Piece.Rook(team=${this.team()})`;
    }

    image() {
        return this.#image;
    }

    move(square) {
        error(`Not implemented`);
    }
}

class Knight extends Piece {
    #dirs;
    #image;

    constructor(square, team) {
        super(square, team);
        this.#image = images.of(team === black ? "black_knight" : "white_knight");
    }

    toString() {
        return `Actor.Piece.Knight(team=${this.team()})`;
    }

    image() {
        return this.#image;
    }

    move(square) {
        error(`Not implemented`);
    }
}

class Queen extends Piece {
    #dirs;
    #image;

    constructor(square, team) {
        super(square, team);
        this.#image = images.of(team === black ? "black_queen" : "white_queen");
    }

    toString() {
        return `Actor.Piece.Queen(team=${this.team()})`;
    }

    image() {
        return this.#image;
    }
}

class Board extends Actor {
    #squares;
    #black_king;
    #white_king;
    #indexes;
    #turn;

    constructor(canvas) {
        super();
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

    toString() {
        return `Actor.Board(squares=${this.#squares} black_king=${this.#black_king} white_king=${this.#white_king} indexes=${this.#indexes} turn=${this.#turn})`;
    }

    move(start, end) {
        this.#draw()
        const end_square = this.#coord_to_square(end);
        const start_piece = this.#coord_to_piece(start);
        const king = this.#turn === black ? this.#black_king : this.#white_king;
        start_piece.team() === this.#turn || error(`It is ${this.#turn.val} turn.`);
        start_piece instanceof King ? start_piece.move(end_square) : king.move_piece(start_piece, end_square);
        this.#turn = this.#turn === white ? black : white;
    }

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

    #draw() {
        const indexes = this.#indexes
        indexes.forEach((row) => {
            indexes.forEach((col) => {
                this.#squares[row][col].draw();
            });
        })        
    }
}

function build() {
    let canvas;
    let board;
    let msg;
    const init = function () {
        canvas = document.getElementById("chess");
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        board = new Board(canvas);
        msg = document.getElementById("msg");
        msg.innerText = "";
    };

    init();

    const play = (moves) => {
        let time = 0;
        moves.forEach(([start, end]) => {
            time += 2000;
            setTimeout(() => {
                try {
                    board.move(start, end);
                } catch (error) {
                    msg.innerText = error.message;
                }
            }, time);
        })
    }

    return {
        init: () => init(),
        attacked_square: () => {
            const moves = [
                [
                    [6, 4],
                    [5, 4],
                ],
                [
                    [1, 3],
                    [2, 3],
                ],
                [
                    [6, 3],
                    [5, 3],
                ],
                [
                    [0, 2],
                    [4, 6],
                ],
                [
                    [7, 4],
                    [6, 4],
                ],
            ];
            play(moves);
        },
        pinned: () => {
            const moves = [
                [
                    [6, 4],
                    [5, 4],
                ],
                [
                    [1, 4],
                    [2, 4],
                ],
                [
                    [6, 3],
                    [5, 3],
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
            play(moves)
        },
    };
}

window.chess = build();
