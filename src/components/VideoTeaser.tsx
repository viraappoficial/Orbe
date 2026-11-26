"use client";

import { useEffect, useRef, useState } from "react";

// Vídeo vertical curto. Toca mudo quando aparece na tela e pausa quando sai; o botão liga o som.
export default function VideoTeaser({
  src,
  poster,
  legenda,
  className = "mx-auto w-full max-w-[22rem] md:max-w-[26rem]",
}: {
  src: string;
  poster: string;
  legenda: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [mudo, setMudo] = useState(true);
  const [tocando, setTocando] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduz) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const alternarSom = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMudo(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };
  const alternarPlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div className={`relative aspect-[9/16] overflow-hidden border border-line bg-black ${className}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={legenda}
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        onClick={alternarPlay}
        className="h-full w-full cursor-pointer object-cover"
      />
      {!tocando && (
        <button
          type="button"
          onClick={alternarPlay}
          aria-label="Reproduzir vídeo"
          className="absolute inset-0 flex items-center justify-center bg-black/30 text-white transition-colors hover:bg-black/20"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/80">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true"><path d="M5 3l10 6-10 6z" /></svg>
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={alternarSom}
        aria-pressed={!mudo}
        className="absolute bottom-3 right-3 min-h-11 border border-white/60 bg-black/60 px-4 text-[0.65rem] uppercase tracking-[0.25em] text-white backdrop-blur transition-colors hover:border-accent hover:text-accent"
      >
        {mudo ? "Ligar som" : "Som ligado"}
      </button>
    </div>
  );
}
