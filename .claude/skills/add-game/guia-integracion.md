# Guía de integración de un juego en Arcade Vault

Contrato técnico para añadir un juego jugable con leaderboard. Sale de lo que hicieron el spec 07 (Asteroides, motor) y el spec 11 (tablas `games` / `scores`). Lo usa `/add-game` para escribir el spec y `/spec-impl` para implementarlo. Si el código y esta guía no coinciden, manda el código: corrige la guía en el mismo spec.

---

## 1. Piezas de un juego nuevo

Un juego es jugable cuando existe **su fila en `games`** y **su entrada en `ARCADE_GAMES`**. Sin la entrada, la cabina muestra el placeholder y no se guarda nada.

| Pieza                     | Archivo                                                 | Qué lleva                                                                                                                                       |
| ------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Lógica y dibujo           | `lib/arcade/<id>.ts`                                    | `export const <id>: GameFactory`. No importa nada de otros juegos; solo tipos de `./engine`.                                                    |
| Registro                  | `lib/arcade/index.ts`                                   | `import { <id> } from "./<id>";` y la clave en `ARCADE_GAMES`. Es el único sitio que une ids con juegos.                                        |
| Portada                   | `components/game-cover.tsx`                             | Una rama `if (id === "<id>")` en `drawCover`. Sin ella, la portada es un fondo neutro.                                                          |
| Fila del catálogo         | `supabase/migrations/<AAAAMMDDhhmmss>_juego_<id>.sql`   | `insert into public.games (...)`. Se aplica con el MCP de Supabase (`apply_migration`).                                                        |
| Documentación             | `CLAUDE.md`                                             | Mencionar el juego (resumen del proyecto, `ARCADE_GAMES`, rutas) y el número de spec.                                                           |

### Lo que ya es genérico y NO se toca

- `proxy.ts`: lee los ids de `games` (caché 60 s), así que `/juegos/<id>` y `/juegos/<id>/jugar` dejan de dar 404 en cuanto existe la fila.
- `lib/games-data.ts` (`getGames`, `getGame`) y `lib/scores-data.ts` (`getTopScores(gameId | null)`, `getBestScore`).
- `/biblioteca` (tarjeta y "mejor puntuación"), `/juegos/[id]` (detalle y top 10), `/salon-de-la-fama` (una pestaña por fila de `games`, además de GLOBAL) y la landing ("JUEGOS DISPONIBLES AHORA").
- El guardado: `components/play-screen.tsx` llama a `submitScore(game.id, name, finalScore)` (`lib/api.ts`) cuando el juego tiene `factory`. El modal, el nombre recordado (`lib/player-name.ts`) y los estados son comunes.
- `lib/supabase/database.types.ts`: solo se regenera (MCP `generate_typescript_types`) si cambia el **esquema**. Insertar una fila no lo cambia.
- La cabina, el HUD de React, PAUSA / P, pantalla completa / F, el imán (spec 10) y "JUGAR DE NUEVO": no saben qué juego corre.

---

## 2. Contrato del motor (`lib/arcade/engine.ts`)

```ts
interface GameContext {
  ctx: CanvasRenderingContext2D;
  W: number; // ancho lógico (480; hasta 853 si el juego implementa resize)
  H: number; // alto lógico, siempre 480 (FIELD_HEIGHT)
  font: string; // Press Start 2P, para el HUD del canvas
  keys: Partial<Record<KeyCode, boolean>>; // teclas mantenidas
  hit(code: KeyCode): boolean; // pulsada en este cuadro (sin repetición)
  handlers: GameHandlers; // score / lives / level / over (+ field, del motor)
  end(finalScore: number): void; // fin de partida → modal de React
}
interface ArcadeGame {
  update(dt: number): void; // dt en segundos, acotado a 0,05
  draw(): void; // se llama en cada cuadro, también en pausa
  resize?(width: number, height: number): void; // opt-in: campo panorámico
  wasdAsArrows?: boolean; // por defecto true; false: A / D llegan como KeyA / KeyD y W / S no hacen nada (spec 12)
  pauseOnScreenChange?: boolean; // por defecto false; true: la cabina pausa al entrar o salir de pantalla completa (spec 12)
}
type KeyCode =
  | "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Space"
  | "KeyA" | "KeyD"; // solo con wasdAsArrows === false (spec 12)
```

