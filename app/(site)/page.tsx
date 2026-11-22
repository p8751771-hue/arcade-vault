import { GameLibrary } from "@/components/game-library";
import { GAMES } from "@/lib/games";
import { formatScore, getLeaderboard } from "@/lib/scores";

export default function HomePage() {
  return (
    <main className="animate-fade-slide relative z-[1] mx-auto w-full max-w-[1240px] px-5 pt-11 pb-20">
      <div className="mb-11 flex flex-col items-center gap-5 text-center">
        <h1 className="text-pixel-glow neon-cyan animate-flicker text-[clamp(26px,6.4vw,66px)] leading-[1.3]">
          ARCADE
          <br />
          <span className="text-pixel-glow neon-pink">VAULT</span>
        </h1>
        <div className="flex items-center gap-3.5 font-pixel text-[clamp(9px,2.2vw,13px)] leading-[1.6] text-neon-yellow [text-shadow:0_0_10px_rgb(245_255_0/0.7)]">
          <span className="h-4 w-4 flex-none rounded-full bg-neon-yellow shadow-[0_0_12px_#f5ff00]" />
          <span className="animate-blink">INSERTA UNA MONEDA PARA JUGAR</span>
          <span className="h-4 w-4 flex-none rounded-full bg-neon-yellow shadow-[0_0_12px_#f5ff00]" />
        </div>
      </div>

      <GameLibrary
        entries={GAMES.map((game) => ({
          game,
          best: formatScore(getLeaderboard(game.id)[0].score),
        }))}
      />
    </main>
  );
}
