import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* usePathname() suspende en rutas con params fuera de generateStaticParams */}
      <Suspense
        fallback={
          <div className="sticky top-0 z-50 h-[70px] border-b border-home-line bg-[linear-gradient(180deg,rgb(10_10_15/0.92),rgb(10_10_15/0.78))]" />
        }
      >
        <SiteHeader />
      </Suspense>
      {children}
    </>
  );
}
