import { NEON_TEXT } from "@/components/home/accent";
import { GAMES } from "@/lib/games";
import { ACTIVITY, formatHomeScore } from "@/lib/home";

const TITLES = new Map<string, string>(GAMES.map((g) => [g.id, g.title]));

// "ÚLTIMAS PUNTUACIONES": 7 filas con entrada escalonada (60 ms por fila).
export function ActivityTicker() {
  return (
    <div className="max-h-[360px] overflow-hidden py-1.5">
      {ACTIVITY.map((row, i) => (
        <div
          key={`${row.player}-${row.gameId}`}
          style={{ animationDelay: `${i * 60}ms` }}
          className="animate-tick-in grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-home-line-2 px-[18px] py-[11px] text-[13px] max-[521px]:grid-cols-[1fr_auto] max-[521px]:gap-y-1"
        >
          <span className={`font-pixel text-[10px] tracking-[0.06em] ${NEON_TEXT[row.accent]}`}>
            {row.player}
          </span>
          <span className="text-[12px] text-home-dim max-[521px]:col-span-full">
            ▸ {TITLES.get(row.gameId)}
          </span>
          <span className="font-pixel text-[11px] text-neon-yellow [text-shadow:0_0_6px_rgb(245_255_0/0.5)]">
            +{formatHomeScore(row.score)}
          </span>
          <span className="text-[11px] tracking-[0.08em] text-home-faint max-[521px]:col-span-full">
            {row.ago}
          </span>
        </div>
      ))}
    </div>
  );
}
