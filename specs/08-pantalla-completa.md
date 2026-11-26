# SPEC 08 — Pantalla completa para jugar en la tele

> **Estado:** Implementado
> **Depende de:** SPEC 01, SPEC 04, SPEC 07
> **Fecha:** 2026-11-26
> **Objetivo:** Añadir a la pantalla de juego botones y la tecla F que ponen en pantalla completa solo el canvas del juego, sin marco ni HUD de React y tan grande como quepa en la pantalla, con un botón para salir y evitando que la tele se apague mientras se juega.

---

## Por qué existe este spec

Al terminar el spec 07, el usuario probó Asteroides en su televisor y la cabina "se ve muy pequeña". El spec 07 ya la había agrandado (de 640 a 860 px como máximo) y dejó la pantalla completa fuera de alcance. Este spec la resuelve y es el primer paso concreto hacia el objetivo de jugar en la tele con una Raspberry Pi y un mando.

**Qué entra en pantalla completa.** El elemento en pantalla completa sigue siendo el `<main>` de `PlayScreen`, y no solo el `<canvas>`, para que el modal de "FIN DEL JUEGO" (que vive fuera del canvas) se siga viendo. Pero lo que se *muestra* dentro de él cambia desde la ampliación de abajo: solo el canvas.

**Ampliación (2026-11-26, tras probarlo en el navegador).** La primera versión (pasos 1 a 4) ponía en pantalla completa toda la cabina, con su marco, el HUD de React y los botones. Al verla, el usuario pidió que fuera "mucho más grande hacia la derecha y la izquierda", que se mostrara "sin los bordes, solo el canvas", que se mantuviera **solo el HUD del propio juego** (el que dibuja el canvas: puntuación, nivel y naves) y que hubiera un botón para salir. También echó en falta un botón para entrar sobre la propia cabina, porque el de la barra superior no lo vio. Estas decisiones **sustituyen** a las de "toda la cabina" y "HUD de React con su tamaño actual" (ver "Decisiones"). Se añaden los pasos 5 y 6 al plan.

**Sin reglas nuevas para los juegos.** La pantalla completa la maneja `play-screen.tsx`, que sigue sin nombrar ningún juego. El motor de `lib/arcade/` y los juegos no cambian.

**Idea aparte, anotada aquí para no perderla.** Durante la definición el usuario describió una función distinta: el puntero del ratón convertido en un **imán**; pasar el ratón por la pantalla de juego no hace nada, pero al hacer clic izquierdo se produce durante 10 segundos la distorsión que causaba un imán en una televisión de tubo, junto al puntero se lee un cartel "no presiones el clic izquierdo" y al final se muestra un diálogo científico que explica por qué ocurría aquello en las teles de la época. Es una experiencia educativa con su propio efecto, texto y (probablemente) fuentes citadas, y no guarda relación técnica con la pantalla completa. Decidió que **va en un spec propio**, que queda pendiente.

**Numeración.** El spec 07 llamaba "spec 08" a los tests e2e del correo. Este spec ocupa el 08, así que los tests e2e pasan a ser el **spec 09**.

---

## Alcance

**Dentro:**

- Dos botones para entrar, solo si el navegador la admite (`document.fullscreenEnabled`):
  - "PANTALLA COMPLETA" en la barra superior de la pantalla de juego, junto a PAUSA y SALIR (ya implementado).
  - "PANTALLA COMPLETA" **sobre la cabina**, en su fila inferior, entre "ARCADE VAULT" y el punto rojo: siempre visible y sin tapar el juego.
