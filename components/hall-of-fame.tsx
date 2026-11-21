"use client";

import { useState, type CSSProperties } from "react";
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
            className="chip-neon py-3"
            style={
              {
                "--neon": game.color,
                "--neon-rgb": game.rgb.replaceAll(",", " "),
              } as CSSProperties
            }
          >
            {game.title}
          </button>
        ))}
      </div>

      {/* Las marcas propias no se guardan en este MVP: con sesión no hay marca aún. */}
      {user && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-2 border-neon-cyan bg-neon-cyan/[0.07] px-[18px] py-4 shadow-[0_0_22px_rgb(0_245_255/0.4)]">
          <span className="font-pixel text-[11px] text-neon-cyan [text-shadow:0_0_8px_#00f5ff]">
            TU MEJOR MARCA
          </span>
          <span className="font-pixel text-xs leading-[1.6] text-white">
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
          className={`grid ${COLUMNS} gap-3 px-4 pb-3 font-pixel text-[9px] text-ink-muted`}
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
            const color = medal?.color ?? "#e8f4ff";
            const glow = medal ? `0 0 10px ${medal.color}` : "none";
            return (
              <li
                key={row.name}
                className={`animate-row-in grid ${COLUMNS} items-center gap-3 border-2 px-4 py-3.5`}
                style={{
                  background: medal
                    ? `rgba(${medal.rgb},0.08)`
                    : "rgb(255 255 255 / 0.025)",
                  borderColor: medal?.color ?? "#242638",
                  boxShadow: medal ? `0 0 16px ${medal.color}66` : "none",
                  animationDelay: `${i * 70}ms`,
                }}
              >
                <span
                  className="font-pixel text-sm"
                  style={{ color, textShadow: glow }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-lg font-bold text-ink-bright">
                  {row.name}
                </span>
                <span
                  className="text-right font-pixel text-[13px]"
                  style={{ color, textShadow: glow }}
                >
                  {formatScore(row.score)}
                </span>
                <span className="hidden text-base text-ink-date min-[760px]:block">
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
