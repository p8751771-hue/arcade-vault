# SPEC 07 — Primer juego jugable: Asteroides

> **Estado:** Implementado
> **Depende de:** SPEC 01, SPEC 04
> **Fecha:** 2026-11-26
> **Objetivo:** Reemplazar el juego simulado `asteroids` por un juego nuevo, `asteroides`, portando la lógica de Asteroids de `references/games.js` a TypeScript sobre un motor mínimo y aislado de cada juego, jugable en `/juegos/asteroides/jugar` con el diseño y la paleta de televisor antiguo actuales, de modo que el canvas notifique a React la puntuación, las vidas, el nivel y el fin de partida, y React controle la pausa.

---

## Por qué existe este spec

Hasta ahora la cabina de `/juegos/[id]/jugar` es un placeholder ("EL JUEGO AÚN NO ESTÁ DISPONIBLE") con valores simulados: puntuación 0, 3 vidas, nivel 1 y una puntuación final inventada (`baseScore / 2`). Este es el primer juego real de la plataforma.

**Solo se toma la lógica de la referencia, no su aspecto.** `references/games.js` dibuja con neón (cian, magenta, amarillo, `shadowBlur`, fondo `#05050b`). Eso ya no existe en el sitio desde el spec 04, y el usuario pidió expresamente que el diseño actual se mantenga. Del juego se portan las reglas: física, colisiones, oleadas, vidas y puntuación. Del dibujo solo se conservan las formas (la nave, las rocas de contorno irregular y las balas cuadradas), que se pintan con la paleta `crt-*`.

**Un motor mínimo, no un juego suelto.** `startGame` de la referencia mezcla el motor (bucle, teclas, pausa) con la lógica de cada juego. Se separan en dos archivos para que los otros cinco juegos se enchufen después al mismo motor sin rehacerlo. En este spec solo se porta Asteroides; los otros cinco siguen con el placeholder.

**Quién manda a quién.** El juego vive entero dentro del `<canvas>`: su física, su dibujo y su estado (rocas, nave, balas, puntuación, vidas, nivel) no salen de `lib/arcade/`. Hay dos canales, siempre en el mismo sentido:

- **Canvas → React (notificaciones):** el juego avisa al componente cuando cambia la puntuación, las vidas o el nivel, y cuando termina la partida. React solo dibuja esos valores en el HUD y en el modal; no los calcula.
- **React → Canvas (órdenes):** la aplicación, que es el contenedor ya dibujado, decide la pausa. El juego no tiene botón ni tecla de pausa propios: el componente llama a `setPaused()`. Lo mismo vale para destruir el juego.

**Dos marcadores, y los dos se mantienen.** El juego dibuja **su propio HUD dentro del canvas** (puntuación, vidas como pequeñas naves y nivel) y además notifica a React, cuyo HUD de la cabina (PUNTUACIÓN, VIDAS, NIVEL) también se queda. No se borra ninguno: el del canvas es del juego y viaja con él; el de React es el de la aplicación y es el que usará el resto de la plataforma (modal de fin, guardado). Ambos muestran los mismos valores porque salen del mismo estado del juego.

**Cada juego aislado.** La ruta `/juegos/[id]/jugar` es genérica: no sabe nada de ningún juego concreto. Solo busca el id en el registro `ARCADE_GAMES` y le da al motor la función de ese juego. El motor tampoco conoce a ningún juego, y los juegos no se importan entre sí ni comparten estado: cada uno vive en su propio archivo de `lib/arcade/` y solo habla con el motor a través de `GameContext`. Así los siguientes juegos se añaden sin mezclar su código con el de Asteroides.

**ID del juego (decisión final, 2026-11-26).** Este juego es **nuevo**, se llama Asteroides y su id es **`asteroides`** (no "Rocas", que era el apodo de la landing de la referencia, ver el comentario de `lib/home.ts`). En los datos fijos ya existía uno parecido, `asteroids` (título "ASTEROIDS"). El usuario decidió **eliminar ese y reemplazarlo por este**: queda un solo juego, `asteroides`, y es el jugable. Por eso este spec renombra `asteroids` → `asteroides` en `lib/games.ts`, en la portada y en la landing. Dos versiones anteriores de este spec (dejar `asteroids` tal cual, y añadir `asteroides` como séptimo juego aparte) se descartaron antes de implementar nada. La referencia `games.js` conserva su id `asteroids`, porque es un archivo externo que no se modifica.