- Botón para salir, solo en pantalla completa: "VENTANA", superpuesto en la esquina **inferior derecha** del canvas, semitransparente (opaco al pasar el ratón o con el foco), con `aria-label="Salir de pantalla completa"`. Abajo y no arriba porque arriba a la derecha el canvas dibuja "NIVEL n".
- Tecla **F**: entra y sale de pantalla completa (igual que **P** pausa). Se ignora al mantenerla pulsada y con Ctrl, Meta o Alt. **Esc** sale, de forma nativa del navegador.
- Se pone en pantalla completa el elemento `<main>` de `PlayScreen`.
- En pantalla completa **solo se ve el canvas**:
  - Cuadrado, de lado `min(100vw, 100svh)`, centrado y sobre el fondo de la página (`crt-bg`, `#748c7d`), que no es el negro por defecto del navegador. En una tele de 1080p el lado es de unos 1080 px.
  - Sin marco de la cabina, borde, esquinas redondeadas, sombras, viñeta, scanlines ni fila inferior.
  - Sin el HUD de React, sin PAUSA / SALIR y sin la botonera táctil. Se mantiene el HUD del propio juego, que va dentro del canvas.
  - Siguen visibles las capas funcionales: "CARGANDO...", el cartel de pausa y el modal de "FIN DEL JUEGO". Como REANUDAR no está a la vista, el cartel de pausa dice "Pulsa P para reanudar".
- **Wake Lock:** al entrar en pantalla completa se pide `navigator.wakeLock.request("screen")`, se libera al salir y se vuelve a pedir si la pestaña recupera la visibilidad (el navegador lo suelta al ocultarse). Si el navegador no lo admite o lo rechaza, se ignora en silencio.
- `components/use-fullscreen.ts`: hook cliente con la lógica (soporte, estado, activar / desactivar y Wake Lock).
- Cambios en `components/play-screen.tsx`: `ref` en el `<main>`, los botones, la tecla F y el diseño de la pantalla completa.
- Funciona en todas las pantallas de juego, también en las de los juegos que aún son placeholder.
- Actualizar `CLAUDE.md` (arquitectura, numeración de specs).

**Fuera de alcance (para specs futuros):**

- **El imán** (puntero con forma de imán, cartel, distorsión de 10 s y diálogo científico sobre las teles de tubo): spec propio.
- Mando de videojuegos (Gamepad API), controles táctiles y el modo sin conexión de la Raspberry Pi.
- Ocultar el cursor del ratón tras unos segundos.
- Entrar en pantalla completa automáticamente al pulsar "JUGAR AHORA" (el navegador exige un gesto del usuario en la propia pantalla de juego).
- Recordar la preferencia de pantalla completa entre visitas.
- Pantalla completa "simulada" con CSS para navegadores sin la API (por ejemplo, iPhone): ahí el botón no aparece.
- Bloquear la orientación o cambiar el lienzo lógico de 480×480 del juego.
- Estirar el canvas para llenar una pantalla panorámica (se deformaría) o ampliar el campo de juego a lo ancho (cambiaría las reglas y el motor). En pantalla completa queda el cuadrado más grande posible, con el fondo verde a los lados.
- Invertir los colores del juego en pantalla completa.
- Reproducir las capas de televisor antiguo de la página (viñeta, scanlines y ruido de `html` / `body`), que el navegador no dibuja fuera del elemento en pantalla completa, y las de la propia pantalla de la cabina, que se quitan.
- Pausar automáticamente al salir de pantalla completa.
- Tests automatizados (spec 09).

---

## Modelo de datos

Esta funcionalidad no introduce datos persistentes: el estado de pantalla completa lo tiene el navegador y no se guarda. Añade un hook con esta forma:

```ts
// components/use-fullscreen.ts
export function useFullscreen<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  supported: boolean; // document.fullscreenEnabled
  active: boolean; // document.fullscreenElement === ref.current
  toggle: () => void; // requestFullscreen / exitFullscreen; ignora el rechazo del navegador
};
```

Convenciones:

