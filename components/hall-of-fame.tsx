"use client";

import { useState } from "react";
import { useSession } from "@/components/session-provider";
import { GAMES, type GameId } from "@/lib/games";
import { MEDALS, formatDate, formatScore, getLeaderboard } from "@/lib/scores";

const COLUMNS =
  "grid-cols-[48px_minmax(0,1fr)_auto] min-[760px]:grid-cols-[90px_minmax(0,1fr)_170px_130px]";

export function HallOfFame() {
  const { user } = useSession();
  const [gameId, setGameId] = useState<GameId>(GAMES[0].id);
  const rows = getLeaderboard(gameId);

  return (
    <>
      <div
        role="tablist"
        aria-label="Juegos"
        className="mb-7 flex flex-wrap justify-center gap-2.5"
      >
        {GAMES.map((game) => (
          <button
            key={game.id}
            type="button"
            role="tab"
            id={`hall-tab-${game.id}`}
            aria-selected={gameId === game.id}
            aria-controls="hall-panel"
            onClick={() => setGameId(game.id)}
            className="chip-crt py-3"
          >
            {game.title}
          </button>
        ))}
      </div>

      {/* Las marcas propias no se guardan en este MVP: con sesión no hay marca aún. */}
      {user && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-2 border-crt-ink bg-crt-ink/[0.07] px-[18px] py-4">
          <span className="font-pixel text-[11px] text-crt-ink">
            TU MEJOR MARCA
          </span>
          <span className="font-pixel text-xs leading-[1.6] text-crt-ink">
            AÚN SIN MARCA EN ESTE JUEGO
          </span>
        </div>
      )}

      <div
        role="tabpanel"
        id="hall-panel"
        aria-labelledby={`hall-tab-${gameId}`}
      >
        <div
          className={`grid ${COLUMNS} gap-3 px-4 pb-3 font-pixel text-[9px] text-crt-ink-2`}
        >
          <span>RANGO</span>
          <span>JUGADOR</span>
          <span className="text-right">PUNTUACIÓN</span>
          <span className="hidden min-[760px]:block">FECHA</span>
        </div>

        {/* key = juego: al cambiar de pestaña las filas se remontan y la animación se reinicia */}
        <ol key={gameId} className="m-0 flex list-none flex-col gap-2 p-0">
          {rows.map((row, i) => {
            const medal = MEDALS[i];

            return (
              <li
                key={row.name}
                className={`animate-row-in grid ${COLUMNS} items-center gap-3 border-2 bg-crt-surface px-4 py-3.5`}
                style={{
                  // Spec 04: la medalla es el borde (≥ 3:1); el texto va en negro.
                  borderColor: medal?.color ?? "var(--color-crt-line)",
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <span className="font-pixel text-sm text-crt-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-lg font-bold text-crt-ink">
                  {row.name}
                </span>
                <span className="text-right font-pixel text-[13px] text-crt-ink">
                  {formatScore(row.score)}
                </span>
                <span className="hidden text-base text-crt-ink-2 min-[760px]:block">
                  {formatDate(row.date)}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
