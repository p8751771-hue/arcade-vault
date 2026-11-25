"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/components/session-provider";
import { submitScore } from "@/lib/api";
import type { Game } from "@/lib/games";
import { formatScore } from "@/lib/scores";

type PlayPhase = "loading" | "running" | "paused" | "over";
type SaveState = "idle" | "saving" | "typing" | "done";

// Valores simulados de la cabina (sin juego real).
const SCORE = 0;
const LIVES = 3;
const LEVEL = 1;

const LOADING_MS = 1100;
const SAVING_MS = 900;
const TYPING_MS = 70;
const SAVED_MESSAGE = "PUNTUACIÓN GUARDADA";

// El botón de depuración no debe llegar al usuario final.
const SHOW_SIMULATE_END = process.env.NODE_ENV !== "production";

const PAD_BUTTONS = [
  { label: "<", flex: 1 },
  { label: "^", flex: 1 },
  { label: "v", flex: 1 },
  { label: ">", flex: 1 },
  { label: "ACCIÓN", flex: 2.4 },
] as const;

function PixelSpinner({ rgb, className = "" }: { rgb: string; className?: string }) {
  const color = `rgb(${rgb})`;
  const tone = (a: number) => `rgb(${rgb} / ${a})`;
  return (
    <div
      aria-hidden="true"
      className={`animate-px-spin relative h-11 w-11 ${className}`}
    >
      <div
        className="absolute top-[19px] left-[19px] h-1.5 w-1.5"
        style={{
          background: color,
          boxShadow: `16px 0 0 ${color}, 11px 11px 0 ${tone(0.75)}, 0 16px 0 ${tone(0.55)}, -11px 11px 0 ${tone(0.38)}, -16px 0 0 ${tone(0.24)}, -11px -11px 0 ${tone(0.12)}`,
        }}
      />
    </div>
  );
}

// Spec 04: los marcadores del HUD comparten la paleta (borde crt-ink, etiqueta crt-ink-2);
// antes cada uno tenía su neón (cian, magenta, amarillo) y el de puntuación brillaba.
function HudBox({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`min-w-0 border-2 border-crt-ink bg-crt-surface px-3 py-[9px] ${className}`}>
      <div className="mb-2 font-pixel text-[7px] text-crt-ink-2">
        {label}
      </div>
      <div className="font-pixel text-sm text-crt-ink">{value}</div>
    </div>
  );
}

