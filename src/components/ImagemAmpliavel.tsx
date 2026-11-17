"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Imagem que abre em tela cheia ao tocar/clicar. Fecha com ESC, com o X ou tocando fora.
export default function ImagemAmpliavel({
  src,
  alt,
  width,
  height,
  className = "",
  frameClassName = "",
  priority = false,
  dica = true,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  frameClassName?: string;
  priority?: boolean;
  dica?: boolean;
  sizes?: string;
}) {
  const [aberta, setAberta] = useState(false);
  const gatilho = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAberta(false);
    window.addEventListener("keydown", onKey);
    const botao = gatilho.current;
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKey);
      botao?.focus(); // devolve o foco a quem abriu
    };
  }, [aberta]);

  return (
    <>
      <button
        ref={gatilho}
        type="button"
        onClick={() => setAberta(true)}
        aria-label={`Ampliar imagem: ${alt}`}
        className={`group relative block w-full cursor-zoom-in overflow-hidden ${frameClassName}`}
      >
        <Image src={src} alt={alt} width={width} height={height} priority={priority} sizes={sizes} className={className} />
        {dica && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center bg-black/65 text-white backdrop-blur-sm transition-colors group-hover:bg-accent group-hover:text-black"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="6.5" cy="6.5" r="4.5" />
              <path d="M10 10l4.5 4.5M6.5 4.5v4M4.5 6.5h4" />
            </svg>
          </span>
        )}
      </button>

      {aberta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setAberta(false)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            autoFocus
            onClick={() => setAberta(false)}
            aria-label="Fechar imagem"
            className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center border border-line bg-black text-white hover:border-accent hover:text-accent"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="100vw"
            className="h-auto max-h-[calc(100svh-1.5rem)] w-auto max-w-full object-contain"
          />
        </div>
      )}
    </>
  );
}
