"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { MagnetHalo, type MagnetPointer } from "./magnet-halo";
import {
  MAGNET_DURATION_MS,
  MAGNET_LABEL,
  MAGNET_LABEL_MS,
  type MagnetState,
} from "@/lib/magnet";

// Spec 10. Capa que cubre la pantalla del juego: pone el puntero de imán, muestra
// el cartel "NO PRESIONES EL CLIC IZQUIERDO" y, con un clic izquierdo, inicia el
// efecto de 10 s. No toca el juego ni el motor. Solo con ratón: en un dispositivo
// táctil no hay puntero que cambiar ni cartel.
const MOUSE_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeMouse(onChange: () => void) {
  const query = window.matchMedia(MOUSE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const readMouse = () => window.matchMedia(MOUSE_QUERY).matches;
const serverMouse = () => false;

// Margen para que el cartel no se salga por la derecha de la pantalla.
const LABEL_WIDTH_GUESS = 250;

export function MagnetLayer({
  enabled,
  gameCanvas,
  state,
  onTrigger,
  onFinish,
}: {
  /** La pantalla tiene un juego real y la partida está en marcha o en pausa. */
  enabled: boolean;
  /** Canvas del juego: el efecto lo copia, no lo modifica. */
  gameCanvas: RefObject<HTMLCanvasElement | null>;
  state: MagnetState;
  /** Clic izquierdo con el ratón en estado "idle". */
  onTrigger: () => void;
  /** Han pasado los 10 s del efecto. */
  onFinish: () => void;
}) {
  const hasMouse = useSyncExternalStore(subscribeMouse, readMouse, serverMouse);
  const active = enabled && hasMouse;

  // Fin del efecto. Si la capa se desactiva (fin de partida) o se desmonta, el
  // temporizador se cancela y el diálogo no llega a abrirse.
  useEffect(() => {
    if (state !== "active" || !enabled) return;
    const timer = window.setTimeout(onFinish, MAGNET_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [state, enabled, onFinish]);

  // Cartel junto al puntero: aparece al mover el ratón y se oculta tras 1,5 s sin
  // moverlo, al salir de la pantalla y mientras dura el efecto.
  const [label, setLabel] = useState<{
    x: number;
    y: number;
    left: boolean;
  } | null>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const hideLabel = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    setLabel(null);
  }, []);
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  // Dónde está el puntero, para que el halo lo siga. Es una referencia y no un
  // estado: el halo lo lee en su propio bucle y no hace falta renderizar.
  const pointer = useRef<MagnetPointer>({ x: 0, y: 0, inside: false });

  if (!active) return null;
  const showLabel = state === "idle" && label !== null;

  return (
    <div
      // Capa de captura: recibe el ratón y no dibuja nada.
      className="absolute inset-0 z-[5]"
      // Si la imagen del cursor no carga, `crosshair`.
      style={{ cursor: "url(/cursors/iman.svg) 16 16, crosshair" }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        pointer.current = { x, y: e.clientY - rect.top, inside: true };
        if (state !== "idle") return;
        setLabel({
          x,
          y: e.clientY - rect.top,
          left: x > rect.width - LABEL_WIDTH_GUESS,
        });
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(
          () => setLabel(null),
          MAGNET_LABEL_MS,
        );
      }}
      onPointerLeave={() => {
        pointer.current = { ...pointer.current, inside: false };
        hideLabel();
      }}
      onPointerDown={(e) => {
        // Solo el botón izquierdo del ratón: el táctil, el lápiz y los demás
        // botones no hacen nada.
        if (e.button !== 0 || e.pointerType !== "mouse" || state !== "idle")
          return;
        const rect = e.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          inside: true,
        };
        hideLabel();
        onTrigger();
      }}
    >
      {state === "active" && (
        <MagnetHalo gameCanvas={gameCanvas} pointer={pointer} />
      )}
      {showLabel && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-[6] border-2 border-crt-ink bg-crt-surface px-2 py-1 font-pixel text-[8px] whitespace-nowrap text-crt-ink"
          style={
            label.left
              ? { right: `calc(100% - ${label.x - 14}px)`, top: label.y + 18 }
              : { left: label.x + 14, top: label.y + 18 }
          }
        >
          {MAGNET_LABEL}
        </div>
      )}
    </div>
  );
}
