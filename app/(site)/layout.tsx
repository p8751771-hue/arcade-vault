import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* usePathname() suspende en rutas con params fuera de generateStaticParams */}
      <Suspense fallback={<div className="header-neon h-16" />}>
        <SiteHeader />
      </Suspense>
      {children}
    </>
  );
}
