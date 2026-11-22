# SPEC 01 — MVP visual de Arcade Vault (todas las pantallas)

> **Estado:** Implementado
> **Depende de:** Ninguno (primer spec)
> **Fecha:** 2026-11-21
> **Objetivo:** Construir la parte visual completa del MVP de Arcade Vault (Biblioteca, Detalle de juego, Salón de la Fama, Acceso y Pantalla de jugar) como rutas de Next.js con datos simulados y sin implementar ningún juego.

---

## Por qué existe este spec

Las pantallas ya están diseñadas en `references/` (`Arcade Vault.dc.html`, `games.js`, `support.js`). Ese prototipo es una sola vista con estado interno, y aquí se traduce a rutas reales de App Router con componentes tipados.

La base visual ya existe y **no se rehace**:

- `app/globals.css` define los tokens de color, las clases `.btn-neon`, `.chip-neon`, `.panel-neon`, `.card-neon`, `.input-neon`, `.header-neon`, `.pixelated`, las animaciones y el fondo CRT (rejilla en perspectiva, scanlines, resplandor).
- `app/layout.tsx` ya carga Press Start 2P y Courier Prime con `next/font/google`.
- `globals.css` ya apaga las animaciones con `prefers-reduced-motion`.

La fuente de verdad visual es `references/Arcade Vault.dc.html`. Si algo de este spec contradice la referencia en lo visual, gana la referencia.

---

## Alcance

**Dentro:**

- Cinco pantallas como rutas de App Router:
  - `/` — Biblioteca: hero, buscador, chips de categoría, grid de tarjetas, estado vacío.
  - `/juegos/[id]` — Detalle: portada, descripción larga, controles, botones y top 10 de puntuaciones.
  - `/salon-de-la-fama` — pestañas por juego, "Tu mejor marca" y tabla top 10 con animación de entrada.
  - `/acceso` — pestañas Iniciar sesión / Crear cuenta, validación visual, botones Google / GitHub / invitado.
  - `/juegos/[id]/jugar` — cabina con HUD, pantalla placeholder, pausa, controles táctiles y modal FIN DEL JUEGO con "guardar puntuación" simulado.
- Header global (logo, navegación con subrayado activo, usuario o botón "INICIAR SESIÓN") y menú lateral móvil con overlay. El header **no** aparece en `/juegos/[id]/jugar`.
- Los 6 juegos del catálogo (Arkanoid, Tetris, Snake, Pac-Man, Space Invaders, Asteroids) como datos tipados, con los textos de la referencia.
- Portadas pixel-art de los 6 juegos, portando `cover()` de `references/games.js` a un componente de cliente. Solo se porta el dibujo de portadas, nada de la lógica de juegos.
- Puntuaciones semilla determinísticas para el ranking, como `seed()` de la referencia.
- Sesión simulada: contexto React que persiste el usuario en `localStorage` (`av_user`).
- Capa `lib/api.ts` con funciones stub (`login`, `register`, `submitScore`) como único punto de reemplazo cuando exista backend.
- Diseño responsive con un único punto de corte en 760 px.
- Respeto a `prefers-reduced-motion` también en los efectos hechos con JavaScript (tilt de tarjetas).
- Actualizar `CLAUDE.md` para reflejar que la app ya no es el starter.

**Fuera de alcance (para specs futuros):**

- Implementar cualquier juego (`startGame`, bucle de juego, canvas jugable, colisiones, controles reales). El área de juego queda como placeholder.
- Backend, base de datos y autenticación real (Supabase, REST, OAuth con Google/GitHub).
- Guardar puntuaciones: "GUARDAR PUNTUACIÓN" solo simula el proceso y **no altera el ranking**.
- Persistir puntuaciones en `localStorage` (`av_scores` de la referencia).
- Ranking global real, filas "(TÚ)" resaltadas en el ranking.
- Cargar juegos HTML externos en `<iframe>` (`GAMES_EXT` de la referencia).
- Página 404 personalizada, metadatos SEO por ruta, internacionalización, tests automatizados y despliegue.
- Controles de edición del prototipo (props `scanlines`, `perspectiveGrid`, `logoFlicker`): los efectos CRT quedan fijos en `globals.css`.

