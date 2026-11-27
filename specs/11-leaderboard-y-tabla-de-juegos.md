# SPEC 11 — Leaderboard real y tabla de juegos en Supabase

> **Estado:** Implementado
> **Depende de:** SPEC 01, SPEC 02, SPEC 06, SPEC 07
> **Fecha:** 2026-11-27
> **Objetivo:** Crear en Supabase las tablas `games` (el catálogo de juegos, solo lectura) y `scores` (las puntuaciones), y conectar a ellas la biblioteca, el detalle de cada juego, el Salón de la Fama (global y por juego) y el guardado de la puntuación al terminar una partida de Asteroides, eliminando los datos locales falsos.

---

## Por qué existe este spec

Hasta ahora el catálogo (`lib/games.ts`) y los rankings (`lib/scores.ts`, un generador determinista) son datos locales falsos, y guardar una puntuación es un stub sin red (`submitScore` en `lib/api.ts`). El spec 06 dejó los clientes de Supabase listos sin tablas; el spec 07 hizo jugable el primer juego. Este spec es el que une todo: la partida de Asteroides termina en una fila real y esa fila aparece en los rankings.

**Qué se decidió en la definición** (respuestas del usuario a doce preguntas; las imágenes de la conversación):

1. Un solo spec para las dos cosas (leaderboard y tabla de juegos).
2. El leaderboard tiene **dos vistas**: global y por juego.
3. La "tabla de juegos" guarda las referencias de **los juegos que tenemos**; hoy, solo `asteroides`.
4. Las dos pantallas de ranking ya existen físicamente pero con datos falsos: el leaderboard global es el Salón de la Fama y el de cada juego está en la página del juego.
5. Se integra con Supabase.
6. `scores` lleva `id`, `game_id`, `player_name`, `score`, `created_at` y un `user_id` de Supabase **opcional (nulo)**, porque por ahora no se exige estar autenticado para jugar.
7. Los juegos de la tabla aparecen en la biblioteca.
8. La tabla de juegos es **solo de lectura**: no se editan juegos desde la aplicación.
9. Modelo **híbrido**: los datos locales de juegos se borran y los juegos se cargan solo desde Supabase; el código de cada juego (motor, portada) sigue en el repositorio.
10. Se guarda el nombre que la persona escribe en la caja de texto del modal de fin de partida; ese nombre se recuerda en `localStorage` y reaparece rellenado la siguiente vez (basta pulsar guardar). La información va a la base de datos.
11. Mientras no haya puntuaciones se muestra "Sé el primero en entrar al salón de la fama", sin datos falsos.
12. Solo se muestran los juegos jugables reales (el Salón de la Fama deja de tener pestañas de placeholders).

**Nombres de rutas.** El usuario habló de `/games`, `/games/[id]` y `/hall-of-fame`; en el proyecto son `/biblioteca`, `/juegos/[id]` y `/salon-de-la-fama`. Este spec usa los nombres reales.

**Numeración.** `CLAUDE.md` reservaba el 11 y el 12 para mando y controles táctiles (borradores que no existen como archivo). Este spec toma el 11; esos dos se renumeran al actualizar `CLAUDE.md`.

---

## Alcance

**Dentro:**

