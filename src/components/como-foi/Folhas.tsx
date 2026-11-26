"use client";

import { useEffect, useRef } from "react";

// Folhas douradas da arte da ORBE, uma em cada canto. Cada folha é desenhada num <canvas> e ondula como se um
// vento passasse: o pé (a quina da tela) fica parado e as pontas se mexem mais. Rajadas lentas dão variação.
// Respeita "reduzir movimento" (fica parada) e pausa quando a aba está escondida.
type Peca = "c1" | "c2";
type Folha = { canto: "se" | "sd" | "ie" | "id"; peca: Peca; entrada: number; semente: number };
const FOLHAS: Folha[] = [
  { canto: "se", peca: "c1", entrada: 0.2, semente: 1.1 },
  { canto: "sd", peca: "c1", entrada: 0.4, semente: 4.7 },
  { canto: "id", peca: "c2", entrada: 0.6, semente: 2.9 },
  { canto: "ie", peca: "c2", entrada: 0.8, semente: 6.3 },
];
// Onde fica o pé de cada peça original (o canto encostado na tela): c1 em cima à esquerda, c2 embaixo à direita.
const PE: Record<Peca, { x: 0 | 1; y: 0 | 1 }> = { c1: { x: 0, y: 0 }, c2: { x: 1, y: 1 } };

function Onda({ src, peca, semente, entrada }: { src: string; peca: Peca; semente: number; entrada: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    let raf = 0, parar = false, ultimo = 0;
    const inicio = performance.now() / 1000;
    const meio = document.createElement("canvas");
    const mctx = meio.getContext("2d");
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pe = PE[peca];

    const desenhar = (t: number) => {
      const W = cv.width, H = cv.height;
      if (!mctx || !W) return;
      // "nascer": a folha cresce a partir do pé (quina) e balança forte, acalmando no vento normal
      const p = reduz ? 1 : Math.min(1, Math.max(0, (t - inicio - entrada) / 3.6));
      const cresce = p * p * (3 - 2 * p);
      const gust = 0.7 + 0.3 * Math.sin(t * 0.37 + semente) + 0.15 * Math.sin(t * 0.91 + semente * 2);
      const A = reduz ? 0 : gust + 1.7 * Math.pow(1 - p, 2) * Math.sin(Math.min(1, p * 1.3) * Math.PI) ;
      const ax = W * 0.034 * A, ay = W * 0.03 * A;           // quanto as pontas se afastam, em pixels
      // 1ª passada: fatias verticais sobem e descem (mais forte longe do pé)
      meio.width = W; meio.height = H; mctx.clearRect(0, 0, W, H);
      const passo = 3;
      for (let x = 0; x < W; x += passo) {
        const un = x / W, dist = Math.abs(un - pe.x);
        const peso = Math.pow(dist, 1.5);
        const dy = ay * peso * (Math.sin(un * 7.2 + t * 1.25 + semente) + 0.45 * Math.sin(un * 13 + t * 2.1 + semente * 1.7));
        mctx.drawImage(img, (x / W) * img.width, 0, (passo / W) * img.width + 0.5, img.height, x, dy, passo + 0.5, H);
      }
      // 2ª passada: fatias horizontais vão para os lados
      ctx.clearRect(0, 0, W, H);
      for (let y = 0; y < H; y += passo) {
        const vn = y / H, dist = Math.abs(vn - pe.y);
        const peso = Math.pow(dist, 1.5);
        const dx = ax * peso * (Math.sin(vn * 6.1 + t * 1.05 + semente * 1.3) + 0.45 * Math.sin(vn * 11 + t * 1.9 + semente));
        ctx.drawImage(meio, 0, y, W, passo + 0.5, dx, y, W, passo + 0.5);
      }
      // máscara de crescimento: só aparece o que está até um certo raio do pé, com borda macia
      if (p < 1) {
        const px = pe.x * W, py = pe.y * H, R = cresce * Math.hypot(W, H) * 0.86;
        ctx.save();
        ctx.globalCompositeOperation = "destination-in";
        const g = ctx.createRadialGradient(px, py, Math.max(0, R - R * 0.22), px, py, R + 1);
        g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = p <= 0 ? "rgba(0,0,0,0)" : g; ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    };

    const ajustar = () => {
      const css = cv.clientWidth || img.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.min(img.width, Math.round(css * dpr));
      cv.width = w; cv.height = Math.round((w * img.height) / img.width);
      desenhar(performance.now() / 1000);
    };

    const laco = (agora: number) => {
      if (parar) return;
      raf = requestAnimationFrame(laco);
      if (agora - ultimo < 33) return;        // ~30 quadros por segundo bastam e poupam bateria
      ultimo = agora;
      desenhar(agora / 1000);
    };

    img.onload = () => {
      ajustar();
      if (!reduz) raf = requestAnimationFrame(laco);
    };
    img.src = src;
    const ro = new ResizeObserver(ajustar);
    ro.observe(cv);
    return () => { parar = true; cancelAnimationFrame(raf); ro.disconnect(); };
  }, [src, peca, semente, entrada]);

  const dim = peca === "c1" ? { w: 770, h: 782 } : { w: 447, h: 701 };
  return <canvas ref={ref} width={dim.w} height={dim.h} className="block h-auto w-full" />;
}

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
          <div key={i} className={`cf-ia cf-c-${f.canto} cf-p-${f.peca}`} style={{ "--entrada": `${f.entrada}s` } as React.CSSProperties}>
            <Onda src={`/como-foi/folhas/${f.peca}.webp`} peca={f.peca} semente={f.semente} entrada={f.entrada} />
          </div>
        ))}
      </div>
    </div>
  );
}
