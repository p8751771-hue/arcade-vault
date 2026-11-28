# Plantilla del spec de un juego (`/add-game`)

Es la forma del spec que escribe `/add-game`. **No se copia literal.** Cada `<…>` se sustituye por lo que se decidió en las preguntas. Las líneas que empiezan por `>>` son instrucciones para quien escribe y no van al spec. Las secciones siguen `.agents/skills/spec/template.md`, las reglas de escritura de `.agents/skills/spec/SKILL.md` (léelos antes de usar esta plantilla) y los encabezados en español de los specs del repo.

---

````markdown
# SPEC NN — Juego jugable: <Título en minúsculas con mayúscula inicial>

> **Estado:** Borrador
> **Depende de:** SPEC 07, SPEC 11<, SPEC 09 si usa resize>
> **Fecha:** <fecha del contexto de la sesión>
> **Objetivo:** Añadir el juego `<id>` (<TÍTULO>) a Arcade Vault, <portado de `<fuente>` | diseñado desde una descripción>, jugable en `/juegos/<id>/jugar` con el aspecto de la pantalla de Asteroides, con su fila en la tabla `games` y su puntuación guardada en `scores` y visible en los rankings.

---

## Por qué existe este spec

>> 1–3 párrafos: de dónde sale el juego (ruta exacta de la fuente o resumen de la descripción).
>> Qué se porta (reglas) y qué no (el dibujo neón). Que el patrón es el de los specs 07 y 11
>> y que un juego es jugable con fila en `games` + entrada en `ARCADE_GAMES`.

**Solo se toma la lógica de la fuente, no su aspecto.** <…>

**Contrato técnico.** La implementación sigue `.claude/skills/add-game/guia-integracion.md` (motor, portada, migración, paleta y verificación).

---

## Alcance

**Dentro:**

- `lib/arcade/<id>.ts`: `GameFactory` con las reglas de "Reglas que se conservan" y el dibujo de "Aspecto", incluido su HUD dentro del canvas.
- `lib/arcade/index.ts`: añadir `<id>` a `ARCADE_GAMES`.
- `components/game-cover.tsx`: rama `id === "<id>"` con la portada de 96×56.
- `supabase/migrations/<AAAAMMDDhhmmss>_juego_<id>.sql`: la fila de `games`, aplicada con el MCP de Supabase.
>> - Una línea por cada extensión genérica del motor o la cabina (fase 4), si las hay.
- Actualizar `CLAUDE.md`.

**Fuera de alcance (para specs futuros):**

- Controles táctiles o de móvil (la botonera sigue sin conectar).
- Mando (Gamepad API) y modo televisor con Raspberry Pi.
- Sonido, música y vibración.
- Un componente genérico `CanvasGame`.
- Cambios en la cabina, el HUD de React, el modal de fin, las páginas, el header o los estilos.
- Cambios en el esquema de `scores` o en sus políticas; anti-trampas; guardar el modo ventana / pantalla completa.
- Normalizar puntuaciones entre juegos en el ranking GLOBAL.
- Mecánicas que no están en la fuente <o en la descripción acordada>.
- Tests automatizados.
>> + lo que la persona haya dejado para después.

---

## Modelo de datos

### Base de datos

No cambia el esquema. Una fila nueva en `games`:

```sql
insert into public.games (id, title, category, description, long_description, controls)
values ('<id>', '<TÍTULO>', '<CATEGORÍA>', '<description>', '<long_description>', '<controls>');
```

>> Si hay categoría nueva: el cambio del CHECK, `Category` y `CATEGORY_FILTERS`, y la regeneración de tipos.

### Código

```ts
// lib/arcade/<id>.ts — estado interno (solo en memoria durante la partida)
interface <Entidad> { <…> }
export const <id>: GameFactory;

// lib/arcade/index.ts
export const ARCADE_GAMES = { asteroides, <id> };
```

>> Si hay huecos del motor: las firmas nuevas (p. ej. `pressed: readonly KeyCode[]`, `destroy?(): void`,
>> `lives(value: number | null)`) con un comentario de por qué son opcionales.

### Reglas que se conservan <de la fuente | acordadas>

>> Lista con números concretos: tamaño del tablero o campo, velocidades, aceleraciones,
>> cuándo se gana cada punto y cuántos, vidas iniciales, cómo se pierde una, qué sube el nivel
>> y qué cambia con él, cuándo termina la partida (`g.end(score)`), invulnerabilidades, límites.