- **Tabla `games`** en Supabase (solo lectura para la aplicación) con una fila: `asteroides`.
- **Tabla `scores`** en Supabase, con `game_id` ligado a `games.id` y `user_id` opcional (nulo siempre en este spec).
- **Seguridad (RLS) activada en ambas:** lectura pública de las dos; inserción pública solo en `scores`, validada por restricciones de la base de datos; ninguna política de actualización ni borrado; ninguna política de escritura en `games`.
- **Migración SQL** versionada en `supabase/migrations/` y aplicada al proyecto con el MCP de Supabase.
- **Tipos generados** (`lib/supabase/database.types.ts`) y clientes tipados (`lib/supabase/client.ts` y `server.ts` pasan a usar `Database`).
- **Capa de acceso a datos** en `lib/games.ts` y `lib/scores.ts` (consultas a Supabase; se borran los datos locales de juegos y el generador de puntuaciones falsas).
- **Biblioteca (`/biblioteca`):** las tarjetas salen de `games`; la mejor puntuación de cada tarjeta sale de `scores` ("—" si no hay).
- **Detalle (`/juegos/[id]`):** los datos del juego salen de `games` y el top 10 de `scores` de ese juego; estado vacío con el mensaje de la respuesta 11.
- **Salón de la Fama (`/salon-de-la-fama`):** pestaña **GLOBAL** (top 10 de todas las puntuaciones de todos los juegos, con columna del juego) más una pestaña por cada juego de `games`; estado vacío en cada una.
- **Jugar (`/juegos/[id]/jugar`):** el juego sale de `games`; el modal de fin de partida de Asteroides pide el nombre (caja de texto, recordado en `localStorage`) y guarda la fila real en `scores`, con estados de guardando, guardado y error.
- **`proxy.ts`:** el 404 real para ids desconocidos deja de depender de `GAMES` local y comprueba contra `games` (ver "Decisiones").
- **Landing (`/`):** la sección "JUEGOS DISPONIBLES AHORA" lee de `games`; la actividad y los "top jugadores" de la landing siguen siendo datos de ejemplo, pero sin depender de `GAMES` (ver "Modelo de datos").
- Actualizar `CLAUDE.md` (arquitectura, rutas, numeración de specs).

**Fuera de alcance (para specs futuros):**

- Autenticación real con Supabase Auth: `user_id` queda en la base de datos pero siempre es nulo; `useSession`, `/acceso` y `lib/api.ts` (`login`, `register`) no cambian.
- Editar juegos desde la aplicación o un panel de administración (la tabla es de solo lectura, respuesta 8).
- Los otros cinco juegos (Arkanoid, Tetris, Snake, Pac-Man, Space Invaders): desaparecen de la aplicación y no se crean filas para ellos hasta que cada uno tenga su spec.
- Anti-trampas: la base valida el formato y el rango de una puntuación, pero no puede demostrar que se jugó de verdad (ver "Riesgos").
- Guardar el modo de juego (ventana o pantalla completa). Las puntuaciones de los dos modos no son comparables (spec 09) y de momento se mezclan.
- Ranking por jugador (mejor puntuación de cada persona), filtros por fecha o paginación: el ranking es el top 10 de puntuaciones individuales.
- Tiempo real (suscripciones de Supabase): los rankings se leen al cargar la página.
- Reemplazar los datos de ejemplo de la landing (`STATS`, `ACTIVITY`, `TOP_PLAYERS`) por datos reales.
- Gestión de datos de prueba en producción, copias de seguridad y despliegue.
- Tests automatizados.

---

## Modelo de datos

### Base de datos (Supabase, esquema `public`)

```sql
-- supabase/migrations/<timestamp>_games_y_scores.sql (resumen; el SQL completo se escribe en el paso 1)

create table public.games (
  id text primary key,                -- "asteroides": el mismo id que usa lib/arcade/index.ts y la URL
  title text not null,                -- "ASTEROIDES"
  category text not null check (category in ('ARCADE','PUZLE','DISPAROS','LABERINTO')),
  description text not null,
  long_description text not null,
  controls text not null,
  created_at timestamptz not null default now()
);

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  game_id text not null references public.games (id),
  player_name text not null check (char_length(player_name) between 1 and 14),
  score integer not null check (score >= 0 and score <= 99999999),
  user_id uuid references auth.users (id) on delete set null,  -- opcional; nulo en este spec
  created_at timestamptz not null default now()
);

create index scores_game_score_idx on public.scores (game_id, score desc, created_at);
create index scores_score_idx on public.scores (score desc, created_at);

alter table public.games  enable row level security;
alter table public.scores enable row level security;

-- games: solo lectura pública. scores: lectura pública e inserción pública validada.
create policy "games_select" on public.games  for select to anon, authenticated using (true);
create policy "scores_select" on public.scores for select to anon, authenticated using (true);
create policy "scores_insert" on public.scores for insert to anon, authenticated
  with check (user_id is null);   -- este spec no acepta user_id desde el navegador
```

