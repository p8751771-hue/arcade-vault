---
name: add-game
description: Genera el spec (en Borrador) de un juego nuevo de Arcade Vault con su leaderboard, siguiendo el patrón de los specs 07 (Asteroides) y 11 (tablas games / scores). El juego puede venir de una subcarpeta de references/started-games/, de una función de references/games.js o de una descripción. No escribe código; se implementa después con /spec-impl.
disable-model-invocation: true
argument-hint: "<subcarpeta de references/started-games/ | función de references/games.js | descripción del juego>"
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion, Bash(ls:*), Bash(cat:*), Bash(date:*), Bash(grep:*)
---

# /add-game — Spec de un juego nuevo con su leaderboard

## Contexto de la sesión

Fecha de hoy (úsala en la cabecera del spec; nunca la inventes):
!`date +%F`

Specs que ya existen:
!`ls specs/`

Juegos de referencia en carpetas (`references/started-games/`):
!`ls references/started-games/ 2>/dev/null || echo "La carpeta references/started-games/ no existe todavía"`

Juegos de referencia en `references/games.js` (funciones):
!`grep -n "^function" references/games.js 2>/dev/null || echo "Sin references/games.js"`

Skill `/spec` de referencia (se lee entera antes de escribir el spec):
!`ls .agents/skills/spec/`

Juegos ya jugables (`ARCADE_GAMES`):
!`cat lib/arcade/index.ts`

---

## Qué hace esta skill

Escribe **un solo spec combinado** `specs/NN-juego-<id>.md` en estado `Borrador`. El spec cubre un juego nuevo de canvas (lógica, HUD del canvas, portada), su fila en la tabla `games` de Supabase y su integración con el leaderboard y el guardado, que ya existen (spec 11). Las tablas `games` y `scores` no cambian: un juego nuevo es **una fila más**.

**No escribe código, no toca la base de datos y no implementa nada.** Cuando la persona apruebe el spec (lo pasa a `Aprobado` a mano), lo implementa `/spec-impl`. Es el flujo spec-driven del proyecto (ver `CLAUDE.md`).

El diseño aprobado **no cambia**: cabina, HUD de React, modal de fin, páginas, header y estilos se quedan como están. El juego se ve como Asteroides: trazos negros sobre la pantalla `#6e8677`, sin brillos ni neón.

Habla siempre en español.

### Relación con `/spec`

`/add-game` es una especialización de la skill `/spec` del proyecto (`.agents/skills/spec/SKILL.md`, con su `template.md`), no un sustituto. **Antes de preguntar y antes de crear el archivo de especificación, lee esa skill entera y úsala como referencia.** Sigue su método:

- sus fases: entender el contexto, aclarar con preguntas, escribir y guardar;
- sus reglas para preguntar: bloques de 3 a 5, opciones concretas con una recomendación, y cuándo dejar de preguntar;
- su forma de escribir: completo de una vez si no falta nada, o sección por sección si falta algo;
- sus reglas para guardar: número siguiente, fecha de la sesión, estado `Borrador`, comprobar las dependencias y no sobrescribir;
- sus reglas duras y el tono.

Este archivo solo **añade** lo propio de un juego: el origen, las preguntas del juego, los huecos del motor, la plantilla y la guía técnica. Si alguna instrucción de aquí contradice a `/spec`, manda la de aquí, porque es más específica. En todo lo demás manda `/spec`. No invoques `/spec` como comando: es de invocación manual. Lee su archivo y aplica sus reglas.

---

## Fase 1 — Contexto

Lee antes de preguntar nada:

0. **`.agents/skills/spec/SKILL.md` y `.agents/skills/spec/template.md`**, enteros: el método y la forma de todo spec del proyecto (ver "Relación con `/spec`").
1. `CLAUDE.md` (arquitectura, paleta, convenciones, prohibiciones).
2. `specs/07-juego-asteroides.md` y `specs/11-leaderboard-y-tabla-de-juegos.md`: son el patrón de este spec.
3. Los dos specs más recientes de `specs/`, para copiar el idioma, las etiquetas (`**Estado:**`, `**Depende de:**`…) y los encabezados.
4. `guia-integracion.md` y `plantilla-spec.md` (en la carpeta de esta skill).
5. `lib/arcade/engine.ts` y `lib/arcade/asteroides.ts`: el contrato real del motor y el modelo de código y de aspecto.

## Fase 2 — Origen del juego

`$ARGUMENTS` dice de dónde sale el juego. Resuélvelo así, en este orden:

