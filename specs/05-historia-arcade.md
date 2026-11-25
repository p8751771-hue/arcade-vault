# SPEC 05 — Página "Historia" de los primeros arcades

> **Estado:** Implementado
> **Depende de:** SPEC 02, SPEC 03, SPEC 04
> **Fecha:** 2026-11-24
> **Objetivo:** Crear la página `/historia`, con una cabina "inserta moneda" que recorre 8 hitos de los primeros arcades (1971–1982) parafraseados de fuentes verificadas y citadas en formato APA, con crédito a sus creadores, y un bloque que explica por qué Arcade Vault pasó del estilo neón al de televisor antiguo.

---

## Por qué existe este spec

El spec 04 cambia el aspecto de todo el sitio, del neón original a una pantalla de televisor antiguo (`#748c7d`, texto negro, scanlines y banda de refresco). El usuario quiere que esa elección **se entienda y quede registrada**: que los jugadores conozcan cómo empezaron los videojuegos de salón recreativo y por qué el sitio se parece a aquellas pantallas, y que el diseño neón anterior no se pierda.

La página tiene tres partes:
- una **cabina** en la que el visitante "inserta monedas" para avanzar por la historia, como en un salón de los 70 y 80;
- la **lista completa** de los hitos, para leerla de corrido;
- una **reseña del cambio de estilo** con capturas del diseño anterior y del actual.

**Contenido real, sin material de terceros.** Los hitos son hechos históricos (año, fabricante, creadores y lo que aportó cada máquina), contrastados con fuentes públicas. El texto de cada hito es una **paráfrasis** escrita para este sitio, nunca una copia de la fuente, y cada paráfrasis lleva su **cita en el texto en formato APA 7.ª edición**, por ejemplo "(Smithsonian Institution, 2020)". La página termina con una lista de **Referencias** en formato APA. Cada hito da crédito a las personas que diseñaron la máquina. No se usan capturas, logotipos, personajes ni música de juegos reales: la única imagen de cada hito es la propia "pantalla" de la cabina, con texto en la tipografía del sitio.

**Numeración.** Los tests e2e del correo, que el spec 04 llamaba "spec 05", pasan a ser el **spec 06**.

**Ampliación (2026-11-25): medallas sin color.** Con el spec 04 ya mergeado, y antes de empezar este, el usuario vio en el Salón de la Fama que los recuadros de los puestos 01 y 03 tenían el borde ocre (`crt-gold` `#3f3200`) y marrón rojizo (`crt-bronze` `#4a230c`): se leían como colores fuera de la paleta. Pidió incluir la corrección en este spec y quitar los tonos de medalla **en todo el sitio**. Los tres primeros puestos se distinguen con un **borde negro más grueso**, no con color. Esto sustituye a la decisión del spec 04 sobre `crt-gold` / `crt-silver` / `crt-bronze`. El spec 04 no se reescribe porque ya está `Implementado`.

---

## Alcance

**Dentro:**

- Ruta `/historia` (`app/(site)/historia/page.tsx`) dentro del grupo `(site)`, con header y pie globales. Bloques, en este orden:
  1. **Cabecera:** kicker "▸ HISTORIA", título "ANTES DEL VAULT" y una frase de introducción.
  2. **Cabina "inserta moneda"** (`components/history/coin-cabinet.tsx`, componente de cliente):
     - una "pantalla" de televisor que muestra un hito: año grande, título, fabricante, la línea "CREADO POR" con sus diseñadores, el texto parafraseado y sus citas APA;
     - el contador "CRÉDITO n/8";
     - el botón "INSERTAR MONEDA", que pasa al hito siguiente, y "CANAL ANTERIOR", que vuelve al anterior;
     - el teclado: → y Enter avanzan, ← retrocede, solo con el foco dentro de la cabina;
     - en el último hito, "INSERTAR MONEDA" se sustituye por "VOLVER A 1971";
     - un efecto de "cambio de canal" (ruido breve) al cambiar de hito.
  3. **Todos los hitos:** lista ordenada (`<ol>`) con los 8 hitos completos (creadores y citas incluidos), siempre visible y legible sin JavaScript.
  4. **"POR QUÉ PARECEMOS UN TELEVISOR":** texto que relaciona aquellas pantallas CRT (scanlines, fósforo, refresco) con el diseño actual. Lleva dos capturas, el diseño neón original y el diseño de televisor actual, con su pie de foto.
  5. **Referencias:** lista de las fuentes usadas en formato APA 7.ª edición, ordenada alfabéticamente por autor, con sangría francesa y enlace.
