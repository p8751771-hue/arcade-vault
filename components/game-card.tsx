"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { GameCover } from "@/components/game-cover";
import type { Game } from "@/lib/games";

interface GameCardProps {
  game: Game;
  best: string; // mejor puntuación ya formateada ("12.000")
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function tiltMove(e: MouseEvent<HTMLAnchorElement>) {
  // El CSS global no neutraliza estilos inline: se consulta aquí.
  if (prefersReducedMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.transition = "transform .08s, background-color .2s, color .2s";
  el.style.transform = `perspective(700px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 11).toFixed(2)}deg) translateY(-6px) scale(1.03)`;
}

function tiltLeave(e: MouseEvent<HTMLAnchorElement>) {
  const el = e.currentTarget;
  el.style.transition = "transform .35s, background-color .2s, color .2s";
  el.style.transform = "";
}

export function GameCard({ game, best }: GameCardProps) {
  return (
    <Link
      href={`/juegos/${game.id}`}
      onMouseMove={tiltMove}
      onMouseLeave={tiltLeave}
      className="card-crt group flex flex-col no-underline will-change-transform"
    >
      <GameCover
        id={game.id}
        title={game.title}
        className="border-b-2 border-crt-line"
      />
      <div className="flex flex-1 flex-col gap-3 p-[18px]">
        <div className="font-pixel text-[9px] tracking-[1px] text-crt-ink-2 group-hover:text-crt-invert">
          {game.category}
        </div>
        <h2
          className="m-0 font-pixel text-[15px] leading-[1.4] font-normal text-current"
        >
          {game.title}
        </h2>
        <p className="m-0 flex-1 text-base leading-[1.45] text-crt-ink-2 [text-wrap:pretty] group-hover:text-crt-invert">
          {game.description}
        </p>
        <div className="flex items-center justify-between gap-2.5 border border-dashed border-current px-2.5 py-[9px]">
          <span className="font-pixel text-[7px] leading-[1.6] text-current">
            MEJOR
            <br />
            PUNTUACIÓN
          </span>
          <span className="font-pixel text-xs text-current">
            {best}
          </span>
        </div>
        {/* Elemento visual: un <button> dentro de un <a> no es HTML válido */}
        <span
          aria-hidden="true"
          className="block border-2 border-current p-[13px] text-center font-pixel text-xs leading-[normal] text-current"
        >
          JUGAR
        </span>
      </div>
    </Link>
  );
}
