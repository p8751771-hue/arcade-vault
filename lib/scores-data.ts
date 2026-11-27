// Lectura de las puntuaciones desde Supabase (spec 11). Solo servidor, igual que
// `lib/games-data.ts`: llamar dentro de <Suspense> y capturar el Error que lanza
// si Supabase falla. Orden: mayor puntuación primero; en empate gana quien llegó antes.
import type { GameId } from "@/lib/games";
import type { ScoreEntry } from "@/lib/scores";
import { createClient } from "@/lib/supabase/server";

export const TOP_LIMIT = 10;

/** Top de puntuaciones de un juego, o de todos los juegos si `gameId` es `null`. */
export async function getTopScores(
  gameId: GameId | null,
  limit: number = TOP_LIMIT,
): Promise<ScoreEntry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("scores")
    .select("id, game_id, player_name, score, created_at, games(title)")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);
  if (gameId !== null) query = query.eq("game_id", gameId);

  const { data, error } = await query;
  if (error)
    throw new Error(`No se pudieron leer las puntuaciones: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    name: row.player_name,
    score: row.score,
    date: row.created_at,
    gameId: row.game_id,
    gameTitle: row.games?.title ?? row.game_id,
  }));
}

/** Mejor puntuación de un juego, o `null` si todavía no hay ninguna. */
export async function getBestScore(gameId: GameId): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scores")
    .select("score")
    .eq("game_id", gameId)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error)
    throw new Error(`No se pudo leer la mejor puntuación: ${error.message}`);
  return data?.score ?? null;
}
