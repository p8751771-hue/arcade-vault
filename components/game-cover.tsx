"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { GameId } from "@/lib/games";

// Port de `cover()` de references/games.js: solo el dibujo de portadas,
// sin nada de la lógica de los juegos. Canvas de 96×56 escalado con .pixelated.
const W = 96;
const H = 56;

const C = "#00f5ff";
const M = "#ff006e";
const Y = "#f5ff00";
const GR = "#39ff88";

const BACKGROUNDS: Record<GameId, [string, string]> = {
  arkanoid: ["#16064a", "#003a52"],
  tetris: ["#34052a", "#14064a"],
  snake: ["#032a30", "#0c0c38"],
  pacman: ["#0a0a42", "#38093a"],
  invaders: ["#0c0c30", "#470628"],
  asteroids: ["#05051c", "#16265a"],
};

function mix(a: string, b: string, t: number): string {
  return (
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(a.slice(i, i + 2), 16) * (1 - t) +
            parseInt(b.slice(i, i + 2), 16) * t,
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function drawCover(x: CanvasRenderingContext2D, id: GameId) {
  const bg = BACKGROUNDS[id];
  for (let y = 0; y < H; y += 4) {
    x.fillStyle = mix(bg[0], bg[1], y / H);
    x.fillRect(0, y, W, 4);
  }
  x.fillStyle = "#fff";
  for (let i = 0; i < 22; i++) x.fillRect((i * 37 + 11) % W, (i * 23 + 5) % 36, 1, 1);

  const R = (a: number, b: number, w: number, h: number, c: string) => {
    x.fillStyle = c;
    x.fillRect(a, b, w, h);
  };

  if (id === "snake") {
    const body: [number, number][] = [
      [12, 36], [16, 36], [20, 36], [24, 36], [28, 36], [32, 36], [32, 32], [32, 28],
      [36, 28], [40, 28], [44, 28], [48, 28], [52, 28], [52, 24], [52, 20], [56, 20],
    ];
    body.forEach((p, i, a) => R(p[0], p[1], 4, 4, i === a.length - 1 ? "#fff" : C));
    R(70, 18, 4, 4, M);
    R(71, 15, 2, 2, Y);
  }

  if (id === "tetris") {
    const K: Record<string, string> = { C, M, Y, G: GR, O: "#ff7a00" };
    ["..O....G..", "C.OMM.GGY.", "CCOMMYGYY.", "CCOMMYYGYC"].forEach((row, j) =>
      [...row].forEach((ch, i) => {
        if (K[ch]) R(18 + i * 6, 32 + j * 6, 5, 5, K[ch]);
      }),
    );
    [[24, 6], [30, 6], [36, 6], [30, 12]].forEach((p) => R(p[0] + 12, p[1], 5, 5, M));
  }

  if (id === "arkanoid") {
    const CO = [M, M, Y, Y, C];
    for (let r = 0; r < 5; r++) for (let i = 0; i < 8; i++) R(8 + i * 11, 6 + r * 5, 10, 4, CO[r]);
    R(36, 50, 24, 3, C);
    R(56, 38, 3, 3, "#fff");
  }

  if (id === "pacman") {
    for (let dx = -12; dx <= 12; dx++)
      for (let dy = -12; dy <= 12; dy++)
        if (dx * dx + dy * dy <= 144 && !(dx > 0 && Math.abs(dy) <= dx * 0.6)) R(24 + dx, 30 + dy, 1, 1, Y);
    [44, 52, 60].forEach((p) => R(p, 30, 2, 2, "#fff"));
    for (let dx = -9; dx <= 9; dx++)
      for (let dy = -9; dy <= 9; dy++)
        if ((dy <= 0 && dx * dx + dy * dy <= 81) || (dy > 0 && dy <= 9)) R(78 + dx, 30 + dy, 1, 1, M);
    R(73, 27, 3, 4, "#fff");
    R(80, 27, 3, 4, "#fff");
  }

  if (id === "invaders") {
    const S = ["00100000100", "00010001000", "00111111100", "01101110110", "11111111111", "10111111101", "10100000101", "00011011000"];
    S.forEach((row, j) =>
      [...row].forEach((ch, i) => {
        if (ch === "1") R(31 + i * 3, 12 + j * 3, 3, 3, M);
      }),
    );
    R(47, 34, 2, 6, Y);
    R(40, 48, 16, 4, C);
    R(44, 45, 8, 3, C);
  }

  if (id === "asteroids") {
    x.lineWidth = 1;
    const P = (pts: [number, number][], col: string) => {
      x.strokeStyle = col;
      x.beginPath();
      pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
      x.closePath();
      x.stroke();
    };
    P([[44, 34], [30, 40], [33, 34], [30, 28]], C);
    P([[60, 12], [70, 10], [76, 18], [72, 28], [62, 28], [56, 20]], M);
    P([[78, 40], [84, 38], [88, 44], [82, 48], [77, 46]], Y);
    R(54, 31, 2, 2, "#fff");
    R(60, 29, 2, 2, "#fff");
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
      className={`aspect-[96/56] w-full overflow-hidden bg-[var(--color-cover)] ${className}`}
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
