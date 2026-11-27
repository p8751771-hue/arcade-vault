# SPEC 10 — El imán: un homenaje a las teles de tubo

> **Estado:** Implementado
> **Depende de:** SPEC 05, SPEC 07, SPEC 08
> **Fecha:** 2026-11-26
> **Objetivo:** Convertir el puntero del ratón en un imán sobre la pantalla del juego, de modo que al hacer clic izquierdo se distorsione la imagen durante 10 segundos como una tele de tubo con un imán cerca, y que después se abra un diálogo científico, con fuentes en APA, que explica por qué ocurría.

---

## Por qué existe este spec

Es una pieza educativa y de humor que encaja con la paleta de televisor antiguo (spec 04) y con la página Historia (spec 05): enseña un fenómeno real de las teles de tubo (CRT) y lo hace probándolo. El usuario describió la idea durante la definición del spec 08 y decidió que fuera un spec propio.

**La experiencia, en cuatro tiempos.**

1. Sobre la pantalla del juego el puntero es un **imán**. Pasar el ratón no hace nada, salvo mostrar un cartel junto al puntero: "NO PRESIONES EL CLIC IZQUIERDO".
2. Si se hace clic izquierdo, durante **10 segundos** la imagen se distorsiona alrededor del imán, que se puede mover por la pantalla: la imagen se ondula, los colores se separan y aparecen manchas moradas y verdes.
3. Al terminar los 10 segundos la distorsión desaparece y se abre un **diálogo científico** que explica por qué un imán estropeaba las teles de aquella época.
4. Al cerrar el diálogo, el juego sigue.

**Solo es un efecto visual.** No toca el juego, el motor ni las reglas: el juego sigue corriendo debajo y lo que se distorsiona es una capa que copia el canvas, no el canvas mismo. Por eso no cambia `lib/arcade/` y es compatible con cualquier tamaño de campo (spec 09).

**Contenido científico real.** El diálogo es una paráfrasis propia, nunca una copia, con citas en APA 7.ª edición y una lista de referencias, igual que la página Historia (spec 05). Cada afirmación se apoya en fuentes verificadas y accesibles. Las fuentes se buscan y verifican en el paso 1 del plan; este spec no las fija de antemano.

**Numeración.** Es el segundo de tres specs pedidos a la vez (09 campo panorámico, 10 el imán, 11 mando y controles táctiles). Los tests e2e del correo pasan a un spec posterior al 11.

---

## Alcance

**Dentro:**

- **Puntero de imán** solo sobre la pantalla del juego (el canvas) y solo con ratón (`(hover: hover) and (pointer: fine)`): una imagen SVG de un imán en herradura, de 32×32 px dibujado píxel a píxel con la paleta (`#000000`, `#0e1511`, `#2f3b34` y los verdes de la página), con el punto activo en el centro. Sobre el marco, el HUD, los botones y fuera de la pantalla, el puntero es el normal.
- **Cartel junto al puntero** con el texto "NO PRESIONES EL CLIC IZQUIERDO" (Press Start 2P, 8 px, `crt-ink` sobre `crt-surface`), que aparece al mover el ratón sobre la pantalla del juego, se queda 1,5 s tras el último movimiento y se oculta al salir de la pantalla, durante el efecto y durante el diálogo.
- **Disparo:** solo el clic con el botón izquierdo del ratón (`button === 0` y `pointerType === "mouse"`). El clic derecho, el central, el táctil y el de lápiz no hacen nada.
- **Efecto de 10 segundos** (capa propia `<canvas>` sobre el juego, sin eventos de puntero):
  - Un halo circular de unos 150 px de radio, centrado en el puntero y que lo sigue, donde la imagen del juego se ondula, los colores rojo, verde y azul se separan unos píxeles (aberración cromática) y se superponen manchas moradas y verdes.
  - Intensidad completa durante 8 s y desvanecimiento en los 2 s finales.
  - Con `prefers-reduced-motion: reduce`: versión **estática**, sin ondulación ni vibración propia y sin desvanecimiento animado: el halo (con la separación de colores y las manchas fijas) sigue al ratón y desaparece de golpe a los 10 s. El cartel y el diálogo se mantienen.
  - Los clics mientras dura el efecto o el diálogo se ignoran.
