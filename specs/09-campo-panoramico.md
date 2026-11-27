# SPEC 09 — Campo de juego panorámico en pantalla completa

> **Estado:** Implementado
> **Depende de:** SPEC 07, SPEC 08
> **Fecha:** 2026-11-26
> **Objetivo:** Hacer que, en pantalla completa, el campo de juego de Asteroides se ensanche a la proporción de la pantalla (hasta 16:9) sin deformarse, con más rocas en proporción a la superficie, y que en ventana siga siendo el cuadrado de 480×480.

---

## Por qué existe este spec

El spec 08 puso el canvas en pantalla completa como el cuadrado más grande que cabe. En una tele panorámica eso deja franjas verdes a los lados y usa solo un 56 % del ancho. Estirar el canvas lo deformaría (rocas ovaladas), así que se descartó. Este spec ensancha el **campo de juego** (el área lógica del juego), no el dibujo: la nave y las rocas conservan su forma y la tele se llena.

**Qué cambia en el juego.** Solo en pantalla completa y solo en los juegos que lo admiten. En ventana todo sigue igual que en el spec 07 (cuadrado de 480×480). La altura lógica no cambia (480), de modo que las rocas, la nave y las velocidades miden y van igual; lo que crece es el ancho lógico.

**Opt-in por juego.** El motor ensancha el campo únicamente si el juego implementa el método opcional `resize`. Los juegos que no lo implementan (hoy, todos menos Asteroides) siguen cuadrados también en pantalla completa. Así el motor sigue sin conocer ningún juego y los futuros juegos no se ven afectados.

**Orden.** Este es el primero de tres specs pedidos a la vez (09 campo panorámico, 10 el imán, 11 mando y controles táctiles). Los tests e2e del correo, que `CLAUDE.md` llamaba "spec 09", pasan a un spec posterior al 11.

---

## Alcance

**Dentro:**

- **Ancho lógico del campo** (`lib/arcade/engine.ts`): `W = clamp(round(H × proporción), 480, 853)` con `H = 480`, donde la proporción es la de la pantalla (ancho / alto de la ventana) en pantalla completa y 1 en ventana. Así 16:9 da 853, 5:4 da 600 y una pantalla más ancha que 16:9 se queda en 853, con franjas laterales. Una pantalla más alta que ancha da 480 (cuadrado).
- **Aviso al juego:** `ArcadeGame` gana un método opcional `resize(width, height)`. El motor lo llama cuando `W` cambia y, si el juego no lo implementa, no cambia el campo.
- **Aviso a React:** `GameHandlers` gana `field(width, height)`, que el motor (no el juego) llama al empezar y cuando cambia el tamaño, solo si cambia el valor. `play-screen.tsx` lo usa para dar al contenedor de la pantalla la proporción `W / H`.
- **Orden a React → canvas:** `RunningGame` gana `setScreenAspect(aspect)`. `play-screen.tsx` lo llama con `innerWidth / innerHeight` al entrar en pantalla completa y al redimensionar la ventana, y con `1` al salir.
- **Dibujo:** el motor pone `canvas.width = W` y `canvas.height = H` al cambiar el campo; el CSS escala el canvas al contenedor, que tiene la proporción `W / H`, así que no hay deformación.
- **Tamaño en pantalla completa:** el contenedor del juego pasa a `min(100vw, 100svh × W / H)` de ancho, con `aspect-ratio: W / H`. Con una pantalla de la proporción del campo ocupa toda la pantalla.
- **Asteroides** (`lib/arcade/asteroides.ts`):
  - Lee `W` y `H` del contexto en cada uso, no al arrancar.
  - `resize(w, h)`: reubica nave, rocas y balas **proporcionalmente** (`x' = x × w / W`, la `y` no cambia), actualiza el campo y da 1,5 s de invulnerabilidad a la nave. La partida no se reinicia.
  - Oleadas: el número de rocas grandes es `round((2 + nivel) × W / 480)`, para mantener la densidad de peligro de la versión cuadrada. En 16:9 son 5 en el nivel 1 en lugar de 3.
  - Partida recién creada: React dice la proporción de la pantalla justo después de arrancar el motor, cuando el juego ya ha generado su primera oleada con el ancho que tenía el canvas. Si `resize` llega **antes del primer `update`**, Asteroides regenera la oleada y la nave con el ancho nuevo en vez de reubicarlas; así una partida nueva en pantalla completa empieza con 5 rocas y no con 3. *(Ajuste hecho al implementar; el criterio de las 5 rocas lo exigía y la spec no decía cómo.)*
  - El HUD del propio juego dentro del canvas se coloca con el `W` actual (el "NIVEL n" sigue arriba a la derecha).
