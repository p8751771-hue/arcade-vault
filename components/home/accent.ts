import type { HomeAccent } from "@/lib/home";

// Spec 04: la paleta de televisor es monocroma. Los acentos de los datos
// (cyan, magenta, yellow, green) se conservan en lib/home.ts sin uso visual y
// todos se pintan con el texto de la paleta. Antes eran neones con resplandor.
export const NEON_TEXT: Record<HomeAccent, string> = {
  cyan: "text-crt-ink",
  magenta: "text-crt-ink",
  yellow: "text-crt-ink",
  green: "text-crt-ink",
};

// Color plano del acento (tarjetas de ventajas: el borde del hover usa currentColor).
export const ACCENT_COLOR: Record<HomeAccent, string> = NEON_TEXT;
