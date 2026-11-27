// Lectura del catálogo de juegos desde Supabase (spec 11). Solo servidor: usa el
// cliente de `lib/supabase/server.ts` (cookies), así que desde una página hay que
// llamarlo dentro de <Suspense> (cacheComponents). Lanza un Error si Supabase falla;
// la página lo captura y muestra un mensaje, nunca datos falsos.
import type { Category, Game } from "@/lib/games";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

const COLUMNS = "id, title, category, description, long_description, controls";

function toGame(
  row: Pick<
    Tables<"games">,
    | "id"
    | "title"
    | "category"
    | "description"
    | "long_description"
    | "controls"
  >,
): Game {
  return {
    id: row.id,
    title: row.title,
    category: row.category as Category, // validado por el CHECK de la base
    description: row.description,
    longDescription: row.long_description,
    controls: row.controls,
  };
}

/** Todos los juegos, en orden de alta. */
export async function getGames(): Promise<Game[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select(COLUMNS)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error)
    throw new Error(`No se pudieron leer los juegos: ${error.message}`);
  return data.map(toGame);
}

/** Un juego por id, o `null` si no existe. */
export async function getGame(id: string): Promise<Game | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`No se pudo leer el juego: ${error.message}`);
  return data ? toGame(data) : null;
}
