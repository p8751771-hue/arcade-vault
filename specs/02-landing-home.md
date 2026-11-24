# SPEC 02 — Landing "Inicio" de Arcade Vault

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-24
> **Objetivo:** Construir la landing "Inicio" del diseño `references/home-about/` en `/`, mover la Biblioteca a `/biblioteca` y adoptar el header, menú móvil, pie y fondo de ese diseño en todo el sitio, sin implementar la página "Acerca de".

---

## Por qué existe este spec

El diseño nuevo de `references/home-about/` (`home.jsx`, `nav.jsx`, `styles.css`, más el prototipo empaquetado `arcade-vault-standalone.html`) separa dos pantallas que el spec 01 tenía fundidas en `/`: una landing de presentación ("Inicio") y la Biblioteca. Hoy `/` es la Biblioteca, así que este spec **modifica una decisión del spec 01**: la Biblioteca pasa a `/biblioteca` y `/` pasa a ser la landing. El spec 01 queda como histórico (estado `Implementado`) y no se reescribe; donde diga que la Biblioteca está en `/`, manda este spec.

La base visual ya existe y **no se rehace**: `app/globals.css` (tokens, `.btn-neon`, `.panel-neon`, fondo CRT, `prefers-reduced-motion` global), `components/game-cover.tsx`, `components/session-provider.tsx` y `lib/games.ts` / `lib/scores.ts`.

La fuente de verdad visual de la landing es `references/home-about/` (`home.jsx` para estructura y textos, `styles.css` líneas 930–1069 y 1621–1727 para estilos). Si algo de este spec contradice la referencia en lo visual, gana la referencia, con las excepciones listadas en "Decisiones".

**Ampliación (2026-11-24, pasos 12–16).** Con los pasos 1–11 implementados, la comparación con Playwright contra el prototipo mostró que el contenido de la landing coincide, pero el header, el logo, el botón de sesión, el menú móvil, el pie y el fondo siguen el diseño del spec 01 y no el de `home-about`. El usuario pidió alinearlos y eligió ampliar este spec en lugar de abrir otro. Esto **reemplaza** la decisión anterior "header solo con Inicio añadido". La fuente de verdad de estas piezas es `references/home-about/nav.jsx` y `styles.css` líneas 1–206 (`.av-bg`, `.av-noise`, `.av-nav`, `.av-mobile-*`, `.btn`), más el `<footer>` del prototipo empaquetado. Medidas de partida en `.mcp-evidencias/2026-11-24_06-16-59/`.

---

## Alcance

**Dentro:**

- Ruta `/` = landing "Inicio" con siete bloques, en este orden:
  1. **Hero:** texto "▸ INSERTA UNA MONEDA_" (guion bajo parpadeante), título en tres líneas (`EL ARCADE` / `CLÁSICO ESTÁ` / `DE VUELTA`), subtítulo, dos CTA, indicador "DESLIZA ▼" y ocho siluetas pixel-art flotantes decorativas.
  2. **`// 01 ¿POR QUÉ ARCADE VAULT?`:** cuatro tarjetas de ventajas con icono pixel (JUEGOS CLÁSICOS, 100% GRATIS, LADDER BOARDS, SIEMPRE CRECIENDO).
  3. **`// 02 JUEGOS DISPONIBLES AHORA`:** fila de 6 mini-tarjetas con los juegos reales de `GAMES` y botón "VER TODOS LOS JUEGOS →".
  4. **Franja de estadísticas:** `12+ JUEGOS`, `MILES DE PARTIDAS`, `GLOBAL RANKING`.
  5. **`// 03 ACTIVIDAD EN VIVO`:** panel "ÚLTIMAS PUNTUACIONES" (7 filas) y panel "TOP JUGADORES · HOY" (5 filas con barra) con enlace "VER SALÓN →".
  6. **`// 04 PRECIOS`:** tarjeta "PLAN ÚNICO · JUGADOR VAULT $0" con sello "FREE PLAY" y tres preguntas frecuentes.
  7. **Cierre:** "¿LISTO PARA JUGAR?", botón "INSERTAR MONEDA →" y la nota "Gratis. Sin registro obligatorio. Empieza en segundos.".
