import type { Milestone } from "@/lib/history";

// Contenido de un hito (spec 05): título, fabricante, "CREADO POR" y texto parafraseado.
// Lo comparten la cabina "inserta moneda" y la lista "TODOS LOS HITOS". Sin hooks: se
// puede renderizar en servidor (lista) y en cliente (cabina).
export function MilestoneBody({ milestone }: { milestone: Milestone }) {
  return (
    <>
      <h3 className="m-0 font-pixel text-[12px] leading-[1.5] font-normal tracking-[0.08em] text-crt-ink">
        {milestone.title}
        {milestone.maker && (
          <span className="text-crt-ink-2"> · {milestone.maker.toUpperCase()}</span>
        )}
      </h3>
      {milestone.creators.length > 0 && (
        <p className="m-0 mt-2 font-pixel text-[9px] leading-[1.6] tracking-[0.12em] text-crt-ink-2">
          CREADO POR {milestone.creators.join(" · ").toUpperCase()}
        </p>
      )}
      <p className="m-0 mt-3 text-[15px] leading-[1.7] text-crt-ink">{milestone.text}</p>
    </>
  );
}
