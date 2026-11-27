"use client";

import { useEffect, useRef } from "react";
import { formatApaCitation, formatApaReference } from "@/lib/history";
import {
  getMagnetSource,
  MAGNET_PARAGRAPHS,
  MAGNET_TITLE,
  SORTED_MAGNET_SOURCES,
} from "@/lib/magnet";

// Spec 10. Diálogo científico que se abre cuando termina el efecto del imán. Es un
// modal en el estilo del de fin de partida; vive dentro del <main> de la pantalla
// de juego, que es el elemento en pantalla completa, así que se ve también ahí.
// APA: varias citas en el mismo paréntesis van en orden alfabético, que es el de
// la lista de referencias.
function citations(ids: readonly string[]): string {
  const order = (id: string) =>
    SORTED_MAGNET_SOURCES.findIndex((s) => s.id === id);
  return [...ids]
    .sort((a, b) => order(a) - order(b))
    .map((id) => formatApaCitation(getMagnetSource(id), SORTED_MAGNET_SOURCES))
    .join("; ");
}

export function MagnetDialog({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // El foco empieza en el botón (sin desplazar el texto, que es largo).
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  // Esc cierra el diálogo. En pantalla completa el navegador usa la primera
  // pulsación para salir de ella; el botón sigue valiendo en cualquier caso.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="magnet-dialog-title"
        className="animate-modal-in flex max-h-[min(92vh,820px)] w-full max-w-[640px] flex-col border-[3px] border-crt-ink bg-crt-surface"
      >
        <div className="flex flex-col gap-4 overflow-y-auto px-6 pt-6 pb-4">
          <h2
            id="magnet-dialog-title"
            className="font-pixel text-[clamp(12px,3vw,16px)] leading-[1.6] text-crt-ink"
          >
            {MAGNET_TITLE}
          </h2>

          {MAGNET_PARAGRAPHS.map((paragraph) => (
            <p
              key={paragraph.text}
              className="text-[16px] leading-[1.55] text-crt-ink"
            >
              {paragraph.text}{" "}
              <span className="text-crt-ink-2">
                ({citations(paragraph.sources)})
              </span>
            </p>
          ))}

          <section aria-labelledby="magnet-references-title">
            <h3
              id="magnet-references-title"
              className="mb-2 font-pixel text-[10px] text-crt-ink"
            >
              REFERENCIAS
            </h3>
            <ul className="flex flex-col gap-2 text-[14px] leading-[1.45] text-crt-ink">
              {SORTED_MAGNET_SOURCES.map((source) => {
                const ref = formatApaReference(source, SORTED_MAGNET_SOURCES);
                return (
                  <li key={source.id} className="[overflow-wrap:anywhere]">
                    {ref.authors} {ref.year} <em>{ref.title}</em>{" "}
                    {ref.container && <>{ref.container} </>}
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {ref.url}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="flex justify-center border-t-2 border-crt-ink px-6 py-4">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="btn-crt-solid p-[15px] text-[11px]"
          >
            SEGUIR JUGANDO
          </button>
        </div>
      </div>
    </div>
  );
}
