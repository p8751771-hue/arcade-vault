import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlayScreen } from "@/components/play-screen";
import { GAMES } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((game) => ({ id: game.id }));
}

// `params` se lee dentro de <Suspense> (validación "instant" de cacheComponents).
// El 404 real lo da `proxy.ts`.
export default function PlayPage({ params }: PageProps<"/juegos/[id]/jugar">) {
  return (
    <Suspense fallback={<main aria-busy="true" className="min-h-screen" />}>
      <Play params={params} />
    </Suspense>
  );
}

async function Play({ params }: { params: PageProps<"/juegos/[id]/jugar">["params"] }) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();

  return <PlayScreen game={game} />;
}
