# SPEC 12 — Juego jugable: Bloques

> **Estado:** Implementado
> **Depende de:** SPEC 07, SPEC 08, SPEC 09, SPEC 11
> **Fecha:** 2026-11-28
> **Objetivo:** Añadir el juego `bloques` (BLOQUES) a Arcade Vault, portado de `tetris(G)` en `references/games.js`, jugable en `/juegos/bloques/jugar` con el aspecto de la pantalla de Asteroides, con su fila en la tabla `games` y su puntuación guardada en `scores` y visible en los rankings.

---

## Por qué existe este spec

El segundo juego jugable sale de la función `tetris(G)` de `references/games.js` (líneas 67–106) y de su entrada en el array `games` de `references/Arcade Vault.dc.html` (`desc`, `long`, `ctl`). Es un puzle de piezas que caen: se mueven, se giran y se encajan para completar líneas. Sigue el patrón de los specs 07 (motor y Asteroides) y 11 (tablas `games` / `scores`). Un juego es jugable cuando tiene **su fila en `games` y su entrada en `ARCADE_GAMES`**.

**Solo se toma la lógica de la fuente, no su aspecto.** Se portan el tablero, las piezas, las colisiones, el giro con desplazamientos, la caída, el borrado de líneas, los puntos y los niveles. El dibujo neón (colores por pieza, `shadowBlur`, brillo blanco, rejilla cian, fondo `#05050b`) se rehace con la paleta CRT. **Título y aspecto propios:** el juego se llama BLOQUES y no usa el nombre, el arte ni la presentación de ningún juego comercial.

Este es el primer juego que necesita dos cosas que el motor y la cabina no tienen: **teclas propias** en A y D (en lugar de los alias WASD) y **pausa al cambiar de pantalla completa**. Las dos se añaden como extensiones genéricas y opcionales. El **campo panorámico** usa el `resize` que ya existe (spec 09), con un tablero fijo. El juego tiene **una sola vida**, así que el aviso `lives` del motor sirve tal como está. Ningún juego aparece por nombre en `lib/arcade/engine.ts` ni en `components/play-screen.tsx`, y Asteroides no cambia.

**Contrato técnico.** La implementación sigue `.claude/skills/add-game/guia-integracion.md` (motor, portada, migración, paleta y verificación). Si la guía y el código no coinciden, manda el código, y la guía se corrige en este mismo spec.

---

## Alcance

**Dentro:**

- `lib/arcade/engine.ts`: dos extensiones genéricas y opcionales (ver "Código"): `KeyCode` con `"KeyA"` y `"KeyD"` más la opción `wasdAsArrows`, y la opción `pauseOnScreenChange` con su reflejo en `RunningGame`.
- `components/play-screen.tsx`: pausar al entrar o salir de pantalla completa si la partida en marcha lo pide. No nombra ningún juego.
- `lib/arcade/bloques.ts`: `GameFactory` con las reglas de "Reglas que se conservan", el giro en los dos sentidos, `resize` (tablero centrado con paneles a los lados) y el dibujo de "Aspecto", incluido su HUD dentro del canvas.
- `lib/arcade/index.ts`: añadir `bloques` a `ARCADE_GAMES`.
- `components/game-cover.tsx`: rama `id === "bloques"` con la portada de 96×56.
- `supabase/migrations/20261128000000_juego_bloques.sql`: la fila de `games`, aplicada con el MCP de Supabase.
- `.claude/skills/add-game/guia-integracion.md`: marcar como resuelto el hueco de "teclas nuevas" y añadir las opciones `wasdAsArrows` y `pauseOnScreenChange`. El hueco de "juego sin vidas" sigue abierto.
- Actualizar `CLAUDE.md`.

**Fuera de alcance (para specs futuros):**

- Reserva de pieza (hold). *(Respuesta del usuario.)*
- Guardar las líneas o el nivel en la base; solo se guarda la puntuación. *(Respuesta del usuario.)*
- Pieza fantasma, sorteo por bolsas de 7, vista de varias piezas siguientes y cualquier otra mecánica que no esté en la referencia.
- Controles táctiles o de móvil (la botonera sigue sin conectar).
- Mando (Gamepad API) y modo televisor con Raspberry Pi.
- Sonido, música y vibración.
- Un componente genérico `CanvasGame`.
- Cambios en la cabina, el HUD de React, el modal de fin, las páginas, el header o los estilos.
- Cambios en el esquema de `scores` o en sus políticas; anti-trampas; guardar el modo ventana / pantalla completa.
- Normalizar puntuaciones entre juegos en el ranking GLOBAL.
- Tests automatizados.

