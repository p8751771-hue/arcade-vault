"use client";

import { useState } from "react";
import { GameCard } from "@/components/game-card";
import { CATEGORY_FILTERS, type Game } from "@/lib/games";

export interface LibraryEntry {
  game: Game;
  best: string; // mejor puntuación ya formateada
}

// Sin mayúsculas ni acentos: "PUZLE" == "puzle", "Laberínto" == "laberinto".
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function GameLibrary({ entries }: { entries: LibraryEntry[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]>("TODOS");

  const q = normalize(query.trim());
  const visible = entries.filter(
    ({ game }) =>
      (category === "TODOS" || game.category === category) &&
      (!q || normalize(`${game.title} ${game.category} ${game.description}`).includes(q)),
  );

  return (
    <>
      <div className="mb-8 flex flex-col gap-4">
        <label className="panel-crt mx-auto flex w-full max-w-[640px] items-center gap-3 px-4">
          <span aria-hidden="true" className="font-pixel text-xs text-neon-cyan">
            &gt;
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar juego por nombre o categoría..."
            aria-label="Buscar juego por nombre o categoría"
            className="min-w-0 flex-1 appearance-none border-0 bg-transparent py-4 text-lg leading-[normal] text-ink-bright outline-none placeholder:text-ink-muted"
          />
        </label>

        <div className="flex flex-wrap justify-center gap-2.5">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c}
              type="button"
              className="chip-crt"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-7">
        {visible.map(({ game, best }) => (
          <GameCard key={game.id} game={game} best={best} />
        ))}
      </div>

      {visible.length === 0 && (
        <div
          role="status"
          className="px-5 py-[60px] text-center font-pixel text-[13px] leading-[2] text-neon-pink [text-shadow:0_0_10px_#ff006e]"
        >
          NO SE ENCONTRARON JUEGOS
          <br />
          <span className="text-[10px] text-ink-muted [text-shadow:none]">
            Prueba con otro nombre o categoría.
          </span>
        </div>
      )}
    </>
  );
}
