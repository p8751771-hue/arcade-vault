// Nombre del jugador recordado en este dispositivo (spec 11). Distinto de
// `av_user` (la sesión simulada): este valor es solo "el último nombre que
// escribiste al guardar una puntuación". Sin localStorage (modo privado, bloqueado)
// todo sigue funcionando y el nombre simplemente no se recuerda.
export const PLAYER_NAME_KEY = "av_player_name";
export const PLAYER_NAME_MAX = 14; // igual que el CHECK de `scores.player_name`

/** Mayúsculas y como máximo 14 caracteres, como los nombres de la sesión simulada. */
export function normalizePlayerName(raw: string): string {
  return raw.toUpperCase().slice(0, PLAYER_NAME_MAX);
}

/** El nombre recordado, o `null` si no hay ninguno o `localStorage` no está disponible. */
export function readPlayerName(): string | null {
  try {
    const value = window.localStorage.getItem(PLAYER_NAME_KEY);
    return value && value.trim() ? normalizePlayerName(value.trim()) : null;
  } catch {
    return null;
  }
}

/** Recuerda el nombre. Ignora cualquier error de almacenamiento. */
export function savePlayerName(name: string): void {
  try {
    window.localStorage.setItem(PLAYER_NAME_KEY, normalizePlayerName(name));
  } catch {
    // sin almacenamiento: el nombre no se recuerda
  }
}
