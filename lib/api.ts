import type { GameId } from "@/lib/games";
import { createClient } from "@/lib/supabase/client";

// `login` y `register` son stubs sin red (punto de reemplazo de la autenticación
// real, spec futuro). `submitScore` ya habla con Supabase (spec 11).

export async function login(
  user: string,
  password: string,
): Promise<{ name: string }> {
  void password;
  return { name: user };
}

export async function register(
  user: string,
  email: string,
  password: string,
): Promise<{ name: string }> {
  void email;
  void password;
  return { name: user };
}

/**
 * Guarda una puntuación en la tabla `scores` de Supabase (spec 11), desde el
 * navegador con la clave pública. `user_id` va siempre vacío: todavía no hay
 * autenticación real y la política de la base solo acepta filas sin usuario.
 * Lanza un Error si Supabase rechaza la fila o no responde.
 */
export async function submitScore(
  gameId: GameId,
  name: string,
  score: number,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("scores")
    .insert({ game_id: gameId, player_name: name, score });
  if (error)
    throw new Error(`No se pudo guardar la puntuación: ${error.message}`);
}
