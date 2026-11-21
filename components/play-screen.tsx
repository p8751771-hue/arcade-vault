"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";
import type { Game } from "@/lib/games";

// Valores simulados de la cabina (sin juego real).
const SCORE = 0;
const LIVES = 3;
const LEVEL = 1;

const PAD_BUTTONS = [
  { label: "<", flex: 1 },
  { label: "^", flex: 1 },
  { label: "v", flex: 1 },
  { label: ">", flex: 1 },
  { label: "ACCIÓN", flex: 2.4 },
] as const;

function HudBox({
  label,
  value,
  color,
  className = "",
  glow,
}: {
  label: string;
  value: string;
  color: string;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`min-w-0 border-2 bg-panel px-3 py-[9px] ${className}`}
      style={{
        borderColor: color,
        boxShadow: glow ? "0 0 10px rgb(0 245 255 / 0.3)" : undefined,
      }}
    >
      <div className="mb-2 font-pixel text-[7px]" style={{ color }}>
        {label}
      </div>
      <div className="font-pixel text-sm text-white">{value}</div>
    </div>
  );
}

export function PlayScreen({ game }: { game: Game }) {
  const { user } = useSession();
  const player = user?.name ?? "INVITADO";

  return (
    <main className="animate-fade-slide relative z-[1] flex min-h-screen flex-col items-center gap-4 px-3.5 pt-3.5 pb-7">
      {/* HUD */}
      <div className="flex w-[min(100%,640px)] flex-wrap items-stretch justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2.5">
          <HudBox label="PUNTUACIÓN" value={String(SCORE)} color="#00f5ff" glow className="flex-[2_1_120px]" />
          <HudBox label="VIDAS" value={String(LIVES)} color="#ff006e" className="flex-[1_1_60px]" />
          <HudBox label="NIVEL" value={String(LEVEL)} color="#f5ff00" className="flex-[1_1_60px]" />
          <div className="min-w-0 flex-[2_1_110px] border-2 border-line bg-panel px-3 py-[9px]">
            <div className="mb-2 font-pixel text-[7px] text-ink-muted">JUGADOR</div>
            <div className="truncate text-base font-bold text-ink-bright">{player}</div>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            className="cursor-pointer border-2 border-neon-yellow bg-transparent px-3.5 font-pixel text-[10px] text-neon-yellow shadow-[0_0_10px_rgb(245_255_0/0.3)] hover:bg-neon-yellow hover:text-void active:scale-[0.92]"
          >
            PAUSA
          </button>
          <Link
            href={`/juegos/${game.id}`}
            className="flex cursor-pointer items-center border-2 border-neon-pink bg-transparent px-3.5 font-pixel text-[10px] text-neon-pink no-underline shadow-[0_0_10px_rgb(255_0_110/0.3)] hover:bg-neon-pink hover:text-void active:scale-[0.92]"
          >
            SALIR
          </Link>
        </div>
      </div>

      {/* Marco de la máquina */}
      <div
        className="w-[min(100%,640px)] rounded-[38px] p-[clamp(10px,3.2vw,24px)]"
        style={{
          background: "linear-gradient(150deg,#262633,#12121a 55%,#1b1b26)",
          boxShadow:
            "0 0 0 2px #34344a, 0 0 70px rgb(0 245 255 / 0.2), 0 30px 60px rgb(0 0 0 / 0.7), inset 0 2px 2px rgb(255 255 255 / 0.12), inset 0 -6px 14px rgb(0 0 0 / 0.6)",
        }}
      >
        <div
          className="relative aspect-square overflow-hidden rounded-[26px/22px] bg-black"
          style={{ boxShadow: "inset 0 0 0 3px #05050a, 0 0 36px rgb(0 245 255 / 0.28)" }}
        >
          {/* Pantalla placeholder: aún no hay juego */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-stage px-6 text-center">
            <div
              className="font-pixel text-[clamp(14px,4vw,24px)] leading-[1.4]"
              style={{ color: game.color, textShadow: `0 0 12px ${game.color}` }}
            >
              {game.title}
            </div>
            <div className="font-pixel text-[10px] leading-[1.8] text-ink-muted">
              EL JUEGO AÚN NO ESTÁ DISPONIBLE
            </div>
          </div>
          {/* Viñeta y scanlines de la pantalla */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgb(255 255 255 / 0.04) 0%, transparent 55%, rgb(0 0 0 / 0.6) 100%)",
              boxShadow: "inset 0 0 90px rgb(0 0 0 / 0.85)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(to bottom, rgb(0 0 0 / 0) 0, rgb(0 0 0 / 0) 2px, rgb(0 0 0 / 0.22) 3px)",
            }}
          />
        </div>
        <div className="flex items-center justify-between px-2.5 pt-3">
          <span className="font-pixel text-[8px] tracking-[2px] text-ink-faint">
            ARCADE VAULT
          </span>
          <span className="h-2.5 w-2.5 rounded-full bg-neon-pink shadow-[0_0_10px_#ff006e]" />
        </div>
      </div>

      {/* Botonera táctil: solo en móvil */}
      <div className="flex w-[min(100%,640px)] touch-none gap-2 select-none min-[760px]:hidden">
        {PAD_BUTTONS.map(({ label, flex }) => (
          <button
            key={label}
            type="button"
            style={{ flex }}
            className="min-h-14 cursor-pointer touch-none border-2 border-neon-cyan bg-panel font-pixel text-[13px] text-neon-cyan active:bg-neon-cyan active:text-void"
          >
            {label}
          </button>
        ))}
      </div>
    </main>
  );
}