**Numeración.** Los tests e2e del correo, que el spec 06 llamaba "spec 07", pasan a ser el **spec 08**.

**Ampliación (2026-11-26, tras implementar): cabina más grande.** Al ver la partida en pantalla, el usuario pidió agrandar la cabina (marco, pantalla y HUD de React), que medía 640 px como máximo. Pasa a `min(100%, 860px, 100svh − 170px)`: crece en pantallas grandes sin desbordar la altura de la ventana, y en móvil sigue ocupando el 100 % del ancho. Es solo tamaño en pantalla; el juego sigue en 480×480 lógicos. Poco después pidió además **pantalla completa** porque en la televisión se ve pequeño: queda fuera de este spec y pasa a uno propio.

---

## Alcance

**Dentro:**

- `lib/arcade/engine.ts`: motor genérico portado de `startGame`: bucle con `requestAnimationFrame`, paso de tiempo limitado a 0,05 s, teclado (con `W A S D` como alias de las flechas), cola de pulsaciones "recién pulsadas" (`hit`), pausa y `destroy()` que quita todos los listeners y cancela el bucle. No conoce ningún juego.
- `lib/arcade/asteroides.ts`: lógica de Asteroides portada tal cual la referencia (ver "Reglas que se conservan"), sin importar nada de otros juegos.
- `lib/arcade/index.ts`: registro `ARCADE_GAMES` con los juegos jugables (hoy solo `asteroides`). El resto de ids no están en el registro y conservan el placeholder. Es el único punto que une ids con juegos.
- Reemplazar el juego existente `asteroids` por `asteroides`:
  - `lib/games.ts`: `GameId` y la entrada del juego pasan de `"asteroids"` a `"asteroides"`, y su `title` de `"ASTEROIDS"` a `"ASTEROIDES"`. La entrada se queda en su sitio (misma posición en `GAMES`, así el ranking semilla no cambia); descripción, categoría (`DISPAROS`), controles y `baseScore` no cambian.
  - `components/game-cover.tsx`: la rama `id === "asteroids"` pasa a `"asteroides"`.
  - `lib/home.ts`: el `gameId` de la fila de `ACTIVITY` y el comentario que lo menciona.
  - Las rutas `/juegos/asteroides` y `/juegos/asteroides/jugar` salen solas de `generateStaticParams` y de `proxy.ts`, que leen `GAMES`. `GAMES` sigue teniendo 6 juegos, así que la rejilla de la landing no cambia.
- Cambios en `components/play-screen.tsx`:
  - Si el juego está en el registro: un `<canvas>` de 480×480 ocupa la pantalla de la cabina en lugar del texto placeholder.
  - El HUD (PUNTUACIÓN, VIDAS, NIVEL) muestra los valores reales del juego.
  - PAUSA / REANUDAR y la tecla P pausan y reanudan el motor.
  - Al perder la última vida se abre el modal "FIN DEL JUEGO" con la puntuación real.
  - "JUGAR DE NUEVO" empieza una partida nueva (0 puntos, 3 vidas, nivel 1).
  - El HUD de React se mantiene y convive con el del canvas.
  - El botón de depuración "SIMULAR FIN DE PARTIDA" solo aparece en los juegos que siguen siendo placeholder.
- HUD propio del juego dentro del canvas (puntuación, vidas como naves, nivel), dibujado por `lib/arcade/asteroides.ts` (ver "Aspecto").
- Dibujo con la paleta `crt-*` y sin brillos (ver "Aspecto").
- Actualizar `CLAUDE.md` (arquitectura, numeración de specs, el id `asteroides` y la nota de que "no hay lógica de juego" deja de ser cierta para Asteroides).

**Fuera de alcance (para specs futuros):**

