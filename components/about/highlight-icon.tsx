import type { HighlightIcon as HighlightIconKind } from "@/lib/about";

// Iconos pixel de los destacados (`HighlightIcon` de references/home-about/about.jsx).
// Heredan el color del destacado (currentColor). `.hl-icon`: 36 px, resplandor y sin suavizado.
const ICON =
  "h-9 w-9 flex-none [image-rendering:pixelated]";

export function HighlightIcon({ kind }: { kind: HighlightIconKind }) {
  const C = "currentColor";
  if (kind === "heart") {
    return (
      <svg className={ICON} viewBox="0 0 16 16" aria-hidden="true">
        <g fill={C}>
          <rect x="2" y="3" width="4" height="2" />
          <rect x="10" y="3" width="4" height="2" />
          <rect x="1" y="4" width="2" height="4" />
          <rect x="13" y="4" width="2" height="4" />
          <rect x="2" y="8" width="2" height="2" />
          <rect x="12" y="8" width="2" height="2" />
          <rect x="3" y="9" width="10" height="2" />
          <rect x="4" y="11" width="8" height="2" />
          <rect x="5" y="12" width="6" height="2" />
          <rect x="6" y="13" width="4" height="1" />
          <rect x="7" y="14" width="2" height="1" />
        </g>
      </svg>
    );
  }
  if (kind === "browser") {
    return (
      <svg className={ICON} viewBox="0 0 16 16" aria-hidden="true">
        <g fill={C}>
          <rect x="1" y="2" width="14" height="12" fill="none" stroke={C} strokeWidth="1.4" />
          <rect x="1" y="2" width="14" height="3" />
          <rect x="3" y="3" width="1" height="1" fill="var(--color-crt-surface)" />
          <rect x="5" y="3" width="1" height="1" fill="var(--color-crt-surface)" />
          <rect x="7" y="3" width="1" height="1" fill="var(--color-crt-surface)" />
          <rect x="3" y="7" width="4" height="1" />
          <rect x="3" y="9" width="6" height="1" />
          <rect x="3" y="11" width="3" height="1" />
        </g>
      </svg>
    );
  }
  return (
    <svg className={ICON} viewBox="0 0 16 16" aria-hidden="true">
      <g fill={C}>
        <rect x="7" y="2" width="2" height="10" />
        <rect x="4" y="4" width="3" height="2" />
        <rect x="9" y="6" width="3" height="2" />
        <rect x="3" y="3" width="2" height="2" />
        <rect x="11" y="5" width="2" height="2" />
        <rect x="3" y="12" width="10" height="2" />
        <rect x="4" y="14" width="8" height="1" />
      </g>
    </svg>
  );
}

/** Marca del corazón dentro de los textos de lib/about.ts ("HECHO CON ♥︎ PARA JUGADORES"). */
export const HEART_MARK = "♥︎";

/**
 * Corazón pixel-art de 7×6 del alto de la letra (1em), en el color del texto.
 * Sustituye al emoji ❤️ de la referencia, que el sistema pinta en rojo (spec 04, paso 12).
 */
export function InlineHeart() {
  return (
    <svg
      role="img"
      aria-label="corazón"
      viewBox="0 0 7 6"
      shapeRendering="crispEdges"
      className="inline-block h-[1em] w-[1.1667em] align-[-0.1em]"
    >
      <path
        fill="currentColor"
        d="M1 0h2v1h1v-1h2v1h1v2h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-2h1z"
      />
    </svg>
  );
}

/** Pinta un texto de lib/about.ts cambiando HEART_MARK por <InlineHeart />. */
export function withPixelHeart(text: string) {
  const parts = text.split(HEART_MARK);
  return parts.flatMap((part, i) => (i === 0 ? [part] : [<InlineHeart key={i} />, part]));
}