### Aspecto (paleta `crt-*`, spec 04)

| Elemento | Dibujo |
| --- | --- |
| Fondo del lienzo | `#6e8677` (`crt-well`) |
| <figura del jugador> | <contorno / relleno> `#000000`, trazo <n> px |
| <…> | <…> |
| HUD del canvas: puntuación | arriba a la izquierda (12, 22), `#000000`, Press Start 2P 12 px, separador `de-DE` |
| HUD del canvas: nivel | arriba a la derecha, `NIVEL n` |
| HUD del canvas: vidas | <iconos bajo la puntuación | no aplica> |
| Portada 96×56 | <escena>, con los cuatro tonos de `game-cover.tsx` |

Sin `shadowBlur`, sin `shadowColor` y sin los colores neón prohibidos por `CLAUDE.md`.

### Controles

| Entrada | Acción |
| --- | --- |
| <teclas> | <acción> |
| `P` o botón PAUSA | pausar / reanudar (de la aplicación) |
| `F` | pantalla completa (de la aplicación) |

---

## Plan de implementación

>> Paso 0 solo si hay huecos: "**Extensión del motor.** <cambio genérico> en `lib/arcade/engine.ts`
>> <y `components/play-screen.tsx`>, sin nombrar ningún juego. Asteroides funciona igual. Pasa tsc y lint."

1. **Lógica del juego.** Crear `lib/arcade/<id>.ts` con las reglas (`update`), los avisos `score` / `lives` / `level` / `end` y un dibujo mínimo con la paleta. Añadir `<id>` a `ARCADE_GAMES`. Pasa `npx tsc --noEmit` y `npm run lint`. Sin cambios visibles (todavía no hay fila en `games`).
2. **Aspecto y HUD del canvas.** Completar `draw()` según la tabla de "Aspecto", con el HUD propio dentro del canvas. Pasa tsc y lint.
3. **Portada.** Rama `id === "<id>"` en `components/game-cover.tsx`. Pasa tsc y lint.
4. **Fila en `games`.** Escribir `supabase/migrations/<AAAAMMDDhhmmss>_juego_<id>.sql`, comprobar que el id no existe, aplicarla con el MCP (`apply_migration`) y comprobar la fila con `execute_sql` y `get_advisors`. Manual: la tarjeta aparece en `/biblioteca`, `/juegos/<id>/jugar` se juega y el Salón de la Fama tiene la pestaña <TÍTULO>.
5. **Verificación y documentación.** Recorrer los criterios con Playwright MCP (1280×900 y 390×844), con evidencias en `.mcp-evidencias/<AAAA-MM-DD_HH-MM-SS>/`, y con filas de prueba solo como `USUARIO-TEST`. Actualizar `CLAUDE.md`. `npm run build` sin errores.

---

## Criterios de aceptación

**Integración**

- [ ] Existe `lib/arcade/<id>.ts` y `ARCADE_GAMES` contiene `asteroides` y `<id>`.
- [ ] Aislamiento: `git grep -n "<id>" -- lib/arcade/engine.ts components/play-screen.tsx` no devuelve nada, y `lib/arcade/<id>.ts` no importa ningún otro juego.
- [ ] `games` tiene una fila con `id = '<id>'` cuyos datos coinciden con este spec, y existe el archivo de migración.
- [ ] `/juegos/<id>` y `/juegos/<id>/jugar` responden 200.
- [ ] `/biblioteca` muestra la tarjeta <TÍTULO> con su portada, su categoría y "—" como mejor puntuación si no hay filas en `scores` para el juego.

**Juego**

- [ ] Tras "CARGANDO...", la pantalla de la cabina muestra <estado inicial concreto>.
- [ ] El HUD empieza en PUNTUACIÓN 0, VIDAS <n | —> y NIVEL 1.
>> Un criterio booleano por regla importante: controles, puntos de cada acción, pérdida de vida, subida de nivel, fin.
- [ ] Dentro del canvas se ve el HUD del juego y fuera el de React, y los dos muestran los mismos valores en todo momento.
- [ ] Al terminar la partida, el juego avisa (`over`) y el modal "FIN DEL JUEGO" muestra la puntuación que mostraba el HUD.
- [ ] "JUGAR DE NUEVO" empieza con 0 puntos, <n> vidas y nivel 1, sin duplicar el bucle (la velocidad no cambia tras reiniciar).
- [ ] PAUSA y la tecla P congelan el juego y REANUDAR continúa desde el mismo punto. En pausa, las teclas del juego no actúan.
- [ ] Con el modal de fin abierto, `Enter` y `Espacio` activan el botón enfocado.
- [ ] "SALIR" y "VOLVER AL VAULT" dejan la ruta sin errores en la consola y sin listeners colgados: al volver a entrar, una pulsación actúa una sola vez.