- Los otros cinco juegos (Arkanoid, Tetris, Snake, Pac-Man, Space Invaders): cada uno es un spec.
- Controles táctiles o de móvil: la botonera `< ^ v > ACCIÓN` sigue como hoy (sin conectar al juego) y Asteroides se juega con teclado. Es un spec aparte ("eso todavía no").
- Extraer un componente genérico `CanvasGame`: el canvas y su arranque se quedan dentro de `play-screen.tsx`, que no menciona ningún juego, y se extraerá cuando haya un segundo juego.
- Guardar puntuaciones de verdad (Supabase) o mezclarlas con el ranking. "GUARDAR PUNTUACIÓN" sigue llamando al stub `submitScore` de `lib/api.ts` y el ranking no cambia.
- Sonido, música y vibración.
- Mando de videojuegos (Gamepad API) y el modo televisor con Raspberry Pi.
- Nuevas mecánicas que no están en la referencia: platillos enemigos, hiperespacio, vidas extra, escudos, pantalla de título o tabla de récords en la partida.
- Cambios en las portadas más allá del renombrado de id, en la tarjeta o en el detalle del juego.
- Cambiar `lib/history.ts`: sus menciones de "Asteroids" (id `strong-asteroids`, `zkm-asteroids`, hito de 1979) hablan del juego real de Atari, no de este, y no se tocan.
- Mantener una redirección de `/juegos/asteroids` a `/juegos/asteroides`: la ruta antigua pasa a dar 404 (el sitio aún no es público).
- Tests automatizados (siguen para el spec 08).
- Pantalla completa (botón o tecla, Fullscreen API) y el modo televisor, pedidos por el usuario tras implementar: spec aparte. Tampoco se cambia el lienzo lógico de 480×480; solo se agrandó la cabina en pantalla (ver "Ampliación" arriba).

---

## Modelo de datos

Esta funcionalidad no introduce datos persistentes. Añade tipos del motor y el estado interno de Asteroides, que viven solo en memoria durante la partida, y cambia el id de un juego del catálogo.

```ts
// lib/arcade/engine.ts
export type KeyCode =
  | "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Space";

// Canvas → React: el juego notifica; la lógica del juego nunca toca React.
// Se llaman solo cuando el valor cambia, no en cada cuadro.
export interface GameHandlers {
  score(value: number): void;
  lives(value: number): void;
  level(value: number): void;
  over(finalScore: number): void;
}

// Contexto que recibe cada juego.
export interface GameContext {
  ctx: CanvasRenderingContext2D;
  W: number; // 480
  H: number; // 480
  font: string; // familia tipográfica del sitio, para el HUD del canvas
  keys: Partial<Record<KeyCode, boolean>>; // mantenidas
  hit(code: KeyCode): boolean; // pulsadas en este cuadro
  handlers: GameHandlers;
  end(finalScore: number): void; // fin de partida
}

// Lo que implementa cada juego.
export interface ArcadeGame {
  update(dt: number): void; // dt en segundos
  draw(): void;
}
export type GameFactory = (g: GameContext) => ArcadeGame;

// React → Canvas: lo que el componente recibe al arrancar y con lo que manda.
export interface RunningGame {
  setPaused(paused: boolean): void;
  destroy(): void;
}
export function startGame(
  factory: GameFactory,
  canvas: HTMLCanvasElement,
  handlers: GameHandlers,
): RunningGame;
```

```ts
// lib/arcade/asteroides.ts — estado interno (como la referencia)
interface Rock { x: number; y: number; r: number; pts: [number, number][]; vx: number; vy: number }
interface Ship { x: number; y: number; a: number; vx: number; vy: number }
interface Bullet { x: number; y: number; vx: number; vy: number; l: number } // l = vida en segundos
export const asteroides: GameFactory;
```

```ts
// lib/arcade/index.ts — único lugar que une ids con juegos
export const ARCADE_GAMES: Partial<Record<GameId, GameFactory>> = { asteroides };

// lib/games.ts (cambio)
// GameId: "asteroids" → "asteroides"; title: "ASTEROIDS" → "ASTEROIDES"
```

### Reglas que se conservan de la referencia

