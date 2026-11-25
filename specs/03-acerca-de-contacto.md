# SPEC 03 — Página "Acerca de" con formulario de contacto por Resend

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-11-24
> **Objetivo:** Construir la página "Acerca de" de `references/home-about/` en `/acerca-de`, idéntica a la referencia, con un formulario de contacto que envía el mensaje por correo a través de `POST /api/contact` y Resend (plan gratuito).

---

## Por qué existe este spec

El spec 02 construyó la landing y dejó fuera, de forma explícita, la página "Acerca de" (`about.jsx`, `.about-*`, `.contact-*`, `.highlight-row`) y su enlace en el header. Este spec la añade.

Es también **el primer código de servidor real del proyecto**: hasta ahora todo era estático o simulado (`lib/api.ts`). El formulario de contacto envía un correo de verdad con Resend, así que aparecen una dependencia nueva (`resend`), variables de entorno secretas y un Route Handler `POST /api/contact`, siguiendo el enfoque del curso.

La fuente de verdad visual es `references/home-about/about.jsx` (estructura y textos), `references/home-about/styles.css` líneas 1072–1146 (`.about-*`, `.highlight*`, `.about-divider`, `.div-pixels`, `.contact-*`, `.terminal-success`, `.term-*`), las líneas 813–824 (`.field`), y el prototipo empaquetado `arcade-vault-standalone.html`. Si algo de este spec contradice la referencia en lo visual, gana la referencia, salvo las excepciones de "Decisiones" (estados de envío y de error, que la referencia no tiene).

**Ampliación (2026-11-24, paso 11).** Con los pasos 1–10 implementados, el usuario probó el formulario y pidió quitar la terminal "VAULT-OS // TERMINAL" de la referencia: `vault@arcade:~$ ./send_message` y `[ERR] Servidor de correo no configurado.` son lenguaje técnico que un jugador no reconoce. La terminal de éxito y la de error se sustituyen por una **tarjeta de resultado** con icono, título y una frase en lenguaje de usuario. Es la única parte de la página que deja de seguir la referencia; el resto sigue idéntico. Eligió ampliar este spec en lugar de abrir otro. En la misma ampliación pidió **un mensaje por cada tipo de error posible**, con un diseño claro y el código del error visible en pequeño: la API pasa a devolver un código concreto por causa (`empty`, `email`, `too_long`, `bad_request`, `rate_limited`, `unavailable`) y el cliente añade `network` y `unexpected`. Los tests e2e de Playwright del servicio de correo que pidió a la vez quedan para el **spec 04**.

**Restricción del plan gratuito de Resend.** Sin un dominio verificado, el remitente tiene que ser `onboarding@resend.dev` y Resend solo entrega al correo de la cuenta dueña de la API key. Por eso el correo va al equipo (`CONTACT_TO_EMAIL`) y no se envía copia al visitante. Límites del plan: 100 correos/día y 3.000/mes.

---

## Alcance

**Dentro:**

- Ruta `/acerca-de` (`app/(site)/acerca-de/page.tsx`) dentro del grupo `(site)`, con header y pie globales. Bloques, en este orden:
  1. **Hero:** kicker amarillo "▸ ACERCA DE", `<h1>` "ACERCA DE ARCADE VAULT" con degradado blanco→cian, párrafo de misión y fila de tres destacados con icono pixel (HEART magenta, BROWSER cian, PLANT verde) y textos literales de `about.jsx`.
  2. **Divisor decorativo** (`aria-hidden`): dos barras con degradado magenta y 24 píxeles parpadeantes (cian, magenta cada 3, amarillo cada 5) con retardo `i * 80` ms.
  3. **Contacto:** columna de introducción (kicker cian "▸ CONTACTO", título "CONTÁCTANOS", subtítulo, tres consejos con LED verde / amarillo / magenta) y columna con el formulario (NOMBRE, CORREO ELECTRÓNICO, MENSAJE, botón "▶  ENVIAR MENSAJE").