- **Diálogo científico** (`role="dialog"`, `aria-modal`) al terminar el efecto, en el estilo del modal de fin de partida: título, de 3 a 5 párrafos con citas en el texto, lista "REFERENCIAS" en APA con enlaces y un botón "SEGUIR JUGANDO" con el foco al abrirse. Cubre al menos: cómo forman la imagen los haces de electrones, cómo un campo magnético los desvía, cómo se magnetiza la máscara de sombra (y por qué quedan manchas de color) y qué hace la bobina desmagnetizadora; y que las pantallas planas actuales no sufren este efecto.
- **Pausa:** el juego se pausa mientras el diálogo está abierto y, al cerrarlo, vuelve al estado que tenía (si estaba en pausa antes, sigue en pausa).
- **Fin de partida durante el efecto:** cancela el efecto y no se muestra el diálogo, para no apilar modales.
- **Funciona en ventana y en pantalla completa** (el diálogo es hijo del `<main>`, que es el elemento en pantalla completa) y solo en los juegos con canvas real (`ARCADE_GAMES`); en los placeholders el puntero es el normal.
- `lib/magnet.ts`: constantes, texto, citas y fuentes. Las funciones APA se reutilizan de `lib/history.ts`; si no sirven tal cual, se extraen a `lib/apa.ts` sin cambiar su comportamiento ni la página Historia.
- `components/magnet/magnet-layer.tsx` (puntero, cartel, estados y capa del efecto) y `components/magnet/magnet-dialog.tsx`.
- `public/cursors/iman.svg`: el puntero.
- Cambios en `components/play-screen.tsx`: montar la capa sobre la pantalla del juego y el diálogo en el `<main>`, y combinar la pausa del diálogo con la de la partida.
- Actualizar `CLAUDE.md` (arquitectura, numeración de specs).

**Fuera de alcance (para specs futuros):**

- Disparar el imán con teclado o mando (es una función de ratón; ver "Riesgos").
- Sonido (zumbido, desmagnetización) y vibración.
- Que el imán afecte al juego (colisiones, físicas): es solo visual.
- Cooldown, contadores de clics o logros.
- Cambiar o ampliar el contenido del diálogo con más temas (historia de las teles, otros dispositivos).
- Traducciones a otros idiomas.
- Efecto en pantallas táctiles.
- Tests automatizados.

---

## Modelo de datos

Estado en memoria, sin persistencia:

```ts
// lib/magnet.ts
export const MAGNET_DURATION_MS = 10_000;
export const MAGNET_FADE_MS = 2_000; // últimos 2 s: desvanecimiento
export const MAGNET_LABEL_MS = 1_500; // cartel tras el último movimiento
export const MAGNET_LABEL = "NO PRESIONES EL CLIC IZQUIERDO";
export const MAGNET_TITLE: string; // título del diálogo

export type MagnetState = "idle" | "active" | "dialog";

export interface MagnetParagraph {
  text: string; // paráfrasis propia
  sources: string[]; // ids de MAGNET_SOURCES; al menos uno
}
export const MAGNET_PARAGRAPHS: readonly MagnetParagraph[]; // de 3 a 5
export const MAGNET_SOURCES: readonly HistorySource[]; // mismo formato APA 7 que lib/history.ts
```

Convenciones:

- Fuentes: mínimo 3, todas accesibles para clientes automáticos (`GET` con 200; las que bloquean `HEAD` se aceptan si responden a `GET`). No se aceptan páginas que respondan 403 o 404 (como pasó en el spec 05).
- Paráfrasis: ninguna secuencia de 8 palabras consecutivas coincide con el texto descargado de las fuentes (misma regla que `lib/history.ts`).
- Estados: `idle` → (clic izquierdo) → `active` (10 s) → `dialog` → (cerrar) → `idle`. Desde `active`, un fin de partida vuelve a `idle` sin pasar por `dialog`.
- La pausa del motor es `phase === "paused" || magnet === "dialog"`; el motor sigue sin saber nada del imán.

---

## Plan de implementación

