import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GameCover } from "@/components/game-cover";
import { getGame } from "@/lib/games-data";
import { MEDALS, formatDate, formatScore } from "@/lib/scores";
import { getTopScores } from "@/lib/scores-data";

// `params` se lee dentro de <Suspense>: así la navegación al detalle no se bloquea
// (validación "instant" de cacheComponents). El 404 real lo da `proxy.ts`.
export default function GameDetailPage({ params }: PageProps<"/juegos/[id]">) {
  return (
    <Suspense
      fallback={
        <main
          aria-busy="true"
          className="relative z-[1] mx-auto min-h-[60vh] w-full max-w-[1180px] px-5 pt-9 pb-20"
        />
      }
    >
      <GameDetail params={params} />
    </Suspense>
  );
}

async function GameDetail({
  params,
}: {
  params: PageProps<"/juegos/[id]">["params"];
}) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) notFound();

  const rows = await getTopScores(game.id);

  return (
    <main className="animate-fade-slide relative z-[1] mx-auto w-full max-w-[1180px] px-5 pt-9 pb-20">
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
        <section className="flex min-w-0 flex-col gap-6">
          <GameCover
            id={game.id}
            title={game.title}
            className="border-2 border-crt-ink"
          />
          <div className="font-pixel text-[11px] text-crt-ink-2">
            {game.category}
          </div>
          <h1 className="m-0 font-pixel text-[clamp(24px,5.4vw,50px)] leading-[1.3] font-normal [overflow-wrap:anywhere] text-crt-ink">
            {game.title}
          </h1>
          <p className="m-0 max-w-[60ch] text-[19px] leading-[1.6] text-crt-ink-2 [text-wrap:pretty]">
            {game.longDescription}
          </p>
          <div className="flex flex-col gap-2 border border-crt-line bg-crt-surface px-[18px] py-4">
            <span className="font-pixel text-[10px] text-crt-ink">
              CONTROLES
            </span>
            <span className="text-[17px] leading-normal text-crt-ink">
              {game.controls}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-[18px] pt-1.5">
            <Link
              href={`/juegos/${game.id}/jugar`}
              className="animate-pulse-coin border-[3px] border-crt-ink bg-crt-ink/[0.08] px-[30px] py-[22px] font-pixel text-base text-crt-ink no-underline hover:bg-crt-ink hover:text-crt-invert active:scale-[0.92]"
            >
              JUGAR AHORA
            </Link>
            <Link
              href="/biblioteca"
              className="btn-crt px-[18px] py-4 text-[11px] no-underline hover:text-crt-invert"
            >
              VOLVER AL VAULT
            </Link>
          </div>
        </section>

        <aside className="min-w-0 border-2 border-crt-ink bg-crt-surface p-5">
          <h2 className="m-0 mb-4 font-pixel text-xs leading-[1.6] font-normal text-crt-ink">
            MEJORES PUNTUACIONES
          </h2>
          <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
            {rows.map((row, i) => {
              const medal = MEDALS[i];
              // Spec 05: barra lateral negra en el top 3 y crt-line en el resto; texto negro.
              const color = medal?.color ?? "var(--color-crt-line)";
              return (
                <li
                  key={row.id}
                  className="grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-2.5 border-l-[3px] px-2.5 py-[9px]"
                  style={{ borderLeftColor: color }}
                >
                  <span className="font-pixel text-[10px] text-crt-ink">
                    #{i + 1}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-bold text-crt-ink">
                      {row.name}
                    </span>
                    <span className="text-[13px] text-crt-ink-2">
                      {formatDate(row.date)}
                    </span>
                  </span>
                  <span className="font-pixel text-[11px] text-crt-ink">
                    {formatScore(row.score)}
                  </span>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </main>
  );
}