- Lienzo lógico de 480×480; los bordes **envuelven** (lo que sale por un lado entra por el opuesto) para nave, rocas y balas.
- Nave: giro 4,2 rad/s con `←`/`→`, propulsor con `↑` (aceleración 260 px/s²), fricción `0.5^dt` por segundo, y 2,2 s de invulnerabilidad parpadeante al aparecer (1,5 s al empezar una oleada).
- Disparo con `Espacio` (solo en el cuadro de la pulsación, sin repetición): máximo 5 balas, velocidad 520 px/s más 30 % de la velocidad de la nave, vida 0,9 s.
- Oleada `n`: `2 + n` rocas de radio 40, nacidas a más de 130 px del centro. Velocidad `rnd(25, 60) × (1 + 0,08·n) × (40/r)^0,4`. Contorno irregular de 8 a 11 puntos con radio entre 0,75 y 1,15 del nominal.
- Al impactar una bala: la roca desaparece; si `r > 16` se parte en dos de radio `r/2`. Puntos: `r > 30` → 20, `r > 16` → 50, resto → 100.
- Choque de la nave con una roca (radio `r × 0,85 + 7`) y sin invulnerabilidad: pierde una vida y reaparece en el centro; con 0 vidas termina la partida.
- Sin rocas: se sube un nivel, se genera la oleada siguiente y la nave es invulnerable 1,5 s.

### Aspecto (paleta `crt-*`, spec 04)

| Elemento | Dibujo |
| --- | --- |
| Fondo del lienzo | `#6e8677` (`crt-well`), igual que la pantalla de la cabina |
| Nave | contorno `#000000`, trazo 2 px |
| Llama del propulsor | contorno `#2f3b34` (`crt-line`), trazo 2 px |
| Balas | cuadrados de 4×4 en `#000000` |
| Roca grande (`r > 30`) | contorno `#000000`, trazo 3 px |
| Roca mediana (`r > 16`) | contorno `#000000`, trazo 2 px |
| Roca pequeña | contorno `#000000`, trazo 1,5 px |
| HUD del canvas: puntuación | arriba a la izquierda (12, 22), texto `#000000` en Press Start 2P 12 px, con separador de miles `de-DE` |
| HUD del canvas: vidas | bajo la puntuación, una nave pequeña (la de la partida, escala 0,6, trazo 1,5 px, `#000000`) por vida restante, separadas 18 px |
| HUD del canvas: nivel | arriba a la derecha, `NIVEL n` en Press Start 2P 12 px, `#000000`, alineado a la derecha |

Sin `shadowBlur`, sin `shadowColor` y sin los colores neón prohibidos por `CLAUDE.md`. Las scanlines y la viñeta ya las pone `play-screen.tsx` por encima del lienzo. Los valores van como constantes hexadecimales dentro de `lib/arcade/asteroides.ts` porque un lienzo no lee variables CSS.

### Controles

| Entrada | Acción |
| --- | --- |
| `←` / `A`, `→` / `D` | girar |
| `↑` / `W` | propulsor |
| `Espacio` | disparar |
| `P` o botón PAUSA | pausar / reanudar (ya existe) |

Convención: el motor solo llama a `preventDefault()` sobre flechas y `Espacio` mientras la partida está en marcha (ni en pausa ni terminada), para que el modal de fin y el botón de pausa funcionen con el teclado. La botonera táctil queda fuera (ver "Alcance").

---

## Plan de implementación

