"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Efeitos ligados à rolagem: progresso, hero, menu e parallax.
// Escreve variáveis CSS (--hero-p, --page-p) e move elementos [data-parallax].
export default function ScrollFX() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    let raf = 0;

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const h = window.innerHeight;
      const max = Math.max(1, root.scrollHeight - h);
      root.style.setProperty("--hero-p", String(Math.min(1, y / (h * 0.9))));
      root.style.setProperty("--page-p", String(Math.min(1, y / max)));
      if (y > 40) root.dataset.scrolled = "1";
      else delete root.dataset.scrolled;

      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > h + 200) return; // fora da tela
        const f = parseFloat(el.dataset.parallax || "0.05");
        const center = r.top + r.height / 2 - h / 2;
        const v = Math.max(-30, Math.min(30, -center * f));
        el.style.transform = `translate3d(0, ${v}px, 0) scale(1.12)`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return <div className="scroll-progress" aria-hidden="true" />;
}
