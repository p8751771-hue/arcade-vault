import { NEON_TEXT } from "@/components/home/accent";
import type { HomeAccent } from "@/lib/home";

// Cabecera de sección: kicker "// NN", título y regla (.section-head).
export function SectionHead({
  kicker,
  accent,
  title,
  id,
}: {
  kicker: string;
  accent: HomeAccent;
  title: string;
  /** Para enlazar la sección con aria-labelledby (spec 05). */
  id?: string;
}) {
  return (
    <div className="mb-9 flex items-center gap-[18px]">
      <div
        className={`font-pixel text-[11px] leading-[1.25] tracking-[0.22em] uppercase ${NEON_TEXT[accent]}`}
      >
        {kicker}
      </div>
      <h2 id={id} className="m-0 font-pixel text-[clamp(18px,2.8vw,28px)] font-normal tracking-[0.06em] text-crt-ink">
        {title}
      </h2>
      <div className="h-px flex-1 bg-[linear-gradient(90deg,var(--color-crt-line),transparent)]" />
    </div>
  );
}
