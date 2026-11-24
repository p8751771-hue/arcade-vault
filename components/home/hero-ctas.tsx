"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";

// CTA del hero. Sin sesión: textos y destinos de la referencia. Con sesión,
// "CREAR CUENTA" no tiene sentido y pasa a llevar al ranking (spec 02).
export function HeroCtas() {
  const { user } = useSession();

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Link href="/biblioteca" className="btn-home btn-home-xl btn-home-pulse neon-cyan">
        ▶ EXPLORAR JUEGOS
      </Link>
      {user ? (
        <Link href="/salon-de-la-fama" className="btn-home btn-home-xl neon-pink">
          ✦ VER MI RANKING
        </Link>
      ) : (
        <Link href="/acceso" className="btn-home btn-home-xl neon-pink">
          ✦ CREAR CUENTA
        </Link>
      )}
    </div>
  );
}
