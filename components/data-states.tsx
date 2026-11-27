// Estados de las pantallas que leen de Supabase (spec 11): carga, error y ranking
// vacío. Sin datos falsos: si no hay datos o la base no responde, se dice.

/** Mensaje mientras llegan los datos (fallback de <Suspense>). */
export function Loading({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={`py-16 text-center font-pixel text-[11px] text-crt-ink ${className}`}
    >
      <span className="animate-blink">CARGANDO...</span>
    </div>
  );
}

/** La base de datos no respondió. Texto sencillo, sin jerga técnica. */
export function LoadError({
  what,
  className = "",
  bare = false,
}: {
  what: string; // "los juegos", "el ranking"…
  className?: string;
  bare?: boolean; // sin marco propio: dentro de otro panel
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-2.5 px-5 py-8 text-center ${
        bare ? "" : "border-2 border-crt-line bg-crt-surface"
      } ${className}`}
    >
      <span className="font-pixel text-[11px] leading-[1.6] text-crt-ink">
        NO SE PUDO CARGAR
      </span>
      <span className="text-base text-crt-ink-2">
        No pudimos cargar {what}. Inténtalo de nuevo en unos minutos.
      </span>
    </div>
  );
}

/** Ranking sin ninguna puntuación todavía. */
export function EmptyRanking({
  className = "",
  bare = false,
}: {
  className?: string;
  bare?: boolean; // sin marco propio: dentro de otro panel
}) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center gap-2.5 px-5 py-8 text-center ${
        bare ? "" : "border-2 border-crt-line bg-crt-surface"
      } ${className}`}
    >
      <span className="font-pixel text-[11px] leading-[1.6] text-crt-ink">
        SÉ EL PRIMERO EN ENTRAR AL SALÓN DE LA FAMA
      </span>
      <span className="text-base text-crt-ink-2">
        Todavía no hay puntuaciones. La primera partida guardada abre el
        ranking.
      </span>
    </div>
  );
}
