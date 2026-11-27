import { HallOfFame } from "@/components/hall-of-fame";
import { getGames } from "@/lib/games-data";
import type { ScoreEntry } from "@/lib/scores";
import { getTopScores } from "@/lib/scores-data";

export default async function HallOfFamePage() {
  const games = await getGames();
  const entries = await Promise.all(
    games.map(async (game) => [game.id, await getTopScores(game.id)] as const),
  );
  const scoresByGame: Record<string, ScoreEntry[]> =
    Object.fromEntries(entries);

  return (
    <main className="animate-fade-slide relative z-[1] mx-auto w-full max-w-[1000px] px-5 pt-11 pb-20">
      <h1 className="m-0 mb-[30px] text-center font-pixel text-[clamp(20px,4.6vw,40px)] leading-[1.4] font-normal text-crt-ink">
        SALÓN DE LA FAMA
      </h1>
      <HallOfFame games={games} scoresByGame={scoresByGame} />
    </main>
  );
}