---

## Modelo de datos

Estructuras nuevas, todas en TypeScript.

```ts
// lib/games.ts
export type GameId = "arkanoid" | "tetris" | "snake" | "pacman" | "invaders" | "asteroids";
export type Category = "ARCADE" | "PUZLE" | "DISPAROS" | "LABERINTO";

export interface Game {
  id: GameId;
  title: string;        // "SPACE INVADERS"
  category: Category;
  color: string;        // "#ff006e" (neón del juego)
  rgb: string;          // "255,0,110" (para glows)
  baseScore: number;    // base del ranking semilla
  description: string;  // texto corto de la tarjeta
  longDescription: string;
  controls: string;
}

export const GAMES: readonly Game[];                 // 6 juegos, orden de la referencia
export const CATEGORY_FILTERS: readonly ["TODOS", ...Category[]]; // chips de la Biblioteca
```

```ts
// lib/scores.ts
export interface ScoreEntry {
  name: string;   // "NEO_CYAN"
  score: number;  // 12000
  date: string;   // ISO 8601, p. ej. "2026-11-19T00:00:00.000Z"
}

export const SEED_REFERENCE_DATE = "2026-11-21T00:00:00.000Z"; // fecha fija, no Date.now()
export function getLeaderboard(gameId: GameId): ScoreEntry[];  // top 10 ordenado desc
export function formatScore(n: number): string;                // 12000 -> "12.000" (de-DE)
export function formatDate(iso: string): string;               // "19/11/2026" (es-ES, timeZone UTC)
```

```ts
// lib/api.ts (stubs, sin red)
export function login(user: string, password: string): Promise<{ name: string }>;
export function register(user: string, email: string, password: string): Promise<{ name: string }>;
export function submitScore(gameId: GameId, name: string, score: number, authed: boolean): Promise<true>;
```

```ts
// components/session-provider.tsx
export interface SessionUser { name: string }          // en mayúsculas, máximo 14 caracteres
export interface SessionContextValue {
  user: SessionUser | null;
  signIn(name: string): void;                          // guarda en localStorage["av_user"]
  signOut(): void;                                     // borra localStorage["av_user"]
}
```

```ts
// pantalla de jugar (estado local de cliente)
type PlayPhase = "loading" | "running" | "paused" | "over";
type SaveState = "idle" | "saving" | "typing" | "done";
```

**Convenciones:**

- Ranking semilla, igual que la referencia. Para el juego en el índice `gi` (0..5) y la posición `i` (0..9):
  - nombre: `PLAYERS[(i + gi * 3) % 10]` con `PLAYERS = [NEO_CYAN, LUCIA88, PIXELFOX, MAXTURBO, SOFIA.EXE, ZENITH, CARLOS_RX, LOLA_ARCADE, DON_JOYSTICK, ELENA404]`;
  - puntuación: `Math.round(baseScore * (1 - i * 0.085 - gi * 0.004) / 10) * 10`;
  - fecha: `SEED_REFERENCE_DATE` menos `(2 + i * 4 + gi * 3)` días.
- `baseScore` por juego: arkanoid 12000, tetris 85000, snake 1800, pacman 9000, invaders 4500, asteroids 6000.
- Colores por juego (de la referencia): arkanoid y asteroids cian `#00f5ff`; tetris e invaders magenta `#ff006e`; snake y pacman amarillo `#f5ff00`.
- Chips de la Biblioteca, en este orden: `TODOS`, `ARCADE`, `PUZLE`, `DISPAROS`, `LABERINTO`.
- Medallas del top 3 (ranking y salón): `#ffd24a`, `#dfe9f5`, `#ff9a4d`. Del puesto 4 en adelante, el color de rango es `#8c93a8` en el detalle y `#e8f4ff` en el salón.
- Valores de la pantalla de jugar (simulados): puntuación `0`, vidas `3`, nivel `1`, jugador = nombre de sesión o `INVITADO`. Puntuación final del modal = `baseScore / 2` del juego.
- Las puntuaciones se formatean con `Intl.NumberFormat("de-DE")` y las fechas con `es-ES` en `timeZone: "UTC"`, para que servidor y cliente rendericen lo mismo.
- Punto de corte: móvil por debajo de 760 px. Se implementa con clases responsive de CSS/Tailwind, no con `window.innerWidth`.

