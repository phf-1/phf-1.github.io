/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const error = function (msg) {
  throw new Error(msg);
};

const Piece = class extends EventTarget {
  constructor(square, team) {
    super();
    this.#square = square;
    this.#teams.includes(team) || error(`Unexpected team. team = ${team}`);
    this.#team = team;
    square.add_piece(this);
    this.draw();
  }

  // Public
  draw() {
    error(`Not Implemented`);
  }

  team() {
    return this.#team;
  }

  square(next_square = null) {
    if (next_square === null) {
      return this.#square;
    } else {
      this.#square = next_square;
    }
  }

  move(square) {
    error(`Not Implemented.`);
  }

  color() {
    if (this.#team === "black") {
      return this.#color_dark;
    } else {
      return this.#color_light;
    }
  }

  // Private
  #square;
  #teams = ["black", "white"];
  #team;
  #color_light = "#fffff8";
  #color_dark = "#000006";
};

const Pawn = class extends Piece {
  // Public
  draw() {
    const pixels = (ctx, top, left, width) => {
      ctx.fillStyle = this.color();

      // Draw the base
      ctx.beginPath();
      ctx.rect(left + width * 0.3, top + width * 0.8, width * 0.4, width * 0.2);
      ctx.closePath();
      ctx.fill();

      // Draw the body
      ctx.beginPath();
      ctx.arc(left + width / 2, top + width * 0.6, width * 0.2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      // Draw the head
      ctx.beginPath();
      ctx.arc(
        left + width / 2,
        top + width * 0.3,
        width * 0.15,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.fill();
    };
    this.square().draw(pixels);
  }

  move(square) {
    const dir = this.#find_direction(square);
    this.#move(dir);
  }

  // Private
  #dirs_white = ["top_left", "top", "top_right"];

  #dirs_black = ["bottom_left", "bottom", "bottom_right"];

  #find_direction(square) {
    const my_square = this.square();
    const dirs = this.team() === "black" ? this.#dirs_black : this.#dirs_white;
    for (const dir of dirs) {
      if (my_square.get_neighbor(dir) === square) {
        return dir;
      }
    }
    error(`No direction found to square. square = ${square}`);
  }

  #move(dir) {
    const square = this.square();
    const next_square = square.get_neighbor(dir);
    next_square !== null || error(`There is no next square.`);
    const dirs_vertical = ["top", "bottom"];
    const dirs_diag = ["top_left", "top_right", "bottom_left", "bottom_right"];
    if (dirs_vertical.includes(dir)) {
      if (!next_square.is_empty()) {
        error(`The next square is not empty.`);
      }
    }

    if (dirs_diag.includes(dir)) {
      if (next_square.is_empty()) {
        error(`The next square is empty.`);
      }
      const next_piece = next_square.get_piece();
      if (next_piece.team() === this.team()) {
        error(`The next piece is in my team.`);
      }
    }

    next_square.remove_piece();
    square.remove_piece();
    this.square(next_square);
    next_square.add_piece(this);
    this.draw();
  }
};

const King = class extends Piece {
  // Public
  draw() {
    const pixels = (ctx, top, left, width) => {
      ctx.fillStyle = this.color();
      ctx.strokeStyle = this.color();

      // Draw the base
      ctx.beginPath();
      ctx.rect(left + width * 0.3, top + width * 0.8, width * 0.4, width * 0.2);
      ctx.closePath();
      ctx.fill();

      // Draw the body
      ctx.beginPath();
      ctx.arc(
        left + width / 2,
        top + width * 0.5,
        width * 0.25,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.fill();

      // Draw the cross
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(left + width / 2, top + width * 0.05);
      ctx.lineTo(left + width / 2, top + width * 0.25);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(left + width * 0.45, top + width * 0.15);
      ctx.lineTo(left + width * 0.55, top + width * 0.15);
      ctx.stroke();

      // Draw the head
      ctx.beginPath();
      ctx.arc(
        left + width / 2,
        top + width * 0.35,
        width * 0.1,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.fill();
    };
    this.square().draw(pixels);
  }

  move(square) {
    const dir = this.#find_direction(square);
    this.#move(dir);
  }

  // Private
  #dirs = [
    "top_left",
    "top",
    "top_right",
    "bottom_left",
    "bottom",
    "bottom_right",
  ];

  #find_direction(square) {
    const my_square = this.square();
    const dirs = this.#dirs;
    for (const dir of dirs) {
      if (my_square.get_neighbor(dir) === square) {
        return dir;
      }
    }
    error(`No direction found to square. square = ${square}`);
  }

  #move(dir) {
    const square = this.square();
    const next_square = square.get_neighbor(dir);
    if (!next_square.is_empty()) {
      const piece = next_square.get_piece();
      if (piece.team() === this.team()) {
        error(`next piece is in my team`);
      }
    }
    next_square.remove_piece();
    square.remove_piece();
    this.square(next_square);
    next_square.add_piece(this);
    this.draw();
  }
};

