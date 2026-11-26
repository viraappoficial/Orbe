"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import VideoTeaser from "@/components/VideoTeaser";

type Item = { id: string; url: string; poster: string; legenda: string };

// Carrossel em loop: sempre há vídeos dos dois lados do centro. O do centro toca; os outros esperam.
// Setas e teclado no computador, arrastar com o mouse ou o dedo, bolinhas embaixo, passagem automática
// (que para quando a pessoa mexe). Só os vizinhos do centro carregam vídeo; os distantes mostram só a capa.
export default function Carrossel({ itens }: { itens: Item[] }) {
  const n = itens.length;
  const loop = n > 1;
  const copias = loop ? 3 : 1;
  const lista = Array.from({ length: copias }, (_, c) => itens.map((it) => ({ ...it, chave: `${it.id}-${c}` }))).flat();

  const [pos, setPos] = useState(loop ? n : 0); // posição na lista com cópias (começa na cópia do meio)
  const [semAnimar, setSemAnimar] = useState(false);
  const [arrasto, setArrasto] = useState(0);
  const [auto, setAuto] = useState(true);
  const raiz = useRef<HTMLDivElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const toque = useRef<{ x: number; id: number; moveu: boolean } | null>(null);
  const ativo = ((pos % n) + n) % n;

  const passo = useCallback(() => {
    const c = trilho.current?.children[0] as HTMLElement | undefined;
    if (!c) return 300;
    const g = parseFloat(getComputedStyle(trilho.current as HTMLElement).columnGap || "0") || 0;
    return c.offsetWidth + g;
  }, []);

  const ir = useCallback((destino: number) => setPos(destino), []);
  const parar = () => setAuto(false);

  // Terminou de deslizar: se saiu da cópia do meio, volta para a posição equivalente nela (sem animar).
  const aoTerminar = (e: React.TransitionEvent) => {
    if (e.target !== trilho.current || !loop) return;
    if (pos < n || pos >= 2 * n) {
      setSemAnimar(true);
      setPos(pos < n ? pos + n : pos - n);
      requestAnimationFrame(() => requestAnimationFrame(() => setSemAnimar(false)));
    }
  };

  // Passagem automática.
  useEffect(() => {
    const el = raiz.current;
    if (!auto || !el || !loop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visivel = false;
    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0.4 });
    io.observe(el);
    const id = window.setInterval(() => { if (visivel) setPos((p) => p + 1); }, 6500);
    return () => { io.disconnect(); window.clearInterval(id); };
  }, [auto, loop]);

  // Arrastar (mouse e dedo). O toque na vertical continua rolando a página.
  const descer = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    parar();
    toque.current = { x: e.clientX, id: e.pointerId, moveu: false };
  };
  const mover = (e: React.PointerEvent) => {
    const t = toque.current;
    if (!t || t.id !== e.pointerId) return;
    const dx = e.clientX - t.x;
    if (!t.moveu && Math.abs(dx) > 6) { t.moveu = true; raiz.current?.setPointerCapture(e.pointerId); }
    if (t.moveu) setArrasto(dx);
  };
  const soltar = (e: React.PointerEvent) => {
    const t = toque.current;
    if (!t || t.id !== e.pointerId) return;
    toque.current = null;
    if (t.moveu) {
      const dx = e.clientX - t.x;
      const p = passo();
      const passos = Math.abs(dx) > p * 0.2 ? Math.max(1, Math.round(Math.abs(dx) / p)) * (dx < 0 ? 1 : -1) : 0;
      setArrasto(0);
      if (loop && passos) setPos((x) => x + passos);
    }
  };
  const cliqueNoCartao = (i: number, e: React.MouseEvent) => {
    if (i !== pos && !toque.current?.moveu) { e.preventDefault(); parar(); ir(i); }
  };

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); parar(); setPos((p) => p + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); parar(); setPos((p) => p - 1); }
  };

  const seta = "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/60 text-white backdrop-blur transition-colors hover:border-accent hover:text-accent focus-visible:border-accent md:flex";
  const irParaVideo = (v: number) => { parar(); setPos(loop ? n + v : v); };

  return (
    <div role="region" aria-roledescription="carrossel" aria-label="Vídeos da session" tabIndex={0} onKeyDown={teclas} className="relative outline-none focus-visible:ring-1 focus-visible:ring-white/30">
      {loop && (
        <>
          <button type="button" aria-label="Vídeo anterior" onClick={() => { parar(); setPos((p) => p - 1); }} className={`${seta} left-4 lg:left-10`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M9 2L4 7l5 5" /></svg>
          </button>
          <button type="button" aria-label="Próximo vídeo" onClick={() => { parar(); setPos((p) => p + 1); }} className={`${seta} right-4 lg:right-10`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 2l5 5-5 5" /></svg>
          </button>
        </>
      )}

      <div
        ref={raiz}
        onPointerDown={descer}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        className="[--g:1rem] [--w:min(60vw,17rem)] md:[--g:1.75rem] md:[--w:clamp(16rem,19vw,21rem)] relative cursor-grab touch-pan-y select-none overflow-hidden py-6 active:cursor-grabbing"
      >
        <div
          ref={trilho}
          onTransitionEnd={aoTerminar}
          className="flex items-center"
          style={{
            columnGap: "var(--g)",
            marginLeft: "calc(50% - var(--w) / 2)",
            width: "max-content",
            transform: `translateX(calc(${pos} * (var(--w) + var(--g)) * -1 + ${arrasto}px))`,
            transition: semAnimar || arrasto !== 0 ? "none" : "transform 750ms cubic-bezier(.2,.7,.2,1)",
          }}
        >
          {lista.map((v, i) => {
            const perto = Math.abs(i - pos) <= 1;
            return (
              <div
                key={v.chave}
                aria-roledescription="slide"
                aria-label={`${(i % n) + 1} de ${n}`}
                aria-hidden={i !== pos}
                onClickCapture={(e) => cliqueNoCartao(i, e)}
                style={{ width: "var(--w)" }}
                className={`shrink-0 transition-[transform,opacity] duration-700 ease-out ${i === pos ? "scale-100 opacity-100" : "scale-[.86] opacity-50"}`}
              >
                {perto ? (
                  <VideoTeaser src={v.url} poster={v.poster} legenda={v.legenda} className="w-full" ativo={i === pos} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.poster} alt="" draggable={false} className="aspect-[9/16] w-full border border-line object-cover" loading="lazy" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {loop && (
        <div className="mt-2 flex justify-center gap-2" role="tablist" aria-label="Escolher vídeo">
          {itens.map((v, i) => (
            <button key={v.id} type="button" role="tab" aria-selected={i === ativo} aria-label={`Ir para o vídeo ${i + 1}`} onClick={() => irParaVideo(i)} className="flex h-6 w-6 items-center justify-center">
              <span className={`block h-1.5 rounded-full transition-all duration-500 ${i === ativo ? "w-6 bg-accent" : "w-1.5 bg-white/30"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
