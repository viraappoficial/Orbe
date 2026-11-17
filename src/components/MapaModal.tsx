"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import MapaLocal from "@/components/MapaLocal";

// "Ver mapa": abre o mapa numa janela, sem ocupar espaço na página. (Não usa useOverlayAberto,
// que esconderia justamente o iframe do mapa.)
export default function MapaModal({
  local, endereco, cidade, embed, className = "",
}: { local: string; endereco: string; cidade?: string; embed?: string; className?: string }) {
  const [aberto, setAberto] = useState(false);
  const gatilho = useRef<HTMLButtonElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", onKey);
    fechar.current?.focus();
    const g = gatilho.current;
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKey);
      g?.focus();
    };
  }, [aberto]);

  return (
    <>
      <button ref={gatilho} type="button" onClick={() => setAberto(true)} aria-haspopup="dialog" className={className}>
        Ver mapa <span aria-hidden="true">↗</span>
      </button>
      {aberto &&
        createPortal(
          <div
            role="dialog" aria-modal="true" aria-label={`Mapa: ${local}`} onClick={() => setAberto(false)}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl border border-line bg-black p-4 sm:p-5">
              <button
                ref={fechar} type="button" onClick={() => setAberto(false)} aria-label="Fechar mapa"
                className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center border border-line bg-black text-white hover:border-accent hover:text-accent"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" /></svg>
              </button>
              <div className="pt-12 sm:pt-0">
                <MapaLocal local={local} endereco={endereco} cidade={cidade} embed={embed} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