Más una fila de `games` con los datos que hoy tiene `asteroides` en `lib/games.ts` (título, categoría `DISPAROS`, descripciones y controles). Los campos `color`, `rgb` y `baseScore` de `lib/games.ts` **no pasan a la base**: `color` y `rgb` no tienen uso visual desde el spec 04 y `baseScore` solo servía para generar puntuaciones falsas.

### Código

```ts
// lib/games.ts — se borran el array GAMES, GameId (unión) y los campos color / rgb / baseScore
export type Category = "ARCADE" | "PUZLE" | "DISPAROS" | "LABERINTO"; // igual que el CHECK de la base
export type GameId = string;                                           // id de games.id

export interface Game {
  id: GameId;
  title: string;
  category: Category;
  description: string;
  longDescription: string;
  controls: string;
}
export const CATEGORY_FILTERS: readonly ["TODOS", ...Category[]];      // se conserva (constante de interfaz)
export async function getGames(): Promise<Game[]>;                     // select de games, orden por created_at
export async function getGame(id: string): Promise<Game | null>;

// lib/scores.ts — se borran PLAYERS, SEED_REFERENCE_DATE y el generador
export interface ScoreEntry {
  id: string;
  name: string;      // player_name
  score: number;
  date: string;      // created_at (ISO 8601)
  gameId: GameId;
  gameTitle: string; // para la columna "JUEGO" del ranking global
}
export async function getTopScores(gameId: GameId | null, limit?: number): Promise<ScoreEntry[]>; // null = global; limit 10 por defecto
export async function getBestScore(gameId: GameId): Promise<number | null>;
export function formatScore(n: number): string;   // se conserva
export function formatDate(iso: string): string;  // se conserva
export const MEDALS;                              // se conserva

// lib/api.ts
export async function submitScore(gameId: GameId, name: string, score: number): Promise<void>;
// inserta en scores con el cliente de navegador; lanza un Error si Supabase responde con error.
// Se quita el parámetro `authed`: user_id siempre es nulo.

// lib/player-name.ts (nuevo)
export const PLAYER_NAME_KEY = "av_player_name"; // localStorage; distinta de av_user
export function readPlayerName(): string | null;  // null si no hay valor o localStorage no existe
export function savePlayerName(name: string): void; // ignora errores (modo privado)
```

Convenciones:

- Los rankings ordenan por `score` descendente y, en empate, por `created_at` ascendente (gana quien llegó antes).
- Las consultas usan `lib/supabase/server.ts` desde Server Components (dentro de `<Suspense>`, por `cacheComponents`) y `lib/supabase/client.ts` solo para guardar.
- Los nombres de jugador se guardan en mayúsculas y recortados a 14 caracteres, igual que los nombres de la sesión simulada (`components/session-provider.tsx`).
- **Datos de ejemplo de la landing:** `ActivityEntry.gameId` (en `lib/home.ts`) pasa a ser `game: string` con el título escrito dentro del dato, y `ActivityTicker` deja de leer `GAMES`. El aspecto no cambia.
- El código de cada juego sigue en el repositorio (`lib/arcade/`). `ARCADE_GAMES` sigue siendo lo que decide si un id de `games` tiene motor: si no lo tiene, la cabina muestra el placeholder y **no se guarda nada** (el fin de partida simulado, que ya no usa `baseScore`, no escribe en `scores`).
- Las portadas siguen dibujadas por `components/game-cover.tsx` (por id); se borran las portadas de los cinco juegos que salen de la aplicación y un id sin portada pinta un fondo neutro de la paleta.

---

## Plan de implementación

