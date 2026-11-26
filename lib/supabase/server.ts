import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para el servidor (Server Components y Route Handlers).
 * Crea uno por petición: depende de las cookies de esa petición, así que
 * nunca se comparte ni se guarda en una variable de módulo.
 *
 * `cookies()` es dinámico: con `cacheComponents` hay que usar este cliente
 * dentro de `<Suspense>` cuando se llama desde una página.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!publishableKey) {
    throw new Error(
      "Falta la variable de entorno NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // En un Server Component no se pueden escribir cookies. Se ignora:
          // el refresco de la sesión lo hará proxy.ts cuando exista auth.
        }
      },
    },
  });
}