- Enlace "Acerca de" en el header de escritorio y en el menú móvil, después de "Salón de la Fama", como en `nav.jsx`; activo solo en `/acerca-de`.
- Comportamiento del formulario de la referencia: si algún campo está vacío tras `trim()`, el formulario hace la animación `shake` (400 ms) y no envía. Con éxito se sustituía por la terminal "VAULT-OS // TERMINAL" (sustituida por la tarjeta de resultado en la ampliación) con las líneas `[OK]` y "> MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {NOMBRE}._", y el botón "ENVIAR OTRO MENSAJE" vacía y muestra de nuevo el formulario.
- **(Ampliación, sustituye a la terminal)** Tarjeta de resultado en lugar del formulario: icono pixel centrado, título en Press Start, una frase en lenguaje de usuario, el código del error en pequeño y un botón. Mismo marco del formulario (fondo, borde y borde discontinuo interior); sin barra de ventana, sin prompt y sin líneas `[OK]` / `[ERR]`. Tres tonos: éxito (✓ verde `#00ff88`), datos por corregir (! amarillo `#f5ff00`) y fallo de envío (✕ rojo `#ff5f56`). Textos y códigos en "Convenciones".
- Estados nuevos (no están en la referencia):
  - **Enviando:** botón deshabilitado con el texto "▶  TRANSMITIENDO…" y campos deshabilitados.
  - **Error:** tarjeta de resultado con el mensaje de su tipo (7 tipos, tabla de "Convenciones"). Los errores de datos llevan el botón "CORREGIR DATOS" y el resto "REINTENTAR"; los dos vuelven al formulario **conservando** lo escrito. (Antes de la ampliación: terminal roja con línea `[ERR]`.)
- Route Handler `app/api/contact/route.ts` con `POST`: lee `name`, `email` y `msg` de un body JSON, valida, envía con Resend y responde `200 { ok: true }`, `400 { error }`, `429 { error }` o `500 { error }` (códigos de la ampliación en "Modelo de datos").
- Envío con Resend: remitente `onboarding@resend.dev`, destinatario `CONTACT_TO_EMAIL`, `replyTo` = correo del visitante, `subject` y `html` con los datos del formulario escapados.
- Validación en servidor: los tres campos no vacíos (como el curso), más formato de email y límites de longitud.
- Variables de entorno: renombrar `apikey-email` a `RESEND_API_KEY` en `.env`, añadir `CONTACT_TO_EMAIL`, y crear `.env.example` versionado con ambas claves vacías.
- Revelado por scroll del divisor y del bloque de contacto, reutilizando `components/home/reveal.tsx` (mismo comportamiento sin JS y con `prefers-reduced-motion` que en el spec 02).
- Responsive con los cortes de la referencia: destacados 3 → 1 columna a ≤ 820 px; contacto 2 → 1 columna a ≤ 900 px (hueco 40 → 24 px).
- Actualizar `CLAUDE.md` (tabla de rutas, arquitectura, API, variables de entorno).

**Fuera de alcance (para specs futuros):**

- Verificar un dominio propio en Resend, cambiar el remitente o enviar copia/confirmación al visitante.
- Guardar los mensajes (base de datos, archivo, panel de administración).
- Honeypot, rate limit por IP, CAPTCHA, comprobación de `Origin` o cualquier otra protección contra spam.
- Cambiar los stubs de `lib/api.ts` (`login`, `register`, `submitScore`) a un backend real.
- Tipografía JetBrains Mono, temas y `tweaks` de la referencia (igual que en el spec 02).
- Tests automatizados, metadatos SEO, i18n y despliegue (configurar las variables en un hosting).

---

## Modelo de datos

Datos estáticos de la página en `lib/about.ts`:

```ts
// lib/about.ts
export type HighlightIcon = "heart" | "browser" | "plant";
export type AboutAccent = "magenta" | "cyan" | "green";

export interface Highlight {
  icon: HighlightIcon;
  text: string;           // "HECHO CON ❤️ PARA JUGADORES"
  accent: AboutAccent;
}

export interface ContactTip {
  text: string;           // "RESPUESTA EN 24-48H"
  led: "green" | "yellow" | "magenta";
}

export const ABOUT_MISSION: string;
export const HIGHLIGHTS: readonly Highlight[];    // 3, orden de la referencia
export const CONTACT_TIPS: readonly ContactTip[]; // 3, orden de la referencia
```

Contrato de la API (tipos compartidos en `lib/contact.ts`; la parte que usa Resend solo la importa el Route Handler):

