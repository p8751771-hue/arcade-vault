// Bloques (spec 12). Lógica portada de `tetris(G)` en `references/games.js`;
// el dibujo no: usa la paleta de televisor antiguo (spec 04) en lugar del neón.
// El juego vive entero dentro del canvas y avisa a React con `g.handlers`.
import type { GameFactory, KeyCode } from "./engine";

const INK = "#000000"; // celdas, borde del tablero y texto del HUD
const LINE = "#2f3b34"; // crt-line: filete de las celdas y rejilla de puntos
const SCREEN = "#6e8677"; // crt-well: igual que la pantalla de la cabina

// Tablero de la referencia: 10 × 20 celdas de 24 px (240 × 480).
const COLS = 10;
const ROWS = 20;
const CELL = 24;
const BOARD_W = COLS * CELL;

// Celdas más pequeñas: la pieza siguiente y el icono de cada vida.
const NEXT_CELL = 18;
const LIFE_CELL = 12;
const LIFE_STEP = 18;

// Campo (spec 09): por debajo de este ancho se usa la disposición de la
// referencia (tablero a la izquierda, todo el HUD a la derecha); desde aquí, el
// tablero se centra con un panel a cada lado de al menos 180 px.
const SQUARE_W = 480;
const WIDE_MIN_W = 600;
const SQUARE_BOARD_X = 40;
const SQUARE_PANEL_X = 370; // centro del panel derecho en 480

// HUD dentro del canvas: etiquetas a 10 px y valores a 14 px, centrados en su
// panel. `y` es la línea base de cada texto.
const HUD = { labelPx: 10, valuePx: 14 };
const SQUARE_HUD = {
  next: 40,
  nextPiece: 60,
  lines: 150,
  score: 216,
  level: 282,
  lives: 348,
};
const WIDE_HUD = {
  score: 40,
  level: 120,
  lives: 200,
  next: 40,
  nextPiece: 60,
  lines: 170,
};
const VALUE_GAP = 26; // de la etiqueta a su valor
const LIFE_GAP = 10; // de la etiqueta VIDAS a sus iconos

// Las 7 piezas de la referencia (1 = celda ocupada). Sin colores: se distinguen
// por la forma, así que el tablero solo guarda ocupado / vacío.
const SHAPES: readonly (readonly (readonly number[])[])[] = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // J
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // L
];
const O_PIECE = 1;

// Puntos por líneas borradas a la vez, multiplicados por el nivel.
const LINE_POINTS = [0, 100, 300, 500, 800];
const HARD_DROP_POINTS = 2; // por fila bajada con Espacio
const LINES_PER_LEVEL = 10;
const SOFT_DROP_SPEED = 12; // ↓ mantenida: el tiempo de caída corre ×12
// Desplazamientos que se prueban al girar contra una pared o una pieza.
const KICKS = [0, -1, 1, -2, 2];
// Repetición al mantener ← / →: primer paso tras 0,17 s y luego cada 0,05 s.
const REPEAT_DELAY = 0.17;
const REPEAT_STEP = 0.05;

type Matrix = number[][];
interface Piece {
  m: Matrix;
  x: number; // columna de la esquina superior izquierda
  y: number; // fila
}
type MoveKey = Extract<KeyCode, "ArrowLeft" | "ArrowRight">;

const ri = (a: number, b: number) => Math.floor(a + Math.random() * (b - a));

// Giro horario (el de la referencia) y antihorario (trasponer e invertir filas).
const rotateCW = (m: Matrix): Matrix =>
  m[0].map((_, i) => m.map((r) => r[i]).reverse());
const rotateCCW = (m: Matrix): Matrix =>
  m[0].map((_, i) => m.map((r) => r[i])).reverse();

// Segundos por fila de la caída automática.
const fallInterval = (level: number) =>
  Math.max(0.07, 0.8 - (level - 1) * 0.07);