- Mover la Biblioteca actual (hero, buscador, chips, grid) de `/` a `/biblioteca`, sin cambiar su contenido.
- Header: añadir el enlace "Inicio" (escritorio y menú móvil) y reajustar qué enlace está activo en cada ruta. El logo sigue llevando a `/`.
- **(Ampliación)** Header de `home-about` en todas las pantallas con header: logo con icono cuadrado (magenta/cian) y texto "ARCADE VAULT" (se parte en dos líneas solo si falta espacio, como en el prototipo), enlaces Inicio / Biblioteca / Salón de la Fama en Press Start 9 px con subrayado cian en el activo, contador decorativo "CRÉDITOS · 03" con moneda, botón "Iniciar Sesión" (borde cian, esquinas cortadas) o, con sesión, "{NOMBRE} ▾" que cierra la sesión. Corte de la referencia: a ≤ 840 px se ocultan enlaces y contador y aparece la hamburguesa "≡".
- **(Ampliación)** Menú móvil de `home-about`: panel lateral de `min(320px, 86vw)` con fondo `#0f0f18`, título "MENÚ" cian, enlaces pixel de 11 px con separador discontinuo (Inicio, Biblioteca, Salón de la Fama, "Iniciar Sesión" o "Cuenta"), "CRÉDITOS · 03" al pie, y fondo oscuro que cierra el menú.
- **(Ampliación)** Pie de página global en las pantallas con header: "© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0".
- **(Ampliación)** Fondo y color base de `home-about` en todo el sitio: degradados magenta/cian sobre `#0a0a0f`, rejilla cian en perspectiva (`.av-bg::before`), scanlines suaves (`.av-bg::after`), ruido (`.av-noise`) y texto base `#e6e9ff`. Sustituye al fondo CRT del spec 01 (rejilla cian+magenta, resplandor magenta y scanlines al 35 %).
- Actualizar los enlaces que apuntaban a la Biblioteca: "VOLVER AL VAULT" (detalle y jugar) y las redirecciones tras acceso e invitado pasan a `/biblioteca`.
- Efecto de aparición al hacer scroll (`reveal`) en las secciones, que respeta `prefers-reduced-motion` y deja el contenido visible sin JavaScript.
- CTA que dependen de la sesión (mocked): con usuario iniciado, "CREAR CUENTA" pasa a "VER MI RANKING" y "EMPEZAR GRATIS →" a "IR A JUGAR →".
- Datos de la landing como datos tipados en `lib/home.ts` (ventajas, estadísticas, actividad, top, plan, preguntas frecuentes).
- Responsive con los cortes de la referencia (ver "Modelo de datos → Convenciones").
- Actualizar `CLAUDE.md` (tabla de rutas y arquitectura).

**Fuera de alcance (para specs futuros):**

- **La página "Acerca de"** (`about.jsx`, `.about-*`, `.contact-*`, `.highlight-row`) y el enlace "Acerca de" del header y del menú. El usuario pidió "solo home, about no por ahora"; el enlace se añadirá con su spec.
- Colores propios de cada pantalla del spec 01 (tarjetas, paneles, chips, ranking, cabina): solo cambian el fondo global y el color de texto base.
- Tipografía base: se mantiene Courier Prime a 16 px (la referencia usa JetBrains Mono a 14 px). Cambiarla rehace la maquetación de todas las pantallas.
- El gamepad (`.gp-*`), las variantes de tema (`Theme variants`) y los controles de edición (`tweaks`) de `styles.css`.
- Datos reales: actividad en vivo, "top de hoy" y estadísticas son datos fijos de ejemplo, sin red ni backend. Ninguno se actualiza en tiempo real.
- Catálogo de 12 juegos: las estadísticas dicen `12+ JUEGOS` como la referencia, pero el catálogo sigue teniendo 6.
- Metadatos SEO, i18n, tests automatizados y despliegue (igual que en el spec 01).

---

## Modelo de datos

Estructuras nuevas, todas en `lib/home.ts`. No se toca `lib/games.ts` ni `lib/scores.ts`.

```ts
// lib/home.ts
import type { GameId } from "@/lib/games";

export type HomeAccent = "cyan" | "yellow" | "magenta" | "green";

export interface Feature {
  icon: "gamepad" | "free" | "trophy" | "rocket";
  title: string;        // "JUEGOS CLÁSICOS"
  description: string;
  accent: HomeAccent;
}

export interface HomeStat {
  value: string;        // "12+"
  unit: string;         // "JUEGOS"
  caption: string;      // "Y CONTANDO"
}

export interface ActivityEntry {
  player: string;       // "NEONFOX"
  gameId: GameId;       // el título se lee de GAMES
  score: number;        // 184220
  ago: string;          // "hace 2 min"
  accent: HomeAccent;
}

export interface TopPlayer {
  rank: number;         // 1..5
  player: string;       // "NEONFOX"
  score: number;        // 312840
}

export interface Faq { question: string; answer: string }

export const FEATURES: readonly Feature[];        // 4, orden de la referencia
export const STATS: readonly HomeStat[];          // 3
export const ACTIVITY: readonly ActivityEntry[];  // 7
export const TOP_PLAYERS: readonly TopPlayer[];   // 5
export const PLAN: { label: string; name: string; price: string; unit: string; tag: string; perks: readonly string[]; foot: string };
export const FAQS: readonly Faq[];                // 3
```

**Convenciones:**

- Los textos, jugadores, puntuaciones y tiempos se copian literales de `references/home-about/home.jsx`. La única adaptación es el juego de cada fila de actividad, que se traduce al catálogo real:

  | Referencia | `gameId` |
  | --- | --- |
  | Caída | `tetris` |
  | Glotón | `pacman` |
  | Invasores | `invaders` |
  | Rocas | `asteroids` |
  | Bloque Buster | `arkanoid` |
  | Serpentina | `snake` |
  | Ranaria | `arkanoid` |

  "Ranaria" no tiene equivalente (no hay juego de rana) y se asigna a `arkanoid` como segundo juego de bloques; el jugador y la puntuación no cambian.