---

## Plan de implementación

Antes del paso 1, leer la guía relevante de `node_modules/next/dist/docs/01-app/` (rutas, route groups, `generateStaticParams`, `cacheComponents`, componentes de cliente). Para todo el trabajo de interfaz se usa `/frontend-design` y se compara contra `references/Arcade Vault.dc.html`.

1. **Datos.** Crear `lib/games.ts` (tipos, `GAMES`, `CATEGORY_FILTERS`) y `lib/scores.ts` (`getLeaderboard`, `formatScore`, `formatDate`). Verificación: `npx tsc --noEmit` pasa y `getLeaderboard("arkanoid")[0]` devuelve `{ name: "NEO_CYAN", score: 12000, … }`.
2. **Sesión y API simulada.** Crear `lib/api.ts` y `components/session-provider.tsx` (`SessionProvider`, `useSession`). Envolver `children` con el provider en `app/layout.tsx`. Verificación: la app compila y `npm run dev` sigue arrancando.
3. **Estructura de rutas y header.** Crear `components/site-header.tsx` (logo, navegación con subrayado activo, usuario o "INICIAR SESIÓN", botón "Salir") con el menú lateral móvil y su overlay. Crear `app/(site)/layout.tsx` que lo renderiza. Mover el starter `app/page.tsx` a `app/(site)/page.tsx` con solo el `<h1>` ARCADE VAULT. Verificación manual: el header se ve en `/`, el menú móvil abre y cierra, "Biblioteca" y "Salón de la Fama" enlazan a sus rutas.
4. **Portada y tarjetas.** Crear `components/game-cover.tsx` (cliente, canvas de 96×56 que porta `cover()`, escalado con `.pixelated` y `aspect-ratio: 96/56`) y `components/game-card.tsx` (toda la tarjeta es un `<Link>` a `/juegos/[id]`, con el efecto tilt que respeta `prefers-reduced-motion`). Pintar en `/` el hero y el grid con los 6 juegos. Verificación manual: se ven las 6 portadas distintas y el tilt funciona con el ratón.
5. **Buscador y filtros.** Añadir en `/` el input de búsqueda, los chips de categoría y el estado vacío "NO SE ENCONTRARON JUEGOS". La búsqueda ignora mayúsculas y acentos y compara contra título, categoría y descripción. Verificación manual: buscar "laberinto" deja solo Pac-Man; buscar "xyz" muestra el estado vacío.
6. **Detalle de juego.** Crear `app/(site)/juegos/[id]/page.tsx` con `generateStaticParams` para los 6 ids y `notFound()` para ids desconocidos. Incluir portada con glow, categoría, título, descripción larga, caja de controles, botones "JUGAR AHORA" (→ `/juegos/[id]/jugar`) y "VOLVER AL VAULT" (→ `/`), y el panel "MEJORES PUNTUACIONES" con el top 10 y medallas. Verificación manual: abrir cada tarjeta lleva a su detalle; `/juegos/xyz` da 404.
7. **Salón de la Fama.** Crear `app/(site)/salon-de-la-fama/page.tsx` con pestañas por juego (activa = relleno del color del juego), banner "TU MEJOR MARCA", cabecera de columnas y 10 filas con animación de entrada escalonada que se reinicia al cambiar de pestaña. La columna FECHA se oculta en móvil. Verificación manual: cambiar de pestaña cambia el ranking y la animación; con sesión iniciada aparece el banner.
8. **Acceso.** Crear `app/(site)/acceso/page.tsx` con las pestañas Iniciar sesión / Crear cuenta, formulario con validación, error visible, botones Google y GitHub, "JUGAR COMO INVITADO" y la nota sobre el modo invitado. Verificación manual: los errores y los redirects descritos en los criterios de aceptación.
9. **Pantalla de jugar: cabina.** Crear `app/juegos/[id]/jugar/page.tsx` (fuera de `(site)`, sin header) con la cabina: HUD de cuatro cajas, botones PAUSA y SALIR, marco de la máquina con scanlines y viñeta, pantalla placeholder, firma "ARCADE VAULT" con el led, y la botonera táctil (`<` `^` `v` `>` `ACCIÓN`) visible solo en móvil. Verificación manual: se ve la cabina completa en escritorio y móvil; SALIR vuelve a `/juegos/[id]`.
10. **Pantalla de jugar: estados.** Implementar `PlayPhase` y `SaveState`: carga de ~1,1 s con spinner pixel, pausa (botón y tecla P), botón "SIMULAR FIN DE PARTIDA" visible solo si `process.env.NODE_ENV !== "production"`, modal FIN DEL JUEGO con "GUARDAR PUNTUACIÓN" (900 ms de "GUARDANDO…", luego "PUNTUACIÓN GUARDADA" tecleado a 70 ms por carácter), "JUGAR DE NUEVO" y "VOLVER AL VAULT". Verificación manual: recorrer carga → pausa → reanudar → fin de partida → guardar → jugar de nuevo.
11. **Documentación del proyecto.** Actualizar `CLAUDE.md` (secciones Project y Architecture) con las rutas, la carpeta `components/` + `lib/` y las convenciones nuevas, y quitar la frase de que la app es el starter. Verificación: `CLAUDE.md` coincide con la estructura real de archivos.
12. **404 real en ids desconocidos.** Con `cacheComponents: true` el shell se envía antes de ejecutar `notFound()`, así que `/juegos/xyz` y `/juegos/xyz/jugar` responden 200 con la UI de 404 y `noindex` (ver `loading.md`, "Status codes"). Antes de escribir código, leer la guía de `proxy` en `node_modules/next/dist/docs/01-app/`. Crear `proxy.ts` en la raíz con un `matcher` solo para `/juegos/:id` y `/juegos/:id/jugar`; si `id` no está en `GAMES`, responde 404 antes de renderizar. Para los ids válidos no hace nada. Mantener `notFound()` en las páginas como segunda defensa. Actualizar en `CLAUDE.md` la convención sobre `notFound()` (ya no es una limitación). Verificación: `curl -s -o /dev/null -w '%{http_code}'` devuelve 404 para `/juegos/xyz` y `/juegos/xyz/jugar`, y 200 para `/juegos/arkanoid` y `/juegos/arkanoid/jugar`; `npm run build` sigue pasando.
13. **Ajuste visual del homepage contra la referencia.** Comparar `/` con `references/Arcade Vault.dc.html` midiendo posiciones, tamaños y estilos calculados con Playwright, a 1280×900 y a 390×844. Correcciones: `line-height: normal` base en `body` (el preflight de Tailwind pone 1.5) más `leading-[normal]` donde una utilidad `text-*` impone su propio interlineado (logo, botón de login, buscador y botón JUGAR de la tarjeta); el color por defecto de `a` pasa a `@layer base` para que las utilidades de Tailwind (`text-ink`, `text-neon-*`) le ganen; `--grid-opacity` de la rejilla a `0.55` como la referencia. Verificación: header, `h1`, buscador, los 5 chips, las 6 tarjetas y el alto del documento (1550 px en escritorio, 3386 px en móvil) coinciden con la referencia.
14. **Ajuste visual del resto de pantallas contra la referencia.** Repetir la comparación del paso 13 con detalle de juego, Salón de la Fama, acceso y jugar, a 1280×900 y a 390×844, llevando la referencia a cada pantalla con el propio prototipo y emparejando textos, campos y portadas por contenido. Correcciones: se anula el interlineado que las utilidades `text-xs … text-xl` de Tailwind asocian a cada tamaño (`--text-*--line-height: normal` en `globals.css`) y se quita el de `.btn-neon` y `.btn-neon-solid`, dejando `leading-[1.5]` explícito en los dos botones del modal de fin de partida, que lo fijan en la referencia; `.input-neon` fija `font-weight: 400` (un `<input>` no hereda el negrita de su `label`); los botones de la botonera táctil llevan `px-1.5 py-px`, el padding por defecto del navegador que usa la referencia. Verificación: el alto del documento coincide en las cuatro pantallas y en las dos resoluciones, y el homepage no retrocede. Las únicas diferencias que quedan son el área de juego (placeholder frente al juego real de la referencia, fuera de alcance), las fechas del ranking (fecha fija por spec) y artefactos de medición (estado `hover`, animación de pulso).

