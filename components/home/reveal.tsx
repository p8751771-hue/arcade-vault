"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Aparición al hacer scroll (`.reveal` de la referencia). El contenido es visible
// desde el servidor; solo se oculta ("armed") en el cliente si la sección aún está
// fuera de pantalla. Con prefers-reduced-motion, sin IntersectionObserver o sin
// JavaScript no se oculta nada.
export function Reveal({
  as: Tag = "section",
  className,
  children,
  ...rest
}: {
  as?: "section" | "div";
  className?: string;
  children: ReactNode;
  "aria-hidden"?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }
    // Ya a la vista: no se oculta para evitar un parpadeo.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "armed";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal="idle"
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
