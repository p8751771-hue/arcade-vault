import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { Loading, LoadError } from "@/components/data-states";
import { HallOfFame } from "@/components/hall-of-fame";
import type { Game } from "@/lib/games";
import { getGames } from "@/lib/games-data";
import type { ScoreEntry } from "@/lib/scores";
import { getTopScores } from "@/lib/scores-data";

export default function HallOfFamePage() {
  return (
    <main className="animate-fade-slide relative z-[1] mx-auto w-full max-w-[1000px] px-5 pt-11 pb-20">
      <h1 className="m-0 mb-[30px] text-center font-pixel text-[clamp(20px,4.6vw,40px)] leading-[1.4] font-normal text-crt-ink">
        SALÓN DE LA FAMA
      </h1>
      {/* Spec 11: el ranking global y el de cada juego salen de Supabase. */}
      <Suspense fallback={<Loading />}>
        <Hall />
      </Suspense>
    </main>
  );
}

async function Hall() {
  let games: Game[];
  let global: ScoreEntry[];
  let scoresByGame: Record<string, ScoreEntry[]>;
  try {
    games = await getGames();
    const [globalRows, ...perGame] = await Promise.all([
      getTopScores(null),
      ...games.map((game) => getTopScores(game.id)),
    ]);
    global = globalRows;
    scoresByGame = Object.fromEntries(
      games.map((game, i) => [game.id, perGame[i]]),
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("[salon-de-la-fama] no se pudo leer el ranking", error);
    return <LoadError what="el salón de la fama" />;
  }

  return (
    <HallOfFame games={games} global={global} scoresByGame={scoresByGame} />
  );
}