Reglas:

- **Lee siempre `g.W` y `g.H`**; no los copies a una variable (cambian con `resize`).
- **Avisa al empezar** con `handlers.score(0)`, `handlers.lives(n)` y `handlers.level(1)`, y otra vez **en cada cambio**. El motor filtra los repetidos, así que se puede llamar sin miedo.
- **Fin:** `g.end(score)` una vez y `return` del `update`. El motor deja de llamar a `update` y avisa a React.
- **Pausa:** la gestiona la aplicación con `setPaused`. El juego no lee `P` ni tiene botón de pausa. Con `pauseOnScreenChange: true`, la cabina pausa la partida en marcha al entrar o salir de pantalla completa (botón, `F` o `Esc`); ejemplo: `bloques`.
- **Teclado:** `W A S D` son alias de las flechas por defecto. Con `wasdAsArrows: false`, `A` y `D` llegan como `"KeyA"` / `"KeyD"` y `W` / `S` se ignoran (ejemplo: `bloques`, que gira con A y D). El motor solo hace `preventDefault` mientras la partida corre.
- **Sin estado global de módulo:** todo el estado vive dentro del factory, porque "JUGAR DE NUEVO" crea otro.
- **Sin asignaciones innecesarias por cuadro** (meta futura: Raspberry Pi).

### Esqueleto (orden de `lib/arcade/asteroides.ts`)

```ts
// <Título> (spec NN). Lógica portada de `<fuente>`; el dibujo usa la paleta CRT.
import type { GameFactory } from "./engine";

const INK = "#000000"; // figuras, texto del HUD
const LINE = "#2f3b34"; // detalle secundario (crt-line)
const SCREEN = "#6e8677"; // fondo (crt-well), igual que la pantalla de la cabina
const HUD = { margin: 12, textY: 22, fontPx: 12 };

export const <id>: GameFactory = (g) => {
  const { ctx, handlers } = g;
  let score = 0;
  let lives = 3;
  let level = 1;
  // …estado propio del juego…

  handlers.score(score);
  handlers.lives(lives);
  handlers.level(level);

  return {
    update(dt) {
      // reglas; al cambiar algo: handlers.score(score) / lives / level
      // al perder: g.end(score); return;
    },
    draw() {
      ctx.fillStyle = SCREEN;
      ctx.fillRect(0, 0, g.W, g.H);
      // …figuras en INK / LINE…
      ctx.fillStyle = INK;
      ctx.font = `${HUD.fontPx}px ${g.font}`;
      ctx.textAlign = "left";
      ctx.fillText(score.toLocaleString("de-DE"), HUD.margin, HUD.textY);
      ctx.textAlign = "right";
      ctx.fillText(`NIVEL ${level}`, g.W - HUD.margin, HUD.textY);
      // vidas: iconos pequeños bajo la puntuación (y ≈ 44, separados 18 px)
    },
  };
};
```

---

## 3. Portar desde una referencia

Fuentes: `references/started-games/<carpeta>/game.js` o una función de `references/games.js` (`function snake(G)`, …). Se porta la **lógica**; el **dibujo** se rehace con la paleta.

| En la referencia                                   | En el juego TS                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `const {ctx, W, H, h} = G`                         | `const { ctx, handlers } = g` y `g.W` / `g.H` leídos cada vez                     |
| `h.score(v)` / `h.lives(v)` / `h.level(v)`         | `handlers.score(v)` / `handlers.lives(v)` / `handlers.level(v)`                   |
| `G.end(score)`                                     | `g.end(score)`                                                                    |
| `G.keys.ArrowLeft`, `G.hit('Space')`               | `g.keys.ArrowLeft`, `g.hit("Space")`                                              |
| `G.q` (cola **ordenada** de pulsaciones)           | **Hueco del motor** (ver §5)                                                      |
| `canvas.addEventListener(...)` (ratón / puntero)   | **Hueco del motor** (ver §5): sin `destroy` del juego, los listeners se quedan    |
| `h.lives('—')` (juego sin vidas)                   | **Hueco del motor** (ver §5)                                                      |
| `glow(x, c, b)`, `shadowBlur`, `shadowColor`       | Se eliminan. Color fijo de la paleta.                                             |
| `clear(x, W, H)` (`#05050b`)                       | `fillRect` con `SCREEN` (`#6e8677`)                                               |
| `txt(x, s, …)` con `"Press Start 2P"`              | `ctx.font = \`${px}px ${g.font}\`` y color `INK`                                  |
| Colores `C`, `M`, `Y`, `GR`, `WH`, `rgba(...)`     | `INK`, `LINE` o un trazo / relleno distinto (ver §4)                              |
| `rnd`, `ri`, `cl` (utilidades)                     | Copiarlas tipadas dentro del archivo del juego (no se comparten entre juegos)     |
| Números mágicos (velocidades, tamaños, puntos)     | Se conservan tal cual y se listan en "Reglas que se conservan" del spec           |