---

## Modelo de datos

### Base de datos

No cambia el esquema. Una fila nueva en `games` (categoría `PUZLE`, como en la referencia):

```sql
-- supabase/migrations/20261128000000_juego_bloques.sql
insert into public.games (id, title, category, description, long_description, controls)
values (
  'bloques',
  'BLOQUES',
  'PUZLE',
  'Encaja las piezas y completa líneas antes de llegar arriba.',
  'Las piezas caen sin parar: gíralas, muévelas y encájalas para completar líneas. Cuantas más líneas borres a la vez, más puntos consigues. Cada diez líneas la caída se acelera.',
  '← →: mover · ↑ / D: girar · A: girar al revés · ↓: bajar rápido · ESPACIO: caída instantánea'
);
```

`description` y `long_description` son los de la referencia (no mencionan neón ni colores). `controls` añade el giro con A y D. `lib/supabase/database.types.ts` no se regenera, porque el esquema no cambia.

### Código

```ts
// lib/arcade/engine.ts — extensiones genéricas y opcionales
export type KeyCode =
  | "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Space"
  | "KeyA" | "KeyD"; // solo llegan a un juego con wasdAsArrows === false

// GameHandlers no cambia: BLOQUES avisa lives(1) al empezar y lives(0) al terminar.

export interface ArcadeGame {
  update(dt: number): void;
  draw(): void;
  resize?(width: number, height: number): void;
  /**
   * Opcional, por defecto true: W A S D se tratan como flechas. Con false,
   * A y D llegan como "KeyA" / "KeyD" y W y S no hacen nada en ese juego.
   */
  wasdAsArrows?: boolean;
  /**
   * Opcional, por defecto false: con true, la cabina pausa la partida en
   * marcha al entrar o salir de pantalla completa.
   */
  pauseOnScreenChange?: boolean;
}

export interface RunningGame {
  setPaused(paused: boolean): void;
  setScreenAspect(aspect: number): void;
  destroy(): void;
  /** Copia de `ArcadeGame.pauseOnScreenChange` (false si el juego no lo define). */
  readonly pauseOnScreenChange: boolean;
}
```

Son opcionales para que Asteroides, que no define ninguna, siga exactamente igual. El motor lee `wasdAsArrows` del objeto que devuelve el factory, antes de que llegue cualquier tecla. Con `false`, el motor tampoco hace `preventDefault` sobre `KeyW` ni `KeyS`.

```ts
// components/play-screen.tsx
// INITIAL_HUD no cambia (lives: 3); el primer aviso del juego lo pone a 1.
// Al cambiar `fullscreen` (de fullscreenchange): si phase === "running" y
// runningRef.current?.pauseOnScreenChange → setPhase("paused").
```

```ts
// lib/arcade/bloques.ts — estado interno (solo en memoria durante la partida)
type Matrix = number[][]; // 1 = celda ocupada
interface Piece { m: Matrix; x: number; y: number } // x, y en celdas
// board: number[20][10] (0 vacío, 1 ocupado); next: Piece; score, lines, level, acc
// hold: { ArrowLeft: number; ArrowRight: number } (temporizador de repetición)
export const bloques: GameFactory;

// lib/arcade/index.ts
export const ARCADE_GAMES = { asteroides, bloques };
```

El tablero guarda solo ocupado / vacío: sin colores por pieza, el tipo no hace falta después de fijarla.

### Reglas que se conservan de la referencia