1. **Base de datos.** Escribir la migración SQL de `games` y `scores` (tablas, restricciones, índices, RLS, fila de `asteroides`) en `supabase/migrations/`, aplicarla con el MCP de Supabase y comprobar con `get_advisors` (seguridad) y `execute_sql` que: anon lee `games` y `scores`, anon inserta una fila válida en `scores`, anon no puede actualizar ni borrar, anon no puede escribir en `games` y una inserción con puntuación negativa, nombre vacío, `game_id` inexistente o `user_id` no nulo falla. Borrar las filas de prueba. Sin cambios en el código.
2. **Tipos y capa de datos.** Generar `lib/supabase/database.types.ts` con el MCP, tipar los dos clientes con `Database` y reescribir `lib/games.ts` (`getGames`, `getGame`, tipos) y `lib/scores.ts` (`getTopScores`, `getBestScore`, formatos) sobre Supabase. Quitar los datos locales y adaptar las páginas y componentes que los importaban para compilar (`app/(site)/page.tsx`, `app/(site)/biblioteca/page.tsx`, `app/(site)/juegos/[id]/page.tsx`, `app/juegos/[id]/jugar/page.tsx`, `components/hall-of-fame.tsx`, `components/home/activity-ticker.tsx`, `lib/home.ts`, `proxy.ts`, `lib/arcade/index.ts`, `components/game-cover.tsx`). Pasa `npx tsc --noEmit` y `npm run lint`.
3. **Biblioteca, detalle y landing con datos reales.** Páginas que cargan de Supabase dentro de `<Suspense>` con un estado de carga, estado de error ("No se pudo cargar…", sin datos falsos) y estado vacío del ranking: "Sé el primero en entrar al salón de la fama". `proxy.ts` comprueba el id contra `games` con una caché breve en memoria. Manual: la biblioteca y la landing muestran solo Asteroides; `/juegos/tetris` responde 404 real.
4. **Salón de la Fama.** Pestaña GLOBAL (con columna del juego) y una pestaña por juego, con los mismos estados vacío y de error. `components/hall-of-fame.tsx` recibe los datos ya cargados (global y por juego) desde la página y solo gestiona las pestañas. Manual: con una fila insertada a mano en la base aparece en GLOBAL y en la pestaña de Asteroides.
5. **Guardado de la puntuación.** `lib/player-name.ts`; `submitScore` real en `lib/api.ts`; el modal de fin de partida (`components/play-screen.tsx`) gana la caja de texto del nombre (rellenada con `av_player_name`; si no existe, con el nombre de la sesión simulada; si tampoco, vacía), el botón "GUARDAR PUNTUACIÓN" se desactiva con el nombre vacío, y los estados de guardando, guardado y error con "REINTENTAR" que conserva el nombre. Al guardar con éxito se escribe `av_player_name`. Manual: terminar una partida, guardar y ver la fila en la base y en los dos rankings.
6. **Verificación y documentación.** Recorrer los criterios con Playwright MCP, guardando las evidencias en `.mcp-evidencias/<AAAA-MM-DD_HH-MM-SS>/` (carpeta nueva por ejecución, con su `README.md`); borrar de la base todas las filas de prueba. Actualizar `CLAUDE.md`.

---

## Criterios de aceptación

**Base de datos**

- [x] `list_tables` muestra `games` y `scores` con RLS activada, y existe el archivo de migración en `supabase/migrations/`.
- [x] `games` tiene exactamente una fila, con `id = 'asteroides'`, y el resto de datos coincide con lo que tenía `lib/games.ts`.
- [x] Con la clave pública (anon): `select` en `games` y `scores` funciona; `insert` de una fila válida en `scores` funciona; `update` y `delete` en `scores` y cualquier escritura en `games` fallan.
- [x] Un `insert` con puntuación negativa, puntuación mayor que 99.999.999, nombre vacío, nombre de más de 14 caracteres, `game_id` inexistente o `user_id` no nulo es rechazado.
- [x] `get_advisors` de seguridad no reporta tablas sin RLS ni políticas de escritura abiertas en `games`.

**Datos locales eliminados**

- [x] `git grep` no encuentra `baseScore`, `SEED_REFERENCE_DATE`, `getLeaderboard`, `PLAYERS` ni los ids `arkanoid`, `tetris`, `snake`, `pacman`, `invaders` en `app/`, `components/` y `lib/` (salvo en comentarios).
- [x] Ningún archivo del repositorio contiene una clave de Supabase (solo `.env`).

**Pantallas**

