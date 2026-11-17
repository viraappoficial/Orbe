import { useEffect } from "react";

/**
 * Enquanto uma janela (foto ampliada, aviso) estiver aberta, esconde os quadros externos da página
 * (mapa do Google, vídeos). Alguns navegadores desenham esses quadros por cima de qualquer camada,
 * então esconder é mais seguro que depender de z-index.
 */
export function useOverlayAberto(aberto: boolean) {
  useEffect(() => {
    if (!aberto) return;
    const el = document.documentElement;
    el.classList.add("overlay-aberto");
    return () => el.classList.remove("overlay-aberto");
  }, [aberto]);
}
