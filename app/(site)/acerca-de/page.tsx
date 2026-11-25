import { ContactForm } from "@/components/about/contact-form";
import { HighlightIcon, withPixelHeart } from "@/components/about/highlight-icon";
import { Reveal } from "@/components/home/reveal";
import {
  ABOUT_MISSION,
  CONTACT_TIPS,
  HIGHLIGHTS,
  type AboutAccent,
  type ContactTip,
} from "@/lib/about";

// "Acerca de". Referencia: references/home-about/about.jsx + styles.css (.about-*).
// `leading-[1.5]`: el body de esa referencia usa line-height 1.5 (como la landing).
// Cortes: `max-[821px]:` ≡ max-width: 820px y `max-[901px]:` ≡ max-width: 900px
// (Tailwind v4 usa <).

const ACCENT: Record<AboutAccent, string> = {
  magenta: "text-crt-ink",
  cyan: "text-crt-ink",
  green: "text-crt-ink",
};

// Spec 04: LED de los consejos y píxeles del divisor en la paleta (antes verde/amarillo/
// magenta y cian/magenta/amarillo). El LED sigue el dato `led`, sin uso visual distinto.
const LED: Record<ContactTip["led"], string> = {
  green: "bg-crt-ink",
  yellow: "bg-crt-ink",
  magenta: "bg-crt-ink",
};

// .div-pixels span: cada 3.º y cada 5.º píxel en tono de línea para conservar el ritmo.
function pixelColor(n: number) {
  if (n % 5 === 0 || n % 3 === 0) return "bg-crt-line";
  return "bg-crt-ink";
}

export default function AboutPage() {
  return (
    <main className="animate-fade-up relative z-[1] leading-[1.5]">
      {/* .about-hero */}
      <section className="mx-auto max-w-[1100px] px-8 pt-20 pb-10 text-center">
        <div className="mb-[18px] font-pixel text-[11px] leading-[1.25] tracking-[0.24em] text-crt-ink uppercase">
          ▸ ACERCA DE
        </div>
        {/* h1 sin font-weight en la referencia ⇒ negrita del navegador */}
        <h1 className="m-0 font-pixel text-[clamp(26px,5vw,52px)] font-bold tracking-[0.06em] text-crt-ink">
          ACERCA DE ARCADE VAULT
        </h1>
        <p className="mx-auto mt-7 max-w-[720px] text-[15px] leading-[1.8] tracking-[0.03em] text-crt-ink-2">
          {ABOUT_MISSION}
        </p>

        {/* .highlight-row */}
        <div className="mt-[52px] grid grid-cols-[repeat(3,1fr)] gap-[18px] max-[821px]:grid-cols-[1fr]">
          {HIGHLIGHTS.map((h, i) => (
            <div
              key={h.icon}
              style={{ transitionDelay: `${i * 80}ms` }}
              className={`flex items-center gap-4 border border-crt-line bg-crt-surface px-5 py-[18px] text-left transition-[transform,border-color,box-shadow] duration-[220ms] hover:[transform:translateY(-3px)] hover:border-current ${ACCENT[h.accent]}`}
            >
              <HighlightIcon kind={h.icon} />
              <div className="font-pixel text-[10px] leading-[1.5] tracking-[0.1em] text-crt-ink uppercase">
                {withPixelHeart(h.text)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* .about-divider (decorativo) */}
      <Reveal
        as="div"
        aria-hidden
        className="mx-auto my-[60px] flex max-w-[1200px] items-center gap-4 px-8"
      >
        <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--color-crt-line),transparent)]" />
        <div className="flex gap-1">
          {Array.from({ length: 24 }, (_, i) => (
            <span
              key={i}
              style={{ animationDelay: `${i * 80}ms` }}
              className={`h-1.5 w-1.5 animate-px-blink ${pixelColor(i + 1)}`}
            />
          ))}
        </div>
        <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,var(--color-crt-line),transparent)]" />
      </Reveal>

      {/* .about-contact */}
      <Reveal className="mx-auto mb-20 max-w-[1200px] px-8">
        <div className="grid grid-cols-[1fr_1.2fr] items-start gap-10 max-[901px]:grid-cols-[1fr] max-[901px]:gap-6">
          {/* .contact-intro */}
          <div>
            <div className="mb-3.5 font-pixel text-[11px] leading-[1.25] tracking-[0.24em] text-crt-ink uppercase">
              ▸ CONTACTO
            </div>
            {/* h2 sin font-weight en la referencia ⇒ negrita del navegador */}
            <h2 className="m-0 font-pixel text-[clamp(22px,3.5vw,36px)] font-bold tracking-[0.06em] text-crt-ink">
              CONTÁCTANOS
            </h2>
            <p className="mt-[18px] mb-6 text-[14px] leading-[1.7] text-crt-ink-2">
              ¿Tienes alguna sugerencia, quieres proponer un juego, o simplemente quieres
              saludar? Escríbenos.
            </p>
            <div className="flex flex-col gap-2.5">
              {CONTACT_TIPS.map((tip) => (
                <div
                  key={tip.text}
                  className="flex items-center gap-2.5 font-pixel text-[9px] tracking-[0.14em] text-crt-ink-2"
                >
                  <span className={`h-2 w-2 rounded-full ${LED[tip.led]}`} />
                  {tip.text}
                </div>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </Reveal>
    </main>
  );
}