- [x] `/biblioteca` muestra una tarjeta (Asteroides) cuyos datos coinciden con la fila de `games`, y su "mejor puntuación" es "—" si no hay filas en `scores` o el máximo de `scores` si las hay.
- [x] `/juegos/asteroides` muestra el juego de `games` y un top 10 que coincide con `select … order by score desc, created_at asc limit 10`; con `scores` vacía muestra "Sé el primero en entrar al salón de la fama" y ninguna fila.
- [x] `/salon-de-la-fama` tiene solo las pestañas GLOBAL y ASTEROIDES; con `scores` vacía las dos muestran el mensaje de estado vacío; con filas muestran el top 10 ordenado, y GLOBAL incluye la columna del juego.
- [x] Las filas del top 3 siguen marcadas en negro (sin colores de medalla) y el resto en `crt-line`.
- [x] `/` muestra en "JUEGOS DISPONIBLES AHORA" solo Asteroides, y "ÚLTIMAS PUNTUACIONES" y "TOP JUGADORES · HOY" se ven igual que antes.
- [x] `/juegos/tetris`, `/juegos/tetris/jugar` y un id inventado responden **404** real (código HTTP), y `/juegos/asteroides` y `/juegos/asteroides/jugar` responden 200.
- [x] Si Supabase no responde (variables vacías), las pantallas muestran un mensaje de error y no datos falsos, y `npm run build` no falla.

**Guardar la puntuación**

- [x] Al terminar una partida de Asteroides el modal muestra la puntuación final y una caja de texto para el nombre; con el nombre vacío el botón "GUARDAR PUNTUACIÓN" está desactivado.
- [x] Al guardar con el nombre "Usuario-test", se crea en `scores` una fila con `game_id = 'asteroides'`, `player_name = 'USUARIO-TEST'` (el nombre se guarda en mayúsculas), la puntuación final exacta del modal, `user_id` nulo y `created_at` actual, y el modal muestra el mensaje de guardado.
- [x] `localStorage["av_player_name"]` vale "USUARIO-TEST" tras guardar; en la siguiente partida la caja aparece rellenada con "USUARIO-TEST" y basta pulsar guardar.
- [x] Sin `av_player_name` y con la sesión simulada iniciada, la caja aparece rellenada con el nombre de la sesión.
- [x] Una partida no guardada no escribe nada en la base (cerrar el modal o "JUGAR DE NUEVO" sin pulsar guardar).
- [x] Si el guardado falla (por ejemplo sin red), el modal muestra un error con "REINTENTAR", conserva el nombre y no escribe `av_player_name`; al reintentar con red se guarda una sola fila (sin duplicados).
- [x] Pulsar guardar dos veces seguidas no crea dos filas.
- [x] La fila guardada aparece, al recargar, en el top 10 del detalle, en GLOBAL y en la pestaña de Asteroides del Salón de la Fama, y como "mejor puntuación" de la tarjeta si es la mayor.
- [x] Sin `localStorage` disponible (modo privado) el guardado funciona igual y el nombre simplemente no se recuerda.

**Calidad**

- [x] La consola no tiene errores en `/`, `/biblioteca`, `/juegos/asteroides`, `/juegos/asteroides/jugar` y `/salon-de-la-fama`.
- [x] `git grep` no encuentra los colores neón prohibidos en los archivos nuevos y `npx tsc --noEmit`, `npm run lint` y `npm run build` terminan sin errores.
- [x] En `scores` solo quedan filas con `player_name = 'USUARIO-TEST'` (el usuario de prueba, para distinguir los datos reales de la base de los datos de ejemplo del frontend); ninguna otra fila de prueba.
- [x] `CLAUDE.md` describe las tablas, la capa de datos, el guardado y la nueva numeración de specs.

Notas de la verificación (Playwright MCP; evidencias en `.mcp-evidencias/2026-11-27_02-05-23/`):

