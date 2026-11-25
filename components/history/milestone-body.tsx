import { SORTED_SOURCES, formatApaCitation, type Milestone } from "@/lib/history";

// Contenido de un hito (spec 05): título, fabricante, "CREADO POR", texto parafraseado y
// sus citas APA en el texto, "(Autor, año; Autor, año)" en orden alfabético, cada una
// enlazada a su entrada de "REFERENCIAS" (#ref-{id}).
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
      <p className="m-0 mt-3 text-[15px] leading-[1.7] text-crt-ink">
        {milestone.text}{" "}
        <span className="text-crt-ink-2">
          (
          {SORTED_SOURCES.filter((src) => milestone.sources.includes(src.id)).map((src, i) => (
            <span key={src.id}>
              {i > 0 && "; "}
              <a href={`#ref-${src.id}`} className="text-crt-ink-2 underline underline-offset-2 hover:bg-crt-ink hover:text-crt-invert">
                {formatApaCitation(src)}
              </a>
            </span>
          ))}
          )
        </span>
      </p>
    </>
  );
}