export const bloques: GameFactory = (g) => {
  const { ctx, handlers } = g;

  const board: number[][] = Array.from({ length: ROWS }, () =>
    Array<number>(COLS).fill(0),
  );
  let piece: Piece;
  let next: Piece | null = null;
  let score = 0;
  let lines = 0;
  let level = 1;
  let lives = 1;
  let acc = 0; // tiempo acumulado para la caída automática
  let ended = false;
  const hold: Record<MoveKey, number> = { ArrowLeft: 0, ArrowRight: 0 };

  const newPiece = (): Piece => {
    const i = ri(0, SHAPES.length);
    return {
      m: SHAPES[i].map((r) => [...r]),
      x: i === O_PIECE ? 4 : 3,
      y: 0,
    };
  };

  const collides = (m: Matrix, x: number, y: number) =>
    m.some((r, j) =>
      r.some(
        (v, i) =>
          v !== 0 &&
          (x + i < 0 ||
            x + i >= COLS ||
            y + j >= ROWS ||
            (y + j >= 0 && board[y + j][x + i] !== 0)),
      ),
    );

  // La siguiente pasa a caer y se sortea otra. Si ya no cabe, se pierde la
  // única vida y termina la partida.
  const spawn = () => {
    piece = next ?? newPiece();
    next = newPiece();
    if (collides(piece.m, piece.x, piece.y)) {
      ended = true;
      lives = 0;
      handlers.lives(lives);
      g.end(score);
    }
  };

  const lock = () => {
    piece.m.forEach((r, j) =>
      r.forEach((v, i) => {
        if (v && piece.y + j >= 0) board[piece.y + j][piece.x + i] = 1;
      }),
    );
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every((v) => v !== 0)) {
        board.splice(y, 1);
        board.unshift(Array<number>(COLS).fill(0));
        cleared++;
        y++; // la fila que bajó ocupa este mismo índice
      }
    }
    if (cleared) {
      score += LINE_POINTS[cleared] * level; // nivel anterior al borrado
      lines += cleared;
      level = 1 + Math.floor(lines / LINES_PER_LEVEL);
      handlers.level(level);
    }
    handlers.score(score);
    spawn();
  };

  const shift = (d: number) => {
    if (!collides(piece.m, piece.x + d, piece.y)) piece.x += d;
  };

  const rotate = (rotated: Matrix) => {
    for (const d of KICKS) {
      if (!collides(rotated, piece.x + d, piece.y)) {
        piece.m = rotated;
        piece.x += d;
        return;
      }
    }
  };

  // Dónde van el tablero y los paneles para el ancho actual. Solo cambia con
  // `resize`: el tablero, la pieza y los puntos no se tocan.
  const layout = { boardX: 0, left: 0, right: 0, wide: false };
  const place = (width: number) => {
    layout.wide = width >= WIDE_MIN_W;
    if (layout.wide) {
      layout.boardX = Math.round((width - BOARD_W) / 2);
      layout.left = layout.boardX / 2;
      const rightStart = layout.boardX + BOARD_W;
      layout.right = rightStart + (width - rightStart) / 2;
    } else {
      const offset = (width - SQUARE_W) / 2;
      layout.boardX = SQUARE_BOARD_X + offset;
      layout.left = SQUARE_PANEL_X + offset;
      layout.right = SQUARE_PANEL_X + offset;
    }
  };
  place(g.W);

  // Una celda: relleno negro con margen de 1 px y un filete interior. El filete
  // está a 5 px del borde en la celda de 24 y se escala en las pequeñas.
  const cell = (x: number, y: number, size: number) => {
    ctx.fillStyle = INK;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    const inset = Math.round((size * 5) / CELL);
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.strokeRect(
      x + inset + 0.5,
      y + inset + 0.5,
      size - 2 * inset - 1,
      size - 2 * inset - 1,
    );
  };

  const matrix = (m: Matrix, x: number, y: number, size: number) => {
    for (let j = 0; j < m.length; j++)
      for (let i = 0; i < m[j].length; i++)
        if (m[j][i]) cell(x + i * size, y + j * size, size);
  };

  const label = (text: string, x: number, y: number) => {
    ctx.fillStyle = INK;
    ctx.font = `${HUD.labelPx}px ${g.font}`;
    ctx.fillText(text, x, y);
  };
  const value = (text: string, x: number, y: number) => {
    ctx.fillStyle = INK;
    ctx.font = `${HUD.valuePx}px ${g.font}`;
    ctx.fillText(text, x, y + VALUE_GAP);
  };

  const drawBoard = () => {
    const bx = layout.boardX;
    // Rejilla: un punto de 2×2 en cada cruce interior de celdas.
    ctx.fillStyle = LINE;
    for (let j = 1; j < ROWS; j++)
      for (let i = 1; i < COLS; i++)
        ctx.fillRect(bx + i * CELL - 1, j * CELL - 1, 2, 2);
    for (let j = 0; j < ROWS; j++)
      for (let i = 0; i < COLS; i++)
        if (board[j][i]) cell(bx + i * CELL, j * CELL, CELL);
    matrix(piece.m, bx + piece.x * CELL, piece.y * CELL, CELL);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, 0, BOARD_W, ROWS * CELL);
  };

  const drawHud = () => {
    const pos = layout.wide ? WIDE_HUD : SQUARE_HUD;
    const { left, right } = layout;
    ctx.textAlign = "center";

    label("SIGUIENTE", right, pos.next);
    if (next) {
      const w = next.m[0].length * NEXT_CELL;
      matrix(next.m, right - w / 2, pos.nextPiece, NEXT_CELL);
    }
    label("LÍNEAS", right, pos.lines);
    value(String(lines), right, pos.lines);

    label("PUNTUACIÓN", left, pos.score);
    value(score.toLocaleString("de-DE"), left, pos.score);
    label("NIVEL", left, pos.level);
    value(String(level), left, pos.level);

    label("VIDAS", left, pos.lives);
    const iconsW = lives > 0 ? (lives - 1) * LIFE_STEP + LIFE_CELL : 0;
    for (let n = 0; n < lives; n++)
      cell(left - iconsW / 2 + n * LIFE_STEP, pos.lives + LIFE_GAP, LIFE_CELL);
  };

  spawn();
  handlers.score(score);
  handlers.lives(lives);
  handlers.level(level);

  return {
    // El motor ensancha o estrecha el campo (pantalla completa o ventana): solo
    // se recolocan el tablero y los paneles; la partida sigue igual.
    resize(width) {
      place(width);
    },

    wasdAsArrows: false, // A y D giran; W y S no hacen nada
    pauseOnScreenChange: true,

    update(dt) {
      if (ended) return;
      const k = g.keys;

      for (const code of ["ArrowLeft", "ArrowRight"] as const) {
        const d = code === "ArrowLeft" ? -1 : 1;
        if (g.hit(code)) {
          shift(d);
          hold[code] = REPEAT_DELAY;
        } else if (k[code]) {
          hold[code] -= dt;
          if (hold[code] <= 0) {
            hold[code] = REPEAT_STEP;
            shift(d);
          }
        }
      }

      if (g.hit("ArrowUp") || g.hit("KeyD")) rotate(rotateCW(piece.m));
      if (g.hit("KeyA")) rotate(rotateCCW(piece.m));

      if (g.hit("Space")) {
        while (!collides(piece.m, piece.x, piece.y + 1)) {
          piece.y++;
          score += HARD_DROP_POINTS;
        }
        lock();
        return;
      }

      acc += dt * (k.ArrowDown ? SOFT_DROP_SPEED : 1);
      const interval = fallInterval(level);
      while (acc >= interval) {
        acc -= interval;
        if (!collides(piece.m, piece.x, piece.y + 1)) piece.y++;
        else {
          lock();
          acc = 0;
          break;
        }
      }
    },

    draw() {
      ctx.fillStyle = SCREEN;
      ctx.fillRect(0, 0, g.W, g.H);
      drawBoard();
      drawHud();
    },
  };
};
