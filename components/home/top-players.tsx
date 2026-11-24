import { TOP_PLAYERS, formatHomeScore } from "@/lib/home";

// Colores de rango de la landing (oro/plata/bronce propios, distintos del spec 01) y
// degradado de fondo de cada fila.
const RANK = [
  {
    text: "text-home-gold [text-shadow:0_0_6px_rgb(255_207_58/0.6)]",
    bg: "before:bg-[linear-gradient(90deg,rgb(255_207_58/0.14),transparent)]",
  },
  {
    text: "text-home-silver",
    bg: "before:bg-[linear-gradient(90deg,rgb(199_208_224/0.10),transparent)]",
  },
  {
    text: "text-home-bronze",
    bg: "before:bg-[linear-gradient(90deg,rgb(217_122_58/0.10),transparent)]",
  },
] as const;

const DEFAULT_BG = "before:bg-[linear-gradient(90deg,rgb(0_245_255/0.06),transparent)]";

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
              className={`relative z-[1] font-pixel text-[10px] ${rank?.text ?? "text-home-faint"}`}
            >
              #{String(row.rank).padStart(2, "0")}
            </span>
            <span className="absolute" aria-hidden="true">
              <span data-bar style={{ width: `${100 - i * 16}%` }} />
            </span>
            <span className="relative z-[1] font-pixel text-[11px] tracking-[0.06em] text-home-ink">
              {row.player}
            </span>
            <span
              className={`relative z-[1] font-pixel text-[11px] ${
                rank?.text ?? "text-neon-cyan [text-shadow:0_0_6px_rgb(0_245_255/0.4)]"
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