De `references/Arcade Vault.dc.html` (array `games`) salen los textos base: `desc` → `description`, `long` → `long_description` y `ctl` → `controls`. Se adaptan quitando lo que hable de neón o de colores ("puntos magenta", "ladrillos neón").

---

## 4. Aspecto (paleta CRT, spec 04; generaliza la tabla del spec 07)

| Elemento                   | Regla                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| Fondo del lienzo           | `#6e8677` (`crt-well`), igual que la pantalla de la cabina                                                |
| Figuras principales        | `#000000`                                                                                                 |
| Detalle secundario         | `#2f3b34` (`crt-line`): llamas, rejillas tenues, sombras planas                                           |
| Distinguir tipos o tamaños | Por **grosor de trazo** (p. ej. 3 / 2 / 1,5 px), **relleno vs. contorno** o **forma**, nunca por color    |
| HUD: puntuación            | Arriba a la izquierda (12, 22), `12px` Press Start 2P (`g.font`), `#000000`, `toLocaleString("de-DE")`    |
| HUD: nivel                 | Arriba a la derecha, `NIVEL n`, misma fuente, alineado a la derecha (`g.W - 12`)                          |
| HUD: vidas                 | Bajo la puntuación: un icono pequeño por vida (la figura del jugador a escala ~0,6), separados 18 px     |
| Prohibido                  | `shadowBlur`, `shadowColor`, los neón de `CLAUDE.md` (`#00f5ff`, `#ff006e`, `#f5ff00`, `#39ff88`, …)       |

- Las scanlines y la viñeta ya las pone `play-screen.tsx` encima del canvas: el juego no las dibuja.
- Abajo a la derecha del canvas está el botón "VENTANA" en pantalla completa: no pongas HUD ahí.
- **Portada** (`components/game-cover.tsx`): 96×56, solo `#0e1511`, `#2f3b34` (fondo), `#748c7d` (`MID`) y `#8aa293` (`LIGHT`). Rectángulos con `R(...)` y líneas con `line()` (Bresenham, sin antialiasing). El fondo y las estrellas ya los pinta `drawCover`.

---

## 5. Huecos conocidos del motor y de la cabina

Cada hueco se resuelve en el spec del **primer** juego que lo necesite, como **extensión genérica y opcional**. No puede nombrar ningún juego en `engine.ts` ni en `play-screen.tsx`, y Asteroides no cambia.

