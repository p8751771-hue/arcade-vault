"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/components/session-provider";

// Header de references/home-about (nav.jsx + styles.css .av-nav), con "Acerca de"
// tras "Salón de la Fama" (spec 03) e "Historia" tras "Acerca de" (spec 05). El CSS
// es el literal de la referencia: el logo y el botón se parten en dos líneas si falta
// espacio (a 1280 px, como el prototipo).

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/salon-de-la-fama", label: "Salón de la Fama" },
  { href: "/acerca-de", label: "Acerca de" },
  { href: "/historia", label: "Historia" },
] as const;

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  // El detalle de un juego cuelga de la Biblioteca.
  if (href === "/biblioteca") {
    return pathname.startsWith("/biblioteca") || pathname.startsWith("/juegos");
  }
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const handleSignOut = () => {
    signOut();
    closeMenu();
  };

  return (
    <>
      {/* .av-nav: hereda 14px / 1.5 / 0.01em del body de la referencia */}
      {/* Corte de la referencia: max-width 840px ⇒ móvil. `max-[841px]:` ≡ ≤ 840 px (Tailwind v4 usa <).
          Desviación acordada (spec 02, paso 14): en móvil el hueco es 12 px y no 24, porque con
          24 px la barra mide 395 px a 390 y la hamburguesa queda recortada (igual que en el prototipo). */}
      <header className="sticky top-0 z-50 flex items-center gap-6 border-b border-crt-line bg-crt-surface px-8 py-3.5 text-[14px] leading-[1.5] tracking-[0.01em] text-crt-ink backdrop-blur-[8px] max-[841px]:gap-3 max-[841px]:px-4 max-[841px]:py-3">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 no-underline"
          aria-label="Arcade Vault, inicio"
        >
          <span
            aria-hidden="true"
            className="h-7 w-7 border border-crt-ink bg-[linear-gradient(45deg,var(--color-crt-ink)_0_50%,transparent_50%),linear-gradient(-45deg,var(--color-crt-line)_0_50%,transparent_50%)]"
          />
          <span className="font-pixel text-[12px] tracking-[0.12em] text-crt-ink">
            ARCADE{" "}
            <span className="text-crt-ink-2">VAULT</span>
          </span>
        </Link>

        {/* .links */}
        <nav aria-label="Principal" className="ml-8 flex gap-1 max-[841px]:hidden">
          {NAV.map(({ href, label }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3.5 py-2.5 font-pixel text-[9px] tracking-[0.16em] no-underline transition-colors duration-[120ms] ${
                  active
                    ? "text-crt-ink after:absolute after:right-3.5 after:bottom-1 after:left-3.5 after:h-0.5 after:bg-crt-ink after:content-[''] hover:bg-crt-ink hover:text-crt-invert hover:after:bg-crt-invert"
                    : "text-crt-ink-2 hover:bg-crt-ink hover:text-crt-invert"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* .coin-counter (decorativo) */}
        <div className="flex items-center gap-2 font-pixel text-[9px] text-crt-ink max-[841px]:hidden">
          {/* Moneda pixel de 7×7 en negro con la ranura en crt-surface (spec 04, paso 12) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 7 7"
            shapeRendering="crispEdges"
            className="h-3.5 w-3.5 flex-none"
          >
            <path
              fill="var(--color-crt-ink)"
              d="M2 0h3v1h1v1h1v3h-1v1h-1v1h-3v-1h-1v-1h-1v-3h1v-1h1z"
            />
            <rect x="3" y="2" width="1" height="3" fill="var(--color-crt-surface)" />
          </svg>
          <span>CRÉDITOS · 03</span>
        </div>

        {/* .btn.auth-btn, visible también en móvil (con sesión: .btn.ghost "{NOMBRE} ▾" que cierra la sesión) */}
        {user ? (
          <button
            type="button"
            onClick={handleSignOut}
            title="Cerrar sesión"
            className="btn-cut btn-cut-ghost ml-4"
          >
            {user.name} ▾
          </button>
        ) : (
          <Link href="/acceso" onClick={closeMenu} className="btn-cut ml-4 text-center">
            Iniciar Sesión
          </Link>
        )}

        {/* .btn.ghost.hamburger (≤ 840 px) */}
        <button
          type="button"
          aria-label="Menú"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
          className="btn-cut btn-cut-ghost min-[841px]:hidden"
        >
          ≡
        </button>
      </header>

      {/* .av-mobile-backdrop */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-[55] bg-black/60 transition-opacity duration-[180ms] min-[841px]:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* .av-mobile-panel: hereda 14px / 1.5 / 0.01em como en la referencia */}
      <aside
        id="mobile-menu"
        aria-label="Menú"
        inert={!menuOpen}
        className={`fixed top-0 right-0 bottom-0 z-[60] flex w-[min(320px,86vw)] flex-col gap-2 border-l border-crt-line bg-crt-surface px-5 py-6 text-[14px] leading-[1.5] tracking-[0.01em] text-crt-ink transition-transform duration-[220ms] ease-[ease] min-[841px]:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 font-pixel text-[11px] leading-[1.25] tracking-[0.04em] text-crt-ink uppercase">
          MENÚ
        </div>
        {[...NAV, { href: "/acceso", label: user ? "Cuenta" : "Iniciar Sesión" }].map(
          ({ href, label }) => {
            const active = href === "/acceso" ? pathname === "/acceso" : isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                aria-current={active ? "page" : undefined}
                className={`border-b border-dashed border-crt-line px-3 py-3.5 font-pixel text-[11px] no-underline ${
                  active ? "bg-crt-ink text-crt-invert" : "text-crt-ink-2 hover:bg-crt-ink hover:text-crt-invert"
                }`}
              >
                {label}
              </Link>
            );
          },
        )}
        <div className="flex-1" />
        <div className="font-pixel text-[9px] leading-[1.25] tracking-[0.16em] text-crt-ink-2 uppercase">
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
