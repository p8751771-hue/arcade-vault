import type { ReactNode } from "react";

// Siluetas pixel-art decorativas del hero (references/home-about/home.jsx).
// Solo adorno: aria-hidden. El flotado se apaga solo con prefers-reduced-motion
// (regla global de globals.css).

function Silo({
  className,
  viewBox,
  children,
}: {
  className: string;
  viewBox: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={`pixelated animate-float absolute [filter:drop-shadow(0_0_10px_currentColor)] ${className}`}
    >
      {children}
    </svg>
  );
}

export function FloatingSilhouettes() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] opacity-[0.55]"
    >
      {/* Invasor */}
      <Silo viewBox="0 0 40 32" className="top-[14%] left-[8%] w-20 text-neon-cyan">
        <g fill="#00f5ff">
          <rect x="6" y="4" width="4" height="4" />
          <rect x="30" y="4" width="4" height="4" />
          <rect x="2" y="8" width="36" height="4" />
          <rect x="2" y="12" width="4" height="4" />
          <rect x="14" y="12" width="4" height="4" />
          <rect x="22" y="12" width="4" height="4" />
          <rect x="34" y="12" width="4" height="4" />
          <rect x="2" y="16" width="36" height="4" />
          <rect x="6" y="20" width="4" height="4" />
          <rect x="30" y="20" width="4" height="4" />
        </g>
      </Silo>

      {/* Fantasma */}
      <Silo
        viewBox="0 0 32 32"
        className="top-[22%] right-[10%] w-[72px] text-neon-pink [animation-delay:-1.5s]"
      >
        <g fill="#ff006e">
          <rect x="8" y="0" width="16" height="4" />
          <rect x="4" y="4" width="24" height="4" />
          <rect x="0" y="8" width="32" height="12" />
          <rect x="0" y="20" width="6" height="6" />
          <rect x="10" y="20" width="4" height="6" />
          <rect x="18" y="20" width="4" height="6" />
          <rect x="26" y="20" width="6" height="6" />
        </g>
      </Silo>

      {/* Cangrejo */}
      <Silo
        viewBox="0 0 32 32"
        className="bottom-[18%] left-[12%] w-[88px] text-neon-yellow [animation-delay:-3s]"
      >
        <g fill="#f5ff00">
          <rect x="10" y="0" width="12" height="4" />
          <rect x="6" y="4" width="20" height="4" />
          <rect x="4" y="8" width="6" height="6" />
          <rect x="22" y="8" width="6" height="6" />
          <rect x="2" y="14" width="28" height="10" />
          <rect x="6" y="24" width="4" height="4" />
          <rect x="14" y="24" width="4" height="4" />
          <rect x="22" y="24" width="4" height="4" />
        </g>
      </Silo>

      {/* Mira */}
      <Silo
        viewBox="0 0 24 24"
        className="right-[14%] bottom-[22%] w-[60px] text-[#00ff88] [animation-delay:-4.5s]"
      >
        <g fill="#00ff88">
          <rect x="10" y="0" width="4" height="24" />
          <rect x="0" y="10" width="24" height="4" />
          <rect
            x="6"
            y="6"
            width="12"
            height="12"
            fill="none"
            stroke="#00ff88"
            strokeWidth="2"
          />
        </g>
      </Silo>

      {/* Platillo */}
      <Silo
        viewBox="0 0 36 24"
        className="top-[38%] left-[4%] w-[70px] text-[#aa00ff] [animation-delay:-2s]"
      >
        <g fill="#aa00ff">
          <rect x="14" y="2" width="8" height="4" />
          <rect x="10" y="6" width="16" height="4" />
          <rect x="4" y="10" width="28" height="4" />
          <rect x="0" y="14" width="36" height="4" />
          <rect x="6" y="18" width="4" height="2" />
          <rect x="16" y="18" width="4" height="2" />
          <rect x="26" y="18" width="4" height="2" />
        </g>
      </Silo>

      {/* Moneda */}
      <Silo
        viewBox="0 0 20 20"
        className="top-[8%] left-[46%] w-11 text-[#ffcf3a] [animation-delay:-3.5s]"
      >
        <g fill="#ffcf3a">
          <rect x="6" y="0" width="8" height="2" />
          <rect x="2" y="2" width="16" height="2" />
          <rect x="0" y="4" width="20" height="12" />
          <rect x="2" y="16" width="16" height="2" />
          <rect x="6" y="18" width="8" height="2" />
          <rect x="8" y="4" width="4" height="12" fill="#0a0a0f" />
        </g>
      </Silo>

      {/* Corazón */}
      <Silo
        viewBox="0 0 24 22"
        className="bottom-[12%] left-[42%] w-[52px] text-[#ff3060] [animation-delay:-1s]"
      >
        <g fill="#ff3060">
          <rect x="2" y="2" width="6" height="2" />
          <rect x="16" y="2" width="6" height="2" />
          <rect x="0" y="4" width="10" height="4" />
          <rect x="14" y="4" width="10" height="4" />
          <rect x="0" y="8" width="24" height="4" />
          <rect x="2" y="12" width="20" height="2" />
          <rect x="4" y="14" width="16" height="2" />
          <rect x="6" y="16" width="12" height="2" />
          <rect x="8" y="18" width="8" height="2" />
          <rect x="10" y="20" width="4" height="2" />
        </g>
      </Silo>

      {/* Cruceta */}
      <Silo
        viewBox="0 0 24 24"
        className="top-1/2 right-[4%] w-[60px] text-[#00d4ff] [animation-delay:-5s]"
      >
        <g fill="#00d4ff">
          <rect x="8" y="2" width="8" height="6" />
          <rect x="2" y="8" width="20" height="8" />
          <rect x="8" y="16" width="8" height="6" />
          <rect x="11" y="6" width="2" height="2" fill="#0a0a0f" />
          <rect x="11" y="16" width="2" height="2" fill="#0a0a0f" />
          <rect x="4" y="11" width="2" height="2" fill="#0a0a0f" />
          <rect x="18" y="11" width="2" height="2" fill="#0a0a0f" />
        </g>
      </Silo>
    </div>
  );
}