1. **Reemplazar `asteroids` por `asteroides`.** En `lib/games.ts` (`GameId`, `id`, `title: "ASTEROIDES"`), `components/game-cover.tsx` y `lib/home.ts` (fila de `ACTIVITY` y comentario). Pasa `npx tsc --noEmit`, `npm run lint` y `npm run build`. Manual: la tarjeta, la portada, `/juegos/asteroides` y `/juegos/asteroides/jugar` (aún placeholder) funcionan; `/juegos/asteroids` da 404.
2. **Motor.** Crear `lib/arcade/engine.ts` con los tipos y `startGame` (bucle, teclas, `hit`, pausa, `destroy`), sin ninguna referencia a un juego concreto. Pasa `tsc` y `lint`. Sin cambios visibles todavía.
3. **Lógica de Asteroides.** Crear `lib/arcade/asteroides.ts` con las reglas portadas (`update`) y el dibujo con la paleta (`draw`), más `lib/arcade/index.ts` con `ARCADE_GAMES`. Pasa `tsc` y `lint`.
4. **Pantalla de juego.** En `components/play-screen.tsx`, si `ARCADE_GAMES[game.id]` existe: crear el `<canvas>` al terminar la carga, arrancar el motor, ocultar el placeholder y destruir el motor al desmontar o al reiniciar (debe aguantar el doble montaje de React en desarrollo). El componente no menciona ningún juego por nombre. Manual: `/juegos/asteroides/jugar` muestra la nave y las rocas moviéndose; los otros cinco juegos siguen igual.
5. **Canvas → React y React → Canvas.** Conectar los avisos `score`, `lives` y `level` al HUD (el componente solo actualiza el estado cuando el valor cambia, no en cada cuadro) y `over` con la puntuación real en el modal "FIN DEL JUEGO". Conectar PAUSA / REANUDAR / P con `setPaused`. "JUGAR DE NUEVO" arranca una partida limpia. Sustituir `finalScore = baseScore / 2` y las constantes `SCORE` / `LIVES` / `LEVEL` por los valores reales en los juegos del registro. Ocultar "SIMULAR FIN DE PARTIDA" en esos juegos.
6. **HUD dentro del canvas.** Dibujar en `lib/arcade/asteroides.ts` el marcador propio del juego (puntuación, vidas como naves y nivel) con la tipografía del sitio (`GameContext.font`, leída por el motor de la variable CSS `--font-press-start`). El HUD de React no se toca. Retirar del motor lo que solo servía a la botonera (`setKey`) y dejar la botonera táctil como estaba antes de este spec.
7. **Verificación y documentación.** Recorrer los criterios de aceptación con Playwright MCP (escritorio 1280×900 y móvil 390×844), guardando las evidencias en `.mcp-evidencias/<AAAA-MM-DD_HH-MM-SS>/` (una carpeta nueva por ejecución, con su `README.md`). Actualizar `CLAUDE.md` (arquitectura con `lib/arcade/`, `play-screen`, el id `asteroides`, "Next specs" y la numeración: tests e2e → spec 08).

---

## Criterios de aceptación

