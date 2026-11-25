import Image from "next/image";
import { CoinCabinet } from "@/components/history/coin-cabinet";
import { MilestoneBody } from "@/components/history/milestone-body";
import { SectionHead } from "@/components/home/section-head";
import { MILESTONES, STYLE_NOTE } from "@/lib/history";

// "Historia": los primeros arcades (1971–1982) y por qué Arcade Vault parece un
// televisor antiguo (spec 05). Mismo lenguaje que "Acerca de": cabecera centrada,
// secciones de 1100 px con SectionHead, paleta del spec 04. `leading-[1.5]` como el resto
// de páginas de references/home-about.
const SECTION = "mx-auto max-w-[1100px] px-8";

// Capturas propias del sitio (no material de juegos reales): la landing a 1280×900
// antes del spec 04 (neón) y después (televisor).
const SHOTS = [
  {
    src: "/historia/estilo-neon.png",
    alt: "Diseño original de Arcade Vault: tema neón sobre fondo negro",
    caption: "ANTES · NEÓN (2026)",
  },
  {
    src: "/historia/estilo-tv.png",
    alt: "Diseño actual de Arcade Vault: pantalla de televisor antiguo verde-gris",
    caption: "AHORA · TV (2026)",
  },
] as const;

export default function HistoryPage() {
  return (
    <main className="animate-fade-up relative z-[1] leading-[1.5]">
      {/* Cabecera */}
      <section className="mx-auto max-w-[1100px] px-8 pt-20 pb-10 text-center">
        <div className="mb-[18px] font-pixel text-[11px] leading-[1.25] tracking-[0.24em] text-crt-ink uppercase">
          ▸ HISTORIA
        </div>
        <h1 className="m-0 font-pixel text-[clamp(26px,5vw,52px)] font-bold tracking-[0.06em] text-crt-ink">
          ANTES DEL VAULT
        </h1>
        <p className="mx-auto mt-7 max-w-[720px] text-[15px] leading-[1.8] tracking-[0.03em] text-crt-ink-2">
          Entre 1971 y 1982 un puñado de máquinas de monedas inventó casi todo lo que hoy
          damos por hecho en un videojuego. Inserta una moneda y recorre aquellos años, máquina
          a máquina.
        </p>
      </section>

      {/* Cabina "inserta moneda" */}
      <section className={`${SECTION} mt-4`} aria-label="Cabina inserta moneda">
        <CoinCabinet />
      </section>

      {/* TODOS LOS HITOS: siempre visible y legible sin JavaScript */}
      <section className={`${SECTION} my-20`} aria-labelledby="todos-los-hitos">
        <SectionHead kicker="// 01" accent="cyan" title="TODOS LOS HITOS" id="todos-los-hitos" />
        <ol className="m-0 list-none border-t border-crt-line p-0">
          {MILESTONES.map((m) => (
            <li
              key={m.year}
              className="grid grid-cols-[120px_1fr] gap-6 border-b border-crt-line py-7 max-[601px]:grid-cols-[1fr] max-[601px]:gap-3"
            >
              <div className="font-pixel text-[24px] leading-none text-crt-ink">{m.year}</div>
              <div className="max-w-[72ch]">
                <MilestoneBody milestone={m} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* POR QUÉ PARECEMOS UN TELEVISOR: reseña del cambio de estilo del sitio */}
      <section className={`${SECTION} my-20`} aria-labelledby="por-que-tv">
        <SectionHead
          kicker="// 02"
          accent="cyan"
          title="POR QUÉ PARECEMOS UN TELEVISOR"
          id="por-que-tv"
        />
        <div className="flex max-w-[72ch] flex-col gap-4">
          {STYLE_NOTE.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="m-0 text-[15px] leading-[1.8] text-crt-ink">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-[repeat(2,1fr)] gap-6 max-[901px]:grid-cols-[1fr]">
          {SHOTS.map((shot) => (
            <figure key={shot.src} className="m-0">
              <Image
                src={shot.src}
                alt={shot.alt}
                width={1280}
                height={900}
                sizes="(max-width: 900px) 100vw, 520px"
                className="block h-auto w-full border-2 border-crt-ink"
              />
              <figcaption className="mt-3 font-pixel text-[9px] tracking-[0.16em] text-crt-ink-2">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
