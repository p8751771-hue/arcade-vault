import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Con `cacheComponents` el shell se envía (200) antes de que `notFound()` corra
// dentro de la página. Aquí se comprueba el id antes de renderizar para que un
// juego inexistente devuelva un 404 real. Debe ser rápido.
//
// Spec 11: los ids salen de la tabla `games` (API REST de Supabase con la clave
// pública). Se guardan 60 s en memoria como optimización: Next avisa de que un
// proxy no debe depender de variables compartidas, así que la corrección no
// depende de la caché (si no existe, se vuelve a pedir). Si la consulta falla,
// se deja pasar la petición: la página llama a `notFound()` como segunda guarda.
const CACHE_MS = 60_000;
const TIMEOUT_MS = 1_500;

let cache: { ids: Set<string>; expires: number } | null = null;

async function knownGameIds(): Promise<Set<string> | null> {
  if (cache && cache.expires > Date.now()) return cache.ids;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  try {
    const response = await fetch(`${url}/rest/v1/games?select=id`, {
      headers: { apikey: key },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as { id: string }[];
    cache = {
      ids: new Set(rows.map((row) => row.id)),
      expires: Date.now() + CACHE_MS,
    };
    return cache.ids;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  // /juegos/:id o /juegos/:id/jugar (el matcher ya acota las rutas)
  const id = request.nextUrl.pathname.split("/")[2];
  const ids = await knownGameIds();
  if (ids === null || ids.has(id)) return NextResponse.next();

  // Reescribe a una ruta inexistente: Next sirve su página 404 con estado 404.
  return NextResponse.rewrite(new URL("/_not-found", request.url));
}

export const config = {
  matcher: ["/juegos/:id", "/juegos/:id/jugar"],
};
