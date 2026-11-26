"use client";

import { useEffect, useRef } from "react";

// Folha dourada nos cantos (imagem com fundo transparente). Cada uma é uma peça separada:
// entra "brotando" e balança no próprio ritmo, girando a partir de onde encosta na borda da tela.
// Ao rolar a página, as folhas deslizam de leve. As duas de cima e as duas de baixo são espelhadas.
type Folha = { lado: "e" | "d"; pos: "topo" | "baixo"; dur: number; atraso: number; amp: number; entrada: number };
const FOLHAS: Folha[] = [
  { lado: "e", pos: "topo", dur: 7.4, atraso: -1.2, amp: 2.2, entrada: 0.15 },
  { lado: "d", pos: "topo", dur: 8.6, atraso: -4.1, amp: 2.0, entrada: 0.35 },
  { lado: "e", pos: "baixo", dur: 8.1, atraso: -2.6, amp: 2.6, entrada: 0.55 },
  { lado: "d", pos: "baixo", dur: 6.9, atraso: -5.3, amp: 2.4, entrada: 0.75 },
];

export default function Folhas() {
  const camada = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const rolar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (camada.current) camada.current.style.transform = `translate3d(0,${-Math.min(window.scrollY * 0.06, 90)}px,0)`;
      });
    };
    rolar();
    window.addEventListener("scroll", rolar, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", rolar); };
  }, []);

  return (
    <div className="cf-folhas" aria-hidden="true">
      <div className="cf-brilho cf-brilho-e" />
      <div className="cf-brilho cf-brilho-d" />
      <div ref={camada} className="cf-camada">
        {FOLHAS.map((f, i) => (
          <div
            key={i}
            className={`cf-ia cf-ia-${f.lado} cf-ia-${f.pos}`}
            style={{ "--dur": `${f.dur}s`, "--atraso": `${f.atraso}s`, "--amp": `${f.amp}deg`, "--entrada": `${f.entrada}s`, "--dir": f.lado === "e" ? -1 : 1 } as React.CSSProperties}
          >
            <div className="cf-ia-bal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/como-foi/folha-ia.webp" alt="" draggable={false} className="block h-full w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
