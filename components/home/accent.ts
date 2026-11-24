import type { HomeAccent } from "@/lib/home";

// Texto neón por acento, con los resplandores de references/home-about/styles.css
// (.neon-cyan, .neon-magenta, .neon-yellow, .neon-green). El verde de la landing
// es #00ff88, distinto del --color-neon-green del resto de la app.
export const NEON_TEXT: Record<HomeAccent, string> = {
  cyan: "text-neon-cyan [text-shadow:0_0_6px_rgb(0_245_255/0.65),0_0_16px_rgb(0_245_255/0.45)]",
  magenta:
    "text-neon-pink [text-shadow:0_0_6px_rgb(255_0_110/0.65),0_0_16px_rgb(255_0_110/0.45)]",
  yellow:
    "text-neon-yellow [text-shadow:0_0_6px_rgb(245_255_0/0.7),0_0_16px_rgb(245_255_0/0.4)]",
  green:
    "text-home-green [text-shadow:0_0_6px_rgb(0_255_136/0.6),0_0_16px_rgb(0_255_136/0.35)]",
};

// Color plano del acento (tarjetas de ventajas: el borde y el resplandor usan currentColor).
export const ACCENT_COLOR: Record<HomeAccent, string> = {
  cyan: "text-neon-cyan",
  magenta: "text-neon-pink",
  yellow: "text-neon-yellow",
  green: "text-home-green",
};