- Las puntuaciones de la landing se formatean con `Intl.NumberFormat("es-ES")`, como la referencia (`toLocaleString("es-ES")`), **no** con `formatScore` (`de-DE`) de `lib/scores.ts`. En `es-ES` los números de cuatro cifras no llevan separador (`7820`, `+7820` de ARKADYA) y los de cinco o más sí (`184.220`); `de-DE` daría `7.820`. Un formateador `Intl` fijo da el mismo texto en servidor y cliente.
- Colores de medalla en "TOP JUGADORES · HOY": oro `#ffcf3a`, plata `#c7d0e0`, bronce `#d97a3a` (los de la landing, no los `#ffd24a`/`#dfe9f5`/`#ff9a4d` del spec 01).
- Barra de cada fila del top: `width = 100 - i * 16` por ciento (`i` = índice 0..4).
- Retardos escalonados: tarjetas de ventajas `i * 80` ms, estadísticas `i * 90` ms, filas de actividad `i * 60` ms.
- Cortes responsive de la referencia (propios de la landing, no el único corte de 760 px del spec 01): ventajas 4 → 2 columnas a ≤ 980 px y 1 columna a ≤ 520 px; mini-tarjetas 6 → 3 columnas a ≤ 1100 px y 2 a ≤ 600 px; estadísticas y panel de actividad/precios a 1 columna a ≤ 720 px / ≤ 900 px. Se implementan con variantes arbitrarias de Tailwind (`max-[…]:`), nunca con `window.innerWidth`.
- Mini-tarjeta: contenedor de portada cuadrado (`aspect-ratio: 1/1`) con el `<canvas>` de `GameCover` centrado y recortado con `object-fit: cover`. Toda la mini-tarjeta es un `<Link>` a `/juegos/[id]`.
- Color de acento de cada mini-tarjeta: el `color` del juego, por las variables `--neon` / `--neon-rgb` ya usadas en el spec 01.
- Rutas de los CTA: "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" e "INSERTAR MONEDA →" → `/biblioteca`; "CREAR CUENTA" y "EMPEZAR GRATIS →" (sin sesión) → `/acceso`; "VER SALÓN →" y "VER MI RANKING" → `/salon-de-la-fama`; "IR A JUGAR →" → `/biblioteca`.

---

## Plan de implementación

Antes del paso 1, leer en `node_modules/next/dist/docs/01-app/` las guías de route groups, `<Link>` y componentes de cliente. Para toda la interfaz se usa `/frontend-design` y se compara contra `references/home-about/` (abriendo `arcade-vault-standalone.html` con Playwright cuando haga falta medir).