- Tablero de 10 columnas × 20 filas, celdas de 24 px (240×480: ocupa todo el alto lógico).
- 7 piezas: I `[[1,1,1,1]]`, O `[[1,1],[1,1]]`, T `[[0,1,0],[1,1,1]]`, S `[[0,1,1],[1,1,0]]`, Z `[[1,1,0],[0,1,1]]`, J `[[1,0,0],[1,1,1]]`, L `[[0,0,1],[1,1,1]]`. Cada pieza nueva sale al azar (`ri(0, 7)`, uniforme), en `y = 0` y en `x = 4` la O y `x = 3` las demás.
- Siempre se conoce la pieza siguiente. Al fijar una pieza, la siguiente pasa a caer y se sortea otra.
- Colisión: una celda fuera de las columnas 0–9, por debajo de la fila 19 o sobre una celda ocupada.
- Mover con `←` / `→`: un paso al pulsar; si se mantiene, repite tras 0,17 s y luego cada 0,05 s (temporizador propio del juego, como `hold` en la referencia).
- Girar horario con `↑` o `D` (solo en el cuadro de la pulsación): se prueban los desplazamientos 0, −1, +1, −2, +2 columnas y se aplica el primero sin colisión. Si ninguno vale, no gira.
- **Girar antihorario con `A`** (añadido, *respuesta del usuario*): la rotación inversa (trasponer e invertir el orden de las filas), con los mismos desplazamientos 0, −1, +1, −2, +2.
- Caída automática: una fila cada `max(0,07; 0,8 − 0,07 × (nivel − 1))` s. Con `↓` mantenida el tiempo corre ×12. La bajada rápida no da puntos.
- `Espacio`: caída instantánea, +2 puntos por fila bajada, y la pieza se fija en ese mismo cuadro.
- Fijar: cuando la pieza no puede bajar, se fija (las celdas con `y < 0` se descartan), se borran las filas completas y las de encima bajan.
- Puntos por líneas borradas a la vez: 1 → 100, 2 → 300, 3 → 500, 4 → 800, multiplicados por el nivel **anterior** al borrado.
- Nivel = `1 + floor(líneas / 10)`. Solo cambia la velocidad de caída.
- **Una sola vida** *(respuesta del usuario)*: la partida empieza con 1 vida y no hay forma de ganar más.
- Fin: si la pieza nueva colisiona al aparecer, se pierde la vida (`handlers.lives(0)`), `g.end(score)` una sola vez y `return` del `update`.
- Avisos: `score(0)`, `lives(1)` y `level(1)` al empezar; `lives(0)` al terminar; `score` tras cada caída instantánea y cada pieza fijada; `level` al subir.

### Campo (spec 09)

El juego implementa `resize`. El tablero no cambia de tamaño (240×480); lo que cambia es dónde se colocan el tablero y los paneles. `resize` no toca el tablero, la pieza, los puntos ni el temporizador de caída *(respuesta del usuario: "sigue igual")*. La pausa al cambiar de pantalla completa la hace la cabina (ver "Controles").

| Ancho lógico `W` | Disposición |
| --- | --- |
| `W < 600` (ventana: 480) | La de la referencia, centrada: tablero en `x = 40 + (W − 480) / 2`, todo el HUD en el panel derecho. |
| `W ≥ 600` (5:4 = 600, 16:9 = 853) | Tablero centrado (`x = round((W − 240) / 2)`). Panel izquierdo: PUNTUACIÓN, NIVEL y VIDAS. Panel derecho: SIGUIENTE y LÍNEAS. Cada texto se centra en su panel. |

El umbral de 600 deja como mínimo 180 px por panel, y caben los 10 caracteres de "99.999.999" a 14 px (unos 140 px).

### Aspecto (paleta `crt-*`, spec 04)

| Elemento | Dibujo |
| --- | --- |
| Fondo del lienzo | `#6e8677` (`crt-well`), también dentro del tablero |
| Rejilla del tablero | un punto de 2×2 `#2f3b34` en cada cruce de celdas (en lugar de las líneas cian) |
| Borde del tablero | contorno `#000000`, trazo 2 px |
| Celda (pieza que cae y fijadas) | relleno `#000000` de 22×22 (margen 1 px) con un filete interior `#2f3b34` de 1 px a 5 px del borde. Las 7 piezas se ven iguales: la forma las identifica *(respuesta del usuario)* |
| Pieza siguiente | las mismas celdas a 18 px, bajo "SIGUIENTE" |
| HUD: etiquetas | `PUNTUACIÓN`, `NIVEL`, `VIDAS`, `SIGUIENTE`, `LÍNEAS` en Press Start 2P (`g.font`) 10 px, `#000000`, centradas en su panel |
| HUD: valores | Press Start 2P 14 px, `#000000`; la puntuación con `toLocaleString("de-DE")` |
| HUD en 480 (panel derecho, centro x = 370 + desplazamiento) | SIGUIENTE (y 40) y su pieza (y 60), LÍNEAS (y 150 / 176), PUNTUACIÓN (y 216 / 242), NIVEL (y 282 / 308), VIDAS (y 348 / 374) |
| HUD en `W ≥ 600` | izquierda: PUNTUACIÓN (y 40 / 66), NIVEL (y 120 / 146), VIDAS (y 200 / 226); derecha: SIGUIENTE (y 40) y su pieza (y 60), LÍNEAS (y 170 / 196) |
| HUD: vidas | la etiqueta `VIDAS` y, debajo, una celda pequeña (la del tablero a 12 px) por vida que queda: una durante la partida y ninguna al terminar |
| Portada 96×56 | la pila de la referencia: 4 filas de bloques de 5×5 (paso 6 px, desde (18, 32)) con huecos, en `LIGHT` (piezas C, M, Y de la referencia) y `MID` (G, O), y una T cayendo arriba en `LIGHT` (celdas (36, 6), (42, 6), (48, 6), (42, 12)) |

