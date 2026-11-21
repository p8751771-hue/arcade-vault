import { GAMES, type GameId } from "@/lib/games";

export interface ScoreEntry {
  name: string; // "NEO_CYAN"
  score: number; // 12000
  date: string; // ISO 8601, p. ej. "2026-11-19T00:00:00.000Z"
}

// Fecha fija (no Date.now()) para que servidor y cliente rendericen lo mismo.
export const SEED_REFERENCE_DATE = "2026-11-21T00:00:00.000Z";

const PLAYERS = [
  "NEO_CYAN",
  "LUCIA88",
  "PIXELFOX",
  "MAXTURBO",
  "SOFIA.EXE",
  "ZENITH",
  "CARLOS_RX",
  "LOLA_ARCADE",
  "DON_JOYSTICK",
  "ELENA404",
] as const;

const DAY_MS = 864e5;

/** Top 10 semilla determinístico del juego, ordenado de mayor a menor. */
export function getLeaderboard(gameId: GameId): ScoreEntry[] {
  const gi = GAMES.findIndex((g) => g.id === gameId);
  if (gi === -1) return [];
  const { baseScore } = GAMES[gi];
  const reference = Date.parse(SEED_REFERENCE_DATE);

  return PLAYERS.map((_, i) => ({
    name: PLAYERS[(i + gi * 3) % 10],
    score: Math.round((baseScore * (1 - i * 0.085 - gi * 0.004)) / 10) * 10,
    date: new Date(reference - (2 + i * 4 + gi * 3) * DAY_MS).toISOString(),
  }));
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
