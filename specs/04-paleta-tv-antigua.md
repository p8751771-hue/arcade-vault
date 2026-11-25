# SPEC 04 — Paleta de televisor antiguo (#748c7d) en todo el sitio

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02, SPEC 03
> **Fecha:** 2026-11-24
> **Objetivo:** Sustituir el tema neón de todas las pantallas (incluidos los mensajes de resultado y error) por una paleta monocroma verde-gris basada en `#748c7d` con texto negro, y añadir una capa de scanlines con una banda de refresco que baja por la pantalla para que el sitio parezca un televisor antiguo.

---

## Por qué existe este spec

Hasta ahora la fuente de verdad visual eran las referencias (`references/Arcade Vault.dc.html` y `references/home-about/`), con un tema neón sobre fondo casi negro: cian, magenta, amarillo, verde, brillos y degradados. El usuario quiere otro aspecto: el de la pantalla de un **televisor antiguo**, con un fondo verde-gris `#748c7d`, letras negras y líneas que recorren la pantalla.

Este spec **cambia una regla del proyecto**: la referencia sigue mandando en la **maquetación** (posiciones, tamaños, tipografía, textos, cortes responsive), pero **ya no en el color ni en los efectos**. Los colores y efectos los define este spec. Los specs 01–03 quedan como históricos y no se reescriben.

**Contraste.** `#748c7d` es un tono medio: el negro sobre él da 5,79:1 (cumple WCAG AA, ≥ 4,5:1), pero cualquier texto de color que no sea casi negro baja de 4,5:1. Por eso **todo el texto es negro o casi negro** y los colores de estado (éxito, aviso, error) y de medalla se usan solo en **iconos, bordes y barras**, donde basta 3:1. Los valores de la paleta se calcularon con la fórmula de luminancia de WCAG 2.x antes de escribir este spec (tabla en "Modelo de datos").

**Ampliación (2026-11-24, durante el paso 3): refactorización de nombres.** Al empezar la implementación, el usuario pidió renombrar las clases CSS compartidas, porque este spec cambia el estilo visual del sitio y los nombres `*-neon` dejan de describirlo. El cliente pidió además refactorizar el código y **conservar la historia del cambio**. La historia queda en tres sitios:
- la tabla "Renombrado de clases" de "Modelo de datos";
- un commit por paso (`spec-04-step-MM`);
- `CLAUDE.md`, que documenta los nombres nuevos.

No se mantienen alias con los nombres antiguos.

**Orden.** El spec 03 debe estar en estado `Implementado` y mergeado en `main` antes de ejecutar `/spec-impl` de este spec: aquí se recolorea su tarjeta de resultado. Los tests e2e de Playwright del servicio de correo, que el spec 03 apuntaba como "spec 04", pasan a ser el **spec 05**.

---

## Alcance

**Dentro:**

- **Paleta monocroma** en tokens de `app/globals.css` (`--color-crt-*`): fondo, superficie, hundido, línea, texto, texto secundario, tres colores de estado y tres de medalla (valores en "Modelo de datos").
- **Todas las pantallas:** `/`, `/biblioteca`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/salon-de-la-fama`, `/acceso`, `/acerca-de`, la página 404, el header, el menú móvil, el pie y el `fallback` del header en `app/(site)/layout.tsx`.
- **Mensajes de resultado y error:** la tarjeta de resultado del formulario de contacto (spec 03) y cualquier otro estado (guardado de puntuación y pausa en la cabina, estados de `auth-form`). El texto va en negro y el estado se distingue por icono (✓ / ! / ✕) y borde de su color.
- **Componentes y clases compartidas:** `.btn-neon`, `.chip-neon`, `.panel-neon`, `.card-neon`, `.input-neon`, `.btn-home` (+ `-lg`, `-xl`, `-pulse`) y los modificadores `.neon-*` pasan a la paleta y pierden los brillos.
- **Hover, foco y activo:** invertidos, fondo negro y texto `#8aa293` (7,67:1). El foco de teclado es un contorno negro de 2 px con 2 px de separación.
- **Portadas pixel-art** (`components/game-cover.tsx`): se dibujan solo con cuatro tonos de la paleta, como una pantalla de cuatro tonos. Las mini-tarjetas, las chips y la cabina también usan la paleta en lugar del color de cada juego.
- **Efectos de televisor antiguo** (los únicos que quedan):
  - fondo plano `#748c7d`;
  - viñeta oscura suave en los bordes;
  - scanlines finas y oscuras fijas;
  - ruido;
  - **banda de refresco**: una franja horizontal algo más clara que baja del borde superior al inferior de la ventana visible en bucle (8 s).

  Es una capa fija sobre todas las páginas, incluida la cabina, y no captura clics (`pointer-events: none`).
