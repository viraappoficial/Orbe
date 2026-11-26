"use client";

import { useEffect, useRef } from "react";
import dados from "@/data/folhas.json";

type Folha = (typeof dados.folhas)[number];

// Cada folha é uma peça separada (recortada do flyer, sem fundo): entra brotando e balança no próprio
// ritmo, girando a partir do ponto onde encosta na borda da tela. Ao rolar, o conjunto desliza de leve.
function Lado({ lado }: { lado: "e" | "d" }) {
  const par = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const caixa = useRef<HTMLDivElement>(null);
  const folhas = dados.folhas.filter((f) => f.lado === lado);

  useEffect(() => {
    const caixaEl = caixa.current, palcoEl = palco.current;
    if (!caixaEl || !palcoEl) return;
    // As coordenadas das folhas são de uma tira de 300 px; ajusta ao tamanho que ela tem na tela.
    const ajustar = () => { palcoEl.style.transform = `scale(${caixaEl.clientWidth / dados.largura})`; };
    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(caixaEl);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => ro.disconnect();
    let raf = 0;
    const rolar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY * (lado === "e" ? 0.22 : 0.18), 1000);
        if (par.current) par.current.style.transform = `translate3d(0,${-y}px,0)`;
      });
    };
    rolar();
    window.addEventListener("scroll", rolar, { passive: true });
    return () => { ro.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("scroll", rolar); };
  }, [lado]);

  return (
    <div ref={caixa} className={`cf-folha ${lado === "e" ? "cf-folha-e" : "cf-folha-d"}`} aria-hidden="true">
      <div ref={par} className="cf-par">
        <div
          ref={palco}
          className="cf-palco"
          style={{ width: dados.largura, height: dados.altura, transformOrigin: lado === "e" ? "0 0" : "100% 0", ...(lado === "d" ? { marginLeft: "auto" } : {}) }}
        >
          {folhas.map((f: Folha, i: number) => {
            const h = (i * 37 + (lado === "e" ? 11 : 53)) % 100; // jeito determinístico de variar cada folha
            const amp = Math.min(5, Math.max(1.5, 5.4 - f.area / 2200));
            const vars = {
              "--amp": `${amp.toFixed(2)}deg`,
              "--dur": `${(5 + (h % 40) / 10).toFixed(1)}s`,
              "--atraso": `${-((h * 7) % 90) / 10}s`,
              "--dir": lado === "e" ? -1 : 1,
              "--y": f.y,
            } as React.CSSProperties;
            return (
              <div key={`${lado}-${i}`} className="cf-fo-ent" style={{ left: f.x, top: f.y, width: f.w, height: f.h, transformOrigin: `${f.px}px ${f.py}px`, ...vars }}>
                <div
                  className="cf-fo"
                  style={{
                    backgroundImage: "url(/como-foi/folhas.webp)",
                    backgroundSize: `${dados.atlasW}px ${dados.atlasH}px`,
                    backgroundPosition: `-${f.ax}px -${f.ay}px`,
                    transformOrigin: `${f.px}px ${f.py}px`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Folhas() {
  return (
    <>
      <Lado lado="e" />
      <Lado lado="d" />
    </>
  );
}