---

## Criterios de aceptación

**Generales**

- [x] `npm run lint`, `npx tsc --noEmit` y `npm run build` terminan sin errores.
- [x] Ninguna pantalla muestra errores ni warnings de hidratación en la consola del navegador.
- [x] Las cinco rutas existen: `/`, `/juegos/arkanoid`, `/salon-de-la-fama`, `/acceso`, `/juegos/arkanoid/jugar`.
- [x] `/juegos/xyz` y `/juegos/xyz/jugar` devuelven código HTTP 404 (comprobado con `curl`, no solo con la UI de 404).
- [x] No existe lógica de ningún juego: ninguna función `startGame`, ningún bucle `requestAnimationFrame` de juego ni manejador de teclas de juego.
- [x] Con `prefers-reduced-motion: reduce` no hay rejilla animada, parpadeos ni tilt en las tarjetas.
- [x] Sin `localStorage` disponible la app sigue funcionando (el usuario simulado simplemente no persiste).

**Header y menú**

- [x] En ≥ 760 px se ve la navegación horizontal; en < 760 px se ve el botón hamburguesa.
- [x] El menú móvil se abre con el botón, se cierra al pulsar el overlay y al navegar.
- [x] "Biblioteca" aparece activa en `/` y en `/juegos/[id]`; "Salón de la Fama" en `/salon-de-la-fama`.
- [x] Sin sesión se ve "INICIAR SESIÓN" y lleva a `/acceso`; con sesión se ve la inicial, el nombre y "Salir".
- [x] "Salir" borra `av_user` y el header vuelve a mostrar "INICIAR SESIÓN" sin cambiar de ruta.
- [x] El header no aparece en `/juegos/[id]/jugar`.

