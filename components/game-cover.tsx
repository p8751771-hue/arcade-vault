"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { GameId } from "@/lib/games";

// Port de `cover()` de references/games.js: solo el dibujo de portadas,
// sin nada de la lógica de los juegos. Canvas de 96×56 escalado con .pixelated.
// Spec 04: se dibuja con cuatro tonos de la paleta de televisor, como una pantalla
// de cuatro tonos (antes: neones por juego y fondos degradados).
const W = 96;
const H = 56;

const DARK = "#0e1511"; // pixel oscuro (crt-ink-2)
const BG = "#2f3b34"; // fondo de portada (crt-line)
const MID = "#748c7d"; // pixel medio (crt-bg)
const LIGHT = "#8aa293"; // pixel claro (crt-surface)

/** Línea de 1 px sin antialiasing (Bresenham), para no generar tonos intermedios. */
function line(
  x: CanvasRenderingContext2D,
  a: [number, number],
  b: [number, number],
) {
  let [x0, y0] = a;
  const [x1, y1] = b;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    x.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function drawCover(x: CanvasRenderingContext2D, id: GameId) {
  x.fillStyle = BG;
  x.fillRect(0, 0, W, H);
  x.fillStyle = MID;
  for (let i = 0; i < 22; i++)
    x.fillRect((i * 37 + 11) % W, (i * 23 + 5) % 36, 1, 1);

  const R = (a: number, b: number, w: number, h: number, c: string) => {
    x.fillStyle = c;
    x.fillRect(a, b, w, h);
  };

  if (id === "snake") {
    const body: [number, number][] = [
      [12, 36],
      [16, 36],
      [20, 36],
      [24, 36],
      [28, 36],
      [32, 36],
      [32, 32],
      [32, 28],
      [36, 28],
      [40, 28],
      [44, 28],
      [48, 28],
      [52, 28],
      [52, 24],
      [52, 20],
      [56, 20],
    ];
    body.forEach((p, i, a) =>
      R(p[0], p[1], 4, 4, i === a.length - 1 ? MID : LIGHT),
    );
    R(70, 18, 4, 4, LIGHT);
    R(71, 15, 2, 2, MID);
  }

  if (id === "tetris") {
    const K: Record<string, string> = {
      C: LIGHT,
      M: MID,
      Y: LIGHT,
      G: MID,
      O: MID,
    };
    ["..O....G..", "C.OMM.GGY.", "CCOMMYGYY.", "CCOMMYYGYC"].forEach((row, j) =>
      [...row].forEach((ch, i) => {
        if (K[ch]) R(18 + i * 6, 32 + j * 6, 5, 5, K[ch]);
      }),
    );
    [
      [24, 6],
      [30, 6],
      [36, 6],
      [30, 12],
    ].forEach((p) => R(p[0] + 12, p[1], 5, 5, LIGHT));
  }

  if (id === "arkanoid") {
    const CO = [MID, MID, LIGHT, LIGHT, MID];
    for (let r = 0; r < 5; r++)
      for (let i = 0; i < 8; i++) R(8 + i * 11, 6 + r * 5, 10, 4, CO[r]);
    R(36, 50, 24, 3, LIGHT);
    R(56, 38, 3, 3, LIGHT);
  }

  if (id === "pacman") {
    for (let dx = -12; dx <= 12; dx++)
      for (let dy = -12; dy <= 12; dy++)
        if (dx * dx + dy * dy <= 144 && !(dx > 0 && Math.abs(dy) <= dx * 0.6))
          R(24 + dx, 30 + dy, 1, 1, LIGHT);
    [44, 52, 60].forEach((p) => R(p, 30, 2, 2, LIGHT));
    for (let dx = -9; dx <= 9; dx++)
      for (let dy = -9; dy <= 9; dy++)
        if ((dy <= 0 && dx * dx + dy * dy <= 81) || (dy > 0 && dy <= 9))
          R(78 + dx, 30 + dy, 1, 1, MID);
    R(73, 27, 3, 4, DARK);
    R(80, 27, 3, 4, DARK);
  }

  if (id === "invaders") {
    const S = [
      "00100000100",
      "00010001000",
      "00111111100",
      "01101110110",
      "11111111111",
      "10111111101",
      "10100000101",
      "00011011000",
    ];
    S.forEach((row, j) =>
      [...row].forEach((ch, i) => {
        if (ch === "1") R(31 + i * 3, 12 + j * 3, 3, 3, LIGHT);
      }),
    );
    R(47, 34, 2, 6, MID);
    R(40, 48, 16, 4, MID);
    R(44, 45, 8, 3, MID);
  }

  if (id === "asteroides") {
    const P = (pts: [number, number][], col: string) => {
      x.fillStyle = col;
      pts.forEach((p, i) => line(x, p, pts[(i + 1) % pts.length]));
    };
    P(
      [
        [44, 34],
        [30, 40],
        [33, 34],
        [30, 28],
      ],
      LIGHT,
    );
    P(
      [
        [60, 12],
        [70, 10],
        [76, 18],
        [72, 28],
        [62, 28],
        [56, 20],
      ],
      MID,
    );
    P(
      [
        [78, 40],
        [84, 38],
        [88, 44],
        [82, 48],
        [77, 46],
      ],
      LIGHT,
    );
    R(54, 31, 2, 2, LIGHT);
    R(60, 29, 2, 2, LIGHT);
  }
}

interface GameCoverProps {
  id: GameId;
  title: string;
  className?: string;
  /** Clases extra del <canvas> (p. ej. `object-cover` en un contenedor cuadrado). */
  canvasClassName?: string;
  style?: CSSProperties;
}

export function GameCover({
  id,
  title,
  className = "",
  canvasClassName = "",
  style,
}: GameCoverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawCover(ctx, id);
  }, [id]);

  // El contenedor fija la proporción y el color de fondo: sin saltos de layout
  // mientras el canvas se dibuja en cliente.
  return (
    <div
      className={`aspect-[96/56] w-full overflow-hidden bg-crt-line ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        role="img"
        aria-label={title}
        className={`pixelated block h-full w-full ${canvasClassName}`}
      />
    </div>
  );
}
