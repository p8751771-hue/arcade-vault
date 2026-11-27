import { GameLibrary } from "@/components/game-library";
import { getGames } from "@/lib/games-data";
import { formatScore } from "@/lib/scores";
import { getBestScore } from "@/lib/scores-data";

export default async function LibraryPage() {
  const games = await getGames();
  const entries = await Promise.all(
    games.map(async (game) => {
      const best = await getBestScore(game.id);
      return { game, best: best === null ? "—" : formatScore(best) };
    }),
  );

  return (
    <main className="animate-fade-slide relative z-[1] mx-auto w-full max-w-[1240px] px-5 pt-11 pb-20">
      <div className="mb-11 flex flex-col items-center gap-5 text-center">
        <h1 className="text-pixel-crt animate-flicker text-[clamp(26px,6.4vw,66px)] leading-[1.3]">
          ARCADE
          <br />
          <span className="text-pixel-crt">VAULT</span>
        </h1>
        <div className="flex items-center gap-3.5 font-pixel text-[clamp(9px,2.2vw,13px)] leading-[1.6] text-crt-ink">
          <span className="h-4 w-4 flex-none rounded-full bg-crt-ink" />
          <span className="animate-blink">INSERTA UNA MONEDA PARA JUGAR</span>
          <span className="h-4 w-4 flex-none rounded-full bg-crt-ink" />
        </div>
      </div>

      <GameLibrary entries={entries} />
    </main>
  );
}