- `active` se lee de `document.fullscreenElement` y se actualiza con el evento `fullscreenchange`, no se supone al pulsar: así Esc y otras salidas del navegador mantienen el botón correcto.
- `supported` es `false` en el servidor y en el primer render del cliente, y pasa a su valor real tras montar, para que el HTML del servidor y el del cliente coincidan (sin errores de hidratación).
- El Wake Lock solo está pedido mientras `active` es verdadero y se libera al salir y al desmontar el componente.
- Si la ruta se abandona en pantalla completa (SALIR, VOLVER AL VAULT), el hook sale de pantalla completa en la limpieza de un efecto. *(Corrección hecha al implementar: la spec suponía que el `<main>` desaparecía del DOM y el navegador salía solo. Con `cacheComponents` Next no desmonta la ruta anterior, la deja oculta con `display: none`, y `document.fullscreenElement` seguía siendo ese `<main>` oculto.)*

---

## Plan de implementación

1. **Hook.** Crear `components/use-fullscreen.ts` con soporte, estado por `fullscreenchange`, `toggle` y Wake Lock (pedir, liberar, repetir al volver a ser visible). Pasa `npx tsc --noEmit` y `npm run lint`. Sin cambios visibles todavía.
2. **Botón y tecla.** En `components/play-screen.tsx`: `ref` en el `<main>`, botón "PANTALLA COMPLETA" / "VENTANA" junto a PAUSA y SALIR (solo si `supported`) y la tecla F con el mismo patrón que la P. Manual: el botón y F entran y salen; Esc sale y la etiqueta vuelve; el juego sigue en marcha.
3. **Diseño en pantalla completa.** Con `active`: fondo `crt-bg` en el `<main>` y cabina y HUD con el ancho `min(100%, calc(100svh − 170px))` (sin el tope de 860 px). Manual a 1920×1080 y a 1280×720: sin scroll, cabina a toda altura, modal de fin visible y con sus botones activos.
4. **Verificación y documentación.** Recorrer los criterios de aceptación con Playwright MCP (1920×1080, 1280×720 y 390×844), guardando las evidencias en `.mcp-evidencias/<AAAA-MM-DD_HH-MM-SS>/` (carpeta nueva por ejecución, con su `README.md`). Actualizar `CLAUDE.md` (arquitectura con `use-fullscreen.ts`, "Next specs" y la numeración: tests e2e → spec 09).
5. **Pantalla completa solo con el canvas** *(ampliación)*. En `components/play-screen.tsx`, con `active`: ocultar el HUD de React, la barra de botones y la botonera; quitar marco, borde, esquinas, sombras, viñeta, scanlines y fila inferior de la cabina; dejar el canvas cuadrado de lado `min(100vw, 100svh)` centrado sobre `crt-bg`; botón "VENTANA" sobre el canvas; botón "PANTALLA COMPLETA" en la fila inferior de la cabina y texto "Pulsa P para reanudar" en el cartel de pausa. Pasa `tsc` y `lint`. Manual a 1920×1080: el canvas ocupa la altura entera.
6. **Verificación y documentación de la ampliación.** Repetir los criterios de aceptación afectados con Playwright MCP (carpeta de evidencias nueva) y actualizar `CLAUDE.md` (diseño en pantalla completa y botones).

---

## Criterios de aceptación

