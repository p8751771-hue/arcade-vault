// Datos estáticos de "Acerca de", copiados literalmente de
// references/home-about/about.jsx.

export type HighlightIcon = "heart" | "browser" | "plant";
export type AboutAccent = "magenta" | "cyan" | "green";

export interface Highlight {
  icon: HighlightIcon;
  text: string;
  accent: AboutAccent;
}

export interface ContactTip {
  text: string;
  led: "green" | "yellow" | "magenta";
}

export const ABOUT_MISSION =
  "ARCADE VAULT nació del amor por los videojuegos clásicos. Nuestra misión es preservar y celebrar los arcades que definieron una generación, haciéndolos accesibles para todos, en cualquier lugar y sin costo.";

export const HIGHLIGHTS: readonly Highlight[] = [
  { icon: "heart", text: "HECHO CON \u2665\uFE0E PARA JUGADORES", accent: "magenta" },
  { icon: "browser", text: "JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR", accent: "cyan" },
  { icon: "plant", text: "PROYECTO EN CONSTANTE CRECIMIENTO", accent: "green" },
];

export const CONTACT_TIPS: readonly ContactTip[] = [
  { text: "RESPUESTA EN 24-48H", led: "green" },
  { text: "SUGERENCIAS BIENVENIDAS", led: "yellow" },
  { text: "SIN SPAM, JAMÁS", led: "magenta" },
];
