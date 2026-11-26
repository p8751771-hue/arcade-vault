# SPEC 06 — Conexión del proyecto a Supabase

> **Estado:** Aprobado
> **Depende de:** SPEC 03
> **Fecha:** 2026-11-26
> **Objetivo:** Conectar la aplicación Next.js a un proyecto de Supabase ya existente instalando `@supabase/supabase-js` y `@supabase/ssr`, definiendo las variables de entorno públicas y creando un cliente para el navegador (`lib/supabase/client.ts`) y otro para el servidor (`lib/supabase/server.ts`), sin cambiar nada visible.

---

## Por qué existe este spec

Hasta ahora el proyecto no tiene backend: la sesión (`useSession`, `localStorage["av_user"]`) y los stubs de `lib/api.ts` (`login`, `register`, `submitScore`) son simulados, y el ranking sale de un generador determinista (`lib/scores.ts`). El spec 03 añadió el primer código de servidor, pero solo para enviar correo.

Este spec es **solo la base**: deja la conexión lista para que los specs siguientes (autenticación real, puntuaciones reales) no tengan que preocuparse de instalar paquetes, variables ni clientes. Por eso no toca ninguna pantalla, tabla ni ruta existente.

El proyecto de Supabase **ya existe** (el `.mcp.json` del repositorio ya apunta a él), así que no se crea nada en supabase.com durante la implementación.

Las decisiones de este spec salen de las respuestas del curso (proyecto ya creado, dos archivos de cliente, ambos paquetes, las dos variables públicas) y de las del usuario en la sesión (alcance: solo la conexión).

---

## Alcance

**Dentro:**

- Instalar las dependencias `@supabase/supabase-js` y `@supabase/ssr`.
- Dos variables de entorno públicas:
  - `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave pública (`anon`) del proyecto.
- Añadir ambas, **vacías**, a `.env.example` (versionado, junto a `RESEND_API_KEY` y `CONTACT_TO_EMAIL`). Los valores reales los pone el usuario en `.env`, que sigue ignorado por git.
- `lib/supabase/client.ts`: función que crea el cliente de Supabase para el navegador (componentes `"use client"`) con `createBrowserClient` de `@supabase/ssr`.
- `lib/supabase/server.ts`: función asíncrona que crea el cliente de Supabase para el servidor (Server Components y Route Handlers) con `createServerClient` de `@supabase/ssr`, leyendo y escribiendo las cookies con `cookies()` de `next/headers`.
- Error claro si faltan las variables: ambas funciones lanzan un `Error` con el nombre de la variable que falta **al llamarse**, no al importar ni al compilar (mismo criterio que `RESEND_API_KEY` en el spec 03: el build no necesita las variables).
- Verificación puntual de que ambos clientes conectan (paso 5), sin dejar código de diagnóstico en la aplicación.
- Actualizar `CLAUDE.md` (arquitectura, variables de entorno, numeración de specs).

**Fuera de alcance (para specs futuros):**

- Autenticación real con Supabase Auth: reemplazar `useSession`, `login`, `register`, `/acceso`, los botones sociales o el acceso de invitado.
- Refresco de la sesión en `proxy.ts` (el patrón de `@supabase/ssr` para renovar cookies). Se añade con la autenticación; hoy no hay sesión que renovar.
- Tablas, migraciones, políticas RLS o tipos generados (`generate_typescript_types`). No se crea ningún esquema.
- Puntuaciones y ranking reales: `lib/scores.ts` y `submitScore` siguen igual.
- Guardar los mensajes de `/api/contact` en la base de datos.
- `SUPABASE_SERVICE_ROLE_KEY` y cualquier operación con privilegios de servidor.
- Ruta de salud o diagnóstico permanente (`/api/supabase`).
- Tests automatizados (el spec 07 de tests e2e sigue pendiente) y despliegue (configurar las variables en un hosting).

---

## Modelo de datos

Esta funcionalidad no introduce estructuras de datos ni tablas. Solo añade dos funciones de fábrica y dos variables de entorno.

```ts
// lib/supabase/client.ts — para componentes "use client"
export function createClient(): SupabaseClient;

// lib/supabase/server.ts — para Server Components y Route Handlers
export async function createClient(): Promise<SupabaseClient>;
```

```bash
# .env.example (valores vacíos; los reales van en .env)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Convenciones:

