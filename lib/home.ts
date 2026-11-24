import type { GameId } from "@/lib/games";

// Datos de la landing (`/`). Textos, jugadores, puntuaciones y tiempos copiados
// de `references/home-about/home.jsx`. Son datos fijos de ejemplo: no leen
// `getLeaderboard` ni `Date.now()` (ver spec 02, "Decisiones").

export type HomeAccent = "cyan" | "yellow" | "magenta" | "green";

export interface Feature {
  icon: "gamepad" | "free" | "trophy" | "rocket";
  title: string; // "JUEGOS CLÁSICOS"
  description: string;
  accent: HomeAccent;
}

export interface HomeStat {
  value: string; // "12+"
  unit: string; // "JUEGOS"
  caption: string; // "Y CONTANDO"
}

export interface ActivityEntry {
  player: string; // "NEONFOX"
  gameId: GameId; // el título se lee de GAMES
  score: number; // 184220
  ago: string; // "hace 2 min"
  accent: HomeAccent;
}

export interface TopPlayer {
  rank: number; // 1..5
  player: string; // "NEONFOX"
  score: number; // 312840
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Plan {
  label: string;
  name: string;
  price: string;
  unit: string;
  tag: string;
  perks: readonly string[]; // con la marca ✔ al inicio, como la referencia
  foot: string;
}

// `es-ES` como la referencia (`toLocaleString("es-ES")`): 7820 sin separador,
// 184.220 con él. Un formateador fijo da el mismo texto en servidor y cliente.
const HOME_NUMBER = new Intl.NumberFormat("es-ES");
export const formatHomeScore = (n: number): string => HOME_NUMBER.format(n);

export const FEATURES: readonly Feature[] = [
  {
    icon: "gamepad",
    title: "JUEGOS CLÁSICOS",
    description:
      "Arkanoid, Tetris, Snake y muchos más. Los mejores arcades de todos los tiempos en un solo lugar.",
    accent: "cyan",
  },
  {
    icon: "free",
    title: "100% GRATIS",
    description:
      "Sin suscripciones, sin pagos ocultos. Todos los juegos disponibles de forma gratuita.",
    accent: "yellow",
  },
  {
    icon: "trophy",
    title: "LADDER BOARDS",
    description:
      "Compite con jugadores de todo el mundo. Escala el ranking y demuestra quién es el mejor.",
    accent: "magenta",
  },
  {
    icon: "rocket",
    title: "SIEMPRE CRECIENDO",
    description:
      "Agregamos nuevos juegos constantemente. Vuelve seguido, siempre habrá algo nuevo que jugar.",
    accent: "green",
  },
];

export const STATS: readonly HomeStat[] = [
  { value: "12+", unit: "JUEGOS", caption: "Y CONTANDO" },
  { value: "MILES", unit: "DE PARTIDAS", caption: "JUGADAS CADA DÍA" },
  { value: "GLOBAL", unit: "RANKING", caption: "COMPITE CON EL MUNDO" },
];

// Los juegos de la referencia se adaptan al catálogo real:
// Caída → tetris, Glotón → pacman, Invasores → invaders, Rocas → asteroids,
// Bloque Buster → arkanoid, Serpentina → snake, Ranaria → arkanoid (no hay juego de rana).
export const ACTIVITY: readonly ActivityEntry[] = [
  { player: "NEONFOX", gameId: "tetris", score: 184220, ago: "hace 2 min", accent: "magenta" },
  { player: "PX_KAI", gameId: "pacman", score: 96400, ago: "hace 5 min", accent: "yellow" },
  { player: "Z3R0COOL", gameId: "invaders", score: 54190, ago: "hace 8 min", accent: "green" },
  { player: "VAULT_07", gameId: "asteroids", score: 41200, ago: "hace 12 min", accent: "cyan" },
  { player: "GLITCHA", gameId: "arkanoid", score: 28450, ago: "hace 18 min", accent: "cyan" },
  { player: "ARKADYA", gameId: "snake", score: 7820, ago: "hace 24 min", accent: "green" },
  { player: "CYBER_LU", gameId: "arkanoid", score: 18900, ago: "hace 31 min", accent: "yellow" },
];

export const TOP_PLAYERS: readonly TopPlayer[] = [
  { rank: 1, player: "NEONFOX", score: 312840 },
  { rank: 2, player: "PX_KAI", score: 248110 },
  { rank: 3, player: "M00NRYU", score: 196720 },
  { rank: 4, player: "VAULT_07", score: 154300 },
  { rank: 5, player: "GLITCHA", score: 138900 },
];

export const PLAN: Plan = {
  label: "PLAN ÚNICO",
  name: "JUGADOR VAULT",
  price: "$0",
  unit: "/ SIEMPRE",
  tag: "SIN TRUCOS · SIN LETRA PEQUEÑA",
  perks: [
    "✔ Acceso a todos los juegos",
    "✔ Ranking global y salón de la fama",
    "✔ Sin anuncios entre partidas",
    "✔ Guarda tus puntuaciones",
    "✔ Nuevos juegos cada mes",
    "✔ Funciona en cualquier navegador",
  ],
  foot: "No pedimos tarjeta. Nunca lo haremos.",
};

export const FAQS: readonly Faq[] = [
  {
    question: "¿REALMENTE ES GRATIS?",
    answer:
      'Sí. Arcade Vault es un proyecto sin fines de lucro hecho por amor a los clásicos. No hay versión "premium" escondida.',
  },
  {
    question: "¿NECESITO CREAR CUENTA?",
    answer:
      "No. Puedes jugar como invitado. Si quieres guardar tu puntuación y aparecer en el ranking, regístrate en 10 segundos.",
  },
  {
    question: "¿CÓMO SOBREVIVEN SIN COBRAR?",
    answer:
      "Es un proyecto comunitario. Si te gusta, compártelo. Esa es toda la moneda que aceptamos.",
  },
];