| Necesidad                                          | Estado actual                                                                                       | Extensión propuesta                                                                                                                                          |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orden de pulsaciones (giros rápidos, laberinto)    | `hit(code)` solo dice si se pulsó en este cuadro; se pierde el orden                                | `GameContext.pressed: readonly KeyCode[]`: las pulsaciones del cuadro, en orden (el motor ya las guarda en `pressed`)                                         |
| Ratón / puntero sobre el canvas                    | El motor no da coordenadas ni limpia listeners del juego                                            | `ArcadeGame.destroy?()`, llamado por `RunningGame.destroy()`. Las coordenadas se pasan a lógicas con `g.W / rect.width`. Ojo con el imán (spec 10), que captura el clic izquierdo con ratón sobre el canvas |
| Juego sin vidas                                    | `GameHandlers.lives(value: number)` e `INITIAL_HUD = { lives: 3 }` en `play-screen.tsx`             | `lives(value: number \| null)`: con `null`, el HUD de React muestra "—". El valor inicial lo da el primer aviso del juego                                      |
| Teclas fuera de flechas / Espacio                  | **Resuelto en parte (spec 12):** `KeyA` / `KeyD` con `wasdAsArrows: false`. `P` y `F` son de la aplicación | Otra tecla: añadirla a `KeyCode` y a `RAW_KEYS` (nunca `KeyP` ni `KeyF`), con la misma regla de opt-in, y documentarla en `controls`                          |
| Pausa al cambiar de pantalla completa              | **Resuelto (spec 12):** `pauseOnScreenChange` en `ArcadeGame` y `RunningGame`                        | —                                                                                                                                                            |
| Repetición al mantener (mover piezas)              | Solo `keys` (mantenida) y `hit` (flanco)                                                            | Se hace dentro del juego con un temporizador propio (como `hold` en `tetris` de la referencia); no hace falta tocar el motor                                 |
| Botonera táctil / móvil                            | Visible pero sin conectar a ningún juego                                                            | Fuera de alcance (spec de controles táctiles)                                                                                                                |
| Mando (Gamepad)                                    | No existe                                                                                           | Fuera de alcance (spec de mando)                                                                                                                             |

---

## 6. Base de datos

La fila del juego (las tablas ya existen desde `supabase/migrations/20261127000000_games_y_scores.sql`):

```sql
-- supabase/migrations/<AAAAMMDDhhmmss>_juego_<id>.sql
insert into public.games (id, title, category, description, long_description, controls)
values ('<id>', '<TÍTULO>', '<ARCADE|PUZLE|DISPAROS|LABERINTO>', '<…>', '<…>', '<…>');
```

- `category` tiene un CHECK con 4 valores. Una categoría nueva necesita además `alter table … drop constraint … add constraint …` en la misma migración, `Category` y `CATEGORY_FILTERS` en `lib/games.ts` y regenerar los tipos.
- Comillas simples dentro de un texto se escriben dobles (`''`).
- **Se aplica en el último paso de código, justo antes de verificar.** La base es compartida: en cuanto existe la fila, el juego aparece en la biblioteca de cualquier entorno conectado (con placeholder si ese entorno aún no tiene el código).
- Antes: `list_tables` / `execute_sql` para confirmar que el id no existe. Después: `execute_sql` (la fila coincide con el spec) y `get_advisors` de seguridad. El único aviso esperado es `public.rls_auto_enable()`, que ya existía.
- No se crean políticas, columnas ni tablas. `scores` sigue con inserción pública `with check (user_id is null)`.

---

## 7. Verificación

- `npx tsc --noEmit`, `npm run lint` y `npm run build` (con `next dev` parado).
- Aislamiento: `git grep -n "<id>" -- lib/arcade/engine.ts components/play-screen.tsx` no devuelve nada, y `lib/arcade/<id>.ts` no importa otros juegos.
- Paleta: `git grep -nE "shadowBlur|shadowColor|#00f5ff|#ff006e|#f5ff00|#39ff88|#00ff88" -- lib/arcade/` no devuelve nada.
- Playwright MCP en escritorio 1280×900 y móvil 390×844. Evidencias en `.mcp-evidencias/<AAAA-MM-DD_HH-MM-SS>/` (carpeta nueva por ejecución, con `README.md`).
  - El navegador del MCP solo permite `localhost:3000`: el insert a `supabase.co` se bloquea (`ERR_BLOCKED_BY_CLIENT`). La interfaz del guardado se prueba con `page.route` (respuesta simulada) y la inserción real con `supabase-js` desde Node con la clave pública.
  - Teclas y ratón con `page.keyboard` / `page.mouse` (`browser_run_code_unsafe`).
- Filas de prueba en `scores`: **solo** `player_name = 'USUARIO-TEST'`; ninguna otra.
- Regresión: `/juegos/asteroides/jugar` funciona igual (HUD 0 / 3 / 1, pausa, fin y guardado).
- `CLAUDE.md`: resumen del proyecto (spec NN y juego nuevo), `ARCADE_GAMES`, numeración de specs y cualquier extensión del motor.