- **`prefers-reduced-motion: reduce`:** las scanlines, el ruido y la viñeta se ven pero no se mueven, y la banda se oculta.
- **Se quitan** los brillos neón (`text-shadow` y `box-shadow` de color), los degradados de color (títulos del hero, "ACERCA DE ARCADE VAULT", fondo radial) y la rejilla cian en perspectiva.
- Actualizar `CLAUDE.md` (regla de fuente de verdad, paleta, tokens, efectos).

**Fuera de alcance (para specs futuros):**

- Maquetación, tamaños, tipografía (Press Start 2P y Courier Prime) y textos: no cambian. Las medidas con Playwright de los specs 02 y 03 deben seguir coincidiendo.
- Datos: `color` de `Game` (`lib/games.ts`), `accent` de `lib/home.ts` y de `lib/about.ts` y `HomeAccent` se conservan sin uso visual (ver "Decisiones").
- Selector de tema, modo claro/oscuro o volver al tema neón: el sitio tiene un único tema.
- Efectos más allá de los listados: curvatura de pantalla, aberración cromática, parpadeo de encendido o sonido.
- Tests e2e de Playwright del servicio de correo (spec 05), tests automatizados en general, SEO, i18n y despliegue.

---

## Modelo de datos

Tokens nuevos en el `@theme inline` de `app/globals.css`. Generan utilidades como `bg-crt-bg`, `text-crt-ink` o `border-crt-line`:

```css
/* Paleta de televisor antiguo (spec 04) */
--color-crt-bg: #748c7d;       /* fondo de página */
--color-crt-surface: #8aa293;  /* tarjetas, paneles, header, menú, formulario */
--color-crt-well: #6e8677;     /* inputs, pozos, pantalla de la cabina */
--color-crt-line: #2f3b34;     /* bordes y separadores */
--color-crt-ink: #000000;      /* texto principal, títulos, botones */
--color-crt-ink-2: #0e1511;    /* texto secundario, placeholders */
--color-crt-ok: #0b3d21;       /* solo iconos y bordes: éxito */
--color-crt-warn: #3d3000;     /* solo iconos y bordes: aviso */
--color-crt-err: #4a0d0a;      /* solo iconos y bordes: error */
--color-crt-gold: #3f3200;     /* solo barras e insignias de medalla */
--color-crt-silver: #2b352f;
--color-crt-bronze: #4a230c;
```

Contraste calculado (WCAG 2.x):

| Color | sobre `crt-bg` | sobre `crt-surface` | sobre `crt-well` | Uso permitido |
| --- | --- | --- | --- | --- |
| `crt-ink` `#000000` | 5,79 | 7,67 | 5,34 | Cualquier texto |
| `crt-ink-2` `#0e1511` | 5,11 | 6,76 | 4,71 | Cualquier texto |
| `crt-line` `#2f3b34` | 3,22 | 4,27 | — | Bordes (≥ 3:1) |
| `crt-ok` `#0b3d21` | 3,40 | 4,50 | — | Iconos y bordes |
| `crt-warn` `#3d3000` | 3,57 | 4,73 | — | Iconos y bordes |
| `crt-err` `#4a0d0a` | 4,28 | 5,67 | — | Iconos y bordes |
| `crt-gold` / `silver` / `bronze` | 3,47 / 3,50 / 3,77 | 4,60 / 4,64 / 4,99 | — | Barras e insignias |
| `#8aa293` (texto invertido) | sobre `#000`: 7,67 | | | Hover, foco y activo |

Otras estructuras que cambian de valor (no de forma):

