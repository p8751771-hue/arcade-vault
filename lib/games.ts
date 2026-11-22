export type GameId =
  | "arkanoid"
  | "tetris"
  | "snake"
  | "pacman"
  | "invaders"
  | "asteroids";

export type Category = "ARCADE" | "PUZLE" | "DISPAROS" | "LABERINTO";

export interface Game {
  id: GameId;
  title: string; // "SPACE INVADERS"
  category: Category;
  color: string; // "#ff006e" (neón del juego)
  rgb: string; // "255,0,110" (para glows)
  baseScore: number; // base del ranking semilla
  description: string; // texto corto de la tarjeta
  longDescription: string;
  controls: string;
}

export const GAMES: readonly Game[] = [
  {
    id: "arkanoid",
    title: "ARKANOID",
    category: "ARCADE",
    color: "#00f5ff",
    rgb: "0,245,255",
    baseScore: 12000,
    description: "Rompe todos los ladrillos con tu pala sin dejar caer la bola.",
    longDescription:
      "Controla la pala y haz rebotar la bola de energía para destruir el muro de ladrillos neón. Cada nivel acelera la bola un poco más. Apunta con el borde de la pala para cambiar el ángulo de rebote.",
    controls:
      "← → o ratón / dedo: mover la pala · ESPACIO o toque: lanzar la bola",
  },
  {
    id: "tetris",
    title: "TETRIS",
    category: "PUZLE",
    color: "#ff006e",
    rgb: "255,0,110",
    baseScore: 85000,
    description: "Encaja las piezas y completa líneas antes de llegar arriba.",
    longDescription:
      "Las piezas caen sin parar: gíralas, muévelas y encájalas para completar líneas. Cuantas más líneas elimines a la vez, más puntos consigues. Cada diez líneas la caída se acelera.",
    controls: "← →: mover · ↑: girar · ↓: bajar rápido · ESPACIO: caída instantánea",
  },
  {
    id: "snake",
    title: "SNAKE",
    category: "ARCADE",
    color: "#f5ff00",
    rgb: "245,255,0",
    baseScore: 1800,
    description: "Come, crece y esquiva tu propia cola en un tablero cerrado.",
    longDescription:
      "Guía a la serpiente para comer los puntos magenta y crecer sin chocar con las paredes ni contigo misma. Cada cinco bocados subes de nivel y ganas velocidad. Tienes tres vidas.",
    controls: "← ↑ ↓ → o WASD: cambiar de dirección",
  },
  {
    id: "pacman",
    title: "PAC-MAN",
    category: "LABERINTO",
    color: "#f5ff00",
    rgb: "245,255,0",
    baseScore: 9000,
    description: "Devora los puntos del laberinto y huye de los fantasmas.",
    longDescription:
      "Recorre el laberinto comiendo todos los puntos mientras los fantasmas te persiguen. Las bolas grandes te dan poder para devorarlos durante unos segundos. Limpia el tablero para pasar de nivel.",
    controls: "← ↑ ↓ → o WASD: elegir dirección",
  },
  {
    id: "invaders",
    title: "SPACE INVADERS",
    category: "DISPAROS",
    color: "#ff006e",
    rgb: "255,0,110",
    baseScore: 4500,
    description: "Defiende la Tierra de la invasión con tu cañón láser.",
    longDescription:
      "Una formación alienígena desciende hacia tu base cada vez más rápido. Dispara con precisión y esquiva sus proyectiles. Si llegan al suelo, la partida termina.",
    controls: "← → o A D: mover · ESPACIO: disparar",
  },
  {
    id: "asteroids",
    title: "ASTEROIDS",
    category: "DISPAROS",
    color: "#00f5ff",
    rgb: "0,245,255",
    baseScore: 6000,
    description: "Pilota tu nave y destruye asteroides en el espacio profundo.",
    longDescription:
      "Gira, acelera y dispara en un campo de asteroides sin bordes. Al ser alcanzados, los más grandes se parten en fragmentos más rápidos. Sobrevive a cada oleada con tus tres vidas.",
    controls: "← →: girar · ↑: propulsor · ESPACIO: disparar",
  },
];

export const CATEGORY_FILTERS = [
  "TODOS",
  "ARCADE",
  "PUZLE",
  "DISPAROS",
  "LABERINTO",
] as const satisfies readonly ["TODOS", ...Category[]];