- [x] Existe `components/use-fullscreen.ts` y `play-screen.tsx` lo usa; `lib/arcade/` no cambia (`git diff main --stat` no lo incluye).
- [x] En `/juegos/asteroides/jugar` (1280×900) hay un botón "PANTALLA COMPLETA" en la barra superior, junto a PAUSA y SALIR.
- [x] Al pulsarlo, `document.fullscreenElement` es el `<main>` de la pantalla de juego y aparece el botón "VENTANA" sobre el canvas.
- [x] La tecla F entra y sale de pantalla completa; mantenerla pulsada no alterna repetidamente y `Ctrl+F` / `Alt+F` / `Meta+F` no hacen nada.
- [ ] Esc sale de pantalla completa y la pantalla vuelve a su aspecto de ventana, con los botones "PANTALLA COMPLETA" (el estado sale de `fullscreenchange`). *(Comprobado con `document.exitFullscreen()`, no con la tecla Esc real: el navegador sin interfaz de pruebas no la recibe.)*
- [x] Entrar o salir de pantalla completa no pausa ni reinicia la partida: la puntuación, las vidas y el nivel son los mismos antes y después.
- [x] En pantalla completa a 1920×1080 el canvas mide 1080×1080 px (`min(100vw, 100svh)`), está centrado, no hay scroll (`scrollHeight <= innerHeight`) y el fondo de la página es `#748c7d`, no negro.
- [x] En pantalla completa a 1280×720 el canvas mide 720×720 px y tampoco hay scroll.
- [x] En pantalla completa no hay marco de cabina, borde, esquinas redondeadas, viñeta, scanlines ni fila "ARCADE VAULT" a la vista, ni HUD de React, ni PAUSA / SALIR, ni botonera táctil; el HUD del propio juego (puntuación, NIVEL y naves) se sigue viendo dentro del canvas.
- [x] Fuera de pantalla completa la cabina sigue midiendo como máximo 860 px y se ve igual que antes de entrar (marco, HUD de React y botones).
- [x] Hay un botón "PANTALLA COMPLETA" en la fila inferior de la cabina, siempre visible y fuera del área del canvas; al pulsarlo entra en pantalla completa.
- [x] En pantalla completa aparece un botón "VENTANA" sobre la esquina inferior derecha del canvas, con `aria-label="Salir de pantalla completa"`, que no tapa el "NIVEL n" del canvas y que al pulsarlo sale de pantalla completa.
- [x] En pantalla completa la tecla P pausa y reanuda, y el cartel de pausa dice "Pulsa P para reanudar".
- [x] Al terminar la partida en pantalla completa el modal "FIN DEL JUEGO" se ve dentro de la pantalla completa; "GUARDAR PUNTUACIÓN" y "JUGAR DE NUEVO" funcionan y la partida nueva sigue en pantalla completa.
- [x] Abandonar la pantalla de juego estando en pantalla completa (el botón "VOLVER AL VAULT" del modal o "atrás" del navegador; el enlace SALIR no se ve en pantalla completa) lleva a la otra página, `document.fullscreenElement` es `null` y la consola no tiene errores.
- [x] En un juego placeholder (por ejemplo `/juegos/tetris/jugar`) el botón y la tecla F también funcionan.
- [x] Si `document.fullscreenEnabled` es `false` (simulado), no hay botón, F no hace nada y no hay errores en la consola ni en la hidratación.
- [x] Al entrar en pantalla completa se llama una vez a `navigator.wakeLock.request("screen")`, al salir se libera el bloqueo, y si `navigator.wakeLock` no existe o la petición se rechaza no hay error y la pantalla completa funciona igual.
- [x] En 390×844 la barra superior con el nuevo botón no provoca scroll horizontal.
- [x] `npx tsc --noEmit`, `npm run lint` y `npm run build` terminan sin errores.
- [x] `CLAUDE.md` describe `use-fullscreen.ts` y la nueva numeración de specs (tests e2e = spec 09).

Notas de la verificación (Playwright MCP; evidencias en `.mcp-evidencias/2026-11-26_04-43-48/` y `.mcp-evidencias/2026-11-26_20-14-17/`):

- El criterio de Esc queda sin marcar: se probó el equivalente `exitFullscreen()`, no la tecla real.
- El Wake Lock se comprobó con un doble de `navigator.wakeLock` (llamada única con `"screen"`, liberación al salir, rechazo y ausencia sin errores), no con el real del navegador.
- `npm run build` se hizo en una copia del proyecto porque había un `next dev` del usuario en marcha (`CLAUDE.md` pide no compilar con él abierto).
- El caso sin `fullscreenEnabled` y el de "VOLVER AL VAULT" se comprobaron con el primer diseño (cabina completa); el código que los resuelve (el hook y la condición `supported`) no cambió con la ampliación.
- No se comprobó a tamaño real de televisor ni que el usuario vea el botón en Brave; en el Chromium de pruebas aparecen los dos.

---