- Las puntuaciones, vidas, nivel, pausa, modal de fin, la tecla F y el botón de salida siguen funcionando como antes.
- Actualizar `CLAUDE.md` (arquitectura de `lib/arcade/`, pantalla completa, numeración de specs).

**Fuera de alcance (para specs futuros):**

- Estirar el canvas o rellenar los lados con paneles de información (descartados en las preguntas).
- Ensanchar también el campo en ventana (la cabina sigue cuadrada).
- Un campo más ancho que 853 (21:9 y similares): quedan franjas laterales.
- Ensanchar el campo de otros juegos: cada uno lo decidirá en su spec.
- Guardar el modo (ventana o pantalla completa) junto a las puntuaciones. El guardado real va en el spec de Supabase (ver "Riesgos").
- Medir y optimizar el rendimiento en la Raspberry Pi.
- Mando y controles táctiles (spec 11) y el imán (spec 10).
- Tests automatizados.

---

## Modelo de datos

No introduce datos persistentes. Cambia las interfaces del motor:

```ts
// lib/arcade/engine.ts
export const FIELD_HEIGHT = 480;
export const FIELD_MIN_WIDTH = 480;
export const FIELD_MAX_WIDTH = 853; // 16:9

export interface GameHandlers {
  score(value: number): void;
  lives(value: number): void;
  level(value: number): void;
  over(finalScore: number): void;
  /** El motor avisa cuando cambia el tamaño lógico del campo (no lo llama el juego). */
  field(width: number, height: number): void;
}

export interface GameContext {
  // ...
  W: number; // mutable: cambia si el campo se ensancha
  H: number; // siempre 480
}

export interface ArcadeGame {
  update(dt: number): void;
  draw(): void;
  /** Opcional. Si existe, el motor ensancha el campo a la proporción de la pantalla. */
  resize?(width: number, height: number): void;
}

export interface RunningGame {
  setPaused(paused: boolean): void;
  /** Proporción ancho / alto de la pantalla; 1 en ventana. */
  setScreenAspect(aspect: number): void;
  destroy(): void;
}
```

Convenciones:

- El ancho lógico se redondea a entero y se limita a `[480, 853]`.
- `GameContext.W` y `GameContext.H` son propiedades del mismo objeto que recibe el juego; el motor las actualiza y el juego debe leerlas siempre de ahí (no copiarlas).
- El motor llama a `resize` **antes** de dibujar el siguiente cuadro y fija `canvas.width` en el mismo paso, para que no haya un cuadro con el tamaño antiguo.
- El motor sigue sin conocer ningún juego: la presencia de `resize` es la señal de que el juego admite un campo ancho.
- La altura lógica es siempre 480; no se admiten campos más altos.

---

## Plan de implementación

1. **Motor.** En `lib/arcade/engine.ts`: constantes del campo, `W` mutable en el contexto, `field` en `GameHandlers` (con el mismo filtro de "solo si cambia"), `setScreenAspect` y el cálculo del ancho; si el juego tiene `resize`, el motor fija `canvas.width` y lo llama al cambiar el ancho. Sin `resize`, nada cambia. Pasa `npx tsc --noEmit` y `npm run lint`. Sin cambios visibles todavía (Asteroides aún no implementa `resize` y nadie llama a `setScreenAspect`).
2. **Asteroides.** En `lib/arcade/asteroides.ts`: leer `W` y `H` en cada uso, implementar `resize` (reubicación proporcional e invulnerabilidad de 1,5 s) y la densidad de rocas `round((2 + nivel) × W / 480)`. Pasa `tsc` y `lint`. Sin cambios visibles en ventana (`W` sigue siendo 480).
3. **Pantalla de juego.** En `components/play-screen.tsx`: estado del campo alimentado por `field`, `aspect-ratio: W / H` y ancho `min(100vw, 100svh × W / H)` del contenedor en pantalla completa, y llamadas a `setScreenAspect` al entrar en pantalla completa, al salir y al redimensionar. Manual a 1920×1080 (16:9), 1280×1024 (5:4) y 2560×1080 (21:9).
4. **Verificación y documentación.** Recorrer los criterios de aceptación con Playwright MCP, guardando las evidencias en `.mcp-evidencias/<AAAA-MM-DD_HH-MM-SS>/` (carpeta nueva por ejecución, con su `README.md`). Actualizar `CLAUDE.md`.

