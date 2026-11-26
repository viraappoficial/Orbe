"use client";

import { useEffect, useRef } from "react";

// Folhas douradas da arte da ORBE, uma em cada canto da tela (duas peças, espelhadas). Cada peça já nasce
// encostada na quina, então o corte reto da imagem fica escondido fora da tela. Entram "brotando" e balançam
// de leve a partir da quina. Ao rolar a página, deslizam um pouco.
type Folha = { canto: "se" | "sd" | "ie" | "id"; peca: "c1" | "c2"; dur: number; atraso: number; entrada: number };
const FOLHAS: Folha[] = [
  { canto: "se", peca: "c1", dur: 8.6, atraso: -1.5, entrada: 0.2 },
  { canto: "sd", peca: "c1", dur: 9.6, atraso: -5.0, entrada: 0.4 },
  { canto: "id", peca: "c2", dur: 8.9, atraso: -2.8, entrada: 0.6 },
  { canto: "ie", peca: "c2", dur: 8.2, atraso: -6.1, entrada: 0.8 },
];

export default function Folhas() {
  const camada = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const rolar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (camada.current) camada.current.style.transform = `translate3d(0,${-Math.min(window.scrollY * 0.04, 60)}px,0)`;
      });
    };
    rolar();
    window.addEventListener("scroll", rolar, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", rolar); };
  }, []);

  return (
    <div className="cf-folhas" aria-hidden="true">
      <div ref={camada} className="cf-camada">
        {FOLHAS.map((f, i) => (
          <div
            key={i}
            className={`cf-ia cf-c-${f.canto} cf-p-${f.peca}`}
            style={{ "--dur": `${f.dur}s`, "--atraso": `${f.atraso}s`, "--entrada": `${f.entrada}s` } as React.CSSProperties}
          >
            <div className="cf-ia-bal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/como-foi/folhas/${f.peca}.webp`} alt="" draggable={false} className="block h-auto w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
