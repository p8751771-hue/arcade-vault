"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { MilestoneBody } from "@/components/history/milestone-body";
import { MILESTONES } from "@/lib/history";

// Cabina "inserta moneda" (spec 05). Una pantalla de televisor muestra un hito; "INSERTAR
// MONEDA" (→ / Enter) avanza y "CANAL ANTERIOR" (←) retrocede. En el último hito el botón
// pasa a "VOLVER A 1971". Al cambiar de hito, 250 ms de ruido de "cambio de canal"
// (instantáneo con prefers-reduced-motion). El hito nuevo se anuncia por aria-live.
// No guarda la posición ni avanza sola.

const SWITCH_MS = 250;
const LAST = MILESTONES.length - 1;

// El ruido SVG de la capa de televisor (spec 04), con opacidad completa para que se vea
// como estática; la capa que lo contiene va a opacidad 0,6.
const STATIC =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 1.4 -0.4'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

export function CoinCabinet() {
  const [index, setIndex] = useState(0);
  const [switching, setSwitching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (next: number) => {
    if (next === index || next < 0 || next > LAST) return;
    setIndex(next);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setSwitching(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSwitching(false), SWITCH_MS);
  };

  const insertCoin = () => go(index === LAST ? 0 : index + 1);
  const previous = () => go(index - 1);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Enter sobre un botón ya lo activa el propio botón: no se duplica.
    if (e.key === "Enter" && (e.target as HTMLElement).closest("button")) return;
    if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      insertCoin();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      previous();
    }
  };

  const m = MILESTONES[index];

  return (
    <div
      onKeyDown={onKeyDown}
      className="mx-auto w-full max-w-[820px] rounded-[28px] bg-crt-surface p-[clamp(12px,3vw,22px)]"
      style={{
        boxShadow: "0 0 0 2px rgb(0 0 0 / 0.65), 0 24px 48px rgb(0 0 0 / 0.3), inset 0 -6px 14px rgb(0 0 0 / 0.2)",
      }}
    >
      {/* Pantalla: enfocable para usar las flechas sin pulsar antes un botón */}
      <div
        tabIndex={0}
        role="group"
        aria-roledescription="cabina"
        aria-label="Cabina de la historia: usa las flechas o los botones para cambiar de año"
        className="relative min-h-[360px] overflow-hidden rounded-[20px/16px] bg-crt-well px-[clamp(18px,4vw,40px)] py-[clamp(20px,4vw,36px)] max-[601px]:min-h-[440px]"
        style={{ boxShadow: "inset 0 0 0 3px rgb(0 0 0 / 0.65), inset 0 0 60px rgb(0 0 0 / 0.25)" }}
      >
        <div aria-live="polite" aria-atomic="true">
          <div className="mb-5 font-pixel text-[40px] leading-none text-crt-ink max-[601px]:text-[24px]">
            {m.year}
          </div>
          <MilestoneBody milestone={m} />
        </div>
        {switching && (
          <div
            data-channel-noise
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-crt-well"
          >
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: STATIC }} />
          </div>
        )}
      </div>

      {/* Mandos */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1 pt-4">
        <button
          type="button"
          onClick={previous}
          disabled={index === 0}
          className="btn-cut btn-cut-ghost disabled:cursor-not-allowed disabled:opacity-50"
        >
          CANAL ANTERIOR
        </button>
        <span className="font-pixel text-[10px] tracking-[0.16em] text-crt-ink">
          CRÉDITO {index + 1}/{MILESTONES.length}
        </span>
        <button type="button" onClick={insertCoin} className="btn-cut">
          {index === LAST ? "VOLVER A 1971" : "INSERTAR MONEDA"}
        </button>
      </div>
    </div>
  );
}