**Biblioteca**

- [x] A 1280×900 y a 390×844 las posiciones y tamaños de header, hero, buscador, chips y tarjetas coinciden con `references/Arcade Vault.dc.html` (medido con Playwright).
- [x] En detalle, Salón de la Fama, acceso y jugar, a 1280×900 y a 390×844, el alto del documento y la posición, tamaño y estilo de cada texto y campo coinciden con la referencia, salvo el área de juego (placeholder) y las fechas del ranking (medido con Playwright).
- [x] Se muestran 6 tarjetas, cada una con portada, categoría, título, descripción, mejor puntuación (la del puesto 1 del ranking) y botón JUGAR.
- [x] La mejor puntuación de Arkanoid se ve como `12.000`.
- [x] Pulsar los chips filtra por categoría; `TODOS` muestra los 6.
- [x] Buscar "puzle" o "PUZLE" no distingue mayúsculas ni acentos y deja solo Tetris.
- [x] Una búsqueda sin resultados muestra "NO SE ENCONTRARON JUEGOS" y el texto "Prueba con otro nombre o categoría.".
- [x] Pulsar cualquier parte de una tarjeta lleva a `/juegos/[id]` de ese juego.

**Detalle**

- [x] Se ven portada, categoría, título, descripción larga y controles con el texto de la referencia.
- [x] "JUGAR AHORA" lleva a `/juegos/[id]/jugar`; "VOLVER AL VAULT" lleva a `/`.
- [x] El panel muestra exactamente 10 filas; las 3 primeras usan los colores de medalla.
- [x] En ≥ 760 px el panel va en una columna lateral; en < 760 px va debajo del contenido.

**Salón de la Fama**

- [x] Hay 6 pestañas, una por juego; la activa está rellena con el color del juego.
- [x] Cambiar de pestaña cambia las 10 filas y reinicia la animación de entrada.
- [x] En < 760 px la columna FECHA no se muestra.
- [x] Sin sesión no hay banner "TU MEJOR MARCA"; con sesión aparece con el texto "AÚN SIN MARCA EN ESTE JUEGO".