Sin `shadowBlur`, sin `shadowColor`, sin `globalAlpha` y sin los colores neón prohibidos por `CLAUDE.md`. Nada por debajo de y = 380 en el panel derecho: ahí va el botón "VENTANA" en pantalla completa. Las scanlines y la viñeta las pone `play-screen.tsx`.

### Controles

| Entrada | Acción |
| --- | --- |
| `←` / `→` | mover (repite al mantener) |
| `↑` o `D` | girar en sentido horario |
| `A` | girar en sentido antihorario |
| `↓` | bajar rápido (×12) |
| `Espacio` | caída instantánea |
| `W` / `S` | nada en BLOQUES (`wasdAsArrows: false`) |
| `P` o botón PAUSA | pausar / reanudar (de la aplicación) |
| `F` | pantalla completa (de la aplicación); al entrar o salir con la partida en marcha, el juego se pausa (`pauseOnScreenChange: true`) |
| `Esc` | sale de pantalla completa (nativo); también pausa |

---

## Plan de implementación

1. **Teclas propias.** En `lib/arcade/engine.ts`, `"KeyA"` / `"KeyD"` en `KeyCode` y la opción `ArcadeGame.wasdAsArrows` (por defecto `true`). Con `false`, A y D llegan como sus códigos y W y S se ignoran. Ningún juego por nombre. Asteroides sigue girando con A y D. Pasa `npx tsc --noEmit` y `npm run lint`.
2. **Pausa al cambiar de pantalla.** `ArcadeGame.pauseOnScreenChange` y `RunningGame.pauseOnScreenChange` en el motor. En `play-screen.tsx`, cuando cambia `fullscreen` con `phase === "running"` y la partida en marcha lo pide, se pasa a `"paused"`. Asteroides no se pausa al cambiar. Pasa tsc y lint.
3. **Lógica del juego.** Crear `lib/arcade/bloques.ts` con las reglas (`update`), los dos giros, los avisos `score` / `lives(1)` y `lives(0)` / `level` / `end`, `wasdAsArrows: false`, `pauseOnScreenChange: true` y un dibujo mínimo con la paleta. Añadir `bloques` a `ARCADE_GAMES`. Pasa tsc y lint. Sin cambios visibles (todavía no hay fila en `games`).
4. **Aspecto, HUD y campo.** Completar `draw()` según "Aspecto" e implementar `resize` según "Campo" (disposición de 480 y de `W ≥ 600`). Pasa tsc y lint.
5. **Portada.** Rama `id === "bloques"` en `components/game-cover.tsx`. Pasa tsc y lint.
6. **Fila en `games`.** Escribir `supabase/migrations/20261128000000_juego_bloques.sql`, comprobar con `execute_sql` que el id `bloques` no existe, aplicarla con el MCP (`apply_migration`) y comprobar la fila con `execute_sql` y `get_advisors` (solo se espera el aviso de `public.rls_auto_enable()`). Manual: la tarjeta aparece en `/biblioteca`, `/juegos/bloques/jugar` se juega y el Salón de la Fama tiene la pestaña BLOQUES.
7. **Verificación y documentación.** Recorrer los criterios con Playwright MCP (1280×900 y 390×844), con evidencias en `.mcp-evidencias/<AAAA-MM-DD_HH-MM-SS>/` y filas de prueba solo como `USUARIO-TEST`. Actualizar `CLAUDE.md` (resumen con spec 12 y BLOQUES, `ARCADE_GAMES`, las dos extensiones del motor y la numeración: los borradores de mando y táctil pasan a 13 y 14) y `.claude/skills/add-game/guia-integracion.md` (§2 y §5). `npm run build` sin errores (con `next dev` parado).

