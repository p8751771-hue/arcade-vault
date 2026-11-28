"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { GameId } from "@/lib/games";

// Port de `cover()` de references/games.js: solo el dibujo de portadas,
// sin nada de la lógica de los juegos. Canvas de 96×56 escalado con .pixelated.
// Spec 04: se dibuja con cuatro tonos de la paleta de televisor, como una pantalla
// de cuatro tonos (antes: neones por juego y fondos degradados).
const W = 96;
const H = 56;

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

  // Spec 12: la pila con huecos de la portada de la referencia y una T cayendo.
  // Las piezas C, M e Y de la referencia van en LIGHT y las G y O en MID.
  if (id === "bloques") {
    const tone: Partial<Record<string, string>> = {
      C: LIGHT,
      M: LIGHT,
      Y: LIGHT,
      G: MID,
      O: MID,
    };
    ["..O....G..", "C.OMM.GGY.", "CCOMMYGYY.", "CCOMMYYGYC"].forEach((row, j) =>
      [...row].forEach((ch, i) => {
        const c = tone[ch];
        if (c) R(18 + i * 6, 32 + j * 6, 5, 5, c);
      }),
    );
    for (const [a, b] of [
      [36, 6],
      [42, 6],
      [48, 6],
      [42, 12],
    ])
      R(a, b, 5, 5, LIGHT);
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