- Las dos funciones se llaman `createClient`, como en la guía oficial de Supabase para Next.js; se distinguen por el archivo desde el que se importan (`@/lib/supabase/client` o `@/lib/supabase/server`).
- Las variables se leen escribiendo `process.env.NEXT_PUBLIC_SUPABASE_URL` y `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` literalmente (no con una clave dinámica), porque Next.js solo sustituye en el navegador las referencias literales.
- `lib/supabase/server.ts` solo se importa desde código de servidor; `lib/supabase/client.ts` solo desde componentes de cliente.
- Ningún cliente se guarda en una variable de módulo: se crea uno por llamada (en servidor, uno por petición, porque depende de las cookies de esa petición).

---

## Plan de implementación

1. **Instalar dependencias.** `npm install @supabase/supabase-js @supabase/ssr`. Comprobar que `package.json` y `package-lock.json` los reflejan y que `npm run build` sigue pasando.
2. **Variables de entorno.** Añadir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` vacías a `.env.example`. El usuario copia la URL y la clave `anon` de su proyecto (panel de Supabase → Project Settings → API) a su `.env`. El agente no escribe claves reales en ningún archivo.
3. **Cliente de navegador.** Crear `lib/supabase/client.ts` con `createBrowserClient` y el error claro si falta una variable. Pasa `npx tsc --noEmit` y `npm run lint`.
4. **Cliente de servidor.** Crear `lib/supabase/server.ts` con `createServerClient`, `await cookies()` y los métodos `getAll` / `setAll` de las cookies (con `try/catch` en `setAll`, porque en un Server Component no se pueden escribir cookies) y el mismo error claro. Pasa `npx tsc --noEmit`, `npm run lint` y `npm run build`.
5. **Verificación y documentación.**
   - Con las variables rellenas, comprobar la conexión **sin dejar rastro en el código**: crear un Route Handler temporal que use `createClient()` de `server.ts` y llame a `supabase.auth.getSession()` (no necesita tablas), probarlo con `curl`, comprobar el cliente de navegador desde un componente temporal o desde la consola del navegador y **borrar ambos** antes de cerrar el paso.
   - Comprobar el caso de variables ausentes: con `.env` sin las claves, `next build` pasa y llamar a `createClient()` lanza el error claro.
   - Actualizar `CLAUDE.md` (sección de arquitectura con `lib/supabase/`, variables de entorno, "Next specs" y numeración: los tests e2e del correo pasan a ser el spec 07).

---

## Criterios de aceptación

- [ ] `package.json` contiene `@supabase/supabase-js` y `@supabase/ssr` en `dependencies`, y `package-lock.json` está actualizado.
- [ ] `.env.example` contiene `NEXT_PUBLIC_SUPABASE_URL=` y `NEXT_PUBLIC_SUPABASE_ANON_KEY=` con valor vacío, y `git ls-files .env` no devuelve nada (el `.env` real sigue sin versionarse).
- [ ] Existen `lib/supabase/client.ts` y `lib/supabase/server.ts`, cada uno exportando `createClient`.
- [ ] `lib/supabase/client.ts` usa `createBrowserClient` y `lib/supabase/server.ts` usa `createServerClient` con `cookies()` de `next/headers`.
- [ ] Ningún archivo del repositorio contiene una clave real de Supabase (la URL y la clave solo aparecen en `.env`).
- [ ] Con las variables rellenas, un Route Handler temporal que llama a `createClient()` de `server.ts` y a `supabase.auth.getSession()` responde sin error, y el cliente de navegador hace lo mismo sin error en la consola.
- [ ] Con las variables vacías, `createClient()` lanza un `Error` que nombra la variable que falta, y `npm run build` termina sin errores.
- [ ] Los códigos temporales de verificación están borrados: `git status` solo muestra los archivos de este spec (`package.json`, `package-lock.json`, `.env.example`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `CLAUDE.md`).
- [ ] `npx tsc --noEmit`, `npm run lint` y `npm run build` terminan sin errores.
- [ ] Ninguna pantalla cambia: `/`, `/biblioteca`, `/acceso`, `/acerca-de` y `/historia` se ven y se comportan como antes, y `POST /api/contact` sigue respondiendo igual.
- [ ] `CLAUDE.md` describe `lib/supabase/`, las dos variables y la nueva numeración de specs.

---

## Decisiones tomadas y descartadas

- **Sí:** proyecto de Supabase existente. Ya hay uno creado y conectado al MCP del repositorio; crear otro duplicaría el trabajo. (Respuesta del curso: "a, ya existe".)
- **Sí:** dos archivos de cliente, `lib/supabase/client.ts` y `lib/supabase/server.ts`. Next.js App Router tiene contextos distintos (componentes de cliente frente a Server Components y Route Handlers) y `@supabase/ssr` los trata de forma diferente. (Respuesta del curso: "c".)
- **No:** un único cliente compartido. Obligaría a refactorizar cuando llegue la autenticación con cookies.
- **Sí:** `@supabase/supabase-js` **y** `@supabase/ssr`. El segundo es el paquete oficial para Next.js App Router y deja resuelto el manejo de cookies y sesión para el spec de autenticación. (Respuesta del curso: "ambos".)
- **No:** solo `@supabase/supabase-js`. Sirve para conectar, pero no gestiona cookies de sesión en servidor.
- **Sí:** solo las dos variables públicas (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Basta para conectar y la `anon` es pública por diseño; lo que protege los datos es RLS, que llegará con las tablas. (Respuesta del curso.)
- **No:** `SUPABASE_SERVICE_ROLE_KEY`, ni siquiera como placeholder. El curso la proponía vacía para no editar la plantilla en specs futuros; aquí se descarta porque salta RLS y ninguna spec próxima la necesita todavía. Si un spec la necesita, la añade él.
- **Sí:** el archivo de plantilla es `.env.example`, no `.env.template` (nombre que usa el curso), para seguir la convención ya establecida en el spec 03 y en `.gitignore`.
- **Sí:** el nombre `ANON_KEY` del curso. Supabase ahora llama también "publishable key" a la clave pública nueva; ambas funcionan en estos clientes, y el usuario pone en `NEXT_PUBLIC_SUPABASE_ANON_KEY` la que muestre su panel. Renombrar la variable no aporta nada hoy.
- **Sí:** error claro al llamar, no al importar. Así el build no depende de variables secretas, igual que con Resend.
- **Sí:** verificación puntual con código temporal que se borra. Comprueba la conexión real sin añadir superficie pública ni ampliar el alcance. *(Decisión tomada al escribir el spec: la pregunta de verificación quedó sin responder. Si prefieres una ruta de salud permanente, es un cambio de esta sección.)*
- **No:** ruta permanente `/api/supabase`. Sería un endpoint más que mantener y que cualquiera podría llamar.
- **No:** tocar `proxy.ts`. El refresco de sesión de `@supabase/ssr` solo tiene sentido con autenticación y `proxy.ts` hoy solo valida ids de juegos.
- **No:** tablas, RLS, tipos generados, auth ni puntuaciones. Cada uno va en su propio spec.

---

## Riesgos identificados

| Riesgo                                                                                                                                                                | Mitigación                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cookies()` es dinámico y el proyecto usa `cacheComponents: true`: usar el cliente de servidor fuera de `<Suspense>` en una página puede fallar el build.             | Hoy nadie importa `server.ts`. El spec que lo use lo envolverá en `<Suspense>`; el paso 5 lo prueba en un Route Handler, que no prerenderiza.      |
| Las variables `NEXT_PUBLIC_*` se incrustan en el JavaScript del navegador en el build: si se cambian en `.env` hay que reiniciar `next dev` o recompilar.               | Documentarlo en `CLAUDE.md`.                                                                                                                       |
| `next dev` no recarga bien `.env` o muestra variables antiguas.                                                                                                       | Reiniciar `next dev` tras editar `.env`.                                                                                                           |
| Copiar por error la clave `service_role` en lugar de la `anon`: el navegador recibiría acceso total.                                                                  | La spec pide solo la clave `anon` / publishable; `service_role` queda fuera de alcance y de `.env.example`. El criterio de aceptación lo comprueba. |
| Una versión de `@supabase/ssr` con API de cookies distinta a la del curso (el curso usaba `get`/`set`/`remove`, la API actual usa `getAll`/`setAll`).                  | Leer la documentación de la versión instalada antes del paso 4 y seguir la actual; no copiar el código del curso literalmente.                     |

---

## Lo que **no** está en este spec

- Autenticación real, sesión de Supabase o cambios en `/acceso`.
- Tablas, migraciones, RLS o tipos generados.
- Puntuaciones y ranking reales.
- Guardar los mensajes de contacto.
- Clave `service_role` y operaciones privilegiadas.
- Refresco de sesión en `proxy.ts`.
- Ruta de salud permanente.
- Tests automatizados y despliegue.

Cada uno de esos puntos, si se hace, va en su propio spec.
