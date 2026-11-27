import type { GameId } from "@/lib/games";

// Tipos y formatos de las puntuaciones (spec 11). Las consultas a la tabla `scores`
// están en `lib/scores-data.ts` (solo servidor); este archivo lo usan también
// componentes de cliente.

export interface ScoreEntry {
  id: string;
  name: string; // player_name, p. ej. "ANA"
  score: number; // 12000
  date: string; // created_at, ISO 8601, p. ej. "2026-11-19T00:00:00.000Z"
  gameId: GameId;
  gameTitle: string; // para la columna "JUEGO" del ranking global
}

const scoreFormat = new Intl.NumberFormat("de-DE");

/** 12000 -> "12.000" */
export function formatScore(n: number): string {
  return scoreFormat.format(n);
}

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-11-19T00:00:00.000Z" -> "19/11/2026" */
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

/** Top 3 (ranking y salón). Spec 05: sin color de medalla; los tres primeros se marcan
 *  en negro (borde o barra más gruesos) y el resto en crt-line. Antes (spec 04):
 *  tonos de medalla oro, plata y bronce, que se leían como colores ajenos a la paleta. */
export const MEDALS = [
  { color: "var(--color-crt-ink)", rgb: "0,0,0" },
  { color: "var(--color-crt-ink)", rgb: "0,0,0" },
  { color: "var(--color-crt-ink)", rgb: "0,0,0" },
] as const;
