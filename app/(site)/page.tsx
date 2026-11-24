import Link from "next/link";
import type { CSSProperties } from "react";
import { ActivityTicker } from "@/components/home/activity-ticker";
import { FeatureCard } from "@/components/home/feature-card";
import { FloatingSilhouettes } from "@/components/home/floating-silhouettes";
import { HeroCtas } from "@/components/home/hero-ctas";
import { MiniCard } from "@/components/home/mini-card";
import { PlanCta } from "@/components/home/plan-cta";
import { Reveal } from "@/components/home/reveal";
import { SectionHead } from "@/components/home/section-head";
import { TopPlayers } from "@/components/home/top-players";
import { GAMES } from "@/lib/games";
import { FAQS, FEATURES, PLAN, STATS } from "@/lib/home";

const SECTION = "mx-auto my-20 max-w-[1320px] px-8";
// Cortes: la referencia usa `max-width: Npx` (incluye N) y `max-[Npx]:` de Tailwind v4
// es `width < Npx`. Por eso se escribe N+1 (`max-[981px]:` ≡ max-width: 980px).
const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;
const FAQ_BORDER = ["border-l-neon-cyan", "border-l-neon-pink", "border-l-neon-yellow"];

// Landing "Inicio". Referencia: references/home-about/home.jsx + styles.css (.home-*).
// `leading-[1.5]`: el body de esa referencia usa line-height 1.5 (el resto de la app, `normal`).
export default function HomePage() {
  return (
    <main className="animate-fade-up relative z-[1] leading-[1.5]">
      {/* HERO */}
      <section className="relative flex min-h-[calc(100vh-60px)] items-center justify-center overflow-hidden px-8 pt-20 pb-[60px]">
        <FloatingSilhouettes />
        <div className="relative z-[3] max-w-[1100px] text-center">
          <div className="mb-6 font-pixel text-[11px] leading-[1.25] tracking-[0.24em] text-neon-yellow uppercase [text-shadow:0_0_6px_rgb(245_255_0/0.7),0_0_16px_rgb(245_255_0/0.4)]">
            ▸ INSERTA UNA MONEDA<span className="animate-blink">_</span>
          </div>

          <h1 className="m-0 flex flex-col gap-2 font-pixel text-[clamp(32px,7vw,88px)] leading-[1.05] font-normal tracking-[0.04em]">
            <span className="text-white [text-shadow:0_0_14px_rgb(255_255_255/0.4)]">
              EL ARCADE
            </span>
            <span className="bg-[linear-gradient(180deg,#00f5ff,#4dd0e1)] bg-clip-text text-transparent [filter:drop-shadow(0_0_14px_rgb(0_245_255/0.45))]">
              CLÁSICO ESTÁ
            </span>
            <span className="bg-[linear-gradient(180deg,#ff006e,#ff6b9e)] bg-clip-text text-transparent [filter:drop-shadow(0_0_14px_rgb(255_0_110/0.45))]">
              DE VUELTA
            </span>
          </h1>

          <p className="mx-auto mt-7 mb-9 max-w-[640px] text-[15px] leading-[1.7] tracking-[0.04em] text-home-dim">
            Juega los mejores clásicos directamente en tu navegador.
            <br />
            Sin descargas. Sin costo. Solo diversión.
          </p>

          <HeroCtas />

          <div
            aria-hidden="true"
            className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-pixel text-[9px] tracking-[0.2em] text-home-faint"
          >
            <span>DESLIZA</span>
            <span className="animate-bounce-soft text-neon-cyan">▼</span>
          </div>
        </div>
      </section>

      {/* // 01 — POR QUÉ */}
      <Reveal className={SECTION}>
        <SectionHead kicker="// 01" accent="magenta" title="¿POR QUÉ ARCADE VAULT?" />
        <div className="grid grid-cols-[repeat(4,1fr)] gap-[18px] max-[981px]:grid-cols-[repeat(2,1fr)] max-[521px]:grid-cols-[1fr]">
          {FEATURES.map((feature, i) => (
            <div key={feature.title} data-reveal-item style={delay(i * 80)}>
              <FeatureCard feature={feature} />
            </div>
          ))}
        </div>
      </Reveal>

      {/* // 02 — JUEGOS */}
      <Reveal className={SECTION}>
        <SectionHead kicker="// 02" accent="cyan" title="JUEGOS DISPONIBLES AHORA" />
        <div className="grid grid-cols-[repeat(6,minmax(0,1fr))] gap-4 max-[1101px]:grid-cols-[repeat(3,1fr)] max-[601px]:grid-cols-[repeat(2,1fr)]">
          {GAMES.map((game) => (
            <MiniCard key={game.id} game={game} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/biblioteca" className="btn-home btn-home-lg neon-cyan">
            VER TODOS LOS JUEGOS →
          </Link>
        </div>
      </Reveal>

      {/* ESTADÍSTICAS */}
      <Reveal className="relative overflow-hidden border-y border-home-line bg-[linear-gradient(180deg,#06060a,#0c0c14)] px-8 py-[60px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_50%,rgb(245_255_0/0.06),transparent_70%)]"
        />
        <div className="relative mx-auto grid max-w-[1200px] grid-cols-[repeat(3,1fr)] gap-8 max-[721px]:grid-cols-[1fr]">
          {STATS.map((stat, i) => (
            <div
              key={stat.unit}
              data-reveal-item
              style={delay(i * 90)}
              className="border-l border-home-line p-5 text-center first:border-l-0 max-[721px]:border-t max-[721px]:border-l-0 max-[721px]:first:border-t-0"
            >
              <div className="font-pixel text-[clamp(32px,5vw,56px)] tracking-[0.04em] text-neon-yellow [text-shadow:0_0_6px_rgb(245_255_0/0.7),0_0_16px_rgb(245_255_0/0.4)]">
                {stat.value}
              </div>
              <div className="mt-2.5 font-pixel text-[13px] leading-[1.25] tracking-[0.18em] text-home-ink uppercase">
                {stat.unit}
              </div>
              <div className="mt-2 text-[11px] tracking-[0.16em] text-home-faint uppercase">
                {stat.caption}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* // 03 — ACTIVIDAD */}
      <Reveal className={SECTION}>
        <SectionHead kicker="// 03" accent="yellow" title="ACTIVIDAD EN VIVO" />
        <div className="grid grid-cols-[1.2fr_1fr] gap-[18px] max-[901px]:grid-cols-[1fr]">
          <div className="border border-home-line bg-home-bg2">
            <div className="flex min-w-0 items-center justify-between gap-2.5 border-b border-home-line px-3.5 py-3">
              <div className="min-w-0 flex-auto overflow-hidden font-pixel text-[10px] leading-[1.25] tracking-[0.1em] text-ellipsis whitespace-nowrap text-neon-cyan uppercase [text-shadow:0_0_8px_rgb(0_245_255/0.5)]">
                ▸ ÚLTIMAS PUNTUACIONES
              </div>
            </div>
            <ActivityTicker />
          </div>

          <div className="border border-home-line bg-home-bg2">
            <div className="flex min-w-0 items-center justify-between gap-2.5 border-b border-home-line px-3.5 py-3">
              <div className="min-w-0 flex-auto overflow-hidden font-pixel text-[10px] leading-[1.25] tracking-[0.1em] text-ellipsis whitespace-nowrap text-neon-pink uppercase [text-shadow:0_0_8px_rgb(255_0_110/0.5)]">
                ▸ TOP JUGADORES · HOY
              </div>
              <Link
                href="/salon-de-la-fama"
                className="border border-home-line px-2.5 py-1.5 font-pixel text-[9px] tracking-[0.14em] text-home-dim no-underline hover:border-neon-pink hover:text-neon-pink hover:shadow-[0_0_8px_rgb(255_0_110/0.35)]"
              >
                VER SALÓN →
              </Link>
            </div>
            <TopPlayers />
          </div>
        </div>
      </Reveal>

      {/* // 04 — PRECIOS */}
      <Reveal className={SECTION}>
        <SectionHead kicker="// 04" accent="green" title="PRECIOS" />
        <div className="grid grid-cols-[1fr_1fr] items-stretch gap-6 max-[901px]:grid-cols-[1fr]">
          <div className="relative flex flex-col gap-3.5 border border-home-green bg-[linear-gradient(180deg,var(--color-home-bg2),#0a0e16)] px-7 py-8 shadow-[0_0_28px_rgb(0_255_136/0.18),inset_0_0_14px_rgb(0_255_136/0.08)] before:pointer-events-none before:absolute before:inset-1 before:border before:border-dashed before:border-[rgb(0_255_136/0.3)] before:content-['']">
            <div className="font-pixel text-[9px] leading-[1.25] tracking-[0.22em] text-home-dim uppercase">
              {PLAN.label}
            </div>
            <div className="font-pixel text-base leading-[1.25] tracking-[0.08em] text-home-green uppercase [text-shadow:0_0_10px_rgb(0_255_136/0.5)]">
              {PLAN.name}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2.5">
              <span className="bg-[linear-gradient(180deg,#fff,var(--color-home-green))] bg-clip-text font-pixel text-[64px] tracking-[0.02em] text-transparent [filter:drop-shadow(0_0_12px_rgb(0_255_136/0.5))]">
                {PLAN.price}
              </span>
              <span className="font-pixel text-[11px] tracking-[0.16em] text-home-dim">
                {PLAN.unit}
              </span>
            </div>
            <div className="font-pixel text-[9px] tracking-[0.18em] text-neon-yellow [text-shadow:0_0_6px_rgb(245_255_0/0.45)]">
              {PLAN.tag}
            </div>
            <ul className="mt-2.5 mb-1 flex list-none flex-col gap-2 p-0">
              {PLAN.perks.map((perk) => (
                <li
                  key={perk}
                  className="text-[13px] tracking-[0.02em] text-home-ink first-letter:text-home-green"
                >
                  {perk}
                </li>
              ))}
            </ul>
            <PlanCta />
            <div className="mt-1 text-center text-[11px] tracking-[0.1em] text-home-faint">
              {PLAN.foot}
            </div>
            <div
              aria-hidden="true"
              className="absolute -top-[18px] -right-[18px] z-[3] rotate-[14deg] border-2 border-neon-pink bg-[rgb(10_10_15/0.85)] px-[18px] py-2.5 text-center font-pixel text-[13px] leading-[1.15] tracking-[0.16em] text-neon-pink uppercase [text-shadow:0_0_8px_rgb(255_0_110/0.6)] shadow-[0_0_14px_rgb(255_0_110/0.35),inset_0_0_8px_rgb(255_0_110/0.2)]"
            >
              FREE
              <br />
              PLAY
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3.5">
            {FAQS.map((faq, i) => (
              <div
                key={faq.question}
                className={`border border-l-[3px] border-home-line bg-home-bg2 px-5 py-[18px] ${FAQ_BORDER[i]}`}
              >
                <div className="mb-2 font-pixel text-[10px] leading-[1.25] tracking-[0.12em] text-home-ink uppercase">
                  {faq.question}
                </div>
                <div className="text-[13px] leading-[1.6] text-home-dim">{faq.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* CIERRE */}
      <Reveal className="relative mx-auto max-w-[900px] px-8 pt-[100px] pb-[120px] text-center before:absolute before:top-[30px] before:left-1/2 before:h-px before:w-3/5 before:-translate-x-1/2 before:bg-[linear-gradient(90deg,transparent,var(--color-neon-cyan),transparent)] before:opacity-50 before:content-[''] after:absolute after:bottom-[30px] after:left-1/2 after:h-px after:w-3/5 after:-translate-x-1/2 after:bg-[linear-gradient(90deg,transparent,var(--color-neon-cyan),transparent)] after:opacity-50 after:content-['']">
        <h2 className="m-0 mb-9 bg-[linear-gradient(180deg,#fff,var(--color-neon-yellow))] bg-clip-text font-pixel text-[clamp(22px,4vw,40px)] leading-[1.25] font-normal tracking-[0.08em] text-transparent uppercase [filter:drop-shadow(0_0_12px_rgb(245_255_0/0.4))]">
          ¿LISTO PARA JUGAR?
        </h2>
        <Link
          href="/biblioteca"
          className="btn-home btn-home-xl btn-home-pulse neon-cyan"
        >
          INSERTAR MONEDA →
        </Link>
        <div className="mt-7 text-[13px] tracking-[0.06em] text-home-dim">
          Gratis. Sin registro obligatorio. Empieza en segundos.
        </div>
      </Reveal>
    </main>
  );
}
