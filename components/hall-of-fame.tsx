"use client";

import { useState } from "react";
import { EmptyRanking } from "@/components/data-states";
import { useSession } from "@/components/session-provider";
import type { Game, GameId } from "@/lib/games";
import { MEDALS, formatDate, formatScore, type ScoreEntry } from "@/lib/scores";

// Spec 11: GLOBAL (todas las puntuaciones de todos los juegos, con la columna
// del juego) y una pestaña por cada juego de la tabla `games`.
const GLOBAL = "global";
type Tab = typeof GLOBAL | GameId;

const COLUMNS =
  "grid-cols-[48px_minmax(0,1fr)_auto] min-[760px]:grid-cols-[90px_minmax(0,1fr)_170px_130px]";
const COLUMNS_GLOBAL =
  "grid-cols-[48px_minmax(0,1fr)_auto] min-[760px]:grid-cols-[90px_minmax(0,1fr)_minmax(0,150px)_150px_110px]";

interface HallOfFameProps {
  games: Game[];
  global: ScoreEntry[];
  scoresByGame: Record<GameId, ScoreEntry[]>;
}

export function HallOfFame({ games, global, scoresByGame }: HallOfFameProps) {
  const { user } = useSession();
  const [tab, setTab] = useState<Tab>(GLOBAL);
  const isGlobal = tab === GLOBAL;
  const rows = isGlobal ? global : (scoresByGame[tab] ?? []);
  const columns = isGlobal ? COLUMNS_GLOBAL : COLUMNS;

  return (
    <>
      <div
        role="tablist"
        aria-label="Rankings"
        className="mb-7 flex flex-wrap justify-center gap-2.5"
      >
        <button
          type="button"
          role="tab"
          id={`hall-tab-${GLOBAL}`}
          aria-selected={isGlobal}
          aria-controls="hall-panel"
          onClick={() => setTab(GLOBAL)}
          className="chip-crt py-3"
        >
          GLOBAL
        </button>
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            role="tab"
            id={`hall-tab-${game.id}`}
            aria-selected={tab === game.id}
            aria-controls="hall-panel"
            onClick={() => setTab(game.id)}
            className="chip-crt py-3"
          >
            {game.title}
          </button>
        ))}
      </div>

      {/* Las marcas propias no se guardan en este MVP: con sesión no hay marca aún. */}
      {user && !isGlobal && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-2 border-crt-ink bg-crt-ink/[0.07] px-[18px] py-4">
          <span className="font-pixel text-[11px] text-crt-ink">
            TU MEJOR MARCA
          </span>
          <span className="font-pixel text-xs leading-[1.6] text-crt-ink">
            AÚN SIN MARCA EN ESTE JUEGO
          </span>
        </div>
      )}

      <div role="tabpanel" id="hall-panel" aria-labelledby={`hall-tab-${tab}`}>
        {rows.length === 0 ? (
          <EmptyRanking />
        ) : (
          <>
            <div
              className={`grid ${columns} gap-3 px-4 pb-3 font-pixel text-[9px] text-crt-ink-2`}
            >
              <span>RANGO</span>
              <span>JUGADOR</span>
              {isGlobal && (
                <span className="hidden min-[760px]:block">JUEGO</span>
              )}
              <span className="text-right">PUNTUACIÓN</span>
              <span className="hidden min-[760px]:block">FECHA</span>
            </div>

            {/* key = pestaña: al cambiar las filas se remontan y la animación se reinicia */}
            <ol key={tab} className="m-0 flex list-none flex-col gap-2 p-0">
              {rows.map((row, i) => {
                const medal = MEDALS[i];

                return (
                  <li
                    key={row.id}
                    // Spec 05: top 3 con borde negro de 3 px (el relleno baja 1 px por lado para
                    // que la fila mida lo mismo); el resto, borde crt-line de 2 px.
                    className={`animate-row-in grid ${columns} items-center gap-3 bg-crt-surface ${
                      medal
                        ? "border-[3px] px-[15px] py-[13px]"
                        : "border-2 border-crt-line px-4 py-3.5"
                    }`}
                    style={{
                      borderColor: medal?.color,
                      animationDelay: `${i * 70}ms`,
                    }}
                  >
                    <span className="font-pixel text-sm text-crt-ink">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-lg font-bold text-crt-ink">
                        {row.name}
                      </span>
                      {/* En pantallas estrechas el juego va bajo el nombre. */}
                      {isGlobal && (
                        <span className="truncate text-[13px] text-crt-ink-2 min-[760px]:hidden">
                          {row.gameTitle}
                        </span>
                      )}
                    </span>
                    {isGlobal && (
                      <span className="hidden truncate font-pixel text-[10px] text-crt-ink min-[760px]:block">
                        {row.gameTitle}
                      </span>
                    )}
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
          </>
        )}
      </div>
    </>
  );
}