1. **Biblioteca a `/biblioteca`.** Crear `app/(site)/biblioteca/page.tsx` con el contenido actual de `app/(site)/page.tsx` y dejar en `app/(site)/page.tsx` un marcador mínimo con el `<h1>` ARCADE VAULT. Cambiar a `/biblioteca` los enlaces "VOLVER AL VAULT" de `app/(site)/juegos/[id]/page.tsx` y `components/play-screen.tsx`, y las dos redirecciones `router.push("/")` de `components/auth-form.tsx`. Verificación: `npm run build` pasa; `/biblioteca` se ve igual que el antiguo `/`; los tres enlaces y las redirecciones llevan a `/biblioteca`.
2. **Header con "Inicio".** En `components/site-header.tsx`, añadir "Inicio" (`/`) a `NAV` por delante de Biblioteca (`/biblioteca`) y Salón de la Fama; reescribir `isActive` para que "Inicio" solo esté activo en `/`, "Biblioteca" en `/biblioteca` y `/juegos/*`, y "Salón de la Fama" en `/salon-de-la-fama`. El logo sigue yendo a `/`. Verificación manual: el subrayado activo cambia correctamente en `/`, `/biblioteca`, `/juegos/arkanoid`, `/salon-de-la-fama`, en escritorio y en el menú móvil.
3. **Datos de la landing.** Crear `lib/home.ts` con los tipos y constantes del modelo de datos, copiando los textos de `home.jsx`. Verificación: `npx tsc --noEmit` pasa y `ACTIVITY` tiene 7 filas con `gameId` válidos, `TOP_PLAYERS` 5, `FEATURES` 4, `STATS` 3 y `FAQS` 3.
4. **Hero.** En `app/(site)/page.tsx`, sustituir el marcador por la sección hero: texto con guion bajo parpadeante, `<h1>` de tres líneas con degradado, subtítulo, "DESLIZA ▼" y los dos CTA en un componente de cliente `components/home/hero-ctas.tsx` que lee `useSession()`. Crear `components/home/floating-silhouettes.tsx` (SVG decorativo, `aria-hidden`, componente de servidor) con las ocho siluetas. Añadir a `app/globals.css` lo necesario que no exista: animaciones `float` y `bounce`, y los tokens de color propios de la landing. Verificación manual: se ve el hero a 1280×900 y 390×844; el CTA "CREAR CUENTA" cambia a "VER MI RANKING" al iniciar sesión.
5. **Secciones con revelado y ventajas.** Crear `components/home/section-head.tsx` (kicker `// NN`, título, regla), `components/home/reveal.tsx` (cliente, `IntersectionObserver`) y `components/home/feature-card.tsx` con los cuatro iconos pixel. Añadir al `page.tsx` la sección `// 01`. Verificación manual: las tarjetas aparecen escalonadas al hacer scroll; con `prefers-reduced-motion: reduce` y con JavaScript desactivado el contenido se ve sin animación.
6. **Juegos disponibles.** Crear `components/home/mini-card.tsx` (`<Link>`, portada cuadrada con `GameCover`) y añadir la sección `// 02` con las 6 mini-tarjetas y el botón "VER TODOS LOS JUEGOS →". Verificación manual: cada mini-tarjeta abre `/juegos/[id]` de su juego y el botón abre `/biblioteca`.
7. **Franja de estadísticas.** Añadir la sección con fondo propio (degradado, bordes superior e inferior y resplandor amarillo), tres bloques separados por línea vertical en escritorio y horizontal en móvil. Verificación manual: se ve a 1280×900 y 390×844.
8. **Actividad en vivo.** Añadir la sección `// 03` con `components/home/activity-ticker.tsx` (7 filas con entrada escalonada) y `components/home/top-players.tsx` (5 filas con barra y colores de medalla), más el enlace "VER SALÓN →". Verificación manual: los títulos de juego salen del catálogo real y "VER SALÓN →" lleva a `/salon-de-la-fama`.
9. **Precios, preguntas y cierre.** Añadir la sección `// 04` con la tarjeta del plan (sello "FREE PLAY" girado, `components/home/plan-cta.tsx` de cliente con el botón dependiente de la sesión), las tres preguntas con borde izquierdo cian / magenta / amarillo, y el bloque de cierre con las dos líneas decorativas. Verificación manual: sin sesión "EMPEZAR GRATIS →" lleva a `/acceso`; con sesión muestra "IR A JUGAR →" y lleva a `/biblioteca`.
10. **Documentación del proyecto.** Actualizar `CLAUDE.md`: tabla de rutas (`/` landing, `/biblioteca`), sección Architecture (`components/home/`, `lib/home.ts`, convención de cortes responsive de la landing) y la frase "Library: hero, search, category chips, game grid". Verificación: `CLAUDE.md` coincide con la estructura real de archivos.
11. **Ajuste visual contra la referencia.** Comparar `/` con la landing del prototipo `references/home-about/arcade-vault-standalone.html` con Playwright, a 1280×900 y a 390×844, midiendo rects y estilos calculados de cada bloque (hero, títulos de sección, tarjetas, mini-tarjetas, estadísticas, filas de actividad, plan, preguntas, cierre) y el alto del documento. Corregir diferencias. Comprobar también que `/biblioteca`, detalle, salón, acceso y jugar **no retroceden** respecto al spec 01 (alto del documento y header). Verificación: las medidas coinciden salvo lo listado como fuera de alcance (tipografía mono, contador de créditos, enlace "Acerca de") y los artefactos de medición (estado `hover`, animaciones en curso).

**Ampliación: header, menú, pie y fondo de `home-about`.** Cada paso se compara con el prototipo con Playwright (copia temporal en `public/`, borrada al terminar) y deja el sitio funcionando.