- **Verificación manual del usuario (2026-11-27), que cierra los dos criterios que el MCP no podía comprobar:** el usuario jugó y guardó desde un navegador normal. En `scores` quedaron filas con `game_id = 'asteroides'`, `player_name` en mayúsculas (`USUARIO-TEST…`) y `user_id` nulo, y funcionó bien. Esto confirma el recorrido navegador → Supabase (CORS incluido) que el navegador del MCP no podía hacer.
- *(Nota previa, ya resuelta)* Los dos criterios no se podían comprobar de extremo a extremo con el MCP. El navegador del MCP solo permite el origen `localhost:3000`: la petición del navegador a `supabase.co` se bloquea (`ERR_BLOCKED_BY_CLIENT`) y no se rodeó esa restricción. Falta una comprobación manual: jugar una partida en un navegador normal, guardar con el nombre "Usuario-test" y ver la fila en `scores` y en los tres rankings.
- Lo que sí se comprobó, por partes: (1) la interfaz del guardado con la respuesta de Supabase simulada con `page.route` (la petición enviada es `{ game_id: "asteroides", player_name: "USUARIO-TEST", score: <la del modal> }`, sin `user_id`, y el doble clic o Enter envían una sola; se probaron 6.390, 12.600 y 1.460 puntos); (2) la inserción real con `supabase-js` y la clave pública desde Node, y la política de la base con `execute_sql` bajo el rol `anon`; (3) las pantallas con filas reales (orden, empate, límite de 10 y mejor puntuación de la tarjeta) y con la tabla vacía.
- El error de guardado se probó abortando la petición (`page.route` con `abort`): aparece el aviso, se conserva el nombre y `av_player_name` queda sin escribir. El reintento "con red" se probó con la respuesta simulada.
- Con `NEXT_PUBLIC_SUPABASE_URL` y la clave vacías el build pasa y las pantallas muestran "NO SE PUDO CARGAR". En ese caso `/juegos/tetris` responde 200 con el aviso y no 404 (el proxy deja pasar la petición si no puede consultar `games`).
- Las partidas de prueba se jugaron con la nave quieta o disparando mientras gira (de 57 a 86 s hasta perder las tres vidas).
- `git grep` encuentra `PLAYERS` solo en `TOP_PLAYERS` (datos de ejemplo de la landing, fuera de alcance) y `baseScore` solo en un comentario.
- `get_advisors` (seguridad) solo avisa de la función `public.rls_auto_enable()` (`SECURITY DEFINER` ejecutable por `anon` y `authenticated`), que **ya existía en el proyecto** y no es de este spec: no se tocó.
- **Estado de la base al terminar:** `games` con `asteroides` y `scores` con tres filas de `USUARIO-TEST` (12.600, 6.390 y 1.460: las puntuaciones reales de tres partidas de prueba), a petición del usuario para distinguir lo real de lo dummy.

---

## Decisiones tomadas y descartadas