1. **Subcarpeta de `references/started-games/`** (p. ej. `03-tetris` o solo `tetris`): busca la carpeta. Lee su `game.js` y, si los hay, su `README` y demás archivos de texto.
2. **Nombre de una función de `references/games.js`** (`snake`, `arkanoid`, `tetris`, `invaders`, `pacman`): lee esa función entera. Lee también su entrada en el array `games` de `references/Arcade Vault.dc.html`: `desc`, `long` y `ctl` son la base de los textos de la fila de `games`.
3. **Descripción libre** (varias palabras que no coinciden con nada de lo anterior): el juego se define desde cero con las preguntas de la fase 3.
4. **Vacío:** enseña las fuentes disponibles (contexto de arriba) y pide una subcarpeta, una función o una descripción en una frase.

Si el argumento parece una carpeta o una función pero no existe, enséñale a la persona lo que hay disponible y pregúntale.

De una referencia **se porta solo la lógica**: reglas, física, colisiones, puntos, vidas, niveles y cuándo termina. Del dibujo solo se conservan las **formas**. El neón (`glow`, `clear`, `txt`, `shadowBlur`, `shadowColor`, fondo `#05050b`, colores `C/M/Y/GR/WH`) se sustituye por la paleta del canvas (ver `guia-integracion.md`). Anota qué notifica la referencia (`h.score`, `h.lives`, `h.level`, `G.end`) y qué usa del motor de la referencia (`G.keys`, `G.hit`, `G.q`, listeners en `canvas`): eso alimenta la fase 4.

**Nombre y aspecto propios.** Las mecánicas y el género son libres, pero el juego de la plataforma lleva un título propio en español y un aspecto propio (paleta CRT). No usa el nombre, los personajes ni el arte de un juego comercial concreto, igual que "ASTEROIDES" no es "Asteroids". Propón un título así en la primera pregunta.

## Fase 3 — Preguntas

Pregunta en bloques de 3 a 5 con `AskUserQuestion`. Pon tu recomendación en primer lugar y márcala "(Recomendado)". Con una referencia, **la recomendación por defecto es conservar lo que hace la referencia**. No preguntes lo que la fuente ya responde sin ambigüedad: dilo en el spec como decisión tomada.

Temas que hay que cerrar:

1. **Identidad:** `id`, en minúsculas y sin acentos: es la URL `/juegos/<id>`, `games.id` y la clave de `ARCADE_GAMES`, y no se puede repetir con la de un juego ya jugable. Además, `title` en mayúsculas.
2. **Categoría:** una de `ARCADE`, `PUZLE`, `DISPAROS`, `LABERINTO` (es el CHECK de la base). Si se necesita una nueva, el spec incluye una migración que cambia el CHECK y actualiza `Category` y `CATEGORY_FILTERS` en `lib/games.ts`. Recomienda no hacerlo si una de las cuatro encaja.
3. **Reglas y puntuación:** qué se conserva y qué cambia respecto a la fuente; fórmulas concretas, con números.
4. **Vidas y niveles:** ¿tiene vidas? (si no, es un hueco del motor, ver fase 4). ¿Cuántas? ¿Qué sube el nivel y qué cambia con él?
5. **Controles:** teclas (las del motor son flechas, `W A S D` como alias y `Espacio`; `P` y `F` están ocupadas por pausa y pantalla completa). Ratón o puntero (sí o no).
6. **Campo:** cuadrado de 480×480 (por defecto) o panorámico en pantalla completa con `resize` (opt-in, spec 09). Recomienda cuadrado salvo que el juego gane mucho con el ancho.
7. **HUD del canvas:** puntuación arriba a la izquierda, `NIVEL n` arriba a la derecha y vidas como iconos (o lo que aplique). El HUD de React no cambia.
8. **Aspecto en el canvas:** qué figuras hay y cómo se distinguen sin color (grosor de trazo, relleno o contorno).
9. **Portada 96×56:** qué escena se dibuja (formas sencillas con los cuatro tonos de las portadas).
10. **Textos de la fila de `games`:** `description` (tarjeta, una frase), `long_description` (detalle, 2–3 frases) y `controls` (formato `← →: mover · ESPACIO: disparar`). Propón un borrador; con una referencia, adapta `desc` / `long` / `ctl`.
11. **Fuera de alcance:** confirma la lista por defecto de `plantilla-spec.md` y lo que la persona mencione y se deje para más tarde.

Deja de preguntar cuando puedas responder sin suponer nada a estas tres preguntas: qué archivos aparecen o cambian, cuál es el primer paso ejecutable y cuál el último, y cómo se comprueba que el juego está terminado.

## Fase 4 — Huecos del motor