- Los 8 hitos, en este orden: 1971 Computer Space (Nutting Associates), 1972 Pong (Atari), 1975 Gun Fight (Midway), 1978 Space Invaders (Taito), 1979 Asteroids (Atari), 1980 Pac-Man (Namco), 1981 Donkey Kong (Nintendo) y 1982 "La edad de oro" (sin fabricante).
- Verificación de cada año, fabricante, creador y dato con al menos dos fuentes públicas antes de escribirlo en los datos.
- **Paráfrasis y crédito:** el texto de cada hito se redacta con palabras propias a partir de las fuentes. No se copian frases (ninguna secuencia de 8 o más palabras seguidas igual a la fuente) ni se usan citas textuales. Cada hito acredita a sus creadores ("CREADO POR …") y lleva al menos dos citas APA en el texto.
- Capturas `public/historia/estilo-neon.png` (landing de `main` antes del spec 04) y `public/historia/estilo-tv.png` (landing con el spec 04), tomadas con Playwright a 1280×900.
- Enlace "Historia" en el header de escritorio y en el menú móvil, tras "Acerca de"; activo solo en `/historia`.
- Paleta y efectos del spec 04 (tokens `crt-*`, texto negro, hover invertido).
- **(Ampliación) Medallas sin color en todo el sitio:**
  - **Salón de la Fama** (`components/hall-of-fame.tsx`): los puestos 01–03 llevan borde `crt-ink` de 3 px y el resto `crt-line` de 2 px. El relleno de las filas 01–03 baja 1 px por lado para que todas midan lo mismo.
  - **Ranking del detalle de juego** (`app/(site)/juegos/[id]/page.tsx`): la barra izquierda de 3 px es `crt-ink` en los puestos 01–03 y `crt-line` en el resto.
  - **"TOP JUGADORES · HOY"** de la landing (`components/home/top-players.tsx`): la barra lateral de 4 px es `crt-ink` en los puestos 01–03 y `crt-line` en el resto.
  - `MEDALS` (`lib/scores.ts`) pasa a `crt-ink` para los tres, y se eliminan los tokens `--color-crt-gold`, `--color-crt-silver` y `--color-crt-bronze` de `app/globals.css`.
- Actualizar `CLAUDE.md` (tabla de rutas, arquitectura, numeración de specs).

**Fuera de alcance (para specs futuros):**

- Sonido (moneda, música o efectos).
- Imágenes, logotipos, personajes o capturas de juegos reales, y recreaciones jugables de ellos.
- Hitos posteriores a 1982 (declive de los salones, consolas domésticas).
- Guardar la posición de la cabina entre visitas.
- Modo "attract" automático (la cabina no avanza sola).
- Tests e2e del correo (spec 06), tests automatizados en general, SEO, i18n y despliegue.

---

## Modelo de datos

Datos estáticos en `lib/history.ts`:

```ts
// lib/history.ts
// Referencia en formato APA 7.ª edición (página web o libro).
export interface HistorySource {
  id: string;                 // "smithsonian-2020-pong"
  authors: readonly string[]; // personas ("Bushnell, N.") u organización ("Smithsonian Institution")
  year: number | null;        // null → "s.f." (sin fecha)
  title: string;              // título de la página, artículo o libro
  container: string | null;   // sitio web, revista o editorial; null si coincide con el autor
  url: string | null;         // https://…; null para libros sin edición en línea
}

// formatApaReference(source) → "Smithsonian Institution. (2020). Título en cursiva. Sitio. https://…"
// formatApaCitation(source)  → "(Smithsonian Institution, 2020)" o "(Autor, s.f.)"
export function formatApaReference(source: HistorySource): string;
export function formatApaCitation(source: HistorySource): string;

export interface Milestone {
  year: number;              // 1971
  title: string;             // "COMPUTER SPACE" o "LA EDAD DE ORO"
  maker: string | null;      // "Nutting Associates"; null en 1982
  creators: readonly string[]; // ["Nolan Bushnell", "Ted Dabney"]; [] en 1982
  text: string;              // 2–3 frases parafraseadas, español, sin adjetivos de marketing
  sources: readonly string[]; // ≥ 2 ids de HISTORY_SOURCES, citados al final del texto
}

export const MILESTONES: readonly Milestone[];       // 8, en orden cronológico
export const HISTORY_SOURCES: readonly HistorySource[];
export const STYLE_NOTE: readonly string[];          // párrafos de "POR QUÉ PARECEMOS UN TELEVISOR"
```

