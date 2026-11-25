import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";

// Armazón de references/home-about: #root es una columna flex de al menos el alto de
// la ventana, el contenido crece (.av-main { flex: 1 }) y el pie queda abajo.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* usePathname() suspende en rutas con params fuera de generateStaticParams */}
      <Suspense
        fallback={
          <div className="sticky top-0 z-50 h-[70px] border-b border-crt-line bg-crt-surface" />
        }
      >
        <SiteHeader />
      </Suspense>
      <div className="flex-1">{children}</div>
      <footer className="relative z-[1] border-t border-crt-line px-8 py-5 text-center text-[11px] leading-[1.5] tracking-[0.16em] text-crt-ink-2">
        © 2026 ARCADE VAULT · HECHO CON PIXELES Y SCANLINES · v2.6.0
      </footer>
    </div>
  );
}