## Decisiones tomadas y descartadas

- **Sustituida (2026-11-26):** ~~poner en pantalla completa toda la cabina con su HUD de React.~~ Era la elección inicial del usuario; tras verla pidió que fuera solo el canvas, sin bordes, "mucho más grande hacia la derecha y la izquierda".
- **Sí:** el elemento en pantalla completa sigue siendo el `<main>` (para que el modal de fin se vea), pero dentro solo se muestra el canvas: cuadrado de lado `min(100vw, 100svh)`, centrado sobre `crt-bg`, sin marco ni HUD de React. (Respuesta del usuario: "el cuadrado más grande posible, centrado".)
- **No:** estirar el canvas a todo el ancho (deforma la imagen) ni ampliar el campo de juego a lo ancho (cambia las reglas y toca el motor y `asteroides.ts`). Si en la tele se quiere llenar el ancho, es otro spec.
- **Sí:** se mantiene solo el HUD del propio juego, el que dibuja el canvas. (Respuesta del usuario.) El HUD de React se oculta en pantalla completa, pero sigue existiendo fuera de ella.
- **No:** invertir los colores del juego en pantalla completa. No se eligió.
- **Sí:** botón "PANTALLA COMPLETA" también sobre la cabina, en su fila inferior, y botón "VENTANA" sobre el canvas para salir. (Respuesta del usuario: "entrar sobre la cabina, salir sobre el canvas".) *(Decisión mía sobre el sitio exacto: fila inferior para entrar, para no tapar el juego, y esquina inferior derecha para salir, porque arriba a la derecha el canvas dibuja "NIVEL n".)*
- **No:** que el botón de salir sea solo visible al mover el ratón. No se eligió; es más simple y funciona con teclado y mando.
- **Sí:** quitar también la viñeta y las scanlines de la pantalla de la cabina en pantalla completa. *(Decisión mía: el usuario pidió "solo el canvas", sin bordes.)* Se pueden devolver si se echan en falta.
- **Sí:** botón en la barra del HUD y tecla F. Salir con el mismo botón, F o Esc. (Respuesta del usuario.)
- **No:** solo botón. En la tele obligaría a usar ratón o a tabular hasta el botón.
- **Sustituida (2026-11-26):** ~~la cabina a toda altura y el HUD de React con su tamaño actual.~~ Ahora solo el canvas (ver arriba).
- **Sí:** Wake Lock incluido: la pantalla no se apaga mientras se juega en pantalla completa. (Respuesta del usuario: eligió "evitar que la tele se apague".)
- **No:** ocultar el cursor del ratón. No se eligió; va en el spec del mando y modo televisor.
- **Sí:** el imán va en un spec propio. (Respuesta del usuario.) Es una experiencia educativa independiente, con su efecto, su texto científico y su puntero, que no necesita la pantalla completa para existir.
- **Sí:** la lógica va en un hook (`use-fullscreen.ts`), no dentro de `play-screen.tsx`, que ya tiene el ciclo de partida, el guardado y el motor. *(Decisión mía al escribir el spec: el nombre y la ubicación del archivo no se preguntaron.)*
- **Sí:** el botón solo se muestra si la API está disponible; si no, no hay botón. *(Decisión mía: no se preguntó.)* Un sustituto con CSS no tiene sentido en la tele y duplicaría trabajo.
- **No:** pausar al salir de pantalla completa. *(Decisión mía.)* Salir con Esc no debe cambiar la partida; el jugador pausa si quiere.
- **Sí:** etiquetas "PANTALLA COMPLETA" y "VENTANA", y la tecla F. *(Decisión mía sobre el texto.)* F no choca con ninguna tecla de Asteroides (flechas, `W A S D`, Espacio y P para pausar).
- **Sustituida (2026-11-26):** ~~el tamaño en pantalla completa reutilizaba la fórmula del spec 07 sin el tope: `min(100%, calc(100svh − 170px))`.~~ Ahora el lado del canvas es `min(100vw, 100svh)`; no hace falta reservar sitio para el HUD ni el pie.
- **Sí:** el estado de pantalla completa se lee del navegador (`fullscreenchange`) y no se guarda. Así Esc y cualquier otra salida mantienen la interfaz correcta.
- **No:** recordar la preferencia entre visitas. El navegador exige un gesto del usuario para entrar, así que no se podría restaurar sola.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| En pantalla completa el navegador solo dibuja el elemento elegido: la viñeta, las scanlines y el ruido de `html` / `body` (spec 04) no se ven y el fondo sería negro. | El `<main>` toma el fondo `crt-bg` mientras está activo. Las capas globales y las de la pantalla de la cabina quedan fuera en pantalla completa (ver arriba). |
| El usuario no ve el botón de la barra superior al probarlo (ocurrió con la primera versión). | Hay otro botón sobre la cabina, en su fila inferior, y la tecla F. Si siguiera sin verse en su navegador, se comprueba `document.fullscreenEnabled` en la consola: `false` significa que el navegador no la admite en ese contexto. |
| El botón "VENTANA" sobre el canvas tapa parte del juego. | Va en la esquina inferior derecha, semitransparente, y no cubre el HUD del canvas. |
| En una pantalla panorámica quedan franjas verdes a los lados del canvas cuadrado. | Aceptado: es la opción que no deforma el juego. Llenar el ancho va en otro spec. |
| El navegador rechaza `requestFullscreen()` si no viene de un gesto del usuario. | Solo se llama desde el clic del botón y desde la tecla F; el rechazo se ignora y la etiqueta no cambia porque depende de `fullscreenchange`. |
| `position: fixed` del modal de fin dentro de un elemento en pantalla completa. | Se comprueba en el criterio del modal; el modal es hijo del `<main>`, que es el elemento en pantalla completa. |
| Con `cacheComponents` Next conserva la ruta anterior oculta y el navegador no sale de pantalla completa por un elemento oculto: se quedaría una pantalla completa vacía al pulsar SALIR. | El hook sale de pantalla completa al abandonar la pantalla (limpieza del efecto) y un criterio de aceptación lo comprueba con SALIR y con VOLVER AL VAULT. |
| Con el modal de fin abierto, su fondo (`fixed inset-0`) tapa el botón "PANTALLA COMPLETA" y no se puede pulsar con el ratón. | Aceptado: es un modal. La tecla F sigue funcionando y el modal tiene sus propios botones. |
| El Wake Lock se pierde al ocultar la pestaña. | Se vuelve a pedir en `visibilitychange` si la pantalla completa sigue activa. |
| iPhone y otros navegadores sin `requestFullscreen` para elementos. | `document.fullscreenEnabled` es `false` y el botón no aparece; no hay error. |
| Una futura tecla F en un juego chocaría con el atajo. | Anotado en `CLAUDE.md`; el juego que la necesite lo resolverá en su spec. |
| Los 170 px de la fórmula de altura pueden no ajustar bien en pantallas muy bajas o muy altas. | Se mide a 1920×1080 y a 1280×720 en la verificación y se ajusta el valor si hay scroll. |
| El `ref` del `<main>` cambia si el componente se vuelve a montar. | El hook lee `ref.current` al activar y compara con `fullscreenElement`, no guarda el elemento. |

---

## Lo que **no** está en este spec

- El imán (puntero, cartel, distorsión de 10 s y diálogo científico): spec propio.
- Mando de videojuegos, controles táctiles y modo sin conexión.
- Ocultar el cursor del ratón.
- Entrar en pantalla completa automáticamente al pulsar "JUGAR AHORA" o recordar la preferencia.
- Pantalla completa simulada con CSS, bloqueo de orientación, agrandar el HUD de React o cambiar el lienzo lógico.
- Las capas de televisor antiguo de la página en pantalla completa.
- Tests automatizados (spec 09).

Cada uno de esos puntos, si se hace, va en su propio spec.