---

## Criterios de aceptación

- [x] Solo cambian `lib/arcade/engine.ts`, `lib/arcade/asteroides.ts`, `components/play-screen.tsx` y `CLAUDE.md` (`git diff main --stat`); `lib/arcade/index.ts` y `lib/games.ts` no cambian.
- [x] En ventana el `<canvas>` de Asteroides tiene `width === 480` y `height === 480`, y la cabina se ve y mide como antes (860 px como máximo).
- [x] En pantalla completa a 1920×1080 el canvas tiene `width === 853` y `height === 480` y se muestra a 1919 × 1080 px o más (sin franjas laterales de más de 1 px).
- [x] En pantalla completa a 1280×1024 (5:4) el canvas tiene `width === 600` y se muestra a 1280 × 1024 px.
- [x] En pantalla completa a 2560×1080 (21:9) el canvas tiene `width === 853` y se muestra a unos 1919 × 1080 px, centrado, con franjas verdes a ambos lados.
- [x] En pantalla completa con una ventana más alta que ancha (por ejemplo 800×1000) el campo queda en 480×480.
- [x] No hay deformación: la proporción mostrada es igual a `canvas.width / canvas.height` con un error menor del 1 % en todos los casos anteriores.
- [x] Al entrar en pantalla completa a mitad de partida, la puntuación, las vidas y el nivel no cambian, la partida no se reinicia, todos los objetos quedan dentro del campo (`0 ≤ x < W`) y la nave parpadea (invulnerable) durante 1,5 s.
- [x] Al salir de pantalla completa a mitad de partida el campo vuelve a 480×480 con la misma garantía.
- [x] Una partida nueva empezada ya en pantalla completa a 1920×1080 muestra 5 rocas grandes en el nivel 1; en ventana, 3.
- [x] Los bordes envuelven en el ancho real: una bala o una roca que sale por la derecha del campo de 853 entra por la izquierda.
- [x] El HUD dentro del canvas sigue visible: la puntuación arriba a la izquierda y "NIVEL n" arriba a la derecha del campo ancho.
- [x] Un juego sin `resize` (por ejemplo `/juegos/tetris/jugar`, placeholder) sigue cuadrado en pantalla completa.
- [x] El botón "VENTANA", la tecla F, la pausa con P y el modal de fin funcionan como antes en pantalla completa.
- [x] La consola no tiene errores y `npx tsc --noEmit`, `npm run lint` y `npm run build` terminan sin errores.
- [x] `CLAUDE.md` describe `resize`, `field`, `setScreenAspect` y la nueva numeración de specs.

Notas de la verificación (Playwright MCP; evidencias en `.mcp-evidencias/2026-11-26_21-05-21/`):

- "Todos los objetos quedan dentro del campo" al entrar a mitad de partida no se leyó del estado interno del juego: se comprobó que la nave nunca sale de `[0, W)` durante la trayectoria hasta el borde y que la partida sigue sin reiniciarse (HUD `20|2|1` antes y después de entrar y salir). La nave parpadea ~1,5 s tras el cambio.
- Del último criterio de funciones de siempre, "VENTANA" y la pausa con P se probaron con el campo ancho; el modal de fin y la tecla F no cambiaron respecto al spec 08 y se comprobaron en ese spec.
- No se comprobó un choque injusto al estrechar el campo con rocas muy cerca de la nave, ni varias entradas y salidas seguidas, ni una ventana real que cambie de tamaño después de `fullscreenchange` (el navegador sin interfaz no la redimensiona; se fijó el tamaño y se comprobó el evento `resize`), ni un tamaño real de televisor.

---

## Decisiones tomadas y descartadas

