// Tipos y constantes de interfaz de los juegos (spec 11). El catálogo vive en la
// tabla `games` de Supabase: se lee con `lib/games-data.ts` (solo servidor). Este
// archivo no importa nada de servidor porque lo usan componentes de cliente.

export type Category = "ARCADE" | "PUZLE" | "DISPAROS" | "LABERINTO"; // igual que el CHECK de la base

export type GameId = string; // `games.id`: el mismo id que `ARCADE_GAMES` y la URL

export interface Game {
  id: GameId;
  title: string; // "ASTEROIDES"
  category: Category;
  description: string; // texto corto de la tarjeta
  longDescription: string;
  controls: string;
}

export const CATEGORY_FILTERS = [
  "TODOS",
  "ARCADE",
  "PUZLE",
  "DISPAROS",
  "LABERINTO",
] as const satisfies readonly ["TODOS", ...Category[]];