- **Sí:** un solo spec para leaderboard y tabla de juegos. *(Respuesta del usuario; contra la recomendación de dividir, que era mía.)* Se mitiga con un plan en seis pasos, cada uno funcional. Si el paso 3 o 4 crece demasiado, se parte en otro spec.
- **Sí:** leaderboard con las dos vistas, global y por juego. *(Respuesta del usuario.)* El global ya existía como Salón de la Fama y el de cada juego como el top 10 de su página.
- **Sí:** tabla `games` de solo lectura, con Asteroides como única fila. *(Respuestas del usuario.)* **No:** edición de juegos desde la aplicación ni panel de administración.
- **Sí:** modelo híbrido: metadatos en la base, código del juego y portada en el repositorio. *(Respuesta del usuario: borrar los datos locales y cargar los juegos desde Supabase.)* Un juego solo es jugable si su fila existe en `games` **y** su id está en `ARCADE_GAMES`.
- **Sí:** los cinco juegos placeholder salen de la aplicación (biblioteca, landing, Salón de la Fama, rutas). *(Respuestas 9 y 12.)* **No:** conservarlos como filas "inactivas".
- **Sí:** `scores` con `id`, `game_id`, `player_name`, `score`, `created_at` y `user_id` nulo y opcional. *(Respuesta del usuario: no se exige autenticación para jugar.)* El `user_id` queda como preparación del spec de autenticación; la política de inserción lo obliga a ser nulo hasta entonces. *(Decisión mía.)*
- **Sí:** estado vacío con el mensaje "Sé el primero en entrar al salón de la fama", sin datos de ejemplo. *(Respuesta 11.)*
- **No:** los `seededScores` como respaldo si no hay datos.
- **Sí:** el nombre es el texto de la caja del modal, se recuerda en `localStorage` y se rellena la siguiente vez. *(Respuesta 10.)* **No:** guardar automáticamente al terminar la partida.
- **Sí:** la clave de `localStorage` es `av_player_name`, separada de `av_user`. *(Decisión mía.)* El nombre recordado es del dispositivo y no debe mezclarse con la sesión simulada, que desaparecerá con la autenticación real.
- **Sí:** el orden de preferencia para rellenar el nombre es `av_player_name`, luego el nombre de la sesión simulada y luego vacío. *(Decisión mía.)* **No:** el "INVITADO" actual como nombre por defecto: se guardaría un nombre que nadie escribió.
- **Sí:** el nombre se guarda en mayúsculas y con máximo 14 caracteres. *(Decisión mía.)* Es la regla de los nombres de la sesión simulada y encaja en las filas del ranking.
- **Sí:** el guardado se hace desde el navegador con la clave pública y una política de inserción en `scores`, validada por restricciones (`CHECK`). *(Decisión mía.)* Es lo más simple y no necesita `SUPABASE_SERVICE_ROLE_KEY`, que el spec 06 dejó fuera. **No:** una ruta `POST /api/scores` con clave de servicio: añadiría una clave privilegiada y un servidor intermedio que, sin autenticación, tampoco puede demostrar que la puntuación es legítima. Si hay trampas, otro spec (por ejemplo, con firma de la partida) lo endurecerá.
- **Sí:** el ranking global es el top 10 de puntuaciones individuales de todos los juegos, con la columna del juego. *(Decisión mía.)* Con un solo juego equivale al de Asteroides; cuando haya un segundo juego, el spec de ese juego decidirá si se normalizan (hoy no son comparables entre juegos).
- **No:** ranking por jugador (mejor puntuación de cada nombre): sin autenticación un nombre no identifica a nadie.
- **Sí:** las puntuaciones de ventana y de pantalla completa se mezclan y no se guarda el modo. *(Decisión mía; el spec 09 pidió decidirlo.)* Guardarlo añade una columna y una pestaña más; se hace en otro spec si el usuario lo pide.
- **Sí:** los rankings se leen al cargar la página (dinámico, dentro de `<Suspense>`), sin caché. *(Decisión mía.)* Una puntuación nueva debe verse al recargar y el guardado viene del navegador, que no puede invalidar una caché de servidor. **No:** `use cache` ni suscripciones en tiempo real.
- **Sí:** `proxy.ts` consulta los ids de `games` con una caché en memoria de 60 s y, si la consulta falla, deja pasar la petición (la página llama a `notFound()` como segunda guarda). *(Decisión mía.)* Mantiene el 404 real sin dejar una lista local de ids. **No:** conservar una lista de ids en el código.
- **Sí:** `color`, `rgb` y `baseScore` no pasan a la base. *(Decisión mía.)* Eran neón sin uso o semilla de datos falsos.
- **Sí:** guardar el SQL en `supabase/migrations/` además de aplicarlo con el MCP. *(Decisión mía.)* El repositorio queda como fuente de verdad del esquema.
- **Sí:** tipos generados con el MCP y clientes tipados. *(Decisión mía; el spec 06 los dejó para "una spec futura".)*
- **Sí:** la landing deja de depender de `GAMES` pero conserva sus datos de ejemplo. *(Decisión mía.)* Cambiarlos por datos reales es otro spec; "12+ JUEGOS" y las filas de actividad siguen siendo de ejemplo, y eso queda dicho en `CLAUDE.md`.

