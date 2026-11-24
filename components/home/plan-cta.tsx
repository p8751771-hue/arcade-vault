"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";

// Botón de la tarjeta de precios. Sin sesión: "EMPEZAR GRATIS →" → /acceso (referencia).
// Con sesión: "IR A JUGAR →" → /biblioteca (spec 02).
export function PlanCta() {
  const { user } = useSession();

  return user ? (
    <Link
      href="/biblioteca"
      className="btn-home btn-home-xl btn-home-pulse neon-cyan w-full"
    >
      IR A JUGAR →
    </Link>
  ) : (
    <Link href="/acceso" className="btn-home btn-home-xl btn-home-pulse neon-cyan w-full">
      EMPEZAR GRATIS →
    </Link>
  );
}