---

## Criterios de aceptación

Verificados el 2026-11-28 con un script de Node sobre `lib/arcade/bloques.ts` (reglas y repetición), Playwright MCP (1280×900, 1280×720 y 390×844) y `supabase-js` desde Node para la inserción real. Evidencias en `.mcp-evidencias/2026-11-28_03-55-30/` (no versionadas). Salir de pantalla completa con `Esc` no se pudo pulsar en el navegador sin ventana: usa el mismo evento `fullscreenchange` que F y VENTANA, que sí se probaron.

**Integración**

- [x] Existe `lib/arcade/bloques.ts` y `ARCADE_GAMES` contiene `asteroides` y `bloques`.
- [x] Aislamiento: `git grep -n "bloques" -- lib/arcade/engine.ts components/play-screen.tsx` no devuelve nada, y `lib/arcade/bloques.ts` solo importa tipos de `./engine`.
- [x] `games` tiene una fila con `id = 'bloques'`, `title = 'BLOQUES'`, `category = 'PUZLE'` y los tres textos de este spec, y existe `supabase/migrations/20261128000000_juego_bloques.sql`.
- [x] `/juegos/bloques` y `/juegos/bloques/jugar` responden 200.
- [x] `/biblioteca` muestra la tarjeta BLOQUES con su portada, la categoría PUZLE y "—" como mejor puntuación si no hay filas en `scores` para el juego. El filtro PUZLE la muestra.

**Juego**

- [x] Tras "CARGANDO...", se ven el tablero vacío con su borde y su rejilla de puntos, una pieza en la fila superior y la pieza siguiente bajo "SIGUIENTE".
- [x] El HUD de React empieza en PUNTUACIÓN 0, VIDAS 1 y NIVEL 1, y el del canvas muestra VIDAS con una celda.
- [x] `←` / `→` mueven la pieza una columna por pulsación y la repiten al mantenerlas; la pieza no sale de las columnas 0–9.
- [x] `↑` y `D` giran en sentido horario y `A` en sentido antihorario. Junto a una pared, el giro se aplica desplazado si hay hueco.
- [x] `W` y `S` no hacen nada en BLOQUES.
- [x] `↓` mantenida acelera la caída sin sumar puntos.
- [x] `Espacio` deja caer la pieza al fondo, suma 2 puntos por fila bajada y la fija.
- [x] Borrar 1, 2, 3 o 4 líneas a la vez en nivel 1 suma 100, 300, 500 u 800 puntos.
- [x] A las 10 líneas el nivel pasa a 2 y la caída automática se acelera (0,73 s por fila).
- [x] Cuando una pieza nueva no cabe al aparecer, VIDAS pasa a 0, el juego avisa (`over`) y el modal "FIN DEL JUEGO" muestra la puntuación del HUD.
- [x] Dentro del canvas se ve el HUD del juego y fuera el de React, y los dos muestran la misma puntuación, las mismas vidas y el mismo nivel en todo momento.
- [x] "JUGAR DE NUEVO" empieza con el tablero vacío, 0 puntos, 0 líneas, 1 vida y nivel 1, sin duplicar el bucle (la velocidad de caída no cambia tras reiniciar).
- [x] PAUSA y la tecla P congelan el juego y REANUDAR continúa desde el mismo punto. En pausa, las teclas del juego no actúan.
- [x] Con el modal de fin abierto, `Enter` y `Espacio` activan el botón enfocado.
- [x] "SALIR" y "VOLVER AL VAULT" dejan la ruta sin errores en la consola y sin listeners colgados: al volver a entrar, una pulsación mueve la pieza una sola columna.

**Pantalla completa**

- [x] En pantalla completa 16:9 el campo mide 853×480: el tablero está centrado, PUNTUACIÓN, NIVEL y VIDAS a la izquierda, SIGUIENTE y LÍNEAS a la derecha, y nada tapa el botón "VENTANA".
- [x] Al entrar en pantalla completa con la partida en marcha, el juego se pausa y la tarjeta dice "Pulsa P para reanudar". Al salir (VENTANA, F o Esc), también se pausa.
- [x] Tras cambiar de modo, el tablero, la pieza que cae, la puntuación, las líneas y el nivel son los mismos que antes del cambio.
- [x] En ventana, la disposición es la de 480: tablero en x 40 y todo el HUD en el panel derecho.