- [x] Existen `lib/arcade/engine.ts`, `lib/arcade/asteroides.ts` y `lib/arcade/index.ts`, y `ARCADE_GAMES` contiene solo `asteroides`.
- [x] Aislamiento: `lib/arcade/engine.ts` y `components/play-screen.tsx` no contienen el texto `asteroides` ni importan `lib/arcade/asteroides.ts` (solo `lib/arcade/index.ts` lo hace), y `lib/arcade/asteroides.ts` no importa ningún otro juego.
- [x] `git grep -n '"asteroids"' -- app components lib proxy.ts` no devuelve nada, `GAMES` sigue teniendo 6 juegos y uno tiene id `asteroides` y título `ASTEROIDES`, en la misma posición que tenía `asteroids`.
- [ ] La Biblioteca muestra la tarjeta "ASTEROIDES" con su portada, y la fila de la landing que antes apuntaba a `asteroids` ahora enlaza a `/juegos/asteroides`.
- [x] En `/juegos/asteroides/jugar`, tras la pantalla "CARGANDO...", la pantalla de la cabina muestra la nave en el centro y 3 rocas grandes (oleada 1 = `2 + 1`) en movimiento.
- [x] El HUD empieza en PUNTUACIÓN 0, VIDAS 3 y NIVEL 1 y el nombre del jugador sigue siendo el de la sesión o `INVITADO`.
- [ ] `←` / `→` giran la nave, `↑` la acelera y `Espacio` dispara; `A`, `D` y `W` hacen lo mismo que las flechas.
- [ ] No se puede tener más de 5 balas a la vez y mantener `Espacio` pulsado dispara una sola vez.
- [ ] La nave, las rocas y las balas que salen por un borde entran por el opuesto.
- [ ] Destruir una roca grande suma 20, una mediana 50 y una pequeña 100, y las grandes y medianas se parten en dos rocas de la mitad de radio.
- [ ] Un choque con una roca (sin invulnerabilidad) resta una vida, el HUD lo refleja y la nave reaparece en el centro parpadeando.
- [x] Al destruir todas las rocas, NIVEL sube en 1 y aparece una oleada con una roca grande más que la anterior.
- [x] El HUD cambia solo cuando el juego avisa (puntuación, vidas, nivel): no hay ningún botón ni cálculo en React que sume puntos o reste vidas.
- [x] Al perder la tercera vida el propio juego avisa a React (`over`) y se abre el modal "FIN DEL JUEGO" con la puntuación que mostraba el HUD, no con `baseScore / 2`.
- [x] "JUGAR DE NUEVO" empieza con 0 puntos, 3 vidas y nivel 1, sin duplicar el bucle (la nave no va más rápido tras reiniciar).
- [ ] El juego no tiene botón ni tecla de pausa propios: PAUSA y la tecla P (de la aplicación) congelan el juego y muestran el cartel "PAUSA"; REANUDAR continúa desde el mismo punto. Con el juego en pausa, `Espacio` no dispara ni se bloquea en el botón.
- [ ] Con el modal de fin abierto, `Enter` y `Espacio` activan el botón enfocado (el motor ya no captura el teclado).
- [x] "SALIR" y "VOLVER AL VAULT" dejan la ruta sin errores en la consola y sin listeners colgados: al volver a entrar, la nave responde a una sola pulsación una sola vez.
- [x] Dentro del canvas se ven el HUD del juego (puntuación arriba a la izquierda, nivel arriba a la derecha y una nave por vida restante) y, fuera del canvas, el HUD de React; los dos muestran los mismos valores en todo momento.
- [ ] Al perder una vida desaparece una nave del HUD del canvas y VIDAS baja en el HUD de React; al subir de nivel cambian los dos.
- [x] La botonera táctil se ve y se comporta como antes de este spec: sin conectar al juego. `RunningGame` no tiene `setKey`.
- [x] En el lienzo solo se usan los colores `#6e8677`, `#000000` y `#2f3b34`; `git grep` no encuentra los valores neón prohibidos en `lib/arcade/` ni `shadowBlur` o `shadowColor`.
- [x] Las rocas grande, mediana y pequeña se distinguen por el grosor del trazo (3, 2 y 1,5 px).
- [x] Arkanoid, Tetris, Snake, Pac-Man y Space Invaders siguen mostrando "EL JUEGO AÚN NO ESTÁ DISPONIBLE" y su botón "SIMULAR FIN DE PARTIDA" funciona como antes.
- [x] "GUARDAR PUNTUACIÓN" sigue mostrando "GUARDANDO..." y "PUNTUACIÓN GUARDADA", y el Salón de la Fama y el detalle del juego no cambian (salvo el nombre y la ruta de Asteroides).
- [x] `/juegos/asteroides` y `/juegos/asteroides/jugar` responden 200; `/juegos/asteroids` y un id inexistente devuelven 404.
- [x] `npx tsc --noEmit`, `npm run lint` y `npm run build` terminan sin errores.
- [x] `CLAUDE.md` describe `lib/arcade/`, el id `asteroides` y la nueva numeración de specs (tests e2e = spec 08).

Los 9 criterios sin marcar no se comprobaron en la verificación con Playwright (`.mcp-evidencias/2026-11-26_04-07-03/`): enlace de la fila de la landing, `A` / `D` / `W`, máximo de 5 balas y un disparo por pulsación, bordes que envuelven, partición de rocas, parpadeo tras el choque, `Espacio` en pausa, `Enter` / `Espacio` activando el botón del modal y la nave que desaparece del HUD del canvas al perder una vida. El usuario decidió implementar y abrir el PR igualmente.

---

## Decisiones tomadas y descartadas

