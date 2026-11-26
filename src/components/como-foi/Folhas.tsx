"use client";

import { useEffect, useRef } from "react";

// Folhas douradas da arte da ORBE, só duas por lado (as outras poluíam). O corte reto de cada conjunto fica
// escondido para fora da tela, então não aparece linha nenhuma. Entram "brotando" e balançam de leve.
// A de cima (d) fica encostada na borda esquerda/direita; a de baixo (a) no canto inferior.
type Folha = { lado: "e" | "d"; peca: "d" | "a"; dur: number; atraso: number; entrada: number };
const FOLHAS: Folha[] = [
  { lado: "e", peca: "d", dur: 8.2, atraso: -1.5, entrada: 0.2 },
  { lado: "d", peca: "d", dur: 9.1, atraso: -4.6, entrada: 0.4 },
  { lado: "e", peca: "a", dur: 9.4, atraso: -2.8, entrada: 0.6 },
  { lado: "d", peca: "a", dur: 8.0, atraso: -5.7, entrada: 0.8 },
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
            className={`cf-ia cf-ia-${f.lado} cf-p-${f.peca}`}
            style={{ "--dur": `${f.dur}s`, "--atraso": `${f.atraso}s`, "--entrada": `${f.entrada}s`, "--dir": f.lado === "e" ? -1 : 1 } as React.CSSProperties}
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