Compara lo que necesita el juego con la tabla **"Huecos conocidos"** de `guia-integracion.md` (cola ordenada de teclas, `destroy?` para listeners de puntero, juego sin vidas, teclas nuevas…). Por cada hueco:

- Añade un paso **al principio del plan** que extienda el motor o la cabina de forma **genérica y opcional**. Ningún juego puede aparecer por nombre en `lib/arcade/engine.ts` ni en `components/play-screen.tsx`, y Asteroides debe seguir funcionando sin cambios.
- Añade un criterio que compruebe que Asteroides sigue igual.
- Anota la extensión en el modelo de datos del spec, con la firma TypeScript nueva.

Si el juego necesita algo que la guía no recoge, descríbelo igual (genérico y opcional) y añádelo a "Riesgos".

## Fase 5 — Escribir el spec

**Antes de crear el archivo**, vuelve a abrir `.agents/skills/spec/SKILL.md` (fases 3 y 4, y "Hard rules") y `.agents/skills/spec/template.md`, y repasa que el spec cumple sus reglas:

- un objetivo de una sola frase;
- "Fuera de alcance" explícito;
- pasos del plan que dejan el sistema funcionando y caben en un commit;
- criterios booleanos y verificables;
- decisiones con su motivo;
- nombres de archivo concretos;
- ningún TODO ni código largo.

Si falta información, sigue el modo sección por sección de `/spec` en vez de inventarla.

1. **Número:** el mayor de `specs/` más uno, con dos cifras.
2. **Archivo:** `specs/NN-juego-<id>.md`. Si ya existe, pregunta antes de tocarlo; si no, escríbelo sin pedir permiso.
3. **Contenido:** rellena `plantilla-spec.md` con lo decidido, siguiendo `.agents/skills/spec/SKILL.md` (método) y `.agents/skills/spec/template.md` (forma):
   - Cabecera: `**Estado:** Borrador`, `**Depende de:** SPEC 07, SPEC 11` (más el 09 si usa `resize`), la fecha del contexto y un objetivo de una sola frase.
   - Las reglas con números concretos, la tabla de aspecto y la de controles.
   - El plan tipo, con un paso por hueco del motor delante.
   - Los criterios base, adaptados al juego, más los criterios propios de sus reglas.
   - Las decisiones: las heredadas, más las respuestas de la persona marcadas "(Respuesta del usuario.)" y tus decisiones marcadas "(Decisión mía.)".
   - El enlace a `.claude/skills/add-game/guia-integracion.md` como contrato técnico para la implementación.
4. **Nada de código largo:** solo firmas, interfaces, el SQL del `insert` y tablas. El código lo escribe `/spec-impl`.
5. **Confirma y para:**
   - Ruta del archivo creado.
   - Recordatorio: el spec está en `Borrador`; hay que releerlo y cambiar el estado a `Aprobado` a mano.
   - Siguiente paso: `/spec-impl NN-juego-<id>`.
   - No propongas implementarlo ni hagas nada más.

---

## Reglas duras

- **Nunca escribas código** ni edites nada fuera del spec nuevo. Tampoco toques la base de datos (ni MCP de Supabase, ni migraciones): solo se describen en el spec.
- **Nunca marques el spec como `Aprobado`.** Lo hace la persona.
- **No cambies el diseño aprobado.** El spec no puede tocar la cabina, el HUD de React, el modal de fin, las páginas, el header, `app/globals.css` ni las clases reutilizables. Lo nuevo del juego vive dentro de su canvas y su portada.
- **Juegos aislados.** Cada juego en su archivo de `lib/arcade/`, sin importar a otros juegos. Solo `lib/arcade/index.ts` une ids con juegos. Ni `engine.ts` ni `play-screen.tsx` nombran un juego.
- **Paleta del canvas:** solo `#6e8677`, `#000000` y `#2f3b34` (y en la portada sus cuatro tonos). Sin `shadowBlur`, `shadowColor` ni los colores neón prohibidos por `CLAUDE.md`.
- **Leaderboard sin cambios de esquema:** una fila en `games`. `scores`, sus políticas, las páginas de ranking y `submitScore` no se tocan, salvo que la persona pida expresamente algo nuevo (y entonces va en "Fuera de alcance" o en otro spec).
- **Datos de prueba:** las filas que la verificación escriba en `scores` usan solo el nombre `USUARIO-TEST`.
- **Evidencias** de Playwright MCP en `.mcp-evidencias/<AAAA-MM-DD_HH-MM-SS>/`, una carpeta nueva por ejecución con su `README.md`.
- Si la persona quiere saltarse las preguntas, recuérdale que se pagan después en código. Si insiste, respétalo y anótalo en "Decisiones" ("Definición rápida sin aclaraciones detalladas").