**Aspecto**

- [ ] En el lienzo solo se usan `#6e8677`, `#000000` y `#2f3b34`, y `git grep` no encuentra `shadowBlur`, `shadowColor` ni colores neón en `lib/arcade/`.
- [ ] <Los tipos de figura se distinguen por …>.
- [ ] La cabina, el HUD de React, el modal y las páginas se ven igual que antes de este spec.

**Leaderboard**

- [ ] El Salón de la Fama tiene las pestañas GLOBAL, ASTEROIDES y <TÍTULO>; la nueva muestra "SÉ EL PRIMERO EN ENTRAR AL SALÓN DE LA FAMA" sin filas.
- [ ] Al guardar con el nombre "Usuario-test", se crea en `scores` una fila con `game_id = '<id>'`, `player_name = 'USUARIO-TEST'`, la puntuación exacta del modal y `user_id` nulo.
- [ ] Esa fila aparece al recargar en el top 10 de `/juegos/<id>`, en GLOBAL y en la pestaña <TÍTULO>, y como mejor puntuación de la tarjeta.

**Calidad**

- [ ] Asteroides funciona igual: HUD 0 / 3 / 1, pausa, fin de partida y guardado.
- [ ] En `scores` solo quedan filas de prueba con `player_name = 'USUARIO-TEST'`.
- [ ] `npx tsc --noEmit`, `npm run lint` y `npm run build` terminan sin errores.
- [ ] `CLAUDE.md` describe el juego nuevo<, la extensión del motor> y el número de spec.

---

## Decisiones tomadas y descartadas

>> Primero las respuestas de la persona, marcadas "(Respuesta del usuario.)". Después las decisiones
>> propias, marcadas "(Decisión mía.)". Al final, las heredadas:

- **Sí:** solo la lógica de la fuente; el dibujo usa la paleta CRT de Asteroides. *(Heredado del spec 07.)*
- **Sí:** título y aspecto propios, sin el nombre, los personajes ni el arte de un juego comercial concreto.
- **Sí:** los dos HUD (el del canvas y el de React), con los mismos valores. *(Spec 07.)*
- **Sí:** la pausa es de la aplicación (PAUSA / P con `setPaused`); el juego no tiene control propio. *(Spec 07.)*
- **Sí:** el juego aislado en su archivo, y solo `lib/arcade/index.ts` lo conoce. *(Spec 07.)*
- **Sí:** una fila en `games` y ningún cambio de esquema; el ranking y el guardado salen solos. *(Spec 11.)*
- **Sí:** la migración se aplica en el último paso de código, porque la base es compartida.
- **Sí:** el ranking GLOBAL mezcla este juego con Asteroides aunque sus escalas de puntos no sean comparables. Normalizarlo es otro spec. *(Spec 11.)*
- **No:** controles táctiles, mando, sonido ni `CanvasGame` en este spec.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| React en desarrollo monta dos veces los efectos y duplica el bucle. | El efecto de `play-screen.tsx` ya devuelve `destroy()`; el criterio de "JUGAR DE NUEVO" lo comprueba. |
| La fila de `games` hace visible el juego en otros entornos antes del merge. | Se aplica en el último paso; un entorno sin el código muestra el placeholder y no guarda nada. |
| Las puntuaciones de este juego dominan (o desaparecen) del ranking GLOBAL por la escala. | Aceptado y documentado; la normalización va en otro spec. |
| En móvil no se puede jugar (botonera sin conectar). | Aceptado; va en el spec de controles táctiles. |
>> + riesgos propios del juego o de la extensión del motor.

---

## Lo que **no** está en este spec

- Controles táctiles, mando, sonido y modo televisor.
- Un componente genérico `CanvasGame`.
- Cambios en la cabina, las páginas, el header o los estilos.
- Cambios de esquema en `scores`, anti-trampas y normalización del ranking GLOBAL.
- Mecánicas nuevas que no estén en la fuente.
- Tests automatizados.

Cada uno de esos puntos, si se hace, va en su propio spec.
````