const Square = class {
  constructor(ctx, top, left, width, color) {
    this.#ctx = ctx;
    this.#pos = [top, left];
    this.#width = width;
    this.#color = color;
    this.#draw_square();
    this.#piece = null;
  }

  // Public

  draw(pixels = null) {
    if (pixels === null) {
      this.#draw_square();
    } else {
      this.#draw_over_square(pixels);
    }
  }

  pos() {
    return this.#pos;
  }

  color() {
    return this.#color;
  }

  add_neighbor(dir, square) {
    this.#dirs.includes(dir) || error(`dir is not valid. dir = ${dir}`);
    this.#neighbors[dir] = square;
  }

  get_neighbors() {
    return this.#neighbors;
  }

  get_neighbor(dir) {
    this.#dirs.includes(dir) || error(`dir is not valid. dir = ${dir}`);
    return this.#neighbors[dir];
  }

  add_piece(piece) {
    this.#piece === null || error("this.#piece !== null");
    this.#piece = piece;
  }

  remove_piece() {
    const piece = this.#piece;
    this.#piece = null;
    this.draw();
    return piece;
  }

  get_piece() {
    return this.#piece;
  }

  is_empty() {
    return !this.#piece;
  }

  // Private
  #ctx;

  #width;

  #pos;

  #color;

  #neighbors = {};

  #dirs = [
    "top",
    "top_right",
    "right",
    "bottom_right",
    "bottom",
    "bottom_left",
    "left",
    "top_left",
  ];

  #piece;

  #draw_square() {
    const ctx = this.#ctx;
    const [top, left] = this.#pos;
    const width = this.#width;
    ctx.fillStyle = this.#color;
    ctx.fillRect(left, top, width, width);
  }

  #draw_over_square(pixels) {
    this.#draw_square();
    const ctx = this.#ctx;
    const [top, left] = this.#pos;
    const width = this.#width;
    pixels(ctx, top, left, width);
  }
};

const Board = class {
  constructor(canvas) {
    const width = canvas.width;
    const height = canvas.height;
    width === height || error("width !== height");
    width % 8 === 0 || error("width % 8 !== 0");
    const square_len = width / 8;
    const indexes = Array.from({ length: 8 }, (item, index) => index);
    this.#indexes = indexes;
    const ctx = canvas.getContext("2d");
    this.#squares = [];
    this.#pieces = [];
    this.#build_space(ctx, indexes, square_len);
    this.#pawns();
    this.#kings();
  }

  // Public
  move(start, end) {
    const start_piece = this.#coord_to_piece(start);
    const end_square = this.#coord_to_square(end);
    start_piece.move(end_square);
  }

  // Private
  #squares;

  #pieces;

  #indexes;

  #pawns() {
    const add_pawn = (square, team) => {
      const piece = new Pawn(square, team);
      this.#pieces.push(piece);
    };

    this.#squares[1].forEach((square) => {
      add_pawn(square, "black");
    });

    this.#squares[6].forEach((square) => {
      add_pawn(square, "white");
    });
  }

  #kings() {
    const add_king = (square, team) => {
      const piece = new King(square, team);
      this.#pieces.push(piece);
    };
    add_king(this.#squares[0][4], "black");
    add_king(this.#squares[7][4], "white");
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

  #build_space(ctx, indexes, square_len) {
    indexes.forEach((row) => {
      this.#squares.push([]);
      indexes.forEach((col) => {
        const top = row * square_len;
        const left = col * square_len;
        const color = this.#choose_color(row, col);
        const square = new Square(ctx, top, left, square_len, color);
        this.#squares[row][col] = square;
      });
    });

    indexes.forEach((row) => {
      indexes.forEach((col) => {
        const squares = this.#squares;
        const square = squares[row][col];
        const neighbors = {
          top: (squares[row - 1] && squares[row - 1][col]) || null,
          top_right: (squares[row - 1] && squares[row - 1][col + 1]) || null,
          right: (squares[row] && squares[row][col + 1]) || null,
          bottom_right: (squares[row + 1] && squares[row + 1][col + 1]) || null,
          bottom: (squares[row + 1] && squares[row + 1][col]) || null,
          bottom_left: (squares[row + 1] && squares[row + 1][col - 1]) || null,
          left: (squares[row - 1] && squares[row - 1][col - 1]) || null,
          top_left: (squares[row - 1] && squares[row - 1][col - 1]) || null,
        };
        Object.entries(neighbors).forEach(([dir, neighbor]) => {
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
    const piece = square.get_piece();
    piece !== null || error(`No piece at coord. coord = (${coord})`);
    return piece;
  }
};

const start = function () {
  const canvas = document.getElementById("chess");
  const board = new Board(canvas);
  setTimeout(() => {
    board.move([1, 4], [2, 4]);
  }, 1000);
  setTimeout(() => {
    board.move([0, 4], [1, 4]);
  }, 2000);
};

start();
