import { ACCENT_COLOR } from "@/components/home/accent";
import type { Feature } from "@/lib/home";

// Iconos pixel de 16×16 de references/home-about/home.jsx (FeatureIcon).
function FeatureIcon({ kind }: { kind: Feature["icon"] }) {
  const C = "currentColor";
  const svg = "h-11 w-11 pixelated ";

  if (kind === "gamepad") {
    return (
      <svg className={svg} viewBox="0 0 16 16" aria-hidden="true">
        <g fill={C}>
          <rect x="2" y="6" width="12" height="6" />
          <rect x="0" y="8" width="2" height="4" />
          <rect x="14" y="8" width="2" height="4" />
          <rect x="3" y="8" width="2" height="2" />
          <rect x="2" y="9" width="4" height="0.5" />
          <rect x="11" y="7" width="1.5" height="1.5" />
          <rect x="11" y="10" width="1.5" height="1.5" />
        </g>
      </svg>
    );
  }
  if (kind === "free") {
    return (
      <svg className={svg} viewBox="0 0 16 16" aria-hidden="true">
        <g fill={C}>
          <rect x="3" y="3" width="10" height="10" fill="none" stroke={C} strokeWidth="1.5" />
          <rect x="5" y="6" width="1.5" height="4" />
          <rect x="5" y="6" width="4" height="1.5" />
          <rect x="5" y="8" width="3" height="1" />
          <rect x="10" y="6" width="1.5" height="4" />
        </g>
      </svg>
    );
  }
  if (kind === "trophy") {
    return (
      <svg className={svg} viewBox="0 0 16 16" aria-hidden="true">
        <g fill={C}>
          <rect x="3" y="2" width="10" height="2" />
          <rect x="3" y="2" width="2" height="6" />
          <rect x="11" y="2" width="2" height="6" />
          <rect x="5" y="8" width="6" height="2" />
          <rect x="7" y="10" width="2" height="3" />
          <rect x="5" y="13" width="6" height="1.5" />
          <rect x="1" y="3" width="2" height="3" />
          <rect x="13" y="3" width="2" height="3" />
        </g>
      </svg>
    );
  }
  return (
    <svg className={svg} viewBox="0 0 16 16" aria-hidden="true">
      <g fill={C}>
        <rect x="7" y="1" width="2" height="2" />
        <rect x="6" y="3" width="4" height="2" />
        <rect x="5" y="5" width="6" height="6" />
        <rect x="4" y="11" width="2" height="2" />
        <rect x="10" y="11" width="2" height="2" />
        <rect x="7" y="6" width="2" height="2" fill="var(--color-crt-surface)" />
        <rect x="6" y="13" width="1" height="2" />
        <rect x="9" y="13" width="1" height="2" />
      </g>
    </svg>
  );
}

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div
      className={`relative flex h-full flex-col gap-3.5 border border-crt-line bg-crt-surface px-5 py-6 transition-[transform,border-color] duration-[220ms] ease-[ease] hover:-translate-y-1.5 hover:border-current ${ACCENT_COLOR[feature.accent]}`}
    >
      <FeatureIcon kind={feature.icon} />
      <div className="font-pixel text-xs leading-[1.25] tracking-[0.1em] text-current uppercase">
        {feature.title}
      </div>
      <div className="text-[13px] leading-[1.6] text-crt-ink-2">{feature.description}</div>
    </div>
  );
}