Estado de la cabina (local al componente, no se guarda):

```ts
type CabinetState = {
  index: number;      // 0..7
  switching: boolean; // true durante el efecto de cambio de canal (~250 ms)
};
```

**Convenciones:**

- **Textos:** español, frases cortas y voz activa. Cada hito explica qué aportó al arcade, sin valoraciones ("revolucionario", "legendario"). Son paráfrasis: se reescribe la idea, no la frase.
- **Formato APA 7.ª edición:**
  - **Cita en el texto:** al final del texto de cada hito, entre paréntesis y separadas por punto y coma, en orden alfabético: "(Autor, año; Autor, año)". Hasta dos autores se nombran ambos ("Bushnell y Dabney"); con tres o más, el primero seguido de "et al.". Sin fecha, "s.f.".
  - **Referencias:** "Autor, A. A. (Año). *Título*. Sitio o editorial. URL". El título va en cursiva (`<cite>` o `<em>`), cada entrada con sangría francesa de 2 em y ordenadas alfabéticamente por el primer autor.
  - Los textos de las citas y referencias los generan `formatApaCitation` y `formatApaReference` a partir de `HISTORY_SOURCES`; no se escriben a mano en el JSX.
- **Crédito a los creadores:** línea "CREADO POR" en Press Start de 9 px con los nombres separados por " · ". En 1982 no aparece.
- **Pantalla de la cabina:**
  - fondo `crt-well` y borde `crt-line`;
  - el año en Press Start a 40 px (24 px a ≤ 600 px), y el título y el fabricante en Press Start a 12 px;
  - el texto en Courier Prime a 15 px, con `aria-live="polite"` para que se anuncie el hito nuevo.
- **Cambio de canal:** durante 250 ms se superpone sobre la pantalla el ruido SVG del spec 04 a opacidad 0,6 y después se muestra el hito nuevo. Con `prefers-reduced-motion: reduce` el cambio es instantáneo.
- **Controles:** botones `.btn-home` con el estado invertido del spec 04. "CANAL ANTERIOR" está deshabilitado en 1971.
- **Capturas:**
  - `next/image` con `width` y `height` fijos (1280×900, mostradas a la anchura de la columna) y cada archivo ≤ 400 KB.
  - Textos alternativos: "Diseño original de Arcade Vault: tema neón sobre fondo negro" y "Diseño actual de Arcade Vault: pantalla de televisor antiguo verde-gris".
  - Pies de foto: "ANTES · NEÓN (2026)" y "AHORA · TV (2026)".
- **Cortes:** a ≤ 900 px las dos capturas pasan de 2 columnas a 1 (`max-[901px]:`, como en el spec 03).
- **Enlaces:** cada cita del texto enlaza a su entrada en "REFERENCIAS" (`#ref-{id}`), y cada enlace externo lleva `rel="noopener noreferrer"`.

---

## Plan de implementación

Requisito: el spec 04 implementado (tokens `crt-*` y capa de televisor). La rama sale de la rama o del merge del spec 04. Toda la interfaz se trabaja con `/frontend-design` y la paleta del spec 04. Las evidencias de Playwright se guardan en `.mcp-evidencias/AAAA-MM-DD_HH-MM-SS/`.

