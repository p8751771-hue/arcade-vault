# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault is a platform for playing games online and competing for the highest score. The visual MVP is built (spec `01-mvp-pantallas-visuales`): five screens with mocked data and no playable games, plus the "Inicio" landing (spec `02-landing-home`) and the "Acerca de" page with a contact form that really sends email through Resend (spec `03-acerca-de-contacto`; the only server code so far). Spec `04-paleta-tv-antigua` replaced the neon theme with an old-TV palette on every screen. Backend, real auth, real score saving and the games themselves are future specs; build them through the spec-driven workflow below. Talk to the user in Spanish.

Routes:

| Route | File | Notes |
| --- | --- | --- |
| `/` | `app/(site)/page.tsx` | Landing "Inicio": hero, features, game rail, stats, live activity, pricing, closing CTA (spec 02) |
| `/biblioteca` | `app/(site)/biblioteca/page.tsx` | Library: hero, search, category chips, game grid (was `/` in spec 01) |
| `/juegos/[id]` | `app/(site)/juegos/[id]/page.tsx` | Detail + top 10; `generateStaticParams` for the 6 ids, `notFound()` otherwise |
| `/salon-de-la-fama` | `app/(site)/salon-de-la-fama/page.tsx` | Per-game tabs and top 10 |
| `/acceso` | `app/(site)/acceso/page.tsx` | Login / register tabs, social and guest buttons |
| `/acerca-de` | `app/(site)/acerca-de/page.tsx` | About: hero with 3 highlights, pixel divider, contact intro + form (spec 03) |
| `/juegos/[id]/jugar` | `app/juegos/[id]/jugar/page.tsx` | Arcade cabinet placeholder; outside `(site)` so it has no header |
| `POST /api/contact` | `app/api/contact/route.ts` | JSON `{ name, email, msg }` → `200 { ok: true }` / `400 { error: "bad_request" \| "empty" \| "email" \| "too_long" }` / `429 { error: "rate_limited" }` / `500 { error: "unavailable" }` |

The visual source of truth is `references/Arcade Vault.dc.html` (plus `games.js` for the pixel-art covers). For the landing (`/`), the header/footer and "Acerca de" (`/acerca-de`) it is `references/home-about/` (`home.jsx`, `about.jsx`, `nav.jsx`, `styles.css`, and the packaged prototype `arcade-vault-standalone.html`). If code and reference disagree on **layout** (positions, sizes, typography, texts, breakpoints), the reference wins. **Color and effects** no longer come from the references: since spec 04 they follow `specs/04-paleta-tv-antigua.md` (old-TV palette, black text, scanlines and refresh band), which wins over the neon references.

## Commands

```bash
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build
npm run start    # next start (after build)
npm run lint     # eslint (flat config, lints whole project)
npx tsc --noEmit # type-check (no dedicated script)
```

If `next dev` keeps serving an old `app/globals.css` after you edit it (seen in spec 04, also right after a restart), stop it, delete `.next/dev` and start it again. Do not run `next build` while `next dev` is running.

There is no test runner configured (Playwright e2e tests for the contact email service are planned as spec 06).

## Spec Driven Design workflow

Features are developed with two project skills from https://github.com/Klerith/fernando-skills, installed with `npx skills@latest add Klerith/fernando-skills` (as the README says). The files live in `.agents/skills/` (shared with other agents) and `.claude/skills/` holds symlinks to them; `skills-lock.json` pins commit `0c33d2f` with content hashes. Edit the files under `.agents/skills/`, not the symlinks. Re-running the install command pulls the latest upstream version, so review the diff before updating:

1. `/spec <one-sentence feature description>`: asks clarifying questions, then writes `specs/NN-slug.md` with status `Draft` (or `Borrador`), based on `.agents/skills/spec/template.md`. It never writes code. It also seeds `specs/.spec-config.yml` if that file is missing.
2. A human re-reads the spec and changes its status to `Approved` (or `Aprobado`). The agent never does this.
3. `/spec-impl NN-slug`: refuses anything that isn't Approved. It works on the `spec-NN-slug` branch and implements the plan one step at a time, pausing for diff review after each step.

Both skills are user-invoked only (`disable-model-invocation`). Settings in `specs/.spec-config.yml`:
- `AutoCreateBranch` (default `true`): when `true`, `/spec-impl` creates the branch without asking.
- `AutoCommitSteps` (default `false`): when `true`, `/spec-impl` commits each step as `spec-NN-step-MM`. Nothing is ever pushed.

Implement what the approved spec says. Changes go into the spec first, and out-of-scope requests go into a future spec.

## Next.js version warning