12. **Fondo y color base.** En `app/globals.css`, sustituir el fondo CRT del spec 01 (`html::before`, `body::before`, `body::after`) por el de la referencia: capa fija con los dos degradados radiales sobre `#0a0a0f`, rejilla cian `rgb(0 245 255 / 0.22)` de 60 px en `perspective(600px) rotateX(60deg)` con máscara y animación de 8 s, scanlines `rgb(255 255 255 / 0.03)` con `mix-blend-mode: overlay` y capa de ruido SVG al 0,35. Texto base `#e6e9ff`. Verificación: con Playwright, los estilos calculados de las capas coinciden con `.av-bg`, `.av-bg::before`, `.av-bg::after` y `.av-noise`, y la animación se detiene con `prefers-reduced-motion`.
13. **Header de escritorio.** Reescribir `components/site-header.tsx` siguiendo `nav.jsx` y `.av-nav`: header pegajoso con degradado y borde inferior `rgb(0 245 255 / 0.18)`, padding 14/32, logo (icono de 28 px + texto de 12 px), enlaces con subrayado activo de 2 px, separador flexible, contador "CRÉDITOS · 03" y botón de sesión con el estilo `.btn` (reutilizando `.btn-home`). Con sesión el botón muestra "{NOMBRE} ▾" con el estilo `.btn.ghost` y cierra la sesión. Ajustar el `fallback` de `<Suspense>` de `app/(site)/layout.tsx` al nuevo alto. Se copia el CSS de `.av-nav` tal cual: sin "Acerca de" sobra espacio y a 1280 el header cabe en una línea (≈70 px), igual que el prototipo cuando tiene espacio (a 1600 px). Verificación: estilos calculados (colores, fuentes, bordes, sombras, `clip-path`) de logo, enlaces, contador y botón iguales a los de la referencia; tamaños iguales a los del prototipo a 1600 px; el enlace activo es correcto en cada ruta.
14. **Hamburguesa y menú móvil.** A ≤ 840 px ocultar enlaces y contador, mostrar el botón "≡" (`.btn.ghost`) y el panel de `.av-mobile-panel` con su fondo oscuro. Enlaces del panel: Inicio, Biblioteca, Salón de la Fama y "Iniciar Sesión" (sin sesión) o "Cuenta" (con sesión) → `/acceso`. "CRÉDITOS · 03" al pie del panel. Se cierra al pulsar el fondo y al navegar. Verificación: a 390×844, cerrado y abierto, coincide con la referencia en posición, tamaño y colores.
15. **Pie de página.** Añadir el `<footer>` del prototipo al final de `app/(site)/layout.tsx` (no aparece en `/juegos/[id]/jugar`). Verificación: a 1280×900 y 390×844 mide lo mismo que el de la referencia (58 px a 1280) y la landing completa (header + contenido + pie) tiene el mismo alto que el prototipo.
16. **Documentación y regresión.** Actualizar `CLAUDE.md` (header, corte de 840 px, pie, fondo). Medir con Playwright el alto del documento de `/biblioteca`, detalle, salón, acceso y jugar a 1280×900 y 390×844 y anotar los nuevos valores en la verificación del paso (cambian por el header y el pie; el contenido de cada pantalla no debe moverse respecto a su header). Verificación: `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan y ninguna pantalla tiene scroll horizontal.

---

## Criterios de aceptación

**Generales**

- [ ] `npm run lint`, `npx tsc --noEmit` y `npm run build` terminan sin errores.
- [ ] Ninguna ruta muestra errores ni warnings de hidratación en la consola del navegador.
- [ ] `/` y `/biblioteca` responden 200; `/juegos/xyz` y `/juegos/xyz/jugar` siguen respondiendo 404 (`curl`).
- [ ] No existe ninguna ruta, archivo ni enlace de la página "Acerca de".
- [ ] No hay lógica de ningún juego nueva (ningún `startGame`, bucle de juego ni manejador de teclas de juego).
- [ ] Con `prefers-reduced-motion: reduce` no hay siluetas flotantes, parpadeos, rebote de "DESLIZA", revelado por scroll ni entrada escalonada de filas.
- [ ] Con JavaScript desactivado todas las secciones de `/` son visibles (el revelado no deja contenido oculto).
- [ ] Sin `localStorage` disponible la landing sigue funcionando (los CTA se muestran como sin sesión).

**Rutas y navegación**

- [ ] `/biblioteca` muestra hero, buscador, chips y grid con el mismo contenido y medidas que tenía `/` en el spec 01. Antes de la ampliación: alto del documento 1550 px en escritorio y 3386 px en móvil; después, ese alto más la diferencia de header y el pie (paso 16).
- [ ] "Inicio" aparece activo solo en `/`; "Biblioteca" en `/biblioteca` y `/juegos/[id]`; "Salón de la Fama" en `/salon-de-la-fama`.
- [ ] El header muestra los tres enlaces en > 840 px y en el menú móvil, y no muestra "Acerca de" en ninguno de los dos.
- [ ] El logo lleva a `/`.
- [ ] "VOLVER AL VAULT" en el detalle y en jugar lleva a `/biblioteca`.
- [ ] Un envío válido del formulario de acceso, los botones Google / GitHub y "JUGAR COMO INVITADO" redirigen a `/biblioteca`.

**Landing — contenido**

- [ ] El hero muestra "▸ INSERTA UNA MONEDA_", las tres líneas del título (`EL ARCADE`, `CLÁSICO ESTÁ`, `DE VUELTA`), el subtítulo de dos líneas y "DESLIZA ▼".
- [ ] El hero muestra ocho siluetas decorativas y ninguna es accesible por lector de pantalla (`aria-hidden`).
- [ ] "▶ EXPLORAR JUEGOS" lleva a `/biblioteca`.
- [ ] Hay cuatro tarjetas de ventajas con los títulos y descripciones de la referencia.
- [ ] La sección `// 02` muestra exactamente 6 mini-tarjetas, con portada, título y categoría de cada juego de `GAMES`, y cada una lleva a `/juegos/[id]` de su juego.
- [ ] "VER TODOS LOS JUEGOS →" lleva a `/biblioteca`.
- [ ] La franja de estadísticas muestra `12+` / `JUEGOS`, `MILES` / `DE PARTIDAS` y `GLOBAL` / `RANKING` con sus subtítulos.
- [ ] "ÚLTIMAS PUNTUACIONES" muestra 7 filas; cada título de juego es el de un juego de `GAMES`; la puntuación de NEONFOX se ve `+184.220` y la de ARKADYA `+7820`.
- [ ] "TOP JUGADORES · HOY" muestra 5 filas; las tres primeras usan oro, plata y bronce; la barra de la fila 1 mide el 100 % y la de la fila 5 el 36 %.
- [ ] "VER SALÓN →" lleva a `/salon-de-la-fama`.
- [ ] La tarjeta de precios muestra `$0 / SIEMPRE`, la etiqueta "SIN TRUCOS · SIN LETRA PEQUEÑA", seis ventajas con marca ✔, el sello "FREE PLAY" y la nota "No pedimos tarjeta. Nunca lo haremos.".
- [ ] Hay tres preguntas frecuentes con sus respuestas literales de la referencia.
- [ ] El cierre muestra "¿LISTO PARA JUGAR?", "INSERTAR MONEDA →" (→ `/biblioteca`) y "Gratis. Sin registro obligatorio. Empieza en segundos.".