export function PlayScreen({ game }: { game: Game }) {
  const { user } = useSession();
  const player = user?.name ?? "INVITADO";

  const [phase, setPhase] = useState<PlayPhase>("loading");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [typed, setTyped] = useState("");
  const saveTimers = useRef<{ save?: number; type?: number }>({});

  const finalScore = game.baseScore / 2;

  const clearSaveTimers = useCallback(() => {
    window.clearTimeout(saveTimers.current.save);
    window.clearInterval(saveTimers.current.type);
    saveTimers.current = {};
  }, []);

  // Carga simulada: cada vez que se entra en "loading" pasan ~1,1 s.
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = window.setTimeout(() => setPhase("running"), LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => clearSaveTimers, [clearSaveTimers]);

  // Pausa solo desde "running" / "paused": ignora la carga y el modal de fin.
  const togglePause = useCallback(() => {
    setPhase((p) => (p === "running" ? "paused" : p === "paused" ? "running" : p));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "KeyP" || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      togglePause();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePause]);

  const simulateEnd = () => {
    if (phase !== "running" && phase !== "paused") return;
    setPhase("over");
  };

  const restart = () => {
    clearSaveTimers();
    setSaveState("idle");
    setTyped("");
    setPhase("loading");
  };

  const save = () => {
    if (saveState !== "idle") return;
    setSaveState("saving");
    saveTimers.current.save = window.setTimeout(async () => {
      await submitScore(game.id, player, finalScore, !!user);
      setTyped("");
      setSaveState("typing");
      let n = 0;
      saveTimers.current.type = window.setInterval(() => {
        n += 1;
        setTyped(SAVED_MESSAGE.slice(0, n));
        if (n >= SAVED_MESSAGE.length) {
          window.clearInterval(saveTimers.current.type);
          setSaveState("done");
        }
      }, TYPING_MS);
    }, SAVING_MS);
  };

  return (
    <main className="animate-fade-slide relative z-[1] flex min-h-screen flex-col items-center gap-4 px-3.5 pt-3.5 pb-7">
      {/* HUD */}
      <div className="flex w-[min(100%,640px)] flex-wrap items-stretch justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2.5">
          <HudBox label="PUNTUACIÓN" value={String(SCORE)} className="flex-[2_1_120px]" />
          <HudBox label="VIDAS" value={String(LIVES)} className="flex-[1_1_60px]" />
          <HudBox label="NIVEL" value={String(LEVEL)} className="flex-[1_1_60px]" />
          <div className="min-w-0 flex-[2_1_110px] border-2 border-crt-line bg-crt-surface px-3 py-[9px]">
            <div className="mb-2 font-pixel text-[7px] text-crt-ink-2">JUGADOR</div>
            <div className="truncate text-base font-bold text-crt-ink">{player}</div>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={togglePause}
            className="cursor-pointer border-2 border-crt-ink bg-transparent px-3.5 font-pixel text-[10px] text-crt-ink hover:bg-crt-ink hover:text-crt-invert active:scale-[0.92]"
          >
            {phase === "paused" ? "REANUDAR" : "PAUSA"}
          </button>
          <Link
            href={`/juegos/${game.id}`}
            className="flex cursor-pointer items-center border-2 border-crt-ink bg-transparent px-3.5 font-pixel text-[10px] text-crt-ink no-underline hover:bg-crt-ink hover:text-crt-invert active:scale-[0.92]"
          >
            SALIR
          </Link>
        </div>
      </div>

      {/* Marco de la máquina */}
      <div
        className="w-[min(100%,640px)] rounded-[38px] p-[clamp(10px,3.2vw,24px)]"
        style={{
          // Spec 04: marco del televisor en la paleta; solo sombras negras.
          background: "var(--color-crt-surface)",
          boxShadow:
            "0 0 0 2px rgb(0 0 0 / 0.65), 0 30px 60px rgb(0 0 0 / 0.35), inset 0 -6px 14px rgb(0 0 0 / 0.2)",
        }}
      >
        <div
          className="relative aspect-square overflow-hidden rounded-[26px/22px] bg-crt-well"
          style={{ boxShadow: "inset 0 0 0 3px rgb(0 0 0 / 0.65)" }}
        >
          {/* Pantalla placeholder: aún no hay juego */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-crt-well px-6 text-center">
            <div className="font-pixel text-[clamp(14px,4vw,24px)] leading-[1.4] text-crt-ink">
              {game.title}
            </div>
            <div className="font-pixel text-[10px] leading-[1.8] text-crt-ink-2">
              EL JUEGO AÚN NO ESTÁ DISPONIBLE
            </div>
          </div>
          {/* Viñeta y scanlines de la pantalla */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, transparent 55%, rgb(0 0 0 / 0.25) 100%)",
              boxShadow: "inset 0 0 60px rgb(0 0 0 / 0.3)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(to bottom, rgb(0 0 0 / 0) 0, rgb(0 0 0 / 0) 2px, rgb(0 0 0 / 0.08) 3px)",
            }}
          />
          {phase === "loading" && (
            <div
              role="status"
              className="absolute inset-0 flex flex-col items-center justify-center gap-[22px] overflow-hidden bg-crt-well"
            >
              <div
                aria-hidden="true"
                className="animate-wipe absolute inset-x-0 top-0 h-2/5"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgb(0 0 0 / 0.12), transparent)",
                }}
              />
              <PixelSpinner rgb="0 0 0" />
              <div className="animate-blink relative font-pixel text-xs text-crt-ink">
                CARGANDO...
              </div>
            </div>
          )}
          {phase === "paused" && (
            <div
              role="status"
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-crt-well/90"
            >
              <div className="font-pixel text-[26px] text-crt-ink">
                PAUSA
              </div>
              <div className="text-[15px] text-crt-ink-2">Pulsa REANUDAR o la tecla P</div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-2.5 pt-3">
          <span className="font-pixel text-[8px] tracking-[2px] text-crt-ink-2">
            ARCADE VAULT
          </span>
          <span className="h-2.5 w-2.5 rounded-full bg-crt-ink" />
        </div>
      </div>

      {/* Botonera táctil: solo en móvil y oculta con el modal abierto */}
      {phase !== "over" && (
        <div className="flex w-[min(100%,640px)] touch-none gap-2 select-none min-[760px]:hidden">
          {PAD_BUTTONS.map(({ label, flex }) => (
            <button
              key={label}
              type="button"
              style={{ flex }}
              className="min-h-14 cursor-pointer touch-none border-2 border-crt-ink bg-crt-surface px-1.5 py-px font-pixel text-[13px] text-crt-ink active:bg-crt-ink active:text-crt-invert"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {SHOW_SIMULATE_END && phase !== "over" && (
        <button
          type="button"
          onClick={simulateEnd}
          className="btn-crt text-[9px]"
        >
          SIMULAR FIN DE PARTIDA
        </button>
      )}

      {phase === "over" && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-over-title"
            className="animate-modal-in flex w-full max-w-[480px] flex-col items-center gap-5 border-[3px] border-crt-ink bg-crt-surface px-6 py-[30px] text-center"
          >
            <div
              id="game-over-title"
              className="animate-flicker font-pixel text-[clamp(20px,5vw,28px)] text-crt-ink"
            >
              FIN DEL JUEGO
            </div>
            <div className="font-pixel text-[9px] text-crt-ink-2">PUNTUACIÓN FINAL</div>
            <div className="font-pixel text-[clamp(24px,7vw,36px)] text-crt-ink">
              {formatScore(finalScore)}
            </div>

            {saveState === "idle" && (
              <div className="flex w-full flex-col gap-2.5">
                <button
                  type="button"
                  autoFocus
                  onClick={save}
                  className="btn-crt-solid p-[15px] text-[11px]"
                >
                  GUARDAR PUNTUACIÓN
                </button>
                <span className="text-sm text-crt-ink-2">
                  {user
                    ? "Se enviará a tu cuenta (conexión con el servidor)."
                    : "Modo invitado: se guardará solo en este dispositivo."}
                </span>
              </div>
            )}
            {saveState === "saving" && (
              <div role="status" className="flex h-[52px] items-center gap-3.5">
                <PixelSpinner rgb="0 0 0" className="scale-[0.7]" />
                <span className="font-pixel text-[10px] text-crt-ink">GUARDANDO...</span>
              </div>
            )}
            {(saveState === "typing" || saveState === "done") && (
              <div
                role="status"
                aria-label={saveState === "done" ? SAVED_MESSAGE : undefined}
                className="flex h-[52px] items-center font-pixel text-[clamp(11px,3vw,14px)] text-crt-ink"
              >
                {typed}
                <span
                  aria-hidden="true"
                  className="animate-blink ml-1 inline-block h-4 w-2.5 bg-crt-ink"
                />
              </div>
            )}

            <div className="flex w-full flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={restart}
                className="btn-crt flex-[1_1_150px] leading-[1.5]"
              >
                JUGAR DE NUEVO
              </button>
              <Link
                href="/biblioteca"
                className="btn-crt flex-[1_1_150px] text-center leading-[1.5] no-underline hover:text-crt-invert"
              >
                VOLVER AL VAULT
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