```ts
// lib/contact.ts
export const CONTACT_LIMITS = { name: 60, email: 254, msg: 2000 } as const;

// Body JSON de POST /api/contact
export interface ContactRequest {
  name: string;      // trim, 1..60
  email: string;     // trim, formato email, ≤ 254
  msg: string;       // trim, 1..2000
}

// Ampliación (paso 11): un código por causa. Antes: "invalid" | "config" | "send".
export type ContactError =
  | "bad_request"   // 400: el body no es JSON o algún campo no es texto
  | "empty"         // 400: nombre, correo o mensaje vacío tras trim
  | "email"         // 400: correo sin formato válido o de más de 254 caracteres
  | "too_long"      // 400: nombre > 60 o mensaje > 2000 caracteres
  | "rate_limited"  // 429: Resend respondió rate_limit_exceeded
  | "unavailable";  // 500: faltan variables, o Resend falló por cualquier otra causa
                    //      (clave, cuota diaria/mensual, destinatario no permitido, excepción)

// Respuestas
// 200 → { ok: true }
// 400 → { error: "bad_request" | "empty" | "email" | "too_long" }
// 429 → { error: "rate_limited" }
// 500 → { error: "unavailable" }
export type ContactResponse = { ok: true } | { error: ContactError };

// Solo en el cliente (components/about/contact-form.tsx):
// "network"    → fetch lanzó excepción o pasaron 15 s (AbortSignal.timeout)
// "unexpected" → bad_request, respuesta no JSON u otro estado HTTP (404, 405, 502…)
type ClientContactError = Exclude<ContactError, "bad_request"> | "network" | "unexpected";
```

Variables de entorno (en `.env`, ignorado por git; `.env.example` versionado y vacío):

```bash
RESEND_API_KEY=
CONTACT_TO_EMAIL=
```

**Convenciones:**

- Textos literales de `about.jsx`, salvo la tarjeta de resultado (ampliación).
- **(Ampliación)** Textos de la tarjeta de resultado. `{nombre}` es el `name` recortado tal como lo escribió el visitante (la API solo devuelve `{ ok: true }`):

  | Caso | Código visible | Tono | Título | Frase | Botón |
  | --- | --- | --- | --- | --- | --- |
  | `200 { ok: true }` | — | ✓ verde | `¡MENSAJE ENVIADO!` | `Gracias, {nombre}. Te responderemos en 24-48 h en tu correo.` | `ENVIAR OTRO MENSAJE` (vacía el formulario) |
  | `400 empty` | `CONTACT-400-EMPTY` | ! amarillo | `DATOS INCOMPLETOS` | `Rellena tu nombre, tu correo y el mensaje para poder enviarlo.` | `CORREGIR DATOS` |
  | `400 email` | `CONTACT-400-EMAIL` | ! amarillo | `CORREO NO VÁLIDO` | `Revisa tu dirección de correo: debe tener el formato nombre@dominio.com.` | `CORREGIR DATOS` |
  | `400 too_long` | `CONTACT-400-LENGTH` | ! amarillo | `TEXTO DEMASIADO LARGO` | `El nombre admite hasta 60 caracteres y el mensaje hasta 2000. Acórtalos y vuelve a enviarlo.` | `CORREGIR DATOS` |
  | `429 rate_limited` | `CONTACT-429` | ✕ rojo | `DEMASIADOS ENVÍOS` | `Se han enviado muchos mensajes seguidos. Espera un minuto y vuelve a intentarlo.` | `REINTENTAR` |
  | `500 unavailable` | `CONTACT-500` | ✕ rojo | `SERVICIO NO DISPONIBLE` | `Nuestro servicio de correo no está disponible ahora mismo. Inténtalo más tarde; tu texto sigue guardado.` | `REINTENTAR` |
  | `network` (cliente) | `CONTACT-NET` | ✕ rojo | `SIN CONEXIÓN` | `No pudimos conectar con Arcade Vault. Comprueba tu conexión a internet e inténtalo de nuevo.` | `REINTENTAR` |
  | `unexpected` (cliente) | `CONTACT-400-JSON` para `bad_request`; `CONTACT-{estado}` para otro estado HTTP; `CONTACT-UNKNOWN` si no hay estado | ✕ rojo | `ALGO SALIÓ MAL` | `Ocurrió un error inesperado al enviar tu mensaje. Inténtalo de nuevo en unos minutos.` | `REINTENTAR` |

  "CORREGIR DATOS" y "REINTENTAR" vuelven al formulario con los campos intactos; ninguno reenvía solo. El código visible va en una línea `Código: …` en Press Start de 8 px, color `text-home-faint`.
  La tarjeta de éxito usa `role="status"` y la de error `role="alert"`, para que los lectores de pantalla anuncien el resultado.
