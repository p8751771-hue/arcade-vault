import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GAMES } from "@/lib/games";

// Con `cacheComponents` el shell se envía (200) antes de que `notFound()` corra
// dentro de la página. Aquí se comprueba el id antes de renderizar para que un
// juego inexistente devuelva un 404 real. Debe ser rápido: solo compara el id.
const GAME_IDS = new Set<string>(GAMES.map((game) => game.id));

export function proxy(request: NextRequest) {
  // /juegos/:id o /juegos/:id/jugar (el matcher ya acota las rutas)
  const id = request.nextUrl.pathname.split("/")[2];
  if (GAME_IDS.has(id)) return NextResponse.next();

  // Reescribe a una ruta inexistente: Next sirve su página 404 con estado 404.
  return NextResponse.rewrite(new URL("/_not-found", request.url));
}

export const config = {
  matcher: ["/juegos/:id", "/juegos/:id/jugar"],
};