**Landing — sesión**

- [ ] Sin sesión: "✦ CREAR CUENTA" y "EMPEZAR GRATIS →" llevan a `/acceso`.
- [ ] Con sesión: el hero muestra "VER MI RANKING" (→ `/salon-de-la-fama`) y el plan "IR A JUGAR →" (→ `/biblioteca`).
- [ ] Tras "Salir" en el header, los CTA vuelven a los textos sin sesión sin cambiar de ruta.

**Landing — responsive y visual**

- [ ] A 1280×900 y a 390×844 las posiciones y tamaños de cada bloque de la landing coinciden con la referencia (medido con Playwright), salvo lo listado en el paso 11.
- [ ] Las ventajas pasan de 4 a 2 columnas a ≤ 980 px y a 1 columna a ≤ 520 px; las mini-tarjetas de 6 a 3 columnas a ≤ 1100 px y a 2 a ≤ 600 px.
- [ ] Las estadísticas pasan a una columna a ≤ 720 px, con línea horizontal en vez de vertical entre bloques.
- [ ] Sin scroll horizontal en 390×844.
- [ ] Las demás pantallas (`/biblioteca`, detalle, salón, acceso, jugar) mantienen el alto de documento medido en el spec 01 a 1280×900 y a 390×844 (antes de la ampliación; después, ver paso 16).

**Ampliación — header, menú, pie y fondo**

- [ ] Logo (icono + texto), enlaces, subrayado activo, "CRÉDITOS · 03" y botón "Iniciar Sesión" tienen los estilos calculados del prototipo y, cuando caben en una línea, su mismo tamaño (prototipo a 1600 px) (medido con Playwright).
- [ ] Con sesión, el botón muestra "{NOMBRE} ▾" y al pulsarlo borra `av_user` sin cambiar de ruta.
- [ ] A ≤ 840 px se ocultan enlaces y contador y aparece "≡"; a 841 px se ven enlaces y contador.
- [ ] A 390×844, el menú abierto coincide con el prototipo: título "MENÚ" cian, cuatro enlaces pixel con separador discontinuo, "CRÉDITOS · 03" al pie. Se cierra al pulsar el fondo y al navegar.
- [ ] El pie "© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0" aparece en todas las pantallas con header y no en `/juegos/[id]/jugar`.
- [ ] Contenido y pie de la landing miden lo mismo que en el prototipo a 1280×900 (3775 + 58 px) y a 390×844 (6116 + pie); el alto total solo difiere en la diferencia de alto del header (sin "Acerca de" no se parte en dos líneas).
- [ ] El fondo global usa las capas de la referencia (degradados, rejilla cian, scanlines suaves, ruido) y el texto base es `#e6e9ff`; con `prefers-reduced-motion` la rejilla no se mueve.
- [ ] Ninguna pantalla tiene scroll horizontal a 390×844 ni a 1280×900.

---

## Decisiones tomadas y descartadas

