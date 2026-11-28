// Motor genérico de los juegos de canvas (spec 07). Portado de `startGame` de
// `references/games.js`: bucle, teclado, pausa y destrucción. No conoce ningún
// juego concreto: cada juego es una función `GameFactory` que recibe un
// `GameContext` y devuelve `update` / `draw`.
//
// Dos canales, siempre en el mismo sentido:
//  - Canvas → React: el juego avisa con `GameHandlers` (puntuación, vidas, nivel
//    y fin de partida) y el motor avisa del tamaño del campo. Se llaman solo
//    cuando el valor cambia.
//  - React → Canvas: la aplicación manda con `RunningGame` (pausa, proporción de
//    la pantalla y destrucción).
//
// Spec 09: el campo lógico mide siempre 480 de alto; su ancho (480 a 853) sigue
// la proporción de la pantalla, pero solo en los juegos que implementan `resize`.

/** Altura lógica del campo; no cambia nunca. */
export const FIELD_HEIGHT = 480;
/** Ancho lógico mínimo: el cuadrado de la ventana. */
export const FIELD_MIN_WIDTH = 480;
/** Ancho lógico máximo: 16:9 sobre 480 de alto. */
export const FIELD_MAX_WIDTH = 853;

// `KeyA` / `KeyD` solo llegan a un juego con `wasdAsArrows === false` (spec 12);
// con el valor por defecto A y D siguen siendo flechas.
export type KeyCode =
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "ArrowDown"
  | "Space"
  | "KeyA"
  | "KeyD";

// Canvas → React: el juego notifica; la lógica del juego nunca toca React.
export interface GameHandlers {
  score(value: number): void;
  lives(value: number): void;
  level(value: number): void;
  over(finalScore: number): void;
  /** Tamaño lógico del campo. Lo llama el motor, no el juego. */
  field(width: number, height: number): void;
}

// Contexto que recibe cada juego. `W` y `H` son propiedades de este mismo
// objeto y el motor las actualiza: el juego debe leerlas siempre de aquí.
export interface GameContext {
  ctx: CanvasRenderingContext2D;
  /** Ancho lógico del campo; cambia si el juego implementa `resize`. */
  W: number;
  /** Alto lógico del campo; siempre `FIELD_HEIGHT`. */
  H: number;
  /** Familia tipográfica del sitio (Press Start 2P) para el HUD del canvas. */
  font: string;
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
  /**
   * Opcional. Si existe, el motor ensancha el campo a la proporción de la
   * pantalla y la llama con el tamaño nuevo, antes de dibujar el cuadro
   * siguiente. Sin ella el campo se queda cuadrado.
   */
  resize?(width: number, height: number): void;
  /**
   * Opcional, por defecto true: W A S D se tratan como flechas. Con false,
   * A y D llegan como "KeyA" / "KeyD" y W y S no hacen nada en ese juego.
   */
  wasdAsArrows?: boolean;
  /**
   * Opcional, por defecto false: con true, la cabina pausa la partida en
   * marcha al entrar o salir de pantalla completa (spec 12).
   */
  pauseOnScreenChange?: boolean;
}

export type GameFactory = (g: GameContext) => ArcadeGame;