**Acceso**

- [x] Enviar con usuario vacío o contraseña de menos de 4 caracteres muestra "Introduce tu usuario y una contraseña de al menos 4 caracteres.".
- [x] En "Crear cuenta" aparece el campo de correo; un correo inválido muestra "Introduce un correo electrónico válido.".
- [x] Cambiar de pestaña limpia el mensaje de error.
- [x] Un envío válido guarda `av_user` con el usuario en mayúsculas y recortado a 14 caracteres, y redirige a `/`.
- [x] El botón Google inicia sesión como `JUGADOR_GOOGLE` y el de GitHub como `JUGADOR_GITHUB`.
- [x] "JUGAR COMO INVITADO" redirige a `/` sin crear sesión.

**Pantalla de jugar**

- [x] Al entrar se ve "CARGANDO..." unos 1,1 s y después el placeholder de juego.
- [x] El HUD muestra PUNTUACIÓN `0`, VIDAS `3`, NIVEL `1` y JUGADOR (nombre de sesión o `INVITADO`).
- [x] El botón PAUSA y la tecla P muestran y ocultan el overlay "PAUSA"; el botón alterna entre PAUSA y REANUDAR.
- [x] La tecla P no hace nada durante la carga ni con el modal de fin de partida abierto.
- [x] SALIR lleva a `/juegos/[id]`.
- [x] La botonera táctil se ve solo en < 760 px y se oculta con el modal abierto.
- [x] En desarrollo, "SIMULAR FIN DE PARTIDA" abre el modal con la puntuación final `baseScore / 2` formateada; en `npm run build` + `npm run start` ese botón no existe.
- [x] "GUARDAR PUNTUACIÓN" muestra "GUARDANDO..." y luego "PUNTUACIÓN GUARDADA" tecleado con cursor; después el botón no se puede volver a pulsar.
- [x] La nota del modal dice "Modo invitado: se guardará solo en este dispositivo." sin sesión y "Se enviará a tu cuenta (conexión con el servidor)." con sesión.
- [x] Guardar no modifica el ranking del detalle ni del salón.
- [x] "JUGAR DE NUEVO" reinicia la carga; "VOLVER AL VAULT" lleva a `/`.

---

## Decisiones tomadas y descartadas