1. **Ruta y enlace.** Crear `app/(site)/historia/page.tsx` con un marcador (`<h1>` ANTES DEL VAULT) y añadir "Historia" a `NAV` en `components/site-header.tsx`. Verificación: `npm run build` pasa; el enlace solo está activo en `/historia`; alto del header a 1280, 1600 y 390 medido y anotado.
2. **Investigación y datos.** Verificar los 8 hitos (año, fabricante, creadores y aportación) con al menos dos fuentes públicas cada uno (búsqueda web), recogiendo de cada fuente los datos APA (autor, año, título, sitio, URL). Redactar los textos como paráfrasis y crear `lib/history.ts` con `MILESTONES`, `HISTORY_SOURCES`, `STYLE_NOTE`, `formatApaCitation` y `formatApaReference`. Si una fuente contradice un año, un fabricante o un creador de la lista, se para y se consulta al usuario antes de escribirlo. Verificación:
   - `npx tsc --noEmit` pasa;
   - 8 hitos en orden, cada uno con creadores (salvo 1982) y ≥ 2 fuentes que existen en `HISTORY_SOURCES`;
   - una comparación automática de cada texto con el contenido descargado de sus fuentes no encuentra ninguna secuencia de 8 o más palabras seguidas en común.
3. **Cabecera y lista completa.** Añadir la cabecera y la sección "TODOS LOS HITOS" (`<ol>`) en la página, como componentes de servidor. Verificación: sin JavaScript se leen los 8 hitos.
4. **Cabina.** Crear `components/history/coin-cabinet.tsx` con los controles, el teclado, el contador, "VOLVER A 1971" y el efecto de cambio de canal. Insertarla entre la cabecera y la lista. Verificación con Playwright: 7 clics en "INSERTAR MONEDA" llegan a 1982; "CANAL ANTERIOR" vuelve; las flechas funcionan con el foco dentro; con `reduced-motion` no hay capa de ruido.
5. **Capturas y reseña.** Tomar con Playwright las dos capturas (la neón desde `main`, la de televisor desde la rama del spec 04), optimizarlas a ≤ 400 KB y guardarlas en `public/historia/`. Añadir la sección "POR QUÉ PARECEMOS UN TELEVISOR" con las dos imágenes. Verificación: las imágenes cargan con su `alt` y su tamaño.
6. **Citas y referencias.** Añadir las citas APA al final de cada hito (en la cabina y en la lista) y la sección "REFERENCIAS" en formato APA con sangría francesa. Verificación: todos los enlaces externos responden con 2xx o 3xx (`curl -I`); cada cita enlaza a una entrada existente; las entradas están en orden alfabético.
7. **Documentación.** Actualizar `CLAUDE.md`: ruta `/historia`, `lib/history.ts`, `components/history/`, `public/historia/`, el enlace del header y la numeración (spec 06 para los tests e2e).
8. **(Ampliación) Medallas sin color.** Aplicar los cambios del alcance en `components/hall-of-fame.tsx`, `app/(site)/juegos/[id]/page.tsx`, `components/home/top-players.tsx` y `lib/scores.ts`, y eliminar `--color-crt-gold|silver|bronze` de `app/globals.css`. Actualizar `CLAUDE.md` (paleta, `MEDALS`). Verificación con Playwright:
   - en `/salon-de-la-fama` los bordes de las filas 01–03 son `rgb(0, 0, 0)` de 3 px y los demás `rgb(47, 59, 52)` de 2 px;
   - en `/juegos/arkanoid` y `/` las barras de los puestos 01–03 son `rgb(0, 0, 0)`;
   - `grep` de `crt-gold|crt-silver|crt-bronze` en `app/`, `components/` y `lib/` sin resultados;
   - el alto del documento de `/`, `/juegos/arkanoid` y `/salon-de-la-fama`, a 1280 y a 390, es igual al de `main` antes de este paso.
9. **Verificación global.** Con Playwright, a 1280×900 y 390×844:
   - capturas de página completa;
   - escaneo de contraste del spec 04 en `/historia`;
   - `grep` de los valores prohibidos del spec 04 (las imágenes PNG no cuentan);
   - alto del header en todas las rutas comparado con las medidas del paso 1.

---

## Criterios de aceptación

