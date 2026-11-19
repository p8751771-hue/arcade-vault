# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault is a platform for playing games online and competing for the highest score. The app itself is still the `create-next-app` starter (`app/page.tsx`); features are meant to be built through the spec-driven workflow below. Talk to the user in Spanish.

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

## Architecture

App Router project: everything lives under `app/`, and the `@/*` path alias maps to the repo root.

Non-default settings in `next.config.ts` that affect how code is written:

- **`cacheComponents: true`**: data fetching is dynamic by default. Opt into caching with the `use cache` directive (plus `cacheLife` / `cacheTag`). Routes prerender a static shell while dynamic content streams in, so uncached dynamic access (e.g. `cookies()`, `fetch`, `searchParams`) outside `<Suspense>` can fail the build. This requires the Node.js runtime, so do **not** export the `runtime` route segment config.
- **`partialPrefetching: true`**: by default `<Link>` prefetches only the route's App Shell. Use `<Link prefetch={true}>` to prefetch a link's URL-specific cached content.
- **`experimental.agentFeedback: true`**: lets `next dev` maintain agent instructions (the `AGENTS.md` block).
- **Tailwind CSS v4 via Turbopack**: wired through `turbopack.rules` using `@tailwindcss/turbopack` for `*.css`; there is no `postcss.config`. `app/globals.css` imports Tailwind with `@import "tailwindcss"` and exposes theme tokens (`--background`, `--foreground`, fonts) via `@theme inline`. Dark mode follows `prefers-color-scheme`.

Conventions:

- `app/layout.tsx` types its props with the global `LayoutProps<"/">` helper (generated route types, no import needed).
- Fonts: Geist / Geist Mono via `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono`.