- **Sí:** rutas de App Router (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/salon-de-la-fama`, `/acceso`). URLs compartibles y botón atrás funcional, y encaja con Next 16.
- **No:** una sola ruta con estado interno como la referencia. Más simple, pero sin URLs ni historial.
- **Sí:** datos simulados y tipados en `lib/`, con ranking semilla determinístico. Cuando haya backend solo se sustituye `lib/api.ts` y `getLeaderboard`.
- **No:** guardar puntuaciones en `localStorage` (`av_scores`). El usuario decidió dejarlo fuera; "guardar" es solo una simulación visual.
- **Sí:** fecha de referencia fija (`SEED_REFERENCE_DATE`) en lugar de `Date.now()`. Con `cacheComponents: true` leer la hora en render del servidor puede romper el prerender y produciría diferencias de hidratación.
- **Sí:** sesión simulada con contexto React + `localStorage["av_user"]`. Sobrevive a recargas, como la referencia, y permite revisar el header con y sin usuario.
- **No:** solo contexto en memoria. Se pierde al recargar y estorba al revisar pantallas.
- **Sí:** portar `cover()` a un componente de cliente con `<canvas>`. Cero assets binarios y fiel al diseño. Se dibuja en `useEffect` sobre un contenedor con proporción fija, para evitar saltos de layout.
- **No:** PNG estáticos ni degradados CSS. Los PNG exigen generar assets; el degradado pierde el pixel-art.
- **Sí:** botón "SIMULAR FIN DE PARTIDA" solo fuera de producción. Sin juego real es la única forma de revisar el modal, y no debe llegar al usuario final.
- **No:** temporizador automático para el fin de partida. Es confuso al revisar la pausa.
- **Sí:** el punto de corte de 760 px se resuelve con CSS responsive, no con `window.innerWidth` como la referencia. Evita parpadeos de hidratación y re-renders en cada resize.
- **Sí:** la tarjeta de juego es un único `<Link>`; el "JUGAR" es un elemento visual dentro. Un `<button>` dentro de un `<a>` no es HTML válido, y la referencia abre el detalle desde ambos.
- **Sí:** el filtro de la Biblioteca y la pestaña del Salón viven en estado de cliente, no en `searchParams`. Evita obligar a `<Suspense>` en la ruta con `cacheComponents`; compartir el filtro por URL puede ser otro spec.
- **Sí:** route group `(site)` para las pantallas con header, y `/juegos/[id]/jugar` fuera del grupo para que no lo tenga.
- **Sí:** un solo spec para las cinco pantallas, porque el usuario pidió "todas las pantallas" y comparten datos, header y tema. El riesgo de tamaño se mitiga con pasos independientes que se pueden commitear por separado.
- **Sí:** `components/` y `lib/` en la raíz del repo, usando el alias `@/*` ya configurado.
- **Sí:** el homepage se valida contra la referencia con medidas reales (rects y estilos calculados), no solo a ojo. El interlineado base es `normal`, como en la referencia, y el color por defecto de los enlaces vive en `@layer base`.
- **Sí:** `proxy.ts` para el 404 real en ids desconocidos (paso 12). Con `cacheComponents` el estado HTTP se fija al enviar el shell, y la documentación de Next indica comprobar el slug en Proxy.
- **No:** relajar el criterio a "muestra la UI de 404". Funciona para el usuario, pero devuelve 200 y puede contar como soft 404.
- **No:** alias de búsqueda para "puzzle". La palabra no aparece en el catálogo; el criterio era una errata y se corrigió.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| `cacheComponents: true` rompe el build si una página lee `Date`, `localStorage` o datos dinámicos fuera de `<Suspense>` | Los datos son estáticos y las fechas fijas. Todo lo que lee `localStorage` va en componentes de cliente. Se verifica con `npm run build` en cada paso. |
| El header muestra "INICIAR SESIÓN" un instante antes de leer `av_user` en cliente | `SessionProvider` empieza en `user: null` y lee `localStorage` en un efecto, así servidor y primer render de cliente coinciden. El parpadeo breve se acepta en este MVP. |
| El tilt hecho con JavaScript ignora `prefers-reduced-motion` (la regla CSS global no neutraliza estilos inline) | `GameCard` consulta `matchMedia("(prefers-reduced-motion: reduce)")` y no aplica el tilt si coincide. Está en los criterios de aceptación. |
| `[id]` fuera y dentro de un route group con rutas hermanas (`/juegos/[id]` y `/juegos/[id]/jugar`) | Ambos usan el mismo nombre de parámetro `id`. Se comprueba al abrir las dos rutas en el paso 9. |
| El canvas de portada está vacío hasta que se monta en cliente | Contenedor con `aspect-ratio: 96/56` y color `--color-cover` de fondo, sin salto de layout. |
| `notFound()` dentro de la página devuelve 200 con `cacheComponents` | Paso 12: `proxy.ts` con `matcher` acotado a las rutas de juego. Debe ser rápido y no leer datos; solo compara el `id` con `GAMES`. |
| Los textos y colores de los juegos se copian a mano y pueden divergir de la referencia | `lib/games.ts` copia literal los textos de `games` en `Arcade Vault.dc.html`. La revisión de cada pantalla compara contra la referencia. |

---

## Qué **no** está en este spec

- Ningún juego jugable (ni Snake, ni Tetris, ni ninguno).
- Backend, autenticación real o OAuth real.
- Guardado real de puntuaciones, ni en servidor ni en `localStorage`.
- Ranking global y resaltado "(TÚ)".
- Juegos HTML externos en `<iframe>`.
- Página 404 personalizada, SEO por ruta, i18n, tests automatizados y despliegue.

Cada uno, si se aborda, va en su propio spec.