- **Sí:** tomar solo la lógica de la referencia. El usuario pidió mantener el diseño actual del sitio y no el neón de `games.js`.
- **Sí:** el juego se llama Asteroides, id `asteroides`, y **reemplaza** al `asteroids` existente: queda un solo juego, el jugable. (Respuesta del usuario: "ese que existe eliminar… reemplazar por este".) Se renombra en `lib/games.ts`, la portada y la landing, y la entrada conserva su posición para no alterar el ranking semilla.
- **No:** dejar `asteroids` como placeholder y añadir `asteroides` como séptimo juego. Habría dos juegos casi iguales y desordenaría la rejilla de 6 columnas de la landing. Fue la versión intermedia de este spec; el usuario la descartó.
- **No:** mantener el id `asteroids`. Otra versión intermedia, descartada por la misma respuesta.
- **No:** renombrar el id en `references/games.js` ni en `lib/history.ts`. El primero es una referencia externa y el segundo habla del juego real de Atari de 1979.
- **Sí:** la ruta antigua `/juegos/asteroids` pasa a 404 sin redirección. El sitio aún no es público y `proxy.ts` ya compara contra `GAMES`.
- **Sí:** el juego vive entero dentro del canvas y **avisa** a React cuando cambian la puntuación, las vidas y el nivel y cuando termina la partida. React solo muestra esos valores. (Respuesta del usuario.)
- **Sí:** la pausa la controla la aplicación (el contenedor ya dibujado: botón PAUSA y tecla P) mediante `setPaused()`; el juego no tiene control de pausa propio. (Respuesta del usuario.)
- **No:** que React calcule puntos o vidas, o que lea el estado interno del juego en cada cuadro. Rompería la frontera canvas / React.
- **Sí:** ruta genérica y juegos aislados. `/juegos/[id]/jugar` y el motor no conocen ningún juego; solo `lib/arcade/index.ts` une ids con juegos, y cada juego vive en su archivo sin importar a los demás. (Respuesta del usuario: "evitar que se mezclen… ruta genérica para mantener cada juego aislado".)
- **No:** que `play-screen.tsx` tenga ramas por juego (`if (game.id === "asteroides")`) ni que el motor incluya reglas de un juego concreto.
- **Sí:** motor mínimo (`engine.ts`) separado de la lógica de Asteroides (`asteroides.ts`). Los otros cinco juegos se enchufan después sin rehacerlo. (Respuesta del usuario.)
- **No:** todo en un solo archivo. Es más corto ahora, pero el siguiente juego obligaría a extraer el motor.
- **Sí:** la carpeta se llama `lib/arcade/`, no `lib/games/`. Ya existe `lib/games.ts`, y una carpeta con el mismo nombre confundiría la resolución de `@/lib/games`.
- **Sí:** TypeScript con tipos, no JavaScript copiado. El proyecto usa `tsc` en el flujo de verificación.
- **Sí:** distinguir el tamaño de las rocas por el grosor del trazo, todo en negro. Sin neón no hay colores por tamaño, y los tonos `crt-ink-2` / `crt-line` sobre `crt-well` tendrían poco contraste. (Respuesta del usuario.)
- **No:** un único trazo para todas las rocas ni tonos de la paleta; el primero pierde información de juego y el segundo contraste.
- **Sí:** puntuación real en el HUD y en el modal de fin; el guardado sigue simulado y el ranking no cambia. El guardado real llega con Supabase en otro spec. (Respuesta del usuario.)
- **No:** guardar las marcas en `localStorage` y mezclarlas con el ranking, como hacía la referencia. Contradice la regla vigente de que el ranking nunca cambia y duplicaría trabajo del spec de puntuaciones reales.
- **Sí:** "SIMULAR FIN DE PARTIDA" solo en los juegos placeholder. (Respuesta del usuario.)
- **Sí:** los dos HUD se mantienen: el del juego dentro del canvas (puntuación, naves, nivel) y el de React. (Respuesta del usuario: "no vamos a borrar el HUD del juego, vamos a usar los dos".)
- **No:** quitar el HUD del canvas para dejar solo el de React, ni al revés. Cada uno cumple un papel y los dos salen del mismo estado.
- **No:** controles táctiles en este spec. (Respuesta del usuario: "eso todavía no".) Una versión anterior conectaba la botonera con `setKey()`; se retiró.
- **No:** extraer un componente genérico `CanvasGame` ahora. Se hará con el segundo juego, cuando haya algo que generalizar.
- **Sí:** el motor solo captura flechas y `Espacio` mientras la partida corre. Así el modal de fin y los botones se pueden usar con el teclado.
- **Sí:** el estado de React solo se actualiza cuando cambia un valor (puntuación, vidas, nivel), no en cada cuadro. El bucle va a 60 cuadros por segundo y renderizar la pantalla entera a ese ritmo sería un coste inútil.
- **Sí:** el lienzo sigue siendo 480×480 lógicos y el CSS lo escala (`w-full h-full`), como la referencia. Las rocas, la velocidad y las colisiones no dependen del tamaño en pantalla.
- **Sí:** agrandar la cabina a `min(100%, 860px, 100svh − 170px)` (marco, pantalla y HUD de React comparten ese ancho). (Petición del usuario: "agrandar".) 170 px es la altura del HUD de arriba, los márgenes y el pie de la cabina, para que no aparezca scroll vertical.
- **No:** añadir pantalla completa en este spec, aunque el usuario la pidió ("en tv se ve muy pequeño"). El alcance original la excluía; va en otro spec.
- **Sí:** conservar la "pantalla de carga" simulada de 1,1 s. Es parte del diseño actual de la cabina y el canvas se crea cuando termina.
- **No:** nuevas mecánicas (platillos, hiperespacio, sonido). El objetivo es portar el juego de la referencia, no ampliarlo.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| React 19 en desarrollo monta, desmonta y vuelve a montar los efectos: se podrían crear dos bucles y la nave iría al doble de velocidad. | El efecto que arranca el motor siempre devuelve `destroy()`; el criterio de aceptación de "JUGAR DE NUEVO" lo comprueba. |
| `preventDefault()` sobre `Espacio` en la ventana rompe los botones del teclado (PAUSA, modal de fin). | Solo se captura con la partida en marcha; se comprueba con el juego en pausa y con el modal abierto. |
| Mantener una tecla y cambiar de pestaña deja la tecla "pulsada" y la nave sigue girando al volver. | El motor borra todas las teclas en el evento `blur` de la ventana. |
| Un cuadro muy largo (pestaña en segundo plano) haría saltar objetos a través de otros. | Se conserva el límite de `dt` de 0,05 s de la referencia. |
| La pausa por pestaña oculta no está en la referencia. | No se añade; el límite de `dt` ya evita el salto. Si molesta, se hace en otro spec. |
| El HUD se renderiza en cada cuadro si se enlaza mal con el estado. | Los manejadores `score`, `lives` y `level` se llaman solo cuando el valor cambia (como en la referencia) y el componente evita `setState` con el mismo valor. |
| En móvil Asteroides no se puede jugar (sin teclado y con la botonera sin conectar). | Aceptado por el usuario para este spec; los controles táctiles van en otro. |
| El HUD del canvas usa Press Start 2P, que puede no haberse cargado cuando arranca el juego. | El canvas se redibuja en cada cuadro, así que el texto pasa a la fuente correcta en cuanto carga; mientras tanto usa `monospace`. |
| El rendimiento en una Raspberry Pi (meta futura del proyecto) puede ser peor con trazos de 3 px y 60 cuadros por segundo. | Sin `shadowBlur`, que es lo más caro del canvas; el bucle no asigna objetos innecesarios por cuadro. Se medirá en el spec del modo televisor. |
| Un enlace o marcador a `/juegos/asteroids` dejará de funcionar. | Aceptado: el sitio aún no es público. Si hiciera falta, una redirección va en otro spec. |

---

## Lo que **no** está en este spec

- Los otros cinco juegos.
- Controles táctiles o de móvil.
- Un componente genérico `CanvasGame`.
- Guardado real de puntuaciones, Supabase o cambios en el ranking.
- Sonido, música, vibración, Gamepad API y modo televisor.
- Mecánicas nuevas (platillos, hiperespacio, vidas extra, pantalla de título).
- Cambios en portadas, tarjetas, detalle del juego, header o pie, más allá del renombrado de `asteroids` a `asteroides`.
- Redirección desde `/juegos/asteroids`.
- Tests automatizados (spec 08).

Cada uno de esos puntos, si se hace, va en su propio spec.