- **Sí:** landing en `/` y Biblioteca en `/biblioteca`, como en la referencia nueva (`nav.jsx`: Inicio y Biblioteca son rutas distintas). El usuario lo eligió frente a las alternativas.
- **No:** landing en `/inicio` con la Biblioteca en `/`. No toca nada existente, pero el logo y los redirects seguirían llevando a la Biblioteca y la landing quedaría como página secundaria.
- **No:** landing y Biblioteca en una sola ruta. Rompe la separación de la referencia y las medidas del spec 01.
- **Sí:** el spec 01 no se reescribe; este spec declara qué cambia (ruta de la Biblioteca y destino de las redirecciones). Mantiene el historial y evita editar un spec ya `Implementado`.
- **Sí:** el logo sigue yendo a `/`, y "VOLVER AL VAULT" y las redirecciones tras acceso van a `/biblioteca`. "Vault" significa la colección de juegos, y tras iniciar sesión se espera estar donde se juega, no en la página de presentación.
- ~~**Sí:** header solo con "Inicio" añadido.~~ **Reemplazada en la ampliación.** Era la elección inicial del usuario; tras ver la comparación con el prototipo pidió el header de `home-about`.
- **Sí (ampliación):** header, menú móvil, pie y fondo de `nav.jsx` / `styles.css` en todas las pantallas con header. El usuario lo pidió al revisar la comparación con Playwright y eligió hacerlo en este spec.
- **No (ampliación):** abrir un spec 03 de tema. El usuario prefirió no cerrar la landing con un header distinto del diseño.
- **Sí (ampliación):** sin enlace "Acerca de" en header ni menú hasta que exista su página. Enlazaría a una ruta 404.
- **Sí (ampliación, decidido en el paso 13):** CSS de `.av-nav` literal. En el prototipo, a 1280 px el logo y el botón se parten en dos líneas (header de 85 px) solo porque "Acerca de" ocupa 117 px; a 1600 px van en una línea (70 px). Sin ese enlace, el header literal cabe en una línea a 1280.
- **No (ampliación):** forzar el logo en dos líneas para imitar el prototipo a 1280. Dejaría de coincidir a anchos grandes.
- **No (ampliación):** un "Acerca de" deshabilitado que ocupe su espacio. Contradice no mostrarlo hasta que exista su página.
- **Sí (ampliación, decidido en el paso 14):** en móvil (≤ 840 px) el hueco entre elementos de la barra es 12 px en vez de 24. Con el valor de la referencia la barra mide 395 px a 390 y la hamburguesa queda recortada 5 px, igual que en el prototipo; el usuario prefirió que quepa. Es la única desviación del CSS de `.av-nav`.
- **No (ampliación):** dejar el recorte idéntico al prototipo, ni ocultar "Iniciar Sesión" de la barra en móvil.
- **Sí (ampliación):** el corte del header pasa de 760 a 840 px, el de la referencia. El resto de pantallas del spec 01 sigue con 760 px para su contenido.
- **Sí (ampliación):** con sesión, el botón "{NOMBRE} ▾" cierra la sesión como en la referencia. Sustituye a inicial + nombre + "Salir" del spec 01.
- **Sí (ampliación):** fondo y texto base de la referencia en todo el sitio; los colores propios de cada pantalla del spec 01 no cambian. El usuario señaló el fondo y los colores del header; recolorear tarjetas, ranking y cabina sería rehacer el spec 01.
- **Sí (ampliación):** se mantiene Courier Prime 16 px como fuente base. JetBrains Mono a 14 px cambiaría el tamaño de todo el texto de las cinco pantallas.
- **Sí:** mini-tarjetas con los 6 `GAMES` reales y su `GameCover` en canvas. El usuario lo eligió; así los enlaces funcionan y hay un único catálogo.
- **No:** copiar las portadas CSS (`.cover-bricks`, `.cover-tetro`, …) ni los 6 juegos ficticios de la referencia. Son un catálogo distinto, sin rutas.
- **Sí:** actividad en vivo y top de hoy como datos fijos tipados en `lib/home.ts`, con los jugadores y puntuaciones de la referencia y los juegos adaptados al catálogo real (tabla del modelo de datos). El usuario lo eligió.
- **No:** leer `getLeaderboard` ni `Date.now()` para esos datos. Son marketing de ejemplo, y el tiempo relativo ("hace 2 min") se escribe fijo para no romper el prerender con `cacheComponents` ni producir diferencias de hidratación.
- **Sí:** CTA que se adaptan a la sesión, con textos nuevos "VER MI RANKING" e "IR A JUGAR →" que no existen en la referencia. El usuario lo eligió; sin sesión se ve exactamente la referencia.
- **Sí:** el revelado por scroll deja el contenido visible sin JavaScript y con `prefers-reduced-motion`. El efecto de la referencia deja `opacity: 0` hasta que un script añade `.in`; copiarlo tal cual ocultaría la página sin JS.
- **Sí:** la aparición del revelado se arma en el cliente después de montar. Evita desajustes de hidratación y destellos.
- **Sí:** el CSS propio de la landing usa Tailwind y los tokens de `globals.css`, más tokens nuevos solo donde la referencia usa un valor distinto (`#e6e9ff`, `#8a8fb5`, oro/plata/bronce `#ffcf3a`/`#c7d0e0`/`#d97a3a`, `#0f0f18`, `#15151f`). No se cambian los tokens existentes ni las otras pantallas.
- **No:** reemplazar los tokens del spec 01 por los de `styles.css`. La referencia nueva y la del spec 01 difieren en sus valores de color y mono; unificarlos es un cambio de tema, no de landing.
- **Sí:** la landing usa Courier Prime (la fuente de cuerpo del proyecto). La referencia nueva declara JetBrains Mono con Courier Prime de reserva, pero el proyecto nunca la ha cargado.
- **No:** añadir JetBrains Mono a `next/font`. Cambiaría la tipografía de todas las pantallas o dejaría dos tipografías mono en el mismo sitio; si se quiere, va en su propio spec.
- **Sí:** los cortes responsive de la landing son los de la referencia (980/900/720/600/520/1100 px), no el único corte de 760 px del spec 01. Con un solo corte las rejillas de 4 y 6 columnas no se adaptan igual que el diseño. La Biblioteca sigue en 760 px; el header pasa a 840 px en la ampliación.
- **Sí:** ajuste visual con medidas reales (paso 11), igual que los pasos 13 y 14 del spec 01.
- **Sí:** un solo spec para la landing completa. Son siete bloques de un mismo documento que comparten datos, tema y revelado; el riesgo de tamaño se mitiga con pasos independientes que se pueden commitear por separado. La página "Acerca de" sí va aparte.
- **Sí:** "Ranaria" se asigna a `arkanoid`. El catálogo no tiene juego de rana ni de cruce de carretera, y mostrar un título inexistente rompería el enlace con el catálogo.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Mover la Biblioteca deja enlaces rotos o redirecciones a la landing por error | El paso 1 cambia los cuatro puntos conocidos (`juegos/[id]/page.tsx`, `play-screen.tsx` y los dos `router.push("/")` de `auth-form.tsx`: envío/social y "JUGAR COMO INVITADO") y su verificación recorre cada uno. El paso 11 repite el recorrido. |
| Cambios en `proxy.ts` o `generateStaticParams` por la nueva ruta | No se tocan: el `matcher` solo cubre `/juegos/:id` y `/juegos/:id/jugar`. Criterio de aceptación con `curl` para el 404. |
| `reveal` con `opacity: 0` oculta contenido sin JS o con movimiento reducido | El estado oculto solo se arma en cliente tras montar y se desactiva con `prefers-reduced-motion`. Está en los criterios de aceptación. |
| `IntersectionObserver` o lectura de sesión en render rompen el prerender con `cacheComponents: true` | El observador y `useSession()` solo viven en componentes de cliente (`reveal.tsx`, `hero-ctas.tsx`, `plan-cta.tsx`); la página `/` sigue siendo un componente de servidor con datos estáticos. Se verifica con `npm run build` en cada paso. |
| Los CTA muestran un instante el texto sin sesión antes de leer `av_user` | Mismo comportamiento aceptado en el spec 01 (el provider empieza en `user: null`). |
| La portada canvas de 96×56 recortada a 1:1 pierde los lados y se ve distinta del diseño | Es una diferencia conocida, porque la referencia usa arte CSS cuadrado. Se revisa en el paso 6 y se ajusta el recorte en el paso 11. Si se ve mal, se proponen portadas cuadradas en otro spec. |
| El hero de la referencia usa `min-height: calc(100vh - 60px)` y nuestro header mide 64 px | Resuelto en el paso 11: se usa el valor literal `100vh - 60px`, que es el que coincide con el prototipo. |
| (Ampliación) El header nuevo (85 px frente a 66) y el pie (58 px) cambian el alto de todas las pantallas del spec 01 | Esperado. El paso 16 anota los nuevos altos y comprueba que el contenido de cada pantalla no se mueve respecto a su header. |
| (Ampliación) `usePathname()` en el header nuevo suspende en rutas con params fuera de `generateStaticParams` | Se mantiene el `<Suspense>` de `app/(site)/layout.tsx`, con el `fallback` ajustado al nuevo alto para evitar saltos. |
| (Ampliación) El nuevo fondo cambia el aspecto de detalle, salón, acceso y jugar, ya validados en el spec 01 | Solo cambian el fondo y el texto base; el paso 16 revisa cada pantalla con capturas a 1280×900 y 390×844. |
| (Ampliación) El panel móvil fuera de pantalla amplía `scrollWidth` | Se mantiene `overflow-x: hidden` en `body`; el criterio de scroll horizontal se mide en las dos resoluciones. |
| Los tokens de la landing duplican colores casi iguales a los existentes | Se aceptan por fidelidad con la referencia; se nombran con prefijo propio para poder unificarlos en un futuro spec de tema. |
| Textos de marketing que no son verdad en el producto (`12+ JUEGOS`, "Nuevos juegos cada mes", "Sin anuncios") | Se copian literales de la referencia como contenido de diseño. Revisarlos antes de publicar la web queda fuera de este spec. |

---

## Qué **no** está en este spec

- La página "Acerca de" y su enlace en el header y el menú.
- Gamepad, variantes de tema y controles de edición de la referencia nueva.
- Datos reales para actividad, top de hoy y estadísticas; nada en tiempo real (tampoco los créditos del header).
- Ampliar el catálogo a 12 juegos o crear juegos nuevos.
- Cambiar la tipografía base o los colores propios de las pantallas del spec 01 (solo cambian fondo y texto base).
- Metadatos SEO, i18n, tests automatizados y despliegue.

Cada uno, si se aborda, va en su propio spec.
