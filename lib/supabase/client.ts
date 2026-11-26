import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para el navegador (componentes "use client").
 * Crea uno por llamada; no se guarda en una variable de módulo.
 *
 * Las variables se leen literalmente (`process.env.NEXT_PUBLIC_…`) porque
 * Next.js solo las sustituye en el navegador cuando la referencia es literal.
 */
export function createClient() {
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

  return createBrowserClient(url, publishableKey);
}
