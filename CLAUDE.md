# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault is a platform for playing games online and competing for the highest score. The visual MVP is built (spec `01-mvp-pantallas-visuales`): five screens with mocked data and no playable games, plus the "Inicio" landing (spec `02-landing-home`). Backend, real auth, real score saving, the games themselves and the "Acerca de" page are future specs; build them through the spec-driven workflow below. Talk to the user in Spanish.

Routes:

| Route | File | Notes |
| --- | --- | --- |
| `/` | `app/(site)/page.tsx` | Landing "Inicio": hero, features, game rail, stats, live activity, pricing, closing CTA (spec 02) |
| `/biblioteca` | `app/(site)/biblioteca/page.tsx` | Library: hero, search, category chips, game grid (was `/` in spec 01) |
| `/juegos/[id]` | `app/(site)/juegos/[id]/page.tsx` | Detail + top 10; `generateStaticParams` for the 6 ids, `notFound()` otherwise |
| `/salon-de-la-fama` | `app/(site)/salon-de-la-fama/page.tsx` | Per-game tabs and top 10 |
| `/acceso` | `app/(site)/acceso/page.tsx` | Login / register tabs, social and guest buttons |
| `/juegos/[id]/jugar` | `app/juegos/[id]/jugar/page.tsx` | Arcade cabinet placeholder; outside `(site)` so it has no header |

The visual source of truth is `references/Arcade Vault.dc.html` (plus `games.js` for the pixel-art covers). For the landing (`/`) it is `references/home-about/` (`home.jsx`, `styles.css`, and the packaged prototype `arcade-vault-standalone.html`); the "Acerca de" part of that folder is not built. If code and reference disagree visually, the reference wins.

## Commands

```bash
npm run dev      # next dev (http://localhost:3000)
npm run build    # next build
npm run start    # next start (after build)
npm run lint     # eslint (flat config, lints whole project)
npx tsc --noEmit # type-check (no dedicated script)
```

There is no test runner configured.

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

- `app/(site)/` is a route group whose `layout.tsx` is the `home-about` shell: a `min-h-screen` flex column with `SiteHeader` (wrapped in `<Suspense>` because `usePathname()` suspends on params outside `generateStaticParams`; its fallback mimics the 70 px bar), the page in a `flex-1` wrapper, and the global footer ("© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0"), so the footer sits at the bottom of short pages. `/juegos/[id]/jugar` lives outside it on purpose (no header, no footer).
- `components/site-header.tsx` follows `references/home-about/nav.jsx` / `.av-nav`: icon logo + "ARCADE VAULT", links Inicio / Biblioteca / Salón de la Fama (pixel 9 px, cyan underline on the active one; Biblioteca is also active on `/juegos/*`), decorative "CRÉDITOS · 03", and a `.btn-home` "Iniciar Sesión" link, or a ghost "{NAME} ▾" button that signs out. At ≤ 840 px the links and credits hide and a ghost "≡" opens the side panel (`#mobile-menu`, `inert` when closed, closes on backdrop click and on navigation). No "Acerca de" until that page exists. Its CSS is the reference's literally, so the logo and button only wrap when space runs out (~70 px tall at 1280); the one agreed deviation is a 12 px gap on mobile so it fits at 390.
- `lib/games.ts`: `Game` type, `GAMES` (6 games, reference order and texts) and `CATEGORY_FILTERS`.
- `lib/scores.ts`: deterministic seed leaderboard (`getLeaderboard`), `MEDALS`, and `formatScore` / `formatDate` (`de-DE` / `es-ES` in `timeZone: "UTC"` so server and client match). Uses the fixed `SEED_REFERENCE_DATE`, never `Date.now()`.
- `lib/home.ts`: static, typed landing data (`FEATURES`, `STATS`, `ACTIVITY`, `TOP_PLAYERS`, `PLAN`, `FAQS`) copied from `home.jsx`; activity rows point at real `GameId`s. `formatHomeScore` uses `es-ES` like the reference (`7820`, `184.220`), unlike `formatScore` (`de-DE`). No `Date.now()`, no leaderboard reads.
- `components/home/`: landing pieces. Server components by default (`floating-silhouettes`, `section-head`, `feature-card`, `mini-card`, `activity-ticker`, `top-players`, `accent.ts`); client ones only where needed: `reveal` (scroll reveal) and `hero-ctas` / `plan-cta` (read `useSession`: "CREAR CUENTA"/"EMPEZAR GRATIS →" become "VER MI RANKING"/"IR A JUGAR →" when signed in).
- `lib/api.ts`: network-free stubs (`login`, `register`, `submitScore`); the single place to swap in a backend.
- `components/session-provider.tsx`: mocked session (`useSession`) persisted in `localStorage["av_user"]`; works without `localStorage` (memory fallback). Names are uppercased and capped at 14 chars.
- Screens' client components: `site-header`, `game-library` (search + chips), `game-card` (a single `<Link>` with tilt that checks `prefers-reduced-motion`), `game-cover` (canvas port of `cover()`, 96×56), `hall-of-fame`, `auth-form`, `play-screen` (`PlayPhase` / `SaveState`; the "SIMULAR FIN DE PARTIDA" button only exists when `NODE_ENV !== "production"`).
- Saving a score is only simulated and never alters the leaderboard. There is no game logic anywhere (no `startGame`, no game loop, no game key handlers; the P pause key is the only key handler).