- Mensajes de la línea `[ERR]` antes de la ampliación (ya no se muestran):

  | Respuesta | Texto |
  | --- | --- |
  | `400 { error: "invalid" }` | `[ERR] Datos no válidos. Revisa el correo y la longitud del mensaje.` |
  | `500 { error: "config" }` | `[ERR] Servidor de correo no configurado.` |
  | `500 { error: "send" }` o fallo de red | `[ERR] No se pudo transmitir el paquete. Inténtalo de nuevo.` |

- `unavailable` se devuelve si falta `RESEND_API_KEY` o `CONTACT_TO_EMAIL`, o si Resend devuelve cualquier error que no sea `rate_limit_exceeded` o lanza excepción. El servidor registra la causa con `console.error` (`[contacto] …` con el `name` del error de Resend), nunca la API key ni el contenido del mensaje. Antes de la ampliación eran `config` y `send` con `500`.
- Correo: `from: "onboarding@resend.dev"`, `subject: "[Arcade Vault] Mensaje de {name}"`, `html` con nombre, correo y mensaje. Los tres valores se escapan (`&`, `<`, `>`, `"`, `'`) antes de insertarlos, y los saltos de línea del mensaje pasan a `<br>`.
- Colores nuevos solo donde la referencia usa un valor que no existe ya como token (`#000` de la terminal, `#ff5f56` / `#ffbd2e` / `#27c93f` de los puntos de la barra). El rojo del estado de error es `#ff5f56`, el mismo del punto rojo.
- Cortes: `max-[821px]:` (≡ `max-width: 820px`) y `max-[901px]:` (≡ `max-width: 900px`), con pistas `1fr` como en el spec 02.

---

## Plan de implementación

Antes del paso 1, leer en `node_modules/next/dist/docs/01-app/` las guías de Route Handlers (`route.ts`, `Request` / `Response.json`) y de variables de entorno, y comprobar cómo se comporta un handler `POST` con `cacheComponents: true` (sin exportar `runtime`). Toda la interfaz se diseña con `/frontend-design` y se compara contra `references/home-about/`. Cada comparación con Playwright guarda sus evidencias en `.mcp-evidencias/AAAA-MM-DD_HH-MM-SS/` (una carpeta nueva por ejecución, nunca sobrescrita); el prototipo se sirve desde una copia temporal en `public/` que se borra al terminar.