- `MEDALS` en `lib/scores.ts`: `{ color, rgb }` de oro, plata y bronce pasan a `crt-gold` / `crt-silver` / `crt-bronze`.
- `components/game-cover.tsx`: los colores fijos (`C`, `M`, `Y`, `GR`, `#fff` y los degradados por juego) se sustituyen por cuatro tonos: `#0e1511` (pixel oscuro), `#2f3b34` (fondo de portada), `#8aa293` (pixel claro) y `#748c7d` (pixel medio).
- `components/home/accent.ts`: `NEON_TEXT` y `ACCENT_COLOR` devuelven las clases de la paleta para cualquier acento.

**Renombrado de clases (ampliación del paso 3).** Las clases compartidas de `app/globals.css` cambian de nombre y todos los usos de `app/` y `components/` se actualizan en el mismo commit:

| Antes (specs 01–03) | Después (spec 04) | Motivo |
| --- | --- | --- |
| `.btn-neon` | `.btn-crt` | Botón de contorno; ya no es neón |
| `.btn-neon-solid` | `.btn-crt-solid` | Botón relleno |
| `.chip-neon` | `.chip-crt` | Chip o pestaña de filtro |
| `.panel-neon` | `.panel-crt` | Panel |
| `.card-neon` | `.card-crt` | Tarjeta de juego |
| `.input-neon` | `.input-crt` | Campo de formulario |
| `.text-pixel-glow` | `.text-pixel-crt` | Texto pixel; ya no brilla |
| `.btn-home`, `-lg`, `-xl`, `-pulse` | `.btn-cut`, `-lg`, `-xl`, `-pulse` | Botón de esquinas cortadas; no es exclusivo de la landing |
| — | `.btn-cut-ghost` | Variante fantasma (borde `crt-line`) que antes se componía con utilidades |
| `.neon-cyan`, `.neon-pink`, `.neon-yellow`, `.neon-green`, `.neon-muted` | eliminadas | Ponían el color por elemento (`--neon`, `--neon-rgb`); la paleta es única |

**Convenciones:**

- **Prohibido en `app/`, `components/` y `lib/`:** los valores del tema neón (`#00f5ff`, `#ff006e`, `#f5ff00`, `#00ff88`, `#39ff88`, `#e6e9ff`, `#8a8fb5`, `#0a0a0f`, `#ffcf3a`, `#ffd24a`, `#ff5f56`, sus `rgb(…)` y los tokens `neon-*` / `home-*` de color), salvo en comentarios y en el campo `color` de los datos de `lib/games.ts`, que se conserva sin uso visual por decisión del usuario (ver "Decisiones"). Se comprueba con `grep` en el criterio de aceptación.
- **Texto:** solo `crt-ink` o `crt-ink-2`. Los colores de estado y medalla nunca van en texto.
- **Capa de televisor:** cuatro pseudo-elementos fijos en `app/globals.css` (`html::before`, `html::after`, `body::before`, `body::after`), por encima del contenido (`z-index` máximo del sitio) y con `pointer-events: none`. Para no bajar el contraste del texto de 4,5:1, la viñeta oscurece como máximo un 12 % (`rgb(0 0 0 / 0.12)`) y las scanlines un 8 % por línea.
  - **Viñeta:** `radial-gradient` transparente en el centro y `rgb(0 0 0 / 0.12)` en los bordes.
  - **Scanlines:** `repeating-linear-gradient` de 1 px `rgb(0 0 0 / 0.08)` cada 3 px.
  - **Ruido:** el SVG actual, en opacidad 0,15.
  - **Banda de refresco:** franja de `18vh` de alto con degradado vertical `transparent → rgb(255 255 255 / 0.07) → transparent`. Animación `crt-roll` de 8 s, `linear` e `infinite`, desde `translateY(-18vh)` hasta `translateY(100vh)`. Con `prefers-reduced-motion: reduce` lleva `display: none`.
- **Botones** (`.btn-home`, `.btn-neon`): borde `crt-ink` de 1 px y texto `crt-ink` sobre transparente, con las esquinas cortadas y el marco interior de la referencia (en `crt-line`). En hover y activo se invierten a fondo `crt-ink` y texto `#8aa293`. La variante "ghost" usa el borde `crt-line`.
- **Enlace activo del header:** el subrayado de 2 px pasa a `crt-ink` sin brillo.
- **Tarjeta de resultado (spec 03):** título y frase en `crt-ink`, la línea `Código:` en `crt-ink-2`, el icono en `crt-ok` / `crt-warn` / `crt-err` y un borde de 2 px del mismo color alrededor de la tarjeta.
- **Selección de texto:** fondo `crt-ink` y texto `#8aa293`.