**Aspecto**

- [x] En el lienzo solo se usan `#6e8677`, `#000000` y `#2f3b34`, y `git grep -nE "shadowBlur|shadowColor|globalAlpha|#00f5ff|#ff006e|#f5ff00|#39ff88|#00ff88" -- lib/arcade/` no devuelve nada.
- [x] Las 7 piezas se dibujan con la misma celda (relleno negro con filete `#2f3b34`) y solo se distinguen por su forma.
- [x] La portada de BLOQUES solo usa los cuatro tonos de `game-cover.tsx` y muestra la pila con huecos y la T cayendo.
- [x] La cabina, el HUD de React, el modal y las páginas se ven igual que antes de este spec.

**Leaderboard**

- [x] El Salón de la Fama tiene las pestañas GLOBAL, ASTEROIDES y BLOQUES. La nueva muestra "SÉ EL PRIMERO EN ENTRAR AL SALÓN DE LA FAMA" mientras no tiene filas.
- [x] Al guardar con el nombre "Usuario-test", se crea en `scores` una fila con `game_id = 'bloques'`, `player_name = 'USUARIO-TEST'`, la puntuación exacta del modal y `user_id` nulo.
- [x] Esa fila aparece al recargar en el top 10 de `/juegos/bloques`, en GLOBAL y en la pestaña BLOQUES, y como mejor puntuación de la tarjeta.

**Calidad**

- [x] Asteroides funciona igual: HUD 0 / 3 / 1, A y D giran la nave, W propulsa, no se pausa al entrar o salir de pantalla completa, y la pausa, el fin y el guardado siguen igual.
- [x] En `scores` solo quedan filas de prueba con `player_name = 'USUARIO-TEST'`.
- [x] `npx tsc --noEmit`, `npm run lint` y `npm run build` terminan sin errores.
- [x] `CLAUDE.md` y `guia-integracion.md` describen BLOQUES, las dos extensiones del motor y el número de spec.

---

## Decisiones tomadas y descartadas

