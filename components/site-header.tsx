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

function UserInitial({ name }: { name: string }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center border-2 border-neon-cyan font-pixel text-xs text-neon-cyan">
      {name[0]}
    </div>
  );
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
      <header className="sticky top-0 z-50 flex items-center gap-6 border-b border-home-line bg-[linear-gradient(180deg,rgb(10_10_15/0.92),rgb(10_10_15/0.78))] px-8 py-3.5 text-[14px] leading-[1.5] tracking-[0.01em] text-home-ink backdrop-blur-[8px]">
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
        <nav aria-label="Principal" className="ml-8 hidden gap-1 min-[760px]:flex">
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
        <div className="hidden items-center gap-2 font-pixel text-[9px] text-neon-yellow min-[760px]:flex">
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff8b0,#f5ff00_60%,#b0b800)] shadow-[0_0_8px_#f5ff00]"
          />
          <span>CRÉDITOS · 03</span>
        </div>

        {/* .btn.auth-btn (con sesión: .btn.ghost "{NOMBRE} ▾" que cierra la sesión) */}
        <div className="hidden min-[760px]:flex">
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
            <Link href="/acceso" className="btn-home neon-cyan ml-4">
              Iniciar Sesión
            </Link>
          )}
        </div>

        {/* Móvil (< 760 px): se rehace en el paso 14 */}
        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
          className="flex h-12 w-12 cursor-pointer flex-col items-center justify-center gap-1.5 border-2 border-neon-cyan bg-transparent shadow-glow-cyan active:scale-[0.92] min-[760px]:hidden"
        >
          <span className="h-[3px] w-[22px] bg-neon-cyan" />
          <span className="h-[3px] w-[22px] bg-neon-cyan" />
          <span className="h-[3px] w-[22px] bg-neon-cyan" />
        </button>
      </header>

      {menuOpen && (
        <div
          onClick={closeMenu}
          aria-hidden="true"
          className="fixed inset-0 z-[80] bg-black/65 min-[760px]:hidden"
        />
      )}

      <aside
        id="mobile-menu"
        aria-label="Menú"
        inert={!menuOpen}
        className={`fixed top-0 right-0 bottom-0 z-[90] flex w-[min(82%,320px)] flex-col gap-3.5 border-l-2 border-neon-cyan bg-panel px-[22px] py-6 shadow-[-10px_0_40px_rgb(0_245_255/0.25)] transition-transform duration-[250ms] ease-in-out min-[760px]:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-[105%]"
        }`}
      >
        <div className="mb-2.5 font-pixel text-[11px] text-neon-yellow">MENÚ</div>
        {NAV.map(({ href, label }) => {
          const active = isActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              aria-current={active ? "page" : undefined}
              className={`border-l-4 px-3.5 py-3.5 text-xl font-bold no-underline ${
                active ? "border-neon-cyan text-neon-cyan" : "border-transparent text-ink"
              }`}
            >
              {label}
            </Link>
          );
        })}

        <div className="mt-auto flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2.5">
                <UserInitial name={user.name} />
                <span className="text-lg font-bold">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="cursor-pointer border-2 border-line bg-transparent p-3 font-pixel text-[10px] text-ink-muted"
              >
                CERRAR SESIÓN
              </button>
            </>
          ) : (
            <Link
              href="/acceso"
              onClick={closeMenu}
              className="btn-neon-solid neon-pink p-3.5 text-center text-[11px] no-underline hover:text-void"
            >
              INICIAR SESIÓN
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
