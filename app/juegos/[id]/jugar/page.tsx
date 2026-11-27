import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlayScreen } from "@/components/play-screen";
import { getGame } from "@/lib/games-data";

// `params` se lee dentro de <Suspense> (validación "instant" de cacheComponents).
// El 404 real lo da `proxy.ts`. Spec 11: el juego sale de la tabla `games`, así que
// no hay `generateStaticParams`: la página se renderiza al pedirla.
export default function PlayPage({ params }: PageProps<"/juegos/[id]/jugar">) {
  return (
    <Suspense fallback={<main aria-busy="true" className="min-h-screen" />}>
      <Play params={params} />
    </Suspense>
  );
}

async function Play({
  params,
}: {
  params: PageProps<"/juegos/[id]/jugar">["params"];
}) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) notFound();

  return <PlayScreen game={game} />;
}
