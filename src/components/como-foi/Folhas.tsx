"use client";

import { useEffect, useRef } from "react";

// Folhas douradas nos cantos da tela. Balançam sozinhas e deslizam um pouco ao rolar a página.
export default function Folhas() {
  const esq = useRef<HTMLDivElement>(null);
  const dir = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const atualizar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY * 0.22, 1000);
        if (esq.current) esq.current.style.transform = `translate3d(0,${-y}px,0)`;
        if (dir.current) dir.current.style.transform = `translate3d(0,${-y * 0.8}px,0)`;
      });
    };
    atualizar();
    window.addEventListener("scroll", atualizar, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", atualizar);
    };
  }, []);

  return (
    <>
      <div className="cf-folha cf-folha-e" aria-hidden="true">
        <div ref={esq} className="cf-par">
          <div className="cf-bal-x cf-bal-x-e">
            <div className="cf-bal-y cf-bal-y-e">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/como-foi/leaf-l.webp" alt="" width={300} height={1920} className="block h-auto w-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="cf-folha cf-folha-d" aria-hidden="true">
        <div ref={dir} className="cf-par">
          <div className="cf-bal-x cf-bal-x-d">
            <div className="cf-bal-y cf-bal-y-d">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/como-foi/leaf-r.webp" alt="" width={300} height={1920} className="block h-auto w-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
