# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault is a platform for playing games online and competing for the highest score. The visual MVP is built (spec `01-mvp-pantallas-visuales`): five screens with mocked data and no playable games. Backend, real auth, real score saving and the games themselves are future specs; build them through the spec-driven workflow below. Talk to the user in Spanish.

Routes:

| Route | File | Notes |
| --- | --- | --- |
| `/` | `app/(site)/page.tsx` | Library: hero, search, category chips, game grid |
| `/juegos/[id]` | `app/(site)/juegos/[id]/page.tsx` | Detail + top 10; `generateStaticParams` for the 6 ids, `notFound()` otherwise |
| `/salon-de-la-fama` | `app/(site)/salon-de-la-fama/page.tsx` | Per-game tabs and top 10 |
| `/acceso` | `app/(site)/acceso/page.tsx` | Login / register tabs, social and guest buttons |
| `/juegos/[id]/jugar` | `app/juegos/[id]/jugar/page.tsx` | Arcade cabinet placeholder; outside `(site)` so it has no header |

The visual source of truth is `references/Arcade Vault.dc.html` (plus `games.js` for the pixel-art covers). If code and reference disagree visually, the reference wins.

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

- `app/(site)/` is a route group whose `layout.tsx` renders `SiteHeader` (wrapped in `<Suspense>` because `usePathname()` suspends on params outside `generateStaticParams`). `/juegos/[id]/jugar` lives outside it on purpose.
- `lib/games.ts`: `Game` type, `GAMES` (6 games, reference order and texts) and `CATEGORY_FILTERS`.
- `lib/scores.ts`: deterministic seed leaderboard (`getLeaderboard`), `MEDALS`, and `formatScore` / `formatDate` (`de-DE` / `es-ES` in `timeZone: "UTC"` so server and client match). Uses the fixed `SEED_REFERENCE_DATE`, never `Date.now()`.
- `lib/api.ts`: network-free stubs (`login`, `register`, `submitScore`); the single place to swap in a backend.
- `components/session-provider.tsx`: mocked session (`useSession`) persisted in `localStorage["av_user"]`; works without `localStorage` (memory fallback). Names are uppercased and capped at 14 chars.
- Screens' client components: `site-header`, `game-library` (search + chips), `game-card` (a single `<Link>` with tilt that checks `prefers-reduced-motion`), `game-cover` (canvas port of `cover()`, 96×56), `hall-of-fame`, `auth-form`, `play-screen` (`PlayPhase` / `SaveState`; the "SIMULAR FIN DE PARTIDA" button only exists when `NODE_ENV !== "production"`).
- Saving a score is only simulated and never alters the leaderboard. There is no game logic anywhere (no `startGame`, no game loop, no game key handlers; the P pause key is the only key handler).

Non-default settings in `next.config.ts` that affect how code is written:

- **`cacheComponents: true`**: data fetching is dynamic by default. Opt into caching with the `use cache` directive (plus `cacheLife` / `cacheTag`). Routes prerender a static shell while dynamic content streams in, so uncached dynamic access (e.g. `cookies()`, `fetch`, `searchParams`) outside `<Suspense>` can fail the build. This requires the Node.js runtime, so do **not** export the `runtime` route segment config.
- **`partialPrefetching: true`**: by default `<Link>` prefetches only the route's App Shell. Use `<Link prefetch={true}>` to prefetch a link's URL-specific cached content.
- **`experimental.agentFeedback: true`**: lets `next dev` maintain agent instructions (the `AGENTS.md` block).
- **Tailwind CSS v4 via Turbopack**: wired through `turbopack.rules` using `@tailwindcss/turbopack` for `*.css`; there is no `postcss.config`. `app/globals.css` imports Tailwind with `@import "tailwindcss"` and exposes the theme (colors such as `bg-void` / `text-neon-cyan`, `font-pixel`, glow shadows, animations like `animate-row-in`) via `@theme inline`. It also defines the reusable classes `.btn-neon`, `.chip-neon`, `.panel-neon`, `.card-neon`, `.input-neon`, `.header-neon`, `.pixelated` and the CRT background. The app is always dark (`color-scheme: dark`); there is no light mode and `prefers-reduced-motion` is handled globally there.

Conventions:

- Single responsive breakpoint at 760 px, done with Tailwind arbitrary variants (`min-[760px]:`), never `window.innerWidth`.
- Per-game neon colors are passed as CSS variables (`--neon`, `--neon-rgb` as space-separated channels) so `.card-neon` / `.chip-neon` pick them up.
- `proxy.ts` (root) returns the real HTTP 404 for unknown game ids on `/juegos/:id` and `/juegos/:id/jugar` by rewriting to `/_not-found`. It is needed because with `cacheComponents` the shell is sent first, so `notFound()` inside a page only yields a 200 with the 404 UI. Keep it fast (it only compares the id with `GAMES`); the pages still call `notFound()` as a second guard. Add new game routes to its `matcher`.
- `app/layout.tsx` types its props with the global `LayoutProps<"/">` helper (generated route types, no import needed).
- Fonts: Press Start 2P (titles, buttons, scores) and Courier Prime (body text) via `next/font/google`, exposed as `--font-press-start` / `--font-courier-prime` and used as `font-pixel` / `font-sans`.
