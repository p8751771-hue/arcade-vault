// Registro de los juegos jugables (spec 07). Es el único lugar que une un id de
// `lib/games.ts` con la lógica de su juego: `/juegos/[id]/jugar` y el motor no
// conocen ningún juego, y los juegos no se importan entre sí. Un id que no está
// aquí conserva el placeholder de la cabina.
import type { GameId } from "@/lib/games";
import { asteroides } from "./asteroides";
import type { GameFactory } from "./engine";

export const ARCADE_GAMES: Partial<Record<GameId, GameFactory>> = {
  asteroides,
};