1. **Fuentes y texto.** Buscar y verificar al menos 3 fuentes sobre desviación magnética de los haces en un tubo de rayos catódicos, magnetización de la máscara de sombra y bobina desmagnetizadora; escribir `lib/magnet.ts` con las paráfrasis y los datos APA; comprobar con un script (en el directorio temporal) que cada URL responde 200 a `GET` y que no hay 8 palabras consecutivas copiadas; reutilizar o extraer las funciones APA. Pasa `npx tsc --noEmit` y `npm run lint`. Sin cambios visibles.
2. **Puntero, cartel y estados.** Crear `public/cursors/iman.svg`, `components/magnet/magnet-layer.tsx` (puntero, cartel, máquina de estados `idle → active → dialog`, con el efecto aún sin dibujar) y `components/magnet/magnet-dialog.tsx`; montarlos en `components/play-screen.tsx` y combinar la pausa. Manual: sobre la pantalla del juego el puntero es el imán y aparece el cartel; el clic izquierdo espera 10 s y abre el diálogo, que pausa el juego y lo reanuda al cerrarse.
3. **Efecto visual.** Dibujar la capa del halo: ondulación, separación de colores y manchas, que sigue al puntero, con desvanecimiento en los 2 s finales y la versión estática con `prefers-reduced-motion`. Manual en ventana y en pantalla completa, y con el movimiento reducido.
4. **Verificación y documentación.** Recorrer los criterios de aceptación con Playwright MCP, guardando las evidencias en `.mcp-evidencias/<AAAA-MM-DD_HH-MM-SS>/` (carpeta nueva por ejecución, con su `README.md`). Actualizar `CLAUDE.md`.

---

## Criterios de aceptación

- [x] Existen `lib/magnet.ts`, `components/magnet/magnet-layer.tsx`, `components/magnet/magnet-dialog.tsx` y `public/cursors/iman.svg`; `lib/arcade/` no cambia (`git diff main --stat`).
- [x] Sobre la pantalla del juego de Asteroides el `cursor` calculado es `url(...iman.svg)` y sobre el HUD, los botones y el marco es el normal.
- [x] Mover el ratón sobre la pantalla sin hacer clic no produce efecto ni diálogo; aparece el cartel "NO PRESIONES EL CLIC IZQUIERDO" a menos de 40 px del puntero y desaparece 1,5 s (±0,3 s) después del último movimiento.
- [x] Un clic izquierdo inicia el efecto: la capa del halo existe, su contenido no está vacío alrededor del puntero, y a los 10 s (±0,5 s) se abre el diálogo.
- [x] El clic derecho, el central y un toque o clic de lápiz no inician el efecto.
- [x] El halo sigue al puntero: el contenido de la capa cambia de posición al mover el ratón.
- [x] Un segundo clic durante el efecto o durante el diálogo no reinicia ni duplica nada.
- [x] Durante el efecto el juego sigue corriendo (la puntuación, la nave o el canvas cambian) y el canvas del juego no se modifica (los pixeles del canvas fuera de la capa son los del juego).
- [x] El diálogo tiene `role="dialog"` y `aria-modal="true"`, el foco está en "SEGUIR JUGANDO", contiene un título, de 3 a 5 párrafos con al menos una cita APA cada uno y la lista "REFERENCIAS" con al menos 3 entradas en APA con enlaces.
- [x] Mientras el diálogo está abierto el juego está en pausa (el canvas no cambia); al cerrarlo el juego sigue, y si estaba en pausa antes sigue en pausa.
- [x] Si la partida termina durante el efecto, el efecto se cancela y se muestra solo el modal "FIN DEL JUEGO", sin el diálogo científico.
- [x] En pantalla completa funcionan el puntero, el cartel, el efecto y el diálogo (este último dentro de `document.fullscreenElement`).
- [x] Con `prefers-reduced-motion: reduce` el contenido de la capa es idéntico en cuadros consecutivos con el puntero quieto, no hay desvanecimiento y el cartel y el diálogo aparecen igual.
- [x] Con un dispositivo táctil (`(hover: none)`) no hay puntero de imán ni cartel y el toque no inicia el efecto.
- [x] En un juego placeholder (por ejemplo `/juegos/tetris/jugar`) el puntero es el normal.
- [x] Todas las URLs de las referencias responden 200 a `GET` y ningún párrafo comparte 8 palabras consecutivas con el texto de sus fuentes (script de verificación).
- [x] La consola no tiene errores; `git grep` no encuentra los colores neón prohibidos en los archivos nuevos y `npx tsc --noEmit`, `npm run lint` y `npm run build` terminan sin errores.
- [x] `CLAUDE.md` describe el imán y la nueva numeración de specs.

