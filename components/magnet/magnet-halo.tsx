"use client";

import { useEffect, useRef, type RefObject } from "react";
import { MAGNET_DURATION_MS, MAGNET_FADE_MS } from "@/lib/magnet";

// Spec 10. El efecto del imán: un halo alrededor del puntero donde la imagen del
// juego se ondula, los colores rojo, verde y azul se separan y aparecen manchas
// moradas y verdes. Es una capa propia que COPIA el canvas del juego y lo
// distorsiona; no toca el canvas ni el motor. Solo se dibuja el área del halo
// (unos 300 px) y solo mientras dura el efecto.

/** Posición del puntero respecto a la pantalla del juego, en px de pantalla. */
export interface MagnetPointer {
  x: number;
  y: number;
  inside: boolean;
}

const SIZE = 300; // lado del halo
const RADIUS = SIZE / 2;
const WAVE_PX = 9; // ondulación máxima
const SPLIT_PX = 5; // separación máxima de los canales de color
const PURPLE = [140, 70, 180] as const;
const GREEN = [70, 175, 100] as const;

const clampIndex = (value: number) =>
  Math.min(SIZE - 1, Math.max(0, Math.round(value)));

export function MagnetHalo({
  gameCanvas,
  pointer,
}: {
  gameCanvas: RefObject<HTMLCanvasElement | null>;
  pointer: RefObject<MagnetPointer>;
}) {
  const haloRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const halo = haloRef.current;
    const game = gameCanvas.current;
    const host = halo?.parentElement;
    if (!halo || !game || !host) return;
    const haloCtx = halo.getContext("2d");
    // Copia intermedia del trozo del juego que hay bajo el halo.
    const copy = document.createElement("canvas");
    copy.width = copy.height = SIZE;
    const copyCtx = copy.getContext("2d", { willReadFrequently: true });
    if (!haloCtx || !copyCtx) return;
    const image = haloCtx.createImageData(SIZE, SIZE);

    // Con movimiento reducido: sin ondulación ni vibración propia y sin
    // desvanecimiento animado; el halo sigue al ratón y desaparece de golpe.
    // Se lee en vivo por si el usuario cambia la preferencia durante el efecto.
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motion.matches;
    const onMotionChange = () => {
      reduced = motion.matches;
    };
    motion.addEventListener("change", onMotionChange);

    const startedAt = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const p = pointer.current;
      if (!p.inside) {
        halo.style.visibility = "hidden";
        return;
      }
      halo.style.visibility = "visible";
      halo.style.transform = `translate(${p.x - RADIUS}px, ${p.y - RADIUS}px)`;

      const elapsed = now - startedAt;
      const fadeStart = MAGNET_DURATION_MS - MAGNET_FADE_MS;
      const intensity =
        reduced || elapsed < fadeStart
          ? 1
          : Math.max(0, (MAGNET_DURATION_MS - elapsed) / MAGNET_FADE_MS);
      const t = reduced ? 0 : elapsed / 1000;

      // Trozo del canvas del juego (en sus píxeles) que queda bajo el halo.
      const box = host.getBoundingClientRect();
      const sx = game.width / box.width;
      const sy = game.height / box.height;
      copyCtx.clearRect(0, 0, SIZE, SIZE);
      copyCtx.drawImage(
        game,
        (p.x - RADIUS) * sx,
        (p.y - RADIUS) * sy,
        SIZE * sx,
        SIZE * sy,
        0,
        0,
        SIZE,
        SIZE,
      );
      const src = copyCtx.getImageData(0, 0, SIZE, SIZE).data;
      const out = image.data;

      for (let y = 0; y < SIZE; y++) {
        // La ondulación depende de la fila; sin movimiento no hay ondulación.
        const wobble = reduced
          ? 0
          : (Math.sin(y * 0.09 + t * 9) + 0.6 * Math.sin(y * 0.025 - t * 3.2)) *
            WAVE_PX *
            intensity;
        for (let x = 0; x < SIZE; x++) {
          const i = (y * SIZE + x) * 4;
          const dx = x - RADIUS;
          const dy = y - RADIUS;
          const d = Math.sqrt(dx * dx + dy * dy) / RADIUS;
          if (d >= 1) {
            out[i + 3] = 0;
            continue;
          }
          const fall = 1 - d; // 1 en el centro, 0 en el borde
          const shift = wobble * fall;
          const split = SPLIT_PX * fall;
          const row = y * SIZE * 4;
          const r = src[row + clampIndex(x + shift - split) * 4];
          const g = src[row + clampIndex(x + shift) * 4 + 1];
          const b = src[row + clampIndex(x + shift + split) * 4 + 2];
          const alpha = src[row + clampIndex(x + shift) * 4 + 3];

          // Manchas moradas y verdes: zonas donde una onda es fuerte. Se deforman
          // las coordenadas para que salgan manchas orgánicas y no una rejilla.
          const wx = x + 16 * Math.sin(y * 0.031 + t * 0.9);
          const wy = y + 16 * Math.sin(x * 0.027 - t * 0.7);
          const n = Math.sin(wx * 0.03 + 1.7) * Math.sin(wy * 0.034 - 0.6);
          let red = r;
          let green = g;
          let blue = b;
          if (n > 0.3 || n < -0.3) {
            const tint = n > 0 ? PURPLE : GREEN;
            const k =
              Math.min(1, (Math.abs(n) - 0.3) / 0.4) *
              0.6 *
              Math.min(1, fall * 2);
            red = r * (1 - k) + tint[0] * k;
            green = g * (1 - k) + tint[1] * k;
            blue = b * (1 - k) + tint[2] * k;
          }

          // El borde se funde con la imagen de debajo y todo se desvanece al final.
          out[i] = red;
          out[i + 1] = green;
          out[i + 2] = blue;
          out[i + 3] = alpha * Math.min(1, fall / 0.4) * intensity;
        }
      }
      haloCtx.putImageData(image, 0, 0);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [gameCanvas, pointer]);

  return (
    <canvas
      ref={haloRef}
      width={SIZE}
      height={SIZE}
      aria-hidden="true"
      data-magnet-halo=""
      // Sin eventos de puntero: los recibe la capa de captura de debajo.
      className="pointer-events-none absolute top-0 left-0 invisible"
    />
  );
}
