"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/components/session-provider";

// Header de references/home-about (nav.jsx + styles.css .av-nav). Sin "Acerca de"
// hasta que exista su página (spec 02). El CSS es el literal de la referencia: el
// logo y el botón solo se parten en dos líneas si falta espacio.

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/salon-de-la-fama", label: "Salón de la Fama" },
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
      <header className="sticky top-0 z-50 flex items-center gap-6 border-b border-home-line bg-[linear-gradient(180deg,rgb(10_10_15/0.92),rgb(10_10_15/0.78))] px-8 py-3.5 text-[14px] leading-[1.5] tracking-[0.01em] text-home-ink backdrop-blur-[8px] max-[841px]:gap-3 max-[841px]:px-4 max-[841px]:py-3">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2.5 no-underline"
          aria-label="Arcade Vault, inicio"
        >
          <span
            aria-hidden="true"
            className="h-7 w-7 border border-white/[0.18] bg-[linear-gradient(45deg,#ff006e_0_50%,transparent_50%),linear-gradient(-45deg,#00f5ff_0_50%,transparent_50%)] bg-blend-screen shadow-[0_0_12px_rgb(0_245_255/0.55),inset_0_0_6px_rgb(255_0_110/0.5)]"
          />
          <span className="font-pixel text-[12px] tracking-[0.12em] text-neon-cyan [text-shadow:0_0_6px_rgb(0_245_255/0.65),0_0_16px_rgb(0_245_255/0.45)]">
            ARCADE{" "}
            <span className="text-neon-pink [text-shadow:0_0_6px_rgb(255_0_110/0.65),0_0_16px_rgb(255_0_110/0.45)]">
              VAULT
            </span>
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
                    ? "text-neon-cyan [text-shadow:0_0_8px_rgb(0_245_255/0.65)] after:absolute after:right-3.5 after:bottom-1 after:left-3.5 after:h-0.5 after:bg-neon-cyan after:shadow-[0_0_8px_#00f5ff,0_0_16px_#00f5ff] after:content-[''] hover:text-neon-cyan"
                    : "text-home-dim hover:text-home-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* .coin-counter (decorativo) */}
        <div className="flex items-center gap-2 font-pixel text-[9px] text-neon-yellow max-[841px]:hidden">
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff8b0,#f5ff00_60%,#b0b800)] shadow-[0_0_8px_#f5ff00]"
          />
          <span>CRÉDITOS · 03</span>
        </div>

        {/* .btn.auth-btn, visible también en móvil (con sesión: .btn.ghost "{NOMBRE} ▾" que cierra la sesión) */}
        {user ? (
          <button
            type="button"
            onClick={handleSignOut}
            title="Cerrar sesión"
            className="btn-home ml-4 border-home-faint text-home-dim hover:border-home-dim hover:text-home-ink hover:shadow-none"
          >
            {user.name} ▾
          </button>
        ) : (
          <Link href="/acceso" onClick={closeMenu} className="btn-home neon-cyan ml-4">
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
          className="btn-home border-home-faint text-home-dim hover:border-home-dim hover:text-home-ink hover:shadow-none min-[841px]:hidden"
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
        className={`fixed top-0 right-0 bottom-0 z-[60] flex w-[min(320px,86vw)] flex-col gap-2 border-l border-home-line bg-home-bg2 px-5 py-6 text-[14px] leading-[1.5] tracking-[0.01em] text-home-ink transition-transform duration-[220ms] ease-[ease] min-[841px]:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 font-pixel text-[11px] leading-[1.25] tracking-[0.04em] text-neon-cyan uppercase [text-shadow:0_0_6px_rgb(0_245_255/0.65),0_0_16px_rgb(0_245_255/0.45)]">
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
                className={`border-b border-dashed border-home-line-2 px-3 py-3.5 font-pixel text-[11px] no-underline ${
                  active ? "text-neon-cyan hover:text-neon-cyan" : "text-home-dim hover:text-home-dim"
                }`}
              >
                {label}
              </Link>
            );
          },
        )}
        <div className="flex-1" />
        <div className="font-pixel text-[9px] leading-[1.25] tracking-[0.16em] text-home-faint uppercase">
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
