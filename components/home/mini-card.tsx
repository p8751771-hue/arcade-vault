import Link from "next/link";
import { GameCover } from "@/components/game-cover";
import type { Game } from "@/lib/games";

// Mini-tarjeta de "JUEGOS DISPONIBLES AHORA" (.mini-card). Toda la tarjeta es un
// <Link>; al pasar el cursor se invierte (spec 04: sin color por juego).
export function MiniCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/juegos/${game.id}`}
      className="group block border border-crt-line bg-crt-surface text-crt-ink no-underline transition-[transform,background-color,color] duration-[180ms] ease-[ease] hover:-translate-y-1 hover:bg-crt-ink hover:text-crt-invert focus-visible:bg-crt-ink focus-visible:text-crt-invert"
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
        <div className="mt-1 text-[10px] tracking-[0.14em] text-crt-ink-2 group-hover:text-crt-invert group-focus-visible:text-crt-invert">
          {game.category}
        </div>
      </div>
    </Link>
  );
}
