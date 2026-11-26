// Motor genérico de los juegos de canvas (spec 07). Portado de `startGame` de
// `references/games.js`: bucle, teclado, pausa y destrucción. No conoce ningún
// juego concreto: cada juego es una función `GameFactory` que recibe un
// `GameContext` y devuelve `update` / `draw`.
//
// Dos canales, siempre en el mismo sentido:
//  - Canvas → React: el juego avisa con `GameHandlers` (puntuación, vidas, nivel
//    y fin de partida). Se llaman solo cuando el valor cambia.
//  - React → Canvas: la aplicación manda con `RunningGame` (pausa, botonera
//    táctil y destrucción).

export type KeyCode =
  "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Space";

// Canvas → React: el juego notifica; la lógica del juego nunca toca React.
export interface GameHandlers {
  score(value: number): void;
  lives(value: number): void;
  level(value: number): void;
  over(finalScore: number): void;
}

// Contexto que recibe cada juego.
export interface GameContext {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  /** Teclas mantenidas ahora mismo. */
  keys: Partial<Record<KeyCode, boolean>>;
  /** ¿Se pulsó `code` en este cuadro? (sin repetición al mantenerla) */
  hit(code: KeyCode): boolean;
  handlers: GameHandlers;
  /** Termina la partida y avisa a React con la puntuación final. */
  end(finalScore: number): void;
}

// Lo que implementa cada juego.
export interface ArcadeGame {
  /** `dt` en segundos (acotado a 0,05). */
  update(dt: number): void;
  draw(): void;
}

export type GameFactory = (g: GameContext) => ArcadeGame;

// React → Canvas: lo que el componente recibe al arrancar y con lo que manda.
export interface RunningGame {
  setPaused(paused: boolean): void;
  /** Botonera táctil: equivale a pulsar / soltar la tecla. */
  setKey(code: KeyCode, down: boolean): void;
  destroy(): void;
}

// W A S D se tratan como flechas.
const KEY_ALIASES: Partial<Record<string, KeyCode>> = {
  KeyW: "ArrowUp",
  KeyA: "ArrowLeft",
  KeyS: "ArrowDown",
  KeyD: "ArrowRight",
};

const GAME_KEYS: ReadonlySet<string> = new Set<KeyCode>([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
]);

// Con una pestaña en segundo plano un cuadro puede durar segundos: se acota.
const MAX_DT = 0.05;

function toKeyCode(code: string): KeyCode | null {
  const mapped = KEY_ALIASES[code] ?? code;
  return GAME_KEYS.has(mapped) ? (mapped as KeyCode) : null;
}

// Los avisos a React solo salen cuando el valor cambia, para que el juego pueda
// llamarlos sin cuidado y el componente no se renderice a 60 cuadros por segundo.
function onChangeOnly(handlers: GameHandlers): GameHandlers {
  let score: number | undefined;
  let lives: number | undefined;
  let level: number | undefined;
  return {
    score(value) {
      if (value === score) return;
      score = value;
      handlers.score(value);
    },
    lives(value) {
      if (value === lives) return;
      lives = value;
      handlers.lives(value);
    },
    level(value) {
      if (value === level) return;
      level = value;
      handlers.level(value);
    },
    over: (finalScore) => handlers.over(finalScore),
  };
}

export function startGame(
  factory: GameFactory,
  canvas: HTMLCanvasElement,
  handlers: GameHandlers,
): RunningGame {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto 2D del canvas.");

  const keys: Partial<Record<KeyCode, boolean>> = {};
  let pressed: KeyCode[] = []; // pulsadas desde el cuadro anterior
  let paused = false;
  let over = false;
  let dead = false;
  let raf = 0;
  let last = performance.now();

  const press = (code: KeyCode) => {
    if (!keys[code]) pressed.push(code);
    keys[code] = true;
  };
  const release = (code: KeyCode) => {
    keys[code] = false;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const code = toKeyCode(e.code);
    if (!code) return;
    // Solo se captura el teclado con la partida en marcha: en pausa o con el
    // modal de fin abierto, flechas y Espacio vuelven a funcionar en los botones.
    if (!paused && !over) e.preventDefault();
    press(code);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const code = toKeyCode(e.code);
    if (code) release(code);
  };
  // Si la ventana pierde el foco con una tecla pulsada, no llegará su keyup.
  const onBlur = () => {
    for (const code of Object.keys(keys) as KeyCode[]) keys[code] = false;
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  const game = factory({
    ctx,
    W: canvas.width,
    H: canvas.height,
    keys,
    hit: (code) => pressed.includes(code),
    handlers: onChangeOnly(handlers),
    end(finalScore) {
      if (over) return;
      over = true;
      handlers.over(finalScore);
    },
  });

  const tick = (t: number) => {
    if (dead) return;
    const dt = Math.min(MAX_DT, (t - last) / 1000);
    last = t;
    if (!paused && !over) game.update(dt);
    pressed = [];
    game.draw();
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    setPaused(value) {
      paused = value;
    },
    setKey(code, down) {
      if (down) press(code);
      else release(code);
    },
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    },
  };
}