---

## Plan de implementación

Toda la interfaz se trabaja con `/frontend-design`, siguiendo la paleta de este spec en lugar de la de las referencias. Cada verificación con Playwright guarda sus evidencias en `.mcp-evidencias/AAAA-MM-DD_HH-MM-SS/` (carpeta nueva por ejecución). Antes del paso 1 se toman en `main` las medidas de partida: alto del documento y del header de cada ruta, a 1280×900 y a 390×844.

1. **Tokens y base.** Añadir los tokens `--color-crt-*` a `app/globals.css`, poner `body` en `crt-bg` / `crt-ink`, `::selection` y el foco de teclado. Verificación: `npm run build` pasa; `body` tiene `background-color: rgb(116, 140, 125)` y `color: rgb(0, 0, 0)`.
2. **Capa de televisor.** Sustituir las capas de fondo actuales (degradados radiales, rejilla en perspectiva, scanlines en `overlay` y ruido) por viñeta, scanlines, ruido y banda de refresco, según "Convenciones". Añadir la animación `crt-roll`. Verificación con Playwright: la banda cambia de posición entre dos capturas separadas 2 s; con `prefers-reduced-motion` la banda tiene `display: none` y las scanlines siguen visibles; un clic sobre un enlace bajo la capa navega.
3. **Clases compartidas.** Pasar `.btn-neon`, `.chip-neon`, `.panel-neon`, `.card-neon`, `.input-neon`, `.btn-home*` y `.neon-*` a la paleta, quitar brillos y añadir el estado invertido. Verificación: hover sobre un `.btn-home` da fondo negro y texto `rgb(138, 162, 147)`.
4. **Header, menú móvil, pie y layout.** `components/site-header.tsx` y `app/(site)/layout.tsx`. Verificación a 1280 y 390: header y pie con la paleta; el panel móvil abierto con fondo `crt-surface`; alto del header igual que en `main`.
5. **Landing.** `app/(site)/page.tsx` y `components/home/*`: `accent.ts`, `floating-silhouettes`, `feature-card`, `mini-card`, `activity-ticker`, `top-players`, `section-head`, `hero-ctas`, `plan-cta`. Verificación: ningún valor prohibido en esos archivos; alto del documento igual que en `main`.
6. **Biblioteca, detalle y portadas.** `app/(site)/biblioteca/page.tsx`, `app/(site)/juegos/[id]/page.tsx`, `components/game-library.tsx`, `components/game-card.tsx`, `components/game-cover.tsx`. Verificación: las seis portadas solo contienen píxeles de los cuatro tonos (lectura de `getImageData` del canvas); chips y tarjetas sin color por juego.
7. **Salón de la Fama, acceso y medallas.** `components/hall-of-fame.tsx`, `components/auth-form.tsx`, `app/(site)/salon-de-la-fama/page.tsx`, `MEDALS` en `lib/scores.ts`. Verificación: medallas con `crt-gold` / `crt-silver` / `crt-bronze` y texto negro; estados de `auth-form` en la paleta.
8. **Cabina de juego.** `components/play-screen.tsx` y `app/juegos/[id]/jugar/page.tsx`: marco, pantalla `crt-well`, HUD, pausa y estados de guardado. Verificación a 1280 y 390, con la capa de televisor encima.
9. **Acerca de.** `app/(site)/acerca-de/page.tsx`, `components/about/highlight-icon.tsx` y la tarjeta de resultado de `components/about/contact-form.tsx` según "Convenciones". Verificación: las 9 respuestas de la tabla del spec 03 (simuladas) muestran texto negro, icono y borde del color de su tono.
10. **Limpieza y documentación.** Quitar de `app/globals.css` los tokens de color que ya no use nadie (`neon-*`, `home-*` de color, `void`, `panel`, `ink-*` del spec 01) y comprobar con `grep` que no queda ningún valor prohibido. Actualizar `CLAUDE.md`: la regla "la referencia gana" pasa a ser solo para la maquetación; documentar paleta, tokens, capa de televisor y la regla de texto negro.
11. **Verificación global.** Con Playwright, en las 7 rutas (`/`, `/biblioteca`, `/juegos/arkanoid`, `/juegos/arkanoid/jugar`, `/salon-de-la-fama`, `/acceso`, `/acerca-de`) más la 404, a 1280×900 y 390×844:
    - recorrer todos los elementos con texto visible y calcular el contraste de su color con su fondo efectivo (el primer ancestro con fondo no transparente), sin contar la capa de televisor;
    - comparar el alto del documento y del header con las medidas de partida de `main`;
    - guardar una captura de página completa por ruta y ancho.

