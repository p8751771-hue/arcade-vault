import { HighlightIcon } from "@/components/about/highlight-icon";
import { ABOUT_MISSION, HIGHLIGHTS, type AboutAccent } from "@/lib/about";

// "Acerca de". Referencia: references/home-about/about.jsx + styles.css (.about-*).
// `leading-[1.5]`: el body de esa referencia usa line-height 1.5 (como la landing).
// Cortes: `max-[821px]:` ≡ max-width: 820px (Tailwind v4 usa <).

const ACCENT: Record<AboutAccent, string> = {
  magenta: "text-neon-pink",
  cyan: "text-neon-cyan",
  green: "text-home-green",
};

export default function AboutPage() {
  return (
    <main className="animate-fade-up relative z-[1] leading-[1.5]">
      {/* .about-hero */}
      <section className="mx-auto max-w-[1100px] px-8 pt-20 pb-10 text-center">
        <div className="mb-[18px] font-pixel text-[11px] leading-[1.25] tracking-[0.24em] text-neon-yellow uppercase [text-shadow:0_0_6px_rgb(245_255_0/0.7),0_0_16px_rgb(245_255_0/0.4)]">
          ▸ ACERCA DE
        </div>
        {/* h1 sin font-weight en la referencia ⇒ negrita del navegador */}
        <h1 className="m-0 bg-[linear-gradient(180deg,#fff,#00f5ff_80%)] bg-clip-text font-pixel text-[clamp(26px,5vw,52px)] font-bold tracking-[0.06em] text-transparent [filter:drop-shadow(0_0_14px_rgb(0_245_255/0.4))]">
          ACERCA DE ARCADE VAULT
        </h1>
        <p className="mx-auto mt-7 max-w-[720px] text-[15px] leading-[1.8] tracking-[0.03em] text-home-dim">
          {ABOUT_MISSION}
        </p>

        {/* .highlight-row */}
        <div className="mt-[52px] grid grid-cols-[repeat(3,1fr)] gap-[18px] max-[821px]:grid-cols-[1fr]">
          {HIGHLIGHTS.map((h, i) => (
            <div
              key={h.icon}
              style={{ transitionDelay: `${i * 80}ms` }}
              className={`flex items-center gap-4 border border-home-line bg-home-bg2 px-5 py-[18px] text-left transition-[transform,border-color,box-shadow] duration-[220ms] hover:[transform:translateY(-3px)] hover:border-current hover:shadow-[0_12px_28px_-14px_currentColor] ${ACCENT[h.accent]}`}
            >
              <HighlightIcon kind={h.icon} />
              <div className="font-pixel text-[10px] leading-[1.5] tracking-[0.1em] text-home-ink uppercase">
                {h.text}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