Notas de la verificación (Playwright MCP; evidencias en `.mcp-evidencias/2026-11-26_21-56-53/`):

- El criterio de que un fin de partida durante el efecto lo cancele se comprobó con un parche **temporal** de 1 vida inicial en `lib/arcade/asteroides.ts` (con 3 vidas no se conseguía morir en 10 s). La partida terminó a los 3,6 s, el halo desapareció y no se abrió el diálogo científico. El parche se revirtió con `git checkout` y nunca se commiteó.
- El dispositivo táctil se simuló sustituyendo `matchMedia` para `(hover: hover) and (pointer: fine)`, y el toque y el lápiz con `PointerEvent` de tipo `touch` y `pen`.
- No se comprobó con un ratón real, con pantallas de alta densidad de píxeles (el halo no usa `devicePixelRatio`), en una Raspberry Pi ni el cierre del diálogo con Esc (el botón sí).
- La frase del diálogo sobre las pantallas planas es una inferencia física sin fuente propia; el usuario revisa el texto.

---

## Decisiones tomadas y descartadas

- **Sí:** el imán es un spec propio, separado de la pantalla completa. (Decisión del usuario en el spec 08.)
- **Sí:** el puntero es el imán solo sobre la pantalla del juego. (Respuesta del usuario.) Así no estorba al pulsar PAUSA, SALIR o el botón de pantalla completa.
- **No:** el imán sobre toda la cabina o sobre toda la página de juego.
- **Sí:** la distorsión es un halo que sigue al imán durante 10 s, con ondulación, separación de colores y manchas moradas y verdes. (Respuesta del usuario.)
- **No:** manchas que se quedan donde pasa (más fiel a una tele real, pero más costosas de dibujar) ni distorsionar toda la pantalla sin importar dónde esté el ratón.
- **Sí:** con `prefers-reduced-motion` se muestra una versión estática, sin movimiento propio, y se mantienen el cartel y el diálogo. (Respuesta del usuario.) El contenido educativo se conserva para todos.
- **No:** desactivarlo con movimiento reducido ni ignorar la preferencia.
- **Sí:** el diálogo lleva paráfrasis propia con fuentes verificadas en APA 7, como la página Historia. (Respuesta del usuario.)
- **No:** un texto divulgativo sin citas ni una simple lista de enlaces.
- **Sí:** el efecto es una capa que copia el canvas del juego y lo distorsiona en el halo; el canvas y el motor no se tocan. *(Decisión mía.)* Mantiene aislado el motor (spec 07) y funciona con cualquier tamaño de campo (spec 09).
- **Sí:** el juego sigue corriendo durante los 10 s y se pausa mientras el diálogo está abierto. *(Decisión mía.)* El jugador no debe perder una partida mientras lee.
- **Sí:** un fin de partida durante el efecto cancela el efecto y omite el diálogo. *(Decisión mía.)* Evita dos modales a la vez; el jugador puede volver a disparar el imán después.
- **Sí:** los clics durante el efecto o el diálogo se ignoran y no hay cooldown después. *(Decisión mía.)* Es la opción más simple.
- **Sí:** 8 s a intensidad completa y 2 s de desvanecimiento. *(Decisión mía.)* El desvanecimiento marca el final sin cortar de golpe.
- **Sí:** solo el botón izquierdo del ratón dispara el imán, y solo con `pointerType === "mouse"`. *(Decisión mía, por el texto "no presiones el clic izquierdo".)*
- **Sí:** el puntero es un SVG 32×32 (`public/cursors/iman.svg`) con la propiedad `cursor` de CSS. *(Decisión mía.)* No añade latencia, como sí lo haría un elemento que siga al ratón.
- **Sí:** el cartel es un elemento del DOM que sigue al puntero. *(Decisión mía.)* El cursor de CSS no puede llevar texto.
- **Sí:** solo en los juegos con canvas real. *(Decisión mía.)* El efecto copia el canvas; en los placeholders no hay nada que distorsionar.
- **Sí:** reutilizar las funciones APA de `lib/history.ts` y extraerlas a `lib/apa.ts` solo si hace falta. *(Decisión mía.)* Evita duplicar el formato.
- **Sí, al implementar:** en vez de crear `lib/apa.ts`, las tres funciones APA de `lib/history.ts` ganan un parámetro opcional `pool` (la lista que decide el sufijo `s.f.-a` / `s.f.-b`), con la lista de Historia por defecto. *(Decisión mía.)* Es el cambio mínimo: la página Historia no cambia (se comprobó que sigue generando `2021a`, `2021b`, `s.f.-a` y `s.f.-b`). Además, ese archivo se reformateó entero con Prettier al editarlo.
- **Sí, al implementar:** las 6 fuentes son 3 demostraciones de física (Universidad de Maryland, UC Santa Barbara y el National MagLab), una patente de Toshiba de 1975 sobre la desmagnetización y dos páginas de Wikipedia (Degaussing y Cathode-ray tube). *(Decisión mía.)* Todas responden 200 a `GET` y ningún párrafo copia 8 palabras (script). El autor "UC Santa Barbara Department of Physics" va sin comas porque `formatApaCitation` cortaría un nombre con comas como "Apellido, N.".
- **Sí, al implementar:** la afirmación de que las pantallas planas no sufren este efecto es una inferencia física: la única fuente citada (Cathode-ray tube) dice que las planas sustituyeron a los tubos, no que un imán no las afecte. No se encontró una fuente fiable (solo foros y blogs comerciales). El texto la formula con cautela ("no dibuja la imagen con un haz de electrones desviado por bobinas"). *(Limitación conocida; se anota en el resumen de la implementación.)*
- **Sí, al implementar:** las citas múltiples de un párrafo van en orden alfabético, como exige APA. *(Decisión mía.)*
- **Sí, al implementar:** el halo se dibuja como un `<canvas>` de 300×300 con `getImageData` y un bucle por píxel, y sus manchas se generan con senos de coordenadas deformadas. *(Decisión mía.)* Es la forma de separar canales de color y ondular sin tocar el canvas del juego; solo se ejecuta durante los 10 s.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| El contenido científico puede ser inexacto o simplificado de más. | Cada párrafo cita fuentes verificadas y se revisa contra ellas; los temas obligatorios están listados en el alcance. El usuario revisa el texto antes de aprobar el paso 1. |
| Las fuentes pueden bloquear a clientes automáticos o desaparecer (pasó en el spec 05). | Se verifican con `GET` en el paso 1 y en la verificación final; se descartan las que respondan 403 o 404. |
| Copiar el canvas y distorsionarlo cada cuadro puede ir lento en una Raspberry Pi. | La capa solo se dibuja durante los 10 s y solo en el halo (unos 300 px), no en todo el canvas. Se mide en el spec del modo televisor. |
| Solo se puede disparar con ratón: quien use teclado o mando no ve el diálogo. | Aceptado en este spec (el nombre y el texto del cartel hablan del clic izquierdo). Una forma de ver el contenido con teclado puede ir en otro spec. |
| Los cursores SVG pueden no admitirse en algún navegador. | El `cursor` lleva una alternativa normal (`crosshair`), por si la imagen no carga. |
| La capa del halo podría bloquear los clics del juego o de los botones. | La capa del efecto tiene `pointer-events: none`; los eventos se reciben en una capa de captura aparte y solo sobre la pantalla del juego. |
| Dos modales a la vez (fin de partida y diálogo). | El fin de partida cancela el efecto y omite el diálogo; los criterios lo comprueban. |
| En pantalla completa el navegador consume la tecla Esc para salir, no para cerrar el diálogo. | El diálogo se cierra con el botón "SEGUIR JUGANDO" (con el foco al abrirse), que funciona con teclado y ratón. |
| El movimiento reducido no se respeta si se lee solo al cargar. | Se lee con `matchMedia` y se escucha su cambio mientras el efecto está activo. |

---

## Lo que **no** está en este spec

- Disparar el imán con teclado o mando.
- Sonido y vibración.
- Que el imán afecte al juego.
- Cooldown, contadores o logros.
- Más temas en el diálogo o traducciones.
- Efecto en pantallas táctiles.
- Tests automatizados.

Cada uno de esos puntos, si se hace, va en su propio spec.