// React → Canvas: lo que el componente recibe al arrancar y con lo que manda.
export interface RunningGame {
  setPaused(paused: boolean): void;
  /** Proporción ancho / alto de la pantalla en pantalla completa; 1 en ventana. */
  setScreenAspect(aspect: number): void;
  destroy(): void;
  /** Copia de `ArcadeGame.pauseOnScreenChange` (false si el juego no lo define). */
  readonly pauseOnScreenChange: boolean;
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

// Teclas que llegan con su propio código a un juego sin alias WASD.
const RAW_KEYS: ReadonlySet<string> = new Set<KeyCode>(["KeyA", "KeyD"]);

// Con una pestaña en segundo plano un cuadro puede durar segundos: se acota.
const MAX_DT = 0.05;

// Con `wasdAsArrows` (por defecto) W A S D se traducen a flechas. Sin alias,
// A y D llegan con su código y W y S no son teclas del juego.
function toKeyCode(code: string, wasdAsArrows: boolean): KeyCode | null {
  if (!wasdAsArrows) {
    if (RAW_KEYS.has(code)) return code as KeyCode;
    return GAME_KEYS.has(code) ? (code as KeyCode) : null;
  }
  const mapped = KEY_ALIASES[code] ?? code;
  return GAME_KEYS.has(mapped) ? (mapped as KeyCode) : null;
}

// Ancho lógico del campo para una proporción de pantalla: la altura es fija y el
// ancho se limita a [480, 853], así que una pantalla más ancha que 16:9 deja
// franjas y una más alta que ancha da el cuadrado.
function fieldWidthFor(aspect: number): number {
  const width = Math.round(FIELD_HEIGHT * aspect);
  return Math.min(FIELD_MAX_WIDTH, Math.max(FIELD_MIN_WIDTH, width));
}

// Los avisos a React solo salen cuando el valor cambia, para que el juego pueda
// llamarlos sin cuidado y el componente no se renderice a 60 cuadros por segundo.
function onChangeOnly(handlers: GameHandlers): GameHandlers {
  let score: number | undefined;
  let lives: number | undefined;
  let level: number | undefined;
  let fieldWidth: number | undefined;
  let fieldHeight: number | undefined;
  return {
    field(width, height) {
      if (width === fieldWidth && height === fieldHeight) return;
      fieldWidth = width;
      fieldHeight = height;
      handlers.field(width, height);
    },
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
  // Lo fija el juego al crearse (`ArcadeGame.wasdAsArrows`), antes de cualquier tecla.
  let wasdAsArrows = true;
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
    const code = toKeyCode(e.code, wasdAsArrows);
    if (!code) return;
    // Solo se captura el teclado con la partida en marcha: en pausa o con el
    // modal de fin abierto, flechas y Espacio vuelven a funcionar en los botones.
    if (!paused && !over) e.preventDefault();
    press(code);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const code = toKeyCode(e.code, wasdAsArrows);
    if (code) release(code);
  };
  // Si la ventana pierde el foco con una tecla pulsada, no llegará su keyup.
  const onBlur = () => {
    for (const code of Object.keys(keys) as KeyCode[]) keys[code] = false;
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  const notify = onChangeOnly(handlers);
  // Un solo objeto: el motor cambia `W` aquí y el juego lo ve en su siguiente uso.
  const context: GameContext = {
    ctx,
    W: canvas.width,
    H: FIELD_HEIGHT,
    // next/font define la variable CSS en <html>; un canvas no la resuelve solo.
    font:
      getComputedStyle(canvas).getPropertyValue("--font-press-start").trim() ||
      "monospace",
    keys,
    hit: (code) => pressed.includes(code),
    handlers: notify,
    end(finalScore) {
      if (over) return;
      over = true;
      handlers.over(finalScore);
    },
  };
  const game = factory(context);
  wasdAsArrows = game.wasdAsArrows ?? true;
  notify.field(context.W, context.H);

  // Proporción pedida por React; se aplica al inicio del siguiente cuadro.
  let pendingAspect: number | null = null;
  const applyAspect = () => {
    if (pendingAspect === null) return;
    const width = fieldWidthFor(pendingAspect);
    pendingAspect = null;
    // Solo los juegos que implementan `resize` admiten un campo ancho.
    if (!game.resize || width === context.W) return;
    // Cambiar `canvas.width` borra el lienzo; el cuadro siguiente lo redibuja.
    canvas.width = width;
    context.W = width;
    game.resize(width, context.H);
    notify.field(width, context.H);
  };

  const tick = (t: number) => {
    if (dead) return;
    const dt = Math.min(MAX_DT, (t - last) / 1000);
    last = t;
    applyAspect();
    if (!paused && !over) game.update(dt);
    pressed = [];
    game.draw();
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    pauseOnScreenChange: game.pauseOnScreenChange ?? false,
    setPaused(value) {
      paused = value;
    },
    setScreenAspect(aspect) {
      if (Number.isFinite(aspect) && aspect > 0) pendingAspect = aspect;
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