---

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] `grep` de los valores prohibidos de "Convenciones" en `app/`, `components/` y `lib/` (sin comentarios) no devuelve resultados.
- [ ] `body` tiene fondo `#748c7d` y texto `#000000` en todas las rutas.
- [ ] El escaneo de contraste de Playwright no encuentra ningún texto por debajo de 4,5:1 (3:1 para texto de ≥ 24 px o ≥ 18,66 px en negrita) en ninguna ruta, a 1280 ni a 390.
- [ ] Ningún elemento visible tiene `text-shadow` ni `box-shadow` de color: solo `none` o sombras negras.
- [ ] La banda de refresco se desplaza de arriba abajo de la ventana en 8 s y se repite; está presente en todas las rutas, incluida `/juegos/arkanoid/jugar`.
- [ ] Con `prefers-reduced-motion: reduce`, la banda tiene `display: none` y ningún elemento tiene una animación en curso de más de 0,01 ms; las scanlines siguen visibles.
- [ ] La capa de televisor no bloquea clics: los enlaces del header, las tarjetas y los botones del formulario funcionan con la capa encima.
- [ ] Hover y foco de teclado de botones y enlaces muestran el estado invertido (fondo negro, texto `#8aa293`) o el contorno negro de 2 px.
- [ ] Las seis portadas solo usan píxeles de `#0e1511`, `#2f3b34`, `#748c7d` y `#8aa293`.
- [ ] La tarjeta de resultado del formulario de contacto muestra, para las 9 respuestas del spec 03, texto negro, icono y borde de `crt-ok`, `crt-warn` o `crt-err` según su tono.
- [ ] Las medallas del Salón de la Fama y de "TOP JUGADORES · HOY" usan `crt-gold`, `crt-silver` y `crt-bronze`, con el texto en negro.
- [ ] El alto del documento y del header de cada ruta, a 1280 y a 390, es igual al de `main` antes de este spec.
- [ ] `CLAUDE.md` dice que la referencia manda en la maquetación y este spec en el color, y documenta los tokens `crt-*` y la capa de televisor.

---

## Decisiones tomadas y descartadas