- **Sí:** ampliar el campo de juego a lo ancho en pantalla completa. (Respuesta del usuario.) Las rocas y la nave no se deforman y el juego aprovecha la tele.
- **No:** estirar el canvas (deforma la imagen) y los paneles laterales con la información (no hacen crecer el campo). (Respuesta del usuario.)
- **Sí:** la proporción del campo es la de la pantalla, con límite entre 480 y 853. (Respuesta del usuario.) Una tele más ancha que 16:9 no cambia más el juego; quedan franjas.
- **No:** un campo siempre 16:9 ni uno sin límite. El primero deja franjas o cortes en otras proporciones; el segundo hace que cada dispositivo juegue un juego distinto.
- **Sí:** más rocas en proporción a la superficie: `round((2 + nivel) × W / 480)`. (Respuesta del usuario.) Mantiene la densidad de peligro.
- **No:** las mismas rocas que ahora: el campo ancho quedaría más vacío y el juego más fácil.
- **Sí:** la ventana sigue cuadrada y el campo se redimensiona al alternar a mitad de partida, sin reiniciar. (Respuesta del usuario.)
- **No:** fijar el campo al empezar la partida, ni ensanchar también la ventana (esto último tocaría el diseño de la cabina del spec 07 y el "sin romper la ventana" pedido).
- **Sí:** la altura lógica se queda en 480. *(Decisión mía.)* Las rocas, la nave y las velocidades siguen midiendo y yendo igual que en ventana.
- **Sí:** el ensanchado es opt-in por juego: solo si el juego implementa `resize`. *(Decisión mía.)* El motor sigue sin conocer ningún juego y los demás siguen cuadrados.
- **Sí:** la reubicación al redimensionar es proporcional en `x` (`x' = x × w / W`). *(Decisión mía.)* Evita que los objetos queden fuera o amontonados en el lado izquierdo.
- **Sí:** 1,5 s de invulnerabilidad de la nave tras cambiar el campo. *(Decisión mía.)* Al estrechar el campo las rocas se acercan y podría haber un choque injusto. Es el mismo tiempo que al empezar una oleada.
- **Sí:** el motor, y no el juego, avisa a React del tamaño del campo (`field`). *(Decisión mía.)* Así React no copia la fórmula del ancho y los juegos no conocen la proporción de la pantalla.
- **Sí:** si el campo cambia antes del primer cuadro de una partida, Asteroides regenera la primera oleada con el ancho nuevo (en vez de reubicarla). *(Decisión mía al implementar.)* Evita una partida nueva en pantalla completa con la densidad de rocas del campo cuadrado.
- **Sí:** el límite superior de 853 px es la proporción 16:9 sobre 480 de alto. *(Decisión mía.)* Cubre las teles habituales sin añadir un cuarto de campo vacío.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Las puntuaciones de ventana (campo de 480×480) y de pantalla completa (campo de hasta 853×480) no son comparables. | Hoy el guardado es simulado y no afecta al ranking. El spec de puntuaciones reales debe decidir si guarda el modo o el tamaño del campo junto a la puntuación. Se anota aquí para no olvidarlo. |
| Al estrechar el campo (salir de pantalla completa) las rocas se amontonan y la nave puede quedar encima de una. | La reubicación es proporcional y la nave tiene 1,5 s de invulnerabilidad. |
| Cambiar `canvas.width` borra el contenido del canvas en ese cuadro. | Se cambia justo antes de dibujar el siguiente cuadro, que redibuja todo; no hay parpadeo visible. |
| Medida de ventana inestable en el navegador (`innerWidth` / `innerHeight` cambian al entrar en pantalla completa). | La proporción se recalcula con `fullscreenchange` y `resize`, y el motor solo actúa si el ancho resultante cambia. |
| El `<canvas>` de React tiene `width={480}` y `height={480}` fijos: React podría restaurarlos. | React solo reescribe un atributo si su valor cambia en el JSX; los atributos del lienzo no cambian en el JSX, así que el motor los controla. Se comprueba en el criterio de 853 px. |
| Rendimiento en una Raspberry Pi con un lienzo más grande y más rocas. | Fuera de alcance; el campo de 853×480 es unas 1,8 veces el área actual. Se medirá en el spec del modo televisor. |
| Pantallas con proporciones extremas (ultra anchas o muy altas). | El ancho está limitado a `[480, 853]`; fuera de ese rango quedan franjas. |

---

## Lo que **no** está en este spec

- Estirar el canvas o añadir paneles laterales.
- Ensanchar el campo en ventana o más allá de 16:9.
- Ensanchar el campo de otros juegos.
- Guardar el modo junto a la puntuación y el ranking real.
- Optimización para la Raspberry Pi.
- El imán (spec 10) y los controles de mando y táctiles (spec 11).
- Tests automatizados.

Cada uno de esos puntos, si se hace, va en su propio spec.
