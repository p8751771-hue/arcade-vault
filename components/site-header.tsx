"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/components/session-provider";

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

function UserInitial({ name, glow }: { name: string; glow?: boolean }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center border-2 border-neon-cyan font-pixel text-xs text-neon-cyan ${
        glow ? "bg-neon-cyan/10 shadow-glow-cyan" : ""
      }`}
    >
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
      <header className="header-neon">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-5 px-5">
          <Link
            href="/"
            onClick={closeMenu}
            className="font-pixel text-sm leading-[normal] whitespace-nowrap text-neon-cyan no-underline [text-shadow:0_0_8px_#00f5ff,0_0_20px_rgb(0_245_255/0.6)] hover:text-neon-cyan"
          >
            ARCADE{" "}
            <span className="text-neon-pink [text-shadow:0_0_8px_#ff006e,0_0_20px_rgb(255_0_110/0.6)]">
              VAULT
            </span>
          </Link>

          {/* Escritorio (≥ 760 px) */}
          <nav
            aria-label="Principal"
            className="hidden h-full items-stretch gap-8 min-[760px]:flex"
          >
            {NAV.map(({ href, label }) => {
              const active = isActive(href, pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center border-b-[3px] px-1 text-[17px] font-bold tracking-[1px] no-underline hover:text-neon-yellow ${
                    active
                      ? "border-neon-cyan text-neon-cyan [text-shadow:0_0_10px_#00f5ff]"
                      : "border-transparent text-ink"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3.5 min-[760px]:flex">
            {user ? (
              <div className="flex items-center gap-2.5">
                <UserInitial name={user.name} glow />
                <span className="font-bold text-ink">{user.name}</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="cursor-pointer border border-line bg-transparent px-2.5 py-1.5 text-sm font-bold text-ink-muted hover:border-neon-pink hover:text-neon-pink"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/acceso"
                className="btn-neon neon-pink px-3.5 py-[11px] leading-[normal] no-underline hover:text-void"
              >
                INICIAR SESIÓN
              </Link>
            )}
          </div>

          {/* Móvil (< 760 px) */}
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
        </div>
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
                active
                  ? "border-neon-cyan text-neon-cyan"
                  : "border-transparent text-ink"
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