Non-default settings in `next.config.ts` that affect how code is written:

- **`cacheComponents: true`**: data fetching is dynamic by default. Opt into caching with the `use cache` directive (plus `cacheLife` / `cacheTag`). Routes prerender a static shell while dynamic content streams in, so uncached dynamic access (e.g. `cookies()`, `fetch`, `searchParams`) outside `<Suspense>` can fail the build. This requires the Node.js runtime, so do **not** export the `runtime` route segment config.
- **`partialPrefetching: true`**: by default `<Link>` prefetches only the route's App Shell. Use `<Link prefetch={true}>` to prefetch a link's URL-specific cached content.
- **`experimental.agentFeedback: true`**: lets `next dev` maintain agent instructions (the `AGENTS.md` block).
- **Tailwind CSS v4 via Turbopack**: wired through `turbopack.rules` using `@tailwindcss/turbopack` for `*.css`; there is no `postcss.config`. `app/globals.css` imports Tailwind with `@import "tailwindcss"` and exposes the theme (colors such as `bg-void` / `text-neon-cyan`, `font-pixel`, glow shadows, animations like `animate-row-in`) via `@theme inline`. It also defines the reusable classes `.btn-neon`, `.chip-neon`, `.panel-neon`, `.card-neon`, `.input-neon`, `.btn-home`, `.pixelated` and the site background, ported from `home-about`'s `.av-bg` / `.av-noise` as fixed pseudo-elements behind the content: `html::before` (magenta/cyan radial gradients), `body::before` (cyan perspective grid, 8 s), `body::after` (soft scanlines, `mix-blend-mode: overlay`) and `html::after` (SVG noise). Base text color is `#e6e9ff` (`--color-home-ink`); the per-screen colors of spec 01 are unchanged. The app is always dark (`color-scheme: dark`); there is no light mode and `prefers-reduced-motion` is handled globally there.

Conventions:

- Breakpoints are done with Tailwind arbitrary variants, never `window.innerWidth`. The spec 01 screens (Library, detail, hall of fame, access, play) use a single breakpoint at 760 px (`min-[760px]:`). The header uses its reference's 840 px (`max-[841px]:` = ≤ 840). The landing keeps the breakpoints of its reference (features 4→2 cols at ≤980 and →1 at ≤520; game rail 6→3 at ≤1100 and →2 at ≤600; stats ≤720; activity/pricing ≤900; ticker rows ≤520). Tailwind v4's `max-[Npx]:` is `width < N` while the reference's `max-width: N` includes N, so they are written as N+1 (`max-[981px]:` ≡ `max-width: 980px`). Grids use plain `1fr` tracks (`grid-cols-[repeat(4,1fr)]`), not `grid-cols-4` (`minmax(0,1fr)`), because the reference lets wide content widen a column.
- Landing styling (`/`): colors that differ from the app tokens live as `--color-home-*` in `globals.css` (`text-home-dim`, `bg-home-bg2`, `border-home-line`, gold/silver/bronze, `home-green` = `#00ff88`). Its buttons are `.btn-home` (+ `-lg`, `-xl`, `-pulse`; color from `.neon-*`), not `.btn-neon`. `<main>` sets `leading-[1.5]` because that reference's body does; the rest of the app is `line-height: normal`. Body font stays Courier Prime (the reference's JetBrains Mono is not loaded).
- Scroll reveal: `Reveal` only sets `data-reveal="armed"` from the client when the section is below the fold and motion is allowed, so with no JavaScript or `prefers-reduced-motion` nothing is hidden. Staggered items use `data-reveal-item` + `--reveal-delay` (opacity only).
- Links that used to go to the Library at `/` now go to `/biblioteca` ("VOLVER AL VAULT", post-login and guest redirects); the logo goes to `/`.
- Per-game neon colors are passed as CSS variables (`--neon`, `--neon-rgb` as space-separated channels) so `.card-neon` / `.chip-neon` pick them up.
- `proxy.ts` (root) returns the real HTTP 404 for unknown game ids on `/juegos/:id` and `/juegos/:id/jugar` by rewriting to `/_not-found`. It is needed because with `cacheComponents` the shell is sent first, so `notFound()` inside a page only yields a 200 with the 404 UI. Keep it fast (it only compares the id with `GAMES`); the pages still call `notFound()` as a second guard. Add new game routes to its `matcher`.
- `app/layout.tsx` types its props with the global `LayoutProps<"/">` helper (generated route types, no import needed).
- Fonts: Press Start 2P (titles, buttons, scores) and Courier Prime (body text) via `next/font/google`, exposed as `--font-press-start` / `--font-courier-prime` and used as `font-pixel` / `font-sans`.
