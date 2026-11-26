"use client";

import { useEffect, useRef } from "react";

// As folhas douradas da ORBE (arte original, sem fundo). Cada uma é uma peça separada: encostada na borda da
// tela (onde o corte da imagem fica escondido), entra "brotando" e balança no próprio ritmo, girando a partir
// do ponto onde encosta. Ao rolar a página, o conjunto desliza de leve.
const PECAS = {
  a: { w: 295, h: 277, py: 0.45, amp: 1.6 },
  b: { w: 223, h: 218, py: 0.35, amp: 2.3 },
  c: { w: 187, h: 257, py: 0.5, amp: 2.8 },
  d: { w: 230, h: 242, py: 0.45, amp: 2.3 },
} as const;
type Peca = keyof typeof PECAS;

type Folha = { lado: "e" | "d"; peca: Peca; espelho: boolean; topo: number; topoCelular?: number; largura: string; celular?: boolean };
// Larguras em vw (com mínimo e máximo), topo em vh. "celular: false" some em telas pequenas para não cobrir o conteúdo.
const FOLHAS: Folha[] = [
  { lado: "e", peca: "a", espelho: false, topo: -1, topoCelular: 9, largura: "clamp(84px,19vw,340px)", celular: true },
  { lado: "e", peca: "b", espelho: false, topo: 27, largura: "clamp(70px,12vw,250px)", celular: true },
  { lado: "e", peca: "c", espelho: true, topo: 50, largura: "clamp(64px,11vw,220px)", celular: false },
  { lado: "e", peca: "d", espelho: false, topo: 70, topoCelular: 83, largura: "clamp(76px,13vw,260px)", celular: true },
  { lado: "d", peca: "a", espelho: true, topo: -1, topoCelular: 9, largura: "clamp(80px,17.5vw,320px)", celular: true },
  { lado: "d", peca: "c", espelho: false, topo: 25, largura: "clamp(64px,11.5vw,230px)", celular: true },
  { lado: "d", peca: "b", espelho: true, topo: 50, largura: "clamp(70px,11vw,235px)", celular: false },
  { lado: "d", peca: "d", espelho: true, topo: 71, topoCelular: 83, largura: "clamp(76px,12.5vw,250px)", celular: true },
];

export default function Folhas() {
  const camada = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const rolar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (camada.current) camada.current.style.transform = `translate3d(0,${-Math.min(window.scrollY * 0.05, 70)}px,0)`;
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
        {FOLHAS.map((f, i) => {
          const p = PECAS[f.peca];
          const h = (i * 37 + 19) % 100; // variação fixa de cada folha (igual no servidor e no navegador)
          const vars = {
            "--amp": `${(p.amp * (0.9 + (h % 5) / 10)).toFixed(2)}deg`,
            "--dur": `${(5.2 + (h % 35) / 10).toFixed(1)}s`,
            "--atraso": `${-((h * 7) % 80) / 10}s`,
            "--entrada": `${(0.2 + i * 0.16).toFixed(2)}s`,
            "--dir": f.lado === "e" ? -1 : 1,
            "--topo": `${f.topo}vh`,
            "--topo-m": `${f.topoCelular ?? f.topo}vh`,
          } as React.CSSProperties;
          return (
            <div
              key={i}
              className={`cf-fo-ent ${f.celular ? "" : "max-md:hidden"}`}
              style={{
                [f.lado === "e" ? "left" : "right"]: -2,
                width: f.largura,
                aspectRatio: `${p.w} / ${p.h}`,
                transformOrigin: `${f.lado === "e" ? 0 : 100}% ${p.py * 100}%`,
                ...vars,
              }}
            >
              <div className="cf-fo" style={{ transformOrigin: `${f.lado === "e" ? 0 : 100}% ${p.py * 100}%` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/como-foi/folhas/${f.peca}.webp`} alt="" width={p.w} height={p.h} draggable={false} className="block h-full w-full" style={f.espelho ? { transform: "scaleX(-1)" } : undefined} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