1. **Ruta y enlace.** Crear `app/(site)/acerca-de/page.tsx` con un marcador mínimo (`<h1>` ACERCA DE ARCADE VAULT). En `components/site-header.tsx` añadir "Acerca de" (`/acerca-de`) a `NAV` tras "Salón de la Fama", en escritorio y menú móvil. Verificación: `npm run build` pasa; el enlace está activo solo en `/acerca-de`; con Playwright, el header a 1280 y a 1600 px mide lo mismo que el del prototipo en esos anchos.
2. **Datos.** Crear `lib/about.ts` con tipos y constantes del modelo de datos, copiando los textos de `about.jsx`. Verificación: `npx tsc --noEmit` pasa; `HIGHLIGHTS` y `CONTACT_TIPS` tienen 3 elementos.
3. **Hero.** Crear `components/about/highlight-icon.tsx` (los tres SVG de `HighlightIcon`, componente de servidor) y sustituir el marcador por el hero completo (kicker, título, misión, fila de destacados con hover). Añadir a `app/globals.css` lo que falte. Verificación manual a 1280×900 y 390×844.
4. **Divisor y columna de introducción.** Añadir el divisor de píxeles (animación `pxblink`) y la sección de contacto con la columna de introducción y un hueco vacío para el formulario, ambos dentro de `Reveal`. Verificación manual: aparecen al hacer scroll; con `prefers-reduced-motion` o sin JS se ven sin animación.
5. **Formulario local.** Crear `components/about/contact-form.tsx` (cliente) con los tres campos, el `shake` con campos vacíos y la terminal de éxito con "ENVIAR OTRO MENSAJE", todavía **sin red** (el éxito se muestra localmente). Verificación manual: vacío → `shake`; relleno → terminal con el nombre en mayúsculas; "ENVIAR OTRO MENSAJE" vacía el formulario.
6. **Resend, variables y lógica de envío.** `npm install resend`. Renombrar `apikey-email` a `RESEND_API_KEY` en `.env`, añadir `CONTACT_TO_EMAIL` con la dirección indicada por el usuario, y crear `.env.example` con ambas vacías. Crear `lib/contact.ts` con `CONTACT_LIMITS`, los tipos, la validación, el escape HTML y la función que llama a Resend. Verificación: `npx tsc --noEmit` y `npm run lint` pasan; `git status` no muestra `.env`; `.env.example` no contiene valores.
7. **Route Handler.** Crear `app/api/contact/route.ts` con `POST` según el contrato. Verificación con `curl -X POST http://localhost:3000/api/contact -H 'Content-Type: application/json' -d '…'`:
   - body válido → `200 { "ok": true }` (con la key configurada) y el correo llega;
   - `name`, `email` o `msg` vacío → `400 { "error": "invalid" }`;
   - body que no es JSON → `400 { "error": "invalid" }`;
   - `msg` de 2001 caracteres → `400`;
   - sin `RESEND_API_KEY` → `500 { "error": "config" }`.

   (Códigos de la versión original; la ampliación del paso 11 los cambia por `empty` / `email` / `too_long` / `bad_request` / `unavailable`.)
8. **Conectar el formulario.** El formulario hace `fetch("/api/contact", { method: "POST" })` con JSON: estado enviando, terminal de éxito con `200`, terminal de error con el texto de la tabla para `400`, `500` o fallo de red, y "REINTENTAR" que conserva los campos. Verificación manual: sin `RESEND_API_KEY` se ve `[ERR] Servidor de correo no configurado.`.
9. **Documentación.** Actualizar `CLAUDE.md`: fila `/acerca-de` en la tabla de rutas y la API `POST /api/contact`, quitar "and the 'Acerca de' page are future specs" y la frase "Backend… future specs" en lo que respecta al contacto, añadir `lib/about.ts`, `lib/contact.ts`, `components/about/`, las variables de entorno, `.env.example`, la restricción del plan gratuito de Resend y el enlace "Acerca de" en la descripción del header. Verificación: `CLAUDE.md` coincide con los archivos reales.
10. **Ajuste visual y envío real.** Comparar `/acerca-de` con la página "Acerca de" del prototipo con Playwright a 1280×900 y 390×844, midiendo rects y estilos calculados de kicker, título, misión, destacados, divisor, columna de introducción, formulario (campos, botón) y terminal de éxito, y el alto del documento. Corregir diferencias. Después, con la clave real, enviar un mensaje desde el formulario y que el usuario confirme que llegó. Comprobar que `/`, `/biblioteca`, detalle, salón y acceso no retroceden (alto del documento y header).
11. **(Ampliación) Tarjeta de resultado y tipos de error.** En `lib/contact.ts` y `app/api/contact/route.ts`, devolver los códigos de `ContactError` con su estado HTTP (`429` para `rate_limited`). En `components/about/contact-form.tsx`, sustituir `Terminal` por una tarjeta de resultado con iconos pixel ✓ / ! / ✕, los textos y códigos de la tabla de "Convenciones", y `AbortSignal.timeout(15000)` en el `fetch`. Verificación: con `curl`, cada caso de `400` devuelve su código; sin clave, `500 unavailable`. Con Playwright a 1280×900 y 390×844, cada fila de la tabla (respuestas simuladas para `429`, `500`, `bad_request`, `502` y red caída) muestra su título, frase, código y botón; los botones conservan o vacían los campos según la tabla; ningún texto visible contiene `vault@arcade`, `[OK]` ni `[ERR]`. Actualizar `CLAUDE.md`.

