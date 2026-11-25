"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";

// CTA del hero. Sin sesión: textos y destinos de la referencia. Con sesión,
// "CREAR CUENTA" no tiene sentido y pasa a llevar al ranking (spec 02).
export function HeroCtas() {
  const { user } = useSession();

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Link href="/biblioteca" className="btn-cut btn-cut-xl btn-cut-pulse">
        ▶ EXPLORAR JUEGOS
      </Link>
      {user ? (
        <Link href="/salon-de-la-fama" className="btn-cut btn-cut-xl">
          ✦ VER MI RANKING
        </Link>
      ) : (
        <Link href="/acceso" className="btn-cut btn-cut-xl">
          ✦ CREAR CUENTA
        </Link>
      )}
    </div>
  );
}
