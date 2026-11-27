import { NEON_TEXT } from "@/components/home/accent";
import { ACTIVITY, formatHomeScore } from "@/lib/home";

// "ÚLTIMAS PUNTUACIONES": 7 filas con entrada escalonada (60 ms por fila).
// Datos de ejemplo (spec 02); no vienen de la tabla `scores`.
export function ActivityTicker() {
  return (
    <div className="max-h-[360px] overflow-hidden py-1.5">
      {ACTIVITY.map((row, i) => (
        <div
          key={`${row.player}-${row.game}`}
          style={{ animationDelay: `${i * 60}ms` }}
          className="animate-tick-in grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-b border-crt-line px-[18px] py-[11px] text-[13px] max-[521px]:grid-cols-[1fr_auto] max-[521px]:gap-y-1"
        >
          <span
            className={`font-pixel text-[10px] tracking-[0.06em] ${NEON_TEXT[row.accent]}`}
          >
            {row.player}
          </span>
          <span className="text-[12px] text-crt-ink-2 max-[521px]:col-span-full">
            ▸ {row.game}
          </span>
          <span className="font-pixel text-[11px] text-crt-ink">
            +{formatHomeScore(row.score)}
          </span>
          <span className="text-[11px] tracking-[0.08em] text-crt-ink-2 max-[521px]:col-span-full">
            {row.ago}
          </span>
        </div>
      ))}
    </div>
  );
}
