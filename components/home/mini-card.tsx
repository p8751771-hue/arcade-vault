import Link from "next/link";
import type { CSSProperties } from "react";
import { GameCover } from "@/components/game-cover";
import type { Game } from "@/lib/games";

// Mini-tarjeta de "JUEGOS DISPONIBLES AHORA" (.mini-card). Toda la tarjeta es un
// <Link>; el acento del hover es el neón del juego (--neon).
export function MiniCard({ game }: { game: Game }) {
  const neon = {
    "--neon": game.color,
    "--neon-rgb": game.rgb.replaceAll(",", " "),
  } as CSSProperties;

  return (
    <Link
      href={`/juegos/${game.id}`}
      style={neon}
      className="block border border-home-line bg-home-bg2 text-home-ink no-underline transition-[transform,border-color] duration-[180ms] ease-[ease] hover:-translate-y-1 hover:border-[var(--neon)] hover:text-home-ink"
    >
      <div className="relative aspect-square overflow-hidden">
        <GameCover
          id={game.id}
          title={game.title}
          className="!aspect-square h-full"
          canvasClassName="object-cover"
        />
      </div>
      <div className="px-3 py-2.5">
        <div className="font-pixel text-[10px] tracking-[0.06em]">{game.title}</div>
        <div className="mt-1 text-[10px] tracking-[0.14em] text-home-faint">
          {game.category}
        </div>
      </div>
    </Link>
  );
}
