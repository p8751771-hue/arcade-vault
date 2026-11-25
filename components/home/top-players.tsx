import { TOP_PLAYERS, formatHomeScore } from "@/lib/home";

// Spec 05: el texto de rango es negro y el top 3 se marca con una barra lateral negra de
// 4 px (el resto, crt-line). En el spec 04 eran tonos de medalla oro/plata/bronce; antes, el
// texto y un degradado de fondo usaban oro/plata/bronce neón.
const RANK = [
  { text: "text-crt-ink", bg: "before:border-l-4 before:border-crt-ink" },
  { text: "text-crt-ink", bg: "before:border-l-4 before:border-crt-ink" },
  { text: "text-crt-ink", bg: "before:border-l-4 before:border-crt-ink" },
] as const;

const DEFAULT_BG = "before:border-l-4 before:border-crt-line";

// "TOP JUGADORES · HOY": 5 filas. La barra (`width = 100 - i * 16` %) se renderiza como
// en la referencia, que no le da estilo propio: el degradado de la fila es el fondo visible.
export function TopPlayers() {
  return (
    <div className="flex flex-col gap-2.5 px-[18px] pt-2.5 pb-[18px]">
      {TOP_PLAYERS.map((row, i) => {
        const rank = RANK[i];
        return (
          <div
            key={row.player}
            className={`relative grid grid-cols-[36px_1fr_auto_auto] items-center gap-2.5 py-2 before:pointer-events-none before:absolute before:inset-y-0 before:right-0 before:left-9 before:z-0 before:content-[''] ${rank?.bg ?? DEFAULT_BG}`}
          >
            <span
              className={`relative z-[1] font-pixel text-[10px] ${rank?.text ?? "text-crt-ink-2"}`}
            >
              #{String(row.rank).padStart(2, "0")}
            </span>
            <span className="absolute" aria-hidden="true">
              <span data-bar style={{ width: `${100 - i * 16}%` }} />
            </span>
            <span className="relative z-[1] font-pixel text-[11px] tracking-[0.06em] text-crt-ink">
              {row.player}
            </span>
            <span
              className={`relative z-[1] font-pixel text-[11px] ${
                rank?.text ?? "text-crt-ink"
              }`}
            >
              {formatHomeScore(row.score)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