- **Sí:** paleta monocroma verde-gris derivada de `#748c7d` con texto negro y tres colores de estado. El usuario la eligió frente al monocromo estricto y a los acentos neón oscurecidos.
- **No:** monocromo estricto, en el que los estados solo se distinguen por icono. Pierde una señal útil en los errores.
- **No:** conservar los acentos neón oscurecidos. Se perdería la sensación de televisor antiguo.
- **Sí:** valores de la paleta corregidos respecto a la primera propuesta. Con la fórmula de WCAG, "hundido" `#5f7567` daba 4,23 con texto negro (pasa a `#6e8677`, 5,34) y "texto 2" `#1f2a23` daba 4,10 sobre el fondo (pasa a `#0e1511`, 5,11). Los estados `#0f4d2a` / `#5c4a00` / `#6b1410` daban 2,4–3,3 y pasan a tonos más oscuros que cumplen 3:1 como iconos.
- **Sí:** los colores de estado y medalla solo en iconos, bordes y barras, nunca en texto. Sobre un fondo de tono medio, ningún color con matiz visible llega a 4,5:1 como texto.
- **Sí:** solo efectos de televisor antiguo (viñeta, scanlines, ruido y banda); se quitan brillos, degradados de color y la rejilla. El usuario lo eligió. Los brillos sobre un fondo claro se ven borrosos.
- **Sí:** scanlines fijas más una banda de refresco que baja, en una capa fija sobre la ventana visible. El usuario lo pidió ("líneas superpuestas que se deslizan de arriba abajo") y eligió esta variante frente a desplazar todas las scanlines o recorrer el documento entero.
- **No:** que la banda recorra el documento hasta el pie. En páginas largas como Inicio casi nunca estaría a la vista.
- **Sí:** con `prefers-reduced-motion` la banda se oculta y el resto queda quieto. Una banda detenida parecería una mancha. El usuario lo eligió.
- **Sí:** la capa cubre también la cabina de juego. El usuario lo eligió.
- **Sí:** oscurecimiento de la capa limitado (viñeta ≤ 12 %, scanlines ≤ 8 %). Con una viñeta del 35 % el negro sobre el fondo bajaría a unos 2,9:1 en los bordes.
- **Sí:** hover, foco y activo invertidos (fondo negro, texto `#8aa293`). El usuario lo eligió; recuerda a un carácter resaltado en una pantalla de fósforo y sustituye a los brillos.
- **Sí:** portadas, mini-tarjetas, chips y cabina en la paleta, sin color por juego. El usuario lo eligió frente a dejar las portadas intactas.
- **Sí:** los datos de color (`Game.color`, `accent` de la landing y de Acerca de) se conservan sin uso visual. El usuario lo eligió; así no se tocan los tipos de los specs 01–03 y un tema futuro podría volver a usarlos.
- **Sí:** la referencia sigue mandando en maquetación, tipografía y textos, y este spec en color y efectos. Las medidas con Playwright de los specs 02 y 03 siguen sirviendo como regresión.
- **Sí:** número 04 para este spec; los tests e2e del correo pasan al 05. El usuario lo eligió, para que los tests validen ya los colores nuevos.
- **Sí:** el spec 03 se cierra y se mergea antes de implementar este.
- **Sí (ampliación, paso 3):** renombrar las clases compartidas (`*-neon` → `*-crt`, `.btn-home` → `.btn-cut`) y eliminar los modificadores `.neon-*`. El usuario lo pidió: el cambio es de estilo visual y los nombres deben describirlo. El cliente pidió conservar la historia del cambio, que queda en la tabla de renombrado, en los commits por paso y en `CLAUDE.md`.
- **No (ampliación):** alias temporales con los nombres antiguos. Mantendrían vivo un vocabulario que ya no describe el sitio; el renombrado completo cabe en un commit.
- **Sí (ampliación):** el `grep` de valores prohibidos excluye el campo `color` de `lib/games.ts`. Este spec conserva esos datos sin uso visual por decisión del usuario, y la prohibición busca colores aplicados al estilo, no datos guardados.
- **Sí:** un solo spec para todo el sitio. Es un único cambio de tema; partirlo por pantallas dejaría el sitio con dos temas mezclados entre specs. El riesgo de tamaño se reparte en pasos que dejan el sitio funcionando.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Quedan colores neón sueltos en clases arbitrarias de Tailwind (`[text-shadow:…]`, `rgb(0_245_255/…)`) | `grep` de valores prohibidos en el paso 10 y como criterio de aceptación. |
| La capa de televisor baja el contraste del texto | Límites de oscurecimiento en "Convenciones" y escaneo de contraste en el paso 11. |
| La capa fija bloquea clics o la selección de texto | `pointer-events: none` en los cuatro pseudo-elementos; criterio de aceptación específico. |
| La banda animada cuesta rendimiento en móviles | Solo anima `transform` (compuesto por la GPU), en un único elemento; se oculta con `prefers-reduced-motion`. |
| Los cuatro tonos de portada hacen indistinguibles los juegos | Las portadas conservan su dibujo (ladrillos, tetrominós, serpiente…); solo cambia la paleta, y cada tarjeta lleva el título del juego. |
| Cambiar tokens compartidos rompe la maquetación de alguna pantalla | Solo cambian colores y sombras; el paso 11 compara alto del documento y header con `main`. |

---

## Lo que **no** entra en este spec

- Cambios de maquetación, tipografía o textos.
- Eliminar los campos de color de los datos (`Game.color`, `accent`).
- Selector de tema o vuelta al tema neón.
- Curvatura de pantalla, aberración cromática, parpadeo de encendido o sonido.
- Tests e2e del servicio de correo (spec 05) y tests automatizados en general.

Cada uno, si llega, va en su propio spec.
