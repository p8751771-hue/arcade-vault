import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GameCover } from "@/components/game-cover";
import { GAMES } from "@/lib/games";
import { MEDALS, formatDate, formatScore, getLeaderboard } from "@/lib/scores";

export function generateStaticParams() {
  return GAMES.map((game) => ({ id: game.id }));
}

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

async function GameDetail({ params }: { params: PageProps<"/juegos/[id]">["params"] }) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();

  const rows = getLeaderboard(game.id);

  return (
    <main className="animate-fade-slide relative z-[1] mx-auto w-full max-w-[1180px] px-5 pt-9 pb-20">
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 min-[760px]:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
        <section className="flex min-w-0 flex-col gap-6">
          <GameCover
            id={game.id}
            title={game.title}
            className="border-2"
            style={{
              borderColor: game.color,
              boxShadow: `0 0 36px rgba(${game.rgb},0.45)`,
            }}
          />
          <div className="font-pixel text-[11px]" style={{ color: game.color }}>
            {game.category}
          </div>
          <h1
            className="m-0 font-pixel text-[clamp(24px,5.4vw,50px)] leading-[1.3] font-normal [overflow-wrap:anywhere] text-white"
            style={{
              textShadow: `0 0 8px ${game.color}, 0 0 28px ${game.color}, 0 0 60px rgba(${game.rgb},0.45)`,
            }}
          >
            {game.title}
          </h1>
          <p className="m-0 max-w-[60ch] text-[19px] leading-[1.6] text-[#c8d2e4] [text-wrap:pretty]">
            {game.longDescription}
          </p>
          <div className="flex flex-col gap-2 border border-line bg-panel px-[18px] py-4">
            <span className="font-pixel text-[10px] text-neon-yellow">CONTROLES</span>
            <span className="text-[17px] leading-normal text-ink">{game.controls}</span>
          </div>
          <div className="flex flex-wrap items-center gap-[18px] pt-1.5">
            <Link
              href={`/juegos/${game.id}/jugar`}
              className="animate-pulse-coin border-[3px] border-neon-yellow bg-neon-yellow/[0.08] px-[30px] py-[22px] font-pixel text-base text-neon-yellow no-underline hover:bg-neon-yellow hover:text-void active:scale-[0.92]"
            >
              JUGAR AHORA
            </Link>
            <Link
              href="/biblioteca"
              className="btn-neon neon-cyan px-[18px] py-4 text-[11px] no-underline hover:text-void"
            >
              VOLVER AL VAULT
            </Link>
          </div>
        </section>

        <aside className="min-w-0 border-2 border-neon-pink bg-panel p-5 shadow-[0_0_26px_rgb(255_0_110/0.35),inset_0_0_24px_rgb(0_0_0/0.5)]">
          <h2 className="m-0 mb-4 font-pixel text-xs leading-[1.6] font-normal text-neon-pink [text-shadow:0_0_10px_#ff006e]">
            MEJORES PUNTUACIONES
          </h2>
          <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
            {rows.map((row, i) => {
              const medal = MEDALS[i];
              const color = medal?.color ?? "#8c93a8";
              return (
                <li
                  key={row.name}
                  className="grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-2.5 border-l-[3px] px-2.5 py-[9px]"
                  style={{
                    borderLeftColor: color,
                    background: medal
                      ? `rgba(${medal.rgb},0.08)`
                      : "rgb(255 255 255 / 0.03)",
                  }}
                >
                  <span
                    className="font-pixel text-[10px]"
                    style={{
                      color,
                      textShadow: medal ? `0 0 10px ${medal.color}` : "none",
                    }}
                  >
                    #{i + 1}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-bold text-ink-bright">
                      {row.name}
                    </span>
                    <span className="text-[13px] text-ink-muted">
                      {formatDate(row.date)}
                    </span>
                  </span>
                  <span className="font-pixel text-[11px] text-white">
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