- [x] `npm run build`, `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [x] `/historia` responde 200 y muestra, en orden, cabecera, cabina, "TODOS LOS HITOS", "POR QUÉ PARECEMOS UN TELEVISOR" y "REFERENCIAS".
- [x] El header y el menú móvil muestran "Historia" tras "Acerca de", y solo está activo en `/historia`.
- [x] La cabina empieza en 1971 con "CRÉDITO 1/8" y "CANAL ANTERIOR" deshabilitado.
- [x] Cada clic en "INSERTAR MONEDA", o cada pulsación de → o Enter con el foco en la cabina, avanza un hito; ← o "CANAL ANTERIOR" retroceden.
- [x] En 1982 ("CRÉDITO 8/8") el botón dice "VOLVER A 1971" y lleva al primer hito.
- [x] El hito nuevo se anuncia por `aria-live="polite"`.
- [x] Sin `prefers-reduced-motion` aparece el ruido de cambio de canal durante unos 250 ms; con `reduce` no aparece.
- [x] Sin JavaScript, la lista "TODOS LOS HITOS" muestra los 8 hitos completos.
- [x] Los 8 hitos coinciden en orden, año, título y fabricante con la lista del alcance, salvo correcciones aprobadas por el usuario en el paso 2.
- [x] Cada hito (salvo 1982) muestra "CREADO POR" con sus diseñadores verificados.
- [x] Cada hito termina con al menos dos citas APA en el texto ("(Autor, año; Autor, año)"), y cada cita enlaza a su entrada de "REFERENCIAS".
- [x] "REFERENCIAS" sigue el formato APA 7.ª edición (autor, año o "s.f.", título en cursiva, sitio y URL), en orden alfabético y con sangría francesa, y todos sus enlaces responden con 2xx o 3xx. (18 de 19 con `curl -I`; Smithsonian Magazine rechaza `HEAD` con 403 y responde 200 a `GET`, comprobado así.)
- [x] Ningún texto de hito comparte 8 o más palabras seguidas con el contenido de sus fuentes (comparación automática del paso 2) ni contiene citas textuales.
- [x] `public/historia/estilo-neon.png` y `public/historia/estilo-tv.png` existen, pesan ≤ 400 KB y se muestran con su `alt` y su pie de foto; a ≤ 900 px van en una columna.
- [x] La página no contiene imágenes, logotipos ni personajes de juegos reales (solo las dos capturas propias de Arcade Vault).
- [x] (Ampliación) Ningún ranking del sitio usa color de medalla. En el Salón de la Fama los puestos 01–03 tienen borde negro de 3 px y el resto borde `crt-line` de 2 px. En el detalle de juego y en "TOP JUGADORES · HOY" las barras de los puestos 01–03 son negras y las demás `crt-line`. Los tokens `crt-gold`, `crt-silver` y `crt-bronze` ya no existen.
- [x] (Ampliación) Las alturas de `/`, `/juegos/arkanoid` y `/salon-de-la-fama` no cambian con el paso 8.
- [x] El escaneo de contraste del spec 04 no encuentra ningún texto por debajo de 4,5:1 en `/historia`, a 1280 ni a 390.
- [x] El `grep` de valores prohibidos del spec 04 sigue sin resultados.
- [x] `CLAUDE.md` documenta la ruta, los archivos nuevos y que los tests e2e son el spec 06.

---

## Decisiones tomadas y descartadas

- **Sí:** página propia `/historia` con enlace en el header. El usuario la eligió frente a una sección en "Acerca de" o en la landing; deja espacio para la cabina y la lista sin alargar otras páginas.
- **Sí:** 8 hitos de 1971 a 1982, con la lista del alcance. El usuario la eligió frente a una versión breve o una que llegue a los 90.
- **Sí:** cabina "inserta moneda" con "CANAL ANTERIOR", teclado y contador. El usuario la eligió; recrea el gesto de echar monedas sin obligar a leerlo todo así.
- **Sí:** la lista "TODOS LOS HITOS" siempre visible bajo la cabina, en lugar de un botón que cambie de modo. Funciona sin JavaScript y con lectores de pantalla, que es para lo que el usuario aceptó un "modo lista completa".
- **No:** modo "attract" que avanza solo. Mueve el texto mientras alguien lee.
- **No:** sonido de moneda. El sitio no tiene audio; si se quiere, va en otro spec.
- **Sí:** cada dato contrastado con al menos dos fuentes públicas y citado en la página. El usuario lo eligió; las fechas y atribuciones de los primeros arcades se citan mal con frecuencia.
- **Sí:** textos parafraseados, nunca copiados, y sin citas textuales. El usuario lo pidió. El umbral de 8 palabras seguidas permite comprobarlo automáticamente.
- **Sí:** formato APA 7.ª edición para las citas en el texto y la lista de referencias. El usuario lo pidió; es un estándar conocido y verificable.
- **Sí:** citas y referencias generadas por `formatApaCitation` / `formatApaReference` desde los datos. Así el formato es el mismo en la cabina, la lista y las referencias, y no se escribe a mano.
- **Sí:** crédito a los creadores de cada máquina ("CREADO POR"), verificado con las fuentes. El usuario lo pidió; las máquinas tienen autores con nombre propio.
- **Sí:** si una fuente contradice la lista, se para y se pregunta. Los hitos los aprobó el usuario y no se cambian por sorpresa.
- **Sí:** reseña "POR QUÉ PARECEMOS UN TELEVISOR" con capturas del diseño neón y del actual. El usuario la eligió para conservar la historia del propio sitio.
- **Sí:** el estilo neón se muestra como captura PNG, no recreado en CSS. El usuario lo eligió; así no se rompe la prohibición de colores neón del spec 04 y la imagen es un documento real del diseño anterior.
- **No:** imágenes, logotipos o personajes de juegos reales. Son material de terceros; la pantalla de cada hito es texto en la tipografía del sitio.
- **Sí:** efecto de cambio de canal de 250 ms, instantáneo con `reduced-motion`. Recuerda al televisor sin retrasar la lectura, y sigue la regla de movimiento del sitio.
- **Sí:** spec 05 para la historia; los tests e2e del correo pasan al 06.
- **Sí (ampliación):** quitar los tonos de medalla en todo el sitio. El usuario los vio como colores ajenos a la paleta en el Salón de la Fama y eligió aplicarlo también al detalle y a la landing, para que todos los rankings sigan el mismo criterio.
- **Sí (ampliación):** los tres primeros puestos se marcan con borde o barra negros más gruesos. El usuario lo eligió frente a invertir la fila o a no distinguirlos; el número de rango sigue siendo la señal principal.
- **No (ampliación):** filas invertidas (fondo negro) para el top 3. Tres filas negras seguidas pesan demasiado frente al resto de la lista.
- **Sí (ampliación):** la corrección va en este spec, aunque no trate de la historia, porque el usuario lo pidió así. El spec 04 queda como histórico.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Datos históricos erróneos (año, fabricante, creador, "primero en…") | Dos fuentes por dato en el paso 2; ante una contradicción se consulta al usuario; las fuentes se citan en la página. |
| Una paráfrasis queda demasiado cerca del original | Comparación automática de 8 palabras seguidas en el paso 2; si salta, se reescribe el texto. |
| Una fuente no tiene autor o fecha claros | APA lo resuelve: autor organizacional y "s.f."; nunca se inventa un autor o un año. |
| Un enlace de fuente deja de funcionar con el tiempo | Se comprueban al implementar (paso 6); preferir fuentes estables (museos, archivos, enciclopedias). |
| Añadir "Historia" hace crecer el header | A 1280 ya ocupa dos líneas; el paso 1 mide el header a 1280, 1600 y 390, y cualquier cambio se anota y se consulta. |
| Las capturas pesan demasiado | Límite de 400 KB por imagen y `next/image`. |
| El spec 04 no está implementado al empezar | Requisito explícito del plan: la rama sale del spec 04. |

---

## Lo que **no** entra en este spec

- Sonido, modo "attract" o guardar la posición de la cabina.
- Material de juegos reales (capturas, logotipos, personajes) o versiones jugables.
- Historia posterior a 1982.
- Tests e2e del correo (spec 06) y tests automatizados en general.
- Otros cambios de paleta aparte de las medallas.

Cada uno, si llega, va en su propio spec.
