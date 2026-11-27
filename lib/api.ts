import type { GameId } from "@/lib/games";

// Stubs sin red: único punto de reemplazo cuando exista backend.

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

// Spec 11, paso 2: solo cambia la firma (sin `authed`: `user_id` siempre es nulo).
// El guardado real en Supabase llega en el paso 5.
export async function submitScore(
  gameId: GameId,
  name: string,
  score: number,
): Promise<void> {
  void gameId;
  void name;
  void score;
}