- **Sí, al implementar:** las consultas están en `lib/games-data.ts` y `lib/scores-data.ts`, no dentro de `lib/games.ts` y `lib/scores.ts`. *(Decisión mía.)* Los componentes de cliente importan los tipos y los formatos, y las consultas usan `next/headers` (por el cliente de servidor): en el mismo archivo el build de cliente fallaría. Los nombres de funciones son los del spec.
- **Sí, al implementar:** cada `catch` que envuelve una lectura empieza con `unstable_rethrow(error)`. *(Decisión mía.)* Sin eso el `catch` se traga el rechazo con el que Next interrumpe `cookies()` durante el prerender y registra un falso error en el build.
- **Sí, al implementar:** `EmptyRanking` y `LoadError` ganan una variante `bare` (sin marco). *(Decisión mía, por una captura.)* Dentro del panel del detalle quedaba una caja dentro de otra.
- **Sí, al implementar:** en la pestaña GLOBAL no se muestra el bloque "TU MEJOR MARCA" (solo en las pestañas de juego). *(Decisión mía.)* Su texto "AÚN SIN MARCA EN ESTE JUEGO" no tiene sentido sin un juego; el bloque sigue siendo un texto fijo del MVP.
- **Sí, al implementar:** las teclas `P` y `F` ignoran las pulsaciones cuyo destino es un `<input>`. *(Decisión mía.)* Sin eso, escribir el nombre pausaba o ponía pantalla completa.
- **Sí, al implementar:** el usuario de prueba de la base se llama **"Usuario-test"** (se guarda `USUARIO-TEST`) y es lo único que queda en `scores` tras las pruebas. *(Petición del usuario.)* Permite distinguir los datos reales de la base de los datos de ejemplo del frontend cuando se integre con el resto de usuarios.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Cualquiera puede insertar una puntuación inventada con la clave pública (sin autenticación y sin anti-trampas). | Aceptado en este spec. Las `CHECK` limitan el formato y el rango y no hay `update` ni `delete`. Queda anotado para el spec de autenticación o de validación de partidas. Mientras tanto se pueden borrar filas desde el panel de Supabase. |
| Abuso por volumen (llenar `scores` de filas). | Aceptado ahora; se vigila con los avisos de Supabase. Un límite por IP o por usuario exige servidor y va en otro spec. |
| Un nombre ofensivo o con HTML. | React escapa el texto al pintarlo; no hay filtro de contenido (fuera de alcance). El `CHECK` limita la longitud. |
| `cacheComponents`: leer Supabase con `cookies()` fuera de `<Suspense>` rompe el build. | Todas las lecturas van dentro de `<Suspense>`; el criterio "`npm run build` termina sin errores" lo comprueba. |
| `proxy.ts` consulta la base en cada petición a una ruta de juego y se vuelve lento o falla. | Caché en memoria de 60 s, tiempo máximo corto en la consulta y, si falla, se deja pasar. |
| Las variables de Supabase vacías en el build o en un entorno. | Las pantallas muestran un error legible (sin datos falsos) y el build no necesita las variables (spec 06). |
| El usuario cierra el modal sin guardar y pierde la puntuación. | Aceptado: el botón de guardar y el recuerdo del nombre hacen el guardado de un solo clic; guardar sin pulsar nada no está en este spec. |
| Doble envío (doble clic o reintento tras un error con respuesta perdida). | El botón se desactiva mientras guarda; en el reintento tras un error de red puede haber una fila duplicada si la primera sí llegó. Se acepta (no hay clave única de partida) y se anota. |
| Las puntuaciones de ventana y pantalla completa se mezclan, y la de pantalla completa tiende a ser más alta. | Aceptado y documentado (spec 09); ver "Fuera de alcance". |
| Borrar las portadas de los cinco juegos retirados puede romper la vista de un id sin portada. | Un id sin portada pinta un fondo neutro; el paso 2 lo comprueba con el compilador y el 3 con la pantalla. |
| La migración se aplica a un proyecto real y compartido. | Antes de aplicarla se listan las tablas existentes (hoy vacío) y el SQL se revisa en el diff del paso 1. Se borran las filas de prueba al terminar. |

---

## Lo que **no** está en este spec

- Autenticación real y uso de `user_id`.
- Edición de juegos o panel de administración.
- Los otros cinco juegos y sus filas.
- Anti-trampas, límites de volumen y filtro de nombres.
- Guardar el modo de juego (ventana o pantalla completa).
- Ranking por jugador, filtros por fecha, paginación y tiempo real.
- Datos reales en `STATS`, `ACTIVITY` y `TOP_PLAYERS` de la landing.
- Tests automatizados y despliegue.

Cada uno de esos puntos, si se hace, va en su propio spec.