---

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` pasan sin errores.
- [ ] `/acerca-de` responde 200 y muestra, en orden, hero, divisor y bloque de contacto con los textos literales de `about.jsx`.
- [ ] El header de escritorio y el menú móvil muestran "Acerca de" tras "Salón de la Fama", y solo está activo en `/acerca-de`.
- [ ] Con Playwright a 1280×900 y 390×844, los rects y estilos calculados de los bloques medidos en el paso 10 coinciden con el prototipo, salvo la tipografía mono (Courier Prime en vez de JetBrains Mono) y los artefactos de medición (hover, animaciones en curso).
- [ ] A ≤ 820 px los destacados van en una columna; a ≤ 900 px el contacto va en una columna con hueco de 24 px.
- [ ] `curl` con body válido y la key configurada devuelve `200 { "ok": true }` y el correo llega a `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] Mensaje de {name}`, cuerpo HTML y `replyTo` del visitante (confirmado por el usuario).
- [ ] `curl` devuelve `400 { "error": "empty" }` con `name`, `email` o `msg` vacío; `400 { "error": "email" }` con un correo sin formato válido; `400 { "error": "too_long" }` con `name` de 61 caracteres o `msg` de 2001; y `400 { "error": "bad_request" }` con un body que no es JSON.
- [ ] `curl` sin `RESEND_API_KEY` devuelve `500 { "error": "unavailable" }`, y un `rate_limit_exceeded` de Resend se traduce en `429 { "error": "rate_limited" }`.
- [ ] Un `msg` con `<b>hola</b>` llega al correo como texto visible `<b>hola</b>`, no en negrita.
- [ ] Enviar el formulario con algún campo vacío (o solo espacios) produce la animación `shake` y no hace ninguna petición a `/api/contact`.
- [ ] Mientras se envía, el botón muestra "▶  TRANSMITIENDO…" y está deshabilitado.
- [ ] Un envío válido desde el formulario muestra la tarjeta verde "¡MENSAJE ENVIADO!" con "Gracias, {nombre}. Te responderemos en 24-48 h en tu correo.".
- [ ] Cada fila de errores de la tabla de "Convenciones" muestra su título, su frase, su código visible y su botón; "CORREGIR DATOS" y "REINTENTAR" vuelven al formulario con los campos intactos.
- [ ] Sin `RESEND_API_KEY` el formulario muestra "SERVICIO NO DISPONIBLE" con `Código: CONTACT-500`, y sin conexión "SIN CONEXIÓN" con `Código: CONTACT-NET`.
- [ ] Ningún estado del formulario muestra texto técnico (`vault@arcade`, `[OK]`, `[ERR]`, "servidor", "paquete").
- [ ] "ENVIAR OTRO MENSAJE" vacía los campos y muestra el formulario de nuevo.
- [ ] `RESEND_API_KEY` no aparece en el bundle del cliente (búsqueda en `.next/static`) ni en ninguna respuesta de `/api/contact`.
- [ ] `.env` no está versionado y `.env.example` existe con `RESEND_API_KEY=` y `CONTACT_TO_EMAIL=` vacíos.
- [ ] Con `prefers-reduced-motion: reduce` o sin JavaScript, el divisor y el bloque de contacto son visibles.
- [ ] `/`, `/biblioteca`, `/juegos/arkanoid`, `/salon-de-la-fama` y `/acceso` mantienen su alto de documento salvo el cambio de alto del header por el nuevo enlace.

---

## Decisiones tomadas y descartadas

- **Sí:** ruta `/acerca-de`. Coherente con `/biblioteca`, `/salon-de-la-fama` y `/acceso`. El usuario lo eligió.
- **No:** `/about`. Rompe la convención de rutas en español.
- **Sí:** Route Handler `POST /api/contact` en `app/api/contact/route.ts`, con body JSON `name` / `email` / `msg` y respuestas `200` / `400` / `500`, como en el curso. Se puede probar con `curl` sin el navegador, y eso hace verificable la validación. El usuario lo eligió al ver el enfoque del curso.
- **No (reemplazada):** Server Action `sendContactMessage`. Era la primera elección; se cambió para seguir el curso. Su ventaja (no exponer un endpoint público) se compensa en parte con las protecciones de abajo.
- **Sí:** al enfoque del curso se añaden formato de email y límites de longitud (60 / 254 / 2000). Evitan mensajes enormes casi sin código y, si fallan, responden un error visible (`400`), así que nunca descartan un mensaje en silencio.
- **Sí:** el correo va al equipo (`CONTACT_TO_EMAIL`) desde `onboarding@resend.dev`, con `replyTo` del visitante. Es lo único que permite el plan gratuito sin dominio verificado.
- **No:** copia al visitante. Requiere verificar un dominio en Resend; va en otro spec si se quiere.
- **Sí:** destinatario en `.env`, no en el código. Así la dirección no queda en el historial de git. El usuario lo eligió.
- **Sí:** renombrar `apikey-email` a `RESEND_API_KEY`. Es el nombre estándar del SDK y un identificador válido. El usuario lo eligió.
- **Sí:** `.env.example` versionado con las claves vacías. Documenta qué hace falta configurar sin exponer secretos.
- **Sí:** SDK `resend`. Da tipos y manejo de errores frente a un `fetch` manual a la API.
- **Sí:** cuerpo `html` como el curso, con los valores escapados. Sin escapar, quien escriba etiquetas en el mensaje inyecta HTML en la bandeja del equipo. El usuario lo eligió.
- **No:** HTML sin escapar ni texto plano. El primero permite inyección; el segundo se aleja del curso.
- **No (retirada):** honeypot (campo oculto `website` que responde éxito falso sin enviar). Lo propuso Claude por iniciativa propia; no estaba en la petición ni en el curso. Se quitó porque el autocompletado del navegador o de gestores de contraseñas puede rellenarlo, y entonces un mensaje real se pierde en silencio mientras el visitante ve "MENSAJE RECIBIDO". Además añade un riesgo de accesibilidad y apenas protege una API pública que se puede llamar con `curl` sin ese campo.
- **No:** rate limit por IP. Necesita almacenamiento; en memoria no sobrevive reinicios ni varias instancias.
- **Sí:** estados "enviando" y "error" que no están en la referencia: botón "▶  TRANSMITIENDO…" y terminal roja con "REINTENTAR". Sin ellos, un fallo real de Resend dejaría al usuario sin respuesta. El usuario eligió la terminal de error frente a un mensaje bajo el botón.
- **Sí (ampliación):** tarjeta de resultado con icono, título y frase en lenguaje de usuario en lugar de la terminal de la referencia. El usuario la pidió al probar el formulario: la terminal no es un mensaje que un jugador reconozca. Es la única desviación visual de la página respecto a la referencia.
- **No (ampliación, reemplazada):** terminal "VAULT-OS // TERMINAL" de éxito y de error, con líneas `[OK]` / `[ERR]`.
- **No (ampliación):** aviso encima del formulario sin ocultarlo. El usuario prefirió la tarjeta que ocupa el lugar del formulario.
- **Sí (ampliación):** un mensaje por causa sobre la que el visitante puede actuar distinto: datos incompletos, correo no válido, texto largo, demasiados envíos, servicio no disponible, sin conexión e inesperado. La primera versión de la ampliación tenía dos mensajes; el usuario pidió todos los tipos posibles y eligió esta granularidad frente a separar cada causa técnica.
- **No (ampliación):** un mensaje distinto para clave inválida, cuota agotada, destinatario no permitido o falta de configuración. El visitante no puede arreglar ninguna y el mensaje sería el mismo; la causa queda en el log del servidor.
- **Sí (ampliación):** código del error visible en pequeño (`Código: CONTACT-…`). Sirve para que el visitante lo cite si escribe a soporte y para depurar sin abrir DevTools. El usuario lo eligió.
- **Sí (ampliación):** tres tonos de tarjeta: verde (enviado), amarillo con "!" (datos por corregir) y rojo con "✕" (el envío falló). Separa lo que arregla el visitante de lo que no depende de él.
- **Sí (ampliación):** botón "CORREGIR DATOS" para los errores de datos y "REINTENTAR" para el resto. El botón dice lo que el visitante va a hacer.
- **Sí (ampliación):** `429` para `rate_limited`, fuera del contrato `200/400/500` del curso. Es el estado HTTP estándar para "demasiadas peticiones" y permite un mensaje que pide esperar.
- **Sí (ampliación):** `fetch` con `AbortSignal.timeout(15000)`. Sin tiempo máximo, una red colgada dejaría el botón en "TRANSMITIENDO…" indefinidamente.
- **Sí (ampliación):** tests e2e de Playwright del servicio de correo en un spec 04 aparte. Los tests automatizados están fuera de alcance de los specs 01–03; el usuario eligió un spec nuevo, con envío simulado por defecto y un envío real opcional (`E2E_REAL_EMAIL=1`).
- **Sí (ampliación):** el nombre de la tarjeta de éxito se muestra tal como lo escribió el visitante, no en mayúsculas: la frase es texto normal, no un título.
- **Sí:** "REINTENTAR" conserva lo escrito. Perder un mensaje largo por un fallo del servidor es frustrante.
- **Sí:** el `shake` con campos vacíos se queda en el cliente, igual que la referencia; el formato del correo lo comprueba el `type="email"` nativo del navegador, como la referencia, y el servidor vuelve a validar todo.
- **Sí:** el mensaje de éxito toma el nombre del formulario. La API del curso solo devuelve `{ ok: true }`.
- **Sí:** el detalle del error solo en `console.error` del servidor. No filtra información interna al cliente.
- **Sí:** reutilizar `components/home/reveal.tsx`. Mismo comportamiento de revelado que la landing, sin duplicar código.
- **Sí:** enlace "Acerca de" en la posición de `nav.jsx`. Con él, el header a 1280 px vuelve a partirse en dos líneas (≈ 85 px) igual que el prototipo, como anticipó el spec 02.
- **Sí:** verificación con `curl` para la API y un envío real desde el formulario que confirma el usuario. Es la única prueba de que la clave, el destinatario y el remitente funcionan juntos. El usuario lo eligió.
- **Sí:** un solo spec para la página y el envío. El formulario es el bloque principal de la página y no tiene sentido sin el envío; el riesgo de tamaño se reparte en pasos independientes (el paso 5 deja el formulario funcionando sin red y el paso 7 deja la API probada con `curl` antes de conectarla).

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `/api/contact` es público y se puede llamar con `curl` saltándose el formulario | Validación y límites en servidor; si se abusa, Resend corta al llegar a la cuota y se ve "SERVICIO NO DISPONIBLE" o "DEMASIADOS ENVÍOS", sin romper la página. Rate limit y comprobación de `Origin` en otro spec. |
| La API key se filtra al cliente o al repo | Solo se lee en el servidor (`lib/contact.ts` desde el Route Handler); `.env` está en `.gitignore`; criterio de aceptación que busca la clave en `.next/static` y en las respuestas. |
| Inyección de HTML en el correo | Escape de `name`, `email` y `msg`; criterio de aceptación con `<b>hola</b>`. |
| `CONTACT_TO_EMAIL` distinto del correo de la cuenta de Resend | Resend rechaza el envío en el plan gratuito; se devuelve `500 { error: "unavailable" }` y el detalle queda en el log del servidor. Documentado en `CLAUDE.md`. |
| Variables ausentes en otro entorno (build, hosting) | El handler devuelve `500 { error: "unavailable" }` en tiempo de ejecución; el build no depende de las variables. |
| Comportamiento de Route Handlers con `cacheComponents` en Next 16.4 | Leer la documentación local de `node_modules/next/dist/docs/` antes del paso 7; un `POST` no se cachea, y no se exporta `runtime`. |
| El nuevo enlace cambia el alto del header en las demás páginas | Es el comportamiento del prototipo; el paso 10 mide que el resto de cada página no cambia. |

---

## Lo que **no** entra en este spec

- Dominio verificado en Resend, otro remitente o copia al visitante.
- Guardar mensajes o un panel para leerlos.
- Honeypot, rate limit, CAPTCHA, comprobación de `Origin` u otras protecciones contra spam.
- Backend real para `login`, `register` o `submitScore`.
- Tests automatizados, SEO, i18n y despliegue. Los tests e2e de Playwright del servicio de correo van en el spec 04.

Cada uno, si llega, va en su propio spec.
