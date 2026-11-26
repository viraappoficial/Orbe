"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import VideoTeaser from "@/components/VideoTeaser";

type Item = { id: string; url: string; poster: string; legenda: string };

// Carrossel de vídeos: o do centro toca (os outros esperam), setas no computador, deslizar no celular,
// bolinhas embaixo e passagem automática (que para assim que a pessoa mexe).
export default function Carrossel({ itens }: { itens: Item[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const cartoes = useRef<(HTMLDivElement | null)[]>([]);
  const [ativo, setAtivo] = useState(0);
  const [auto, setAuto] = useState(true);
  const rolando = useRef(0);

  const ir = useCallback((i: number) => {
    const t = trilho.current, c = cartoes.current[i];
    if (!t || !c) return;
    t.scrollTo({ left: c.offsetLeft + c.offsetWidth / 2 - t.clientWidth / 2, behavior: "smooth" });
  }, []);

  // Descobre qual cartão está mais perto do centro.
  useEffect(() => {
    const t = trilho.current;
    if (!t) return;
    const medir = () => {
      const centro = t.scrollLeft + t.clientWidth / 2;
      let melhor = 0, dist = Infinity;
      cartoes.current.forEach((c, i) => {
        if (!c) return;
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centro);
        if (d < dist) { dist = d; melhor = i; }
      });
      setAtivo(melhor);
    };
    const aoRolar = () => { cancelAnimationFrame(rolando.current); rolando.current = requestAnimationFrame(medir); };
    t.addEventListener("scroll", aoRolar, { passive: true });
    medir();
    return () => { t.removeEventListener("scroll", aoRolar); cancelAnimationFrame(rolando.current); };
  }, []);

  // Passagem automática: só enquanto a pessoa não interagiu e o carrossel está na tela.
  useEffect(() => {
    const t = trilho.current;
    if (!auto || !t || itens.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visivel = false;
    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0.4 });
    io.observe(t);
    const id = window.setInterval(() => { if (visivel) ir((ativo + 1) % itens.length); }, 6500);
    return () => { io.disconnect(); window.clearInterval(id); };
  }, [auto, ativo, itens.length, ir]);

  const parar = () => setAuto(false);
  const seta = "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/60 text-white backdrop-blur transition-colors hover:border-accent hover:text-accent focus-visible:border-accent md:flex";

  return (
    <div role="region" aria-roledescription="carrossel" aria-label="Vídeos da session" className="relative" onPointerDown={parar} onKeyDown={parar} onWheel={parar}>
      <button type="button" aria-label="Vídeo anterior" onClick={() => { parar(); ir((ativo - 1 + itens.length) % itens.length); }} className={`${seta} left-4 lg:left-10`}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M9 2L4 7l5 5" /></svg>
      </button>
      <button type="button" aria-label="Próximo vídeo" onClick={() => { parar(); ir((ativo + 1) % itens.length); }} className={`${seta} right-4 lg:right-10`}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 2l5 5-5 5" /></svg>
      </button>

      <div
        ref={trilho}
        tabIndex={0}
        aria-label="Deslize para ver mais vídeos"
        style={{ ["--w" as string]: "min(60vw, 17rem)", paddingInline: "calc(50% - var(--w) / 2)" }}
        className="cf-trilho flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 md:gap-6"
      >
        {itens.map((v, i) => (
          <div
            key={v.id}
            ref={(el) => { cartoes.current[i] = el; }}
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${itens.length}`}
            onClick={() => { if (i !== ativo) { parar(); ir(i); } }}
            style={{ width: "var(--w)" }}
            className={`shrink-0 snap-center transition-[transform,opacity] duration-700 ease-out ${i === ativo ? "scale-100 opacity-100" : "scale-[.88] cursor-pointer opacity-55"}`}
          >
            <VideoTeaser src={v.url} poster={v.poster} legenda={v.legenda} className="w-full" ativo={i === ativo} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Escolher vídeo">
        {itens.map((v, i) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={i === ativo}
            aria-label={`Ir para o vídeo ${i + 1}`}
            onClick={() => { parar(); ir(i); }}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span className={`block h-1.5 rounded-full transition-all duration-500 ${i === ativo ? "w-6 bg-accent" : "w-1.5 bg-white/30"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