This is Next.js 16.4 / React 19.3, which is newer than most training data. `AGENTS.md` requires reading the version-matched docs in `node_modules/next/dist/docs/` (mirrors nextjs.org/docs; App Router lives under `01-app/`) before writing Next.js code, and heeding deprecation notices. `next dev` re-adds the `AGENTS.md` block automatically.

## Skills

Usa siempre `/frontend-design` para diseñar la interfaz de usuario en este proyecto.

It comes from https://github.com/anthropics/skills, installed with `npx skills add https://github.com/anthropics/skills --skill frontend-design`. Like the spec skills, the files live in `.agents/skills/frontend-design/`, `.claude/skills/frontend-design` is a symlink to them, and `skills-lock.json` pins commit `e4bb5d9`.

## Architecture

App Router project. Routes live under `app/`, shared UI in `components/` and data/logic in `lib/`; the `@/*` path alias maps to the repo root.

- `app/(site)/` is a route group whose `layout.tsx` is the `home-about` shell: a `min-h-screen` flex column with `SiteHeader` (wrapped in `<Suspense>` because `usePathname()` suspends on params outside `generateStaticParams`; its fallback mimics the 70 px bar), the page in a `flex-1` wrapper, and the global footer ("© 2026 ARCADE VAULT · HECHO CON PIXELES Y SCANLINES · v2.6.0"; "NEÓN" until spec 04), so the footer sits at the bottom of short pages. `/juegos/[id]/jugar` lives outside it on purpose (no header, no footer).
- `components/site-header.tsx` follows `references/home-about/nav.jsx` / `.av-nav`: icon logo + "ARCADE VAULT", links Inicio / Biblioteca / Salón de la Fama / Acerca de (pixel 9 px, black 2 px underline on the active one, inverted on hover; Biblioteca is also active on `/juegos/*`), decorative "CRÉDITOS · 03", and a `.btn-cut` "Iniciar Sesión" link, or a `.btn-cut-ghost` "{NAME} ▾" button that signs out. At ≤ 840 px the links and credits hide and a ghost "≡" opens the side panel (`#mobile-menu`, `inert` when closed, closes on backdrop click and on navigation). Its CSS is the reference's literally, so the logo and button wrap when space runs out (at 1280 they do, ~85 px tall, as in the prototype; one line at 1600); the one agreed deviation is a 12 px gap on mobile so it fits at 390.
- `lib/games.ts`: `Game` type, `GAMES` (6 games, reference order and texts) and `CATEGORY_FILTERS`.
- `lib/scores.ts`: deterministic seed leaderboard (`getLeaderboard`), `MEDALS`, and `formatScore` / `formatDate` (`de-DE` / `es-ES` in `timeZone: "UTC"` so server and client match). Uses the fixed `SEED_REFERENCE_DATE`, never `Date.now()`.
- `lib/home.ts`: static, typed landing data (`FEATURES`, `STATS`, `ACTIVITY`, `TOP_PLAYERS`, `PLAN`, `FAQS`) copied from `home.jsx`; activity rows point at real `GameId`s. `formatHomeScore` uses `es-ES` like the reference (`7820`, `184.220`), unlike `formatScore` (`de-DE`). No `Date.now()`, no leaderboard reads.
- `components/home/`: landing pieces (`Reveal` is also used by "Acerca de"; it takes `as="section" | "div"`). Server components by default (`floating-silhouettes`, `section-head`, `feature-card`, `mini-card`, `activity-ticker`, `top-players`, `accent.ts`); client ones only where needed: `reveal` (scroll reveal) and `hero-ctas` / `plan-cta` (read `useSession`: "CREAR CUENTA"/"EMPEZAR GRATIS →" become "VER MI RANKING"/"IR A JUGAR →" when signed in).
- `lib/api.ts`: network-free stubs (`login`, `register`, `submitScore`); the single place to swap in a backend for those.
- `lib/about.ts`: static "Acerca de" data (`ABOUT_MISSION`, `HIGHLIGHTS`, `CONTACT_TIPS`) copied from `about.jsx`. `components/about/`: `highlight-icon` (server, the 3 pixel SVGs) and `contact-form` (client: shake on empty fields like the reference, then `fetch("/api/contact")` with a 15 s `AbortSignal.timeout` and the state "▶  TRANSMITIENDO…"). The result is NOT the reference's "VAULT-OS // TERMINAL" (replaced in spec 03's amendment because it read as developer jargon) but a result card in plain language: icon, title, sentence, a small `Código: CONTACT-…` line and a button. Tones: green ✓ success ("ENVIAR OTRO MENSAJE" empties the form), yellow ! for data the visitor fixes (`empty`, `email`, `too_long` → "CORREGIR DATOS") and red ✕ for failed sends (`rate_limited`, `unavailable`, client-side `network` and `unexpected` → "REINTENTAR"); both keep the fields. Texts and codes live in `ERRORS` and must match the table in spec 03. Press Start 2P has no uppercase Ó/É, so titles like "SIN CONEXIÓN" show a lowercase-looking accent (same as "CRÉDITOS" in the reference). The form sets `text-[14px]` because the reference body is 14 px.
- `lib/contact.ts`: contact API logic, imported only by `app/api/contact/route.ts` (the client imports types only). `ContactError` + `CONTACT_STATUS` (one code per cause and its HTTP status), `parseContactRequest` (returns `bad_request` / `empty` / `email` / `too_long`; max 60 / 254 / 2000 chars), `escapeHtml` and `sendContactEmail` (Resend SDK, `from: "onboarding@resend.dev"`, `to: CONTACT_TO_EMAIL`, `replyTo` = visitor, subject `[Arcade Vault] Mensaje de {name}`, escaped `html`; Resend's `rate_limit_exceeded` → `rate_limited`, any other Resend error, exception or missing variable → `unavailable`). Errors are logged with `console.error` without the key or the message content. No honeypot, rate limit or CAPTCHA (decided in spec 03).
- Environment: `RESEND_API_KEY` and `CONTACT_TO_EMAIL` in `.env` (git-ignored; `.env.example` is versioned with empty values via `!.env.example` in `.gitignore`). Resend's free plan without a verified domain only delivers to the email of the account that owns the key, so `CONTACT_TO_EMAIL` must be that address; otherwise the API returns `500 { error: "unavailable" }` (the cause is in the server log). Missing variables also return `500 { error: "unavailable" }` at request time; the build does not need them.
- `components/session-provider.tsx`: mocked session (`useSession`) persisted in `localStorage["av_user"]`; works without `localStorage` (memory fallback). Names are uppercased and capped at 14 chars.
- Screens' client components: `site-header`, `game-library` (search + chips), `game-card` (a single `<Link>` with tilt that checks `prefers-reduced-motion`), `game-cover` (canvas port of `cover()`, 96×56), `hall-of-fame`, `auth-form`, `play-screen` (`PlayPhase` / `SaveState`; the "SIMULAR FIN DE PARTIDA" button only exists when `NODE_ENV !== "production"`).
- Saving a score is only simulated and never alters the leaderboard. There is no game logic anywhere (no `startGame`, no game loop, no game key handlers; the P pause key is the only key handler).

Non-default settings in `next.config.ts` that affect how code is written:

- **`cacheComponents: true`**: data fetching is dynamic by default. Opt into caching with the `use cache` directive (plus `cacheLife` / `cacheTag`). Routes prerender a static shell while dynamic content streams in, so uncached dynamic access (e.g. `cookies()`, `fetch`, `searchParams`) outside `<Suspense>` can fail the build. This requires the Node.js runtime, so do **not** export the `runtime` route segment config.
- **`partialPrefetching: true`**: by default `<Link>` prefetches only the route's App Shell. Use `<Link prefetch={true}>` to prefetch a link's URL-specific cached content.
- **`experimental.agentFeedback: true`**: lets `next dev` maintain agent instructions (the `AGENTS.md` block).
- **Tailwind CSS v4 via Turbopack**: wired through `turbopack.rules` using `@tailwindcss/turbopack` for `*.css`; there is no `postcss.config`. `app/globals.css` imports Tailwind with `@import "tailwindcss"` and exposes the theme via `@theme inline`: the old-TV palette `--color-crt-*` (spec 04), `font-pixel`, and animations like `animate-row-in`. There are no other color tokens (the neon `void` / `neon-*` / `ink-*` / `home-*` tokens and glow shadows were removed in spec 04).
  - **Palette:** `crt-bg` `#748c7d` (page), `crt-surface` `#8aa293` (cards, panels, header, menu, forms), `crt-well` `#6e8677` (inputs, game screen), `crt-line` `#2f3b34` (borders), `crt-ink` `#000` and `crt-ink-2` `#0e1511` (the only text colors), `crt-invert` `#8aa293` (text on black). `crt-ok` / `crt-warn` / `crt-err` and `crt-gold` / `crt-silver` / `crt-bronze` are only for icons, borders and bars: on a mid-tone background no hued color reaches 4.5:1 as text. Contrast table in spec 04.
  - **Reusable classes** (renamed in spec 04; the old → new table and the reason are in the spec): `.btn-crt` (was `.btn-neon`), `.btn-crt-solid`, `.chip-crt`, `.panel-crt`, `.card-crt`, `.input-crt`, `.text-pixel-crt` (was `.text-pixel-glow`), `.btn-cut` + `-ghost` / `-lg` / `-xl` / `-pulse` (was `.btn-home`), `.pixelated`. The `.neon-*` modifiers no longer exist. Hover, focus and active are shown inverted (black background, `crt-invert` text); keyboard focus is a 2 px black outline. `.card-crt` inverts as a whole, so its children use `text-current` or `group-hover:`.
  - **Old-TV layer:** four fixed pseudo-elements above the content (`z-index: 1000`, `pointer-events: none`): `html::before` (vignette, at most 12 % black), `body::before` (static scanlines, 8 %), `html::after` (SVG noise) and `body::after` (refresh band, 18vh, `crt-roll` 8 s from top to bottom of the viewport). Darkening is capped so black text keeps ≥ 4.5:1.
  - **Motion:** `color-scheme: light`. `prefers-reduced-motion` is handled globally: everything stops and the refresh band is hidden.

Conventions:

- Breakpoints are done with Tailwind arbitrary variants, never `window.innerWidth`. The spec 01 screens (Library, detail, hall of fame, access, play) use a single breakpoint at 760 px (`min-[760px]:`). The header uses its reference's 840 px (`max-[841px]:` = ≤ 840). The landing keeps the breakpoints of its reference (features 4→2 cols at ≤980 and →1 at ≤520; game rail 6→3 at ≤1100 and →2 at ≤600; stats ≤720; activity/pricing ≤900; ticker rows ≤520), and so does "Acerca de" (highlights 3→1 at ≤820, contact 2→1 at ≤900). Tailwind v4's `max-[Npx]:` is `width < N` while the reference's `max-width: N` includes N, so they are written as N+1 (`max-[981px]:` ≡ `max-width: 980px`). Grids use plain `1fr` tracks (`grid-cols-[repeat(4,1fr)]`), not `grid-cols-4` (`minmax(0,1fr)`), because the reference lets wide content widen a column.
- Landing styling (`/`): same `crt-*` palette as the rest of the site. Its buttons are `.btn-cut` (+ `-lg`, `-xl`, `-pulse`), not `.btn-crt`. Data accents (`accent` in `lib/home.ts` and `lib/about.ts`, `color`/`rgb` in `lib/games.ts`) are kept but have no visual use since spec 04 (`components/home/accent.ts` maps every accent to `text-crt-ink`). `<main>` sets `leading-[1.5]` because that reference's body does; the rest of the app is `line-height: normal`. Body font stays Courier Prime (the reference's JetBrains Mono is not loaded).
- Scroll reveal: `Reveal` only sets `data-reveal="armed"` from the client when the section is below the fold and motion is allowed, so with no JavaScript or `prefers-reduced-motion` nothing is hidden. Staggered items use `data-reveal-item` + `--reveal-delay` (opacity only).
- Links that used to go to the Library at `/` now go to `/biblioteca` ("VOLVER AL VAULT", post-login and guest redirects); the logo goes to `/`.
- No per-game colors: since spec 04 cards, chips, mini-cards and the cabinet use the palette. `components/game-cover.tsx` draws the covers with only four palette tones (`#0e1511`, `#2f3b34`, `#748c7d`, `#8aa293`), with lines drawn pixel by pixel (no canvas antialiasing). `MEDALS` in `lib/scores.ts` hold `var(--color-crt-gold|silver|bronze)` and are only used for borders and bars.
- Forbidden in `app/`, `components/` and `lib/` (except comments and the `color` data of `lib/games.ts`): the neon values `#00f5ff`, `#ff006e`, `#f5ff00`, `#00ff88`, `#39ff88`, `#e6e9ff`, `#8a8fb5`, `#0a0a0f`, `#ffcf3a`, `#ffd24a`, `#ff5f56`, their `rgb(…)` and colored `text-shadow` / `box-shadow`. Use `crt-*` tokens.
- `proxy.ts` (root) returns the real HTTP 404 for unknown game ids on `/juegos/:id` and `/juegos/:id/jugar` by rewriting to `/_not-found`. It is needed because with `cacheComponents` the shell is sent first, so `notFound()` inside a page only yields a 200 with the 404 UI. Keep it fast (it only compares the id with `GAMES`); the pages still call `notFound()` as a second guard. Add new game routes to its `matcher`.
- `app/layout.tsx` types its props with the global `LayoutProps<"/">` helper (generated route types, no import needed).
- Fonts: Press Start 2P (titles, buttons, scores) and Courier Prime (body text) via `next/font/google`, exposed as `--font-press-start` / `--font-courier-prime` and used as `font-pixel` / `font-sans`.
