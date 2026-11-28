// Bloques (spec 12). Lógica portada de `tetris(G)` en `references/games.js`;
// el dibujo no: usa la paleta de televisor antiguo (spec 04) en lugar del neón.
// El juego vive entero dentro del canvas y avisa a React con `g.handlers`.
import type { GameFactory, KeyCode } from "./engine";

const INK = "#000000"; // celdas, borde del tablero y texto del HUD
const SCREEN = "#6e8677"; // crt-well: igual que la pantalla de la cabina

// Tablero de la referencia: 10 × 20 celdas de 24 px (240 × 480).
const COLS = 10;
const ROWS = 20;
const CELL = 24;

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

  spawn();
  handlers.score(score);
  handlers.lives(lives);
  handlers.level(level);

  return {
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

    // Dibujo mínimo; el aspecto completo, el HUD y el campo ancho van en el paso 4.
    draw() {
      ctx.fillStyle = SCREEN;
      ctx.fillRect(0, 0, g.W, g.H);
      const ox = 40 + (g.W - 480) / 2;
      ctx.fillStyle = INK;
      board.forEach((r, j) =>
        r.forEach((v, i) => {
          if (v) ctx.fillRect(ox + i * CELL + 1, j * CELL + 1, 22, 22);
        }),
      );
      piece.m.forEach((r, j) =>
        r.forEach((v, i) => {
          if (v)
            ctx.fillRect(
              ox + (piece.x + i) * CELL + 1,
              (piece.y + j) * CELL + 1,
              22,
              22,
            );
        }),
      );
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(ox, 0, COLS * CELL, ROWS * CELL);
    },
  };
};