- **Sí:** título BLOQUES e id `bloques`. *(Respuesta del usuario.)*
- **No:** "TETRISS". Es el nombre comercial con una letra más. La skill pide un título propio, igual que ASTEROIDES no es "Asteroids". *(Decisión mía, aceptada por el usuario al elegir BLOQUES.)*
- **Sí:** una sola vida: el HUD empieza en 1 y pasa a 0 al terminar, como Asteroides con su última vida. *(Respuesta del usuario, que sustituye a "sin vidas" del primer borrador.)*
- **No:** `lives(number | null)` con "—" en el HUD. Con una vida no hace falta tocar el motor, y el hueco "juego sin vidas" queda para el primer juego que lo necesite.
- **No:** 3 vidas con vaciado del tablero. Es una mecánica que la referencia no tiene.
- **Sí:** todo el HUD del canvas en los paneles, nunca encima del tablero. *(Respuesta del usuario.)* La vida se dibuja como una celda pequeña, siguiendo la regla de la guía (la figura del jugador a escala). *(Decisión mía.)*
- **Sí:** las 7 piezas con la misma celda; la forma las identifica. *(Respuesta del usuario.)*
- **No:** 7 texturas por tipo. Cargan la vista a 24 px.
- **Sí:** reglas de la referencia tal cual (sorteo uniforme, puntos, niveles, velocidad, desplazamientos del giro). *(Respuesta del usuario.)*
- **Sí:** giro antihorario con A y horario con D o ↑; W y S no hacen nada; el movimiento lateral es solo con las flechas. *(Respuesta del usuario.)*
- **Sí:** `wasdAsArrows` como opción del juego, por defecto `true`, para que Asteroides no cambie. *(Decisión mía.)*
- **No:** cambiar los alias de `KEY_ALIASES` para todos los juegos. Rompería los controles de Asteroides.
- **Sí:** campo panorámico con el tablero centrado y los paneles a los lados en `W ≥ 600`; por debajo, la disposición de la referencia. *(Respuesta del usuario; el umbral de 600 es decisión mía, para que la puntuación quepa en un panel.)*
- **Sí:** un cambio de pantalla completa no toca el tablero ni la pieza. *(Respuesta del usuario.)*
- **Sí:** entrar o salir de pantalla completa pausa la partida y muestra la tarjeta de pausa que ya existe. *(Respuesta del usuario.)* La hace la cabina, activada por el juego con `pauseOnScreenChange`, para no cambiar Asteroides. *(Decisión mía.)*
- **Sí:** categoría PUZLE, sin migración del CHECK. *(Heredado de la referencia.)*
- **Sí:** los textos de `games` son los de la referencia; `controls` añade A y D. *(Respuesta del usuario; el añadido es decisión mía, porque los controles cambiaron.)*
- **Sí:** rejilla de puntos `#2f3b34` en lugar de líneas, y nada de `globalAlpha`, para no crear tonos fuera de la paleta. *(Decisión mía.)*
- **Sí:** el tablero guarda solo ocupado / vacío. Sin colores no hace falta el tipo de pieza. *(Decisión mía.)*
- **Sí:** este spec es el 12. Los borradores de mando y táctil que `CLAUDE.md` numeraba como 12 y 13 no existen como archivo y pasan a ser 13 y 14. *(Decisión mía.)*
- **Sí:** solo la lógica de la fuente; el dibujo usa la paleta CRT de Asteroides. *(Heredado del spec 07.)*
- **Sí:** los dos HUD (el del canvas y el de React), con los mismos valores. *(Spec 07.)*
- **Sí:** la pausa es de la aplicación (PAUSA / P con `setPaused`); el juego no tiene control propio. *(Spec 07.)*
- **Sí:** el juego aislado en su archivo, y solo `lib/arcade/index.ts` lo conoce. *(Spec 07.)*
- **Sí:** una fila en `games` y ningún cambio de esquema; el ranking y el guardado salen solos. *(Spec 11.)*
- **Sí:** la migración se aplica en el último paso de código, porque la base es compartida.
- **Sí:** el ranking GLOBAL mezcla BLOQUES con Asteroides aunque sus escalas de puntos no sean comparables. Normalizarlo es otro spec. *(Spec 11.)*
- **No:** reserva de pieza ni guardar las líneas en la base. *(Respuesta del usuario.)*
- **No:** controles táctiles, mando, sonido ni `CanvasGame` en este spec.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| React en desarrollo monta dos veces los efectos y duplica el bucle. | El efecto de `play-screen.tsx` ya devuelve `destroy()`; el criterio de "JUGAR DE NUEVO" lo comprueba. |
| La pausa por cambio de pantalla se dispara también con el modal de fin o con el diálogo del imán abiertos. | Solo actúa con `phase === "running"`; el diálogo del imán ya pausa por su cuenta. |
| Al entrar en pantalla completa el tamaño de la ventana cambia después de `fullscreenchange` (spec 08). | `resize` solo recoloca el dibujo, y la partida está en pausa mientras tanto. |
| Press Start 2P no tiene algunas mayúsculas acentuadas: "LÍNEAS" y "PUNTUACIÓN" pueden mostrar un acento con aspecto de minúscula. | Aceptado, igual que "CRÉDITOS" (CLAUDE.md). Se comprueba en la captura. |
| `KeyA` / `KeyD` como `KeyCode` podrían llegar a un juego que no los espera. | Solo se emiten con `wasdAsArrows === false`; con el valor por defecto siguen siendo flechas. |
| La fila de `games` hace visible el juego en otros entornos antes del merge. | Se aplica en el último paso; un entorno sin el código muestra el placeholder y no guarda nada. |
| Las puntuaciones de BLOQUES (miles por tetra-línea × nivel) dominan el ranking GLOBAL frente a Asteroides. | Aceptado y documentado; la normalización va en otro spec. |
| En móvil no se puede jugar (botonera sin conectar). | Aceptado; va en el spec de controles táctiles. |

---

## Lo que **no** está en este spec

- Reserva de pieza, pieza fantasma, bolsas de 7 y guardar líneas o nivel.
- Controles táctiles, mando, sonido y modo televisor.
- Un componente genérico `CanvasGame`.
- Cambios en la cabina, las páginas, el header o los estilos.
- Cambios de esquema en `scores`, anti-trampas y normalización del ranking GLOBAL.
- Tests automatizados.

Cada uno de esos puntos, si se hace, va en su propio spec.
