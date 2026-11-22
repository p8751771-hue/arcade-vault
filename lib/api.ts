import type { GameId } from "@/lib/games";

// Stubs sin red: único punto de reemplazo cuando exista backend.

export async function login(user: string, password: string): Promise<{ name: string }> {
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

export async function submitScore(
  gameId: GameId,
  name: string,
  score: number,
  authed: boolean,
): Promise<true> {
  void gameId;
  void name;
  void score;
  void authed;
  return true;
}
