"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const EVENT = "orbe:go";

// Link que dispara a cortina de transição antes de trocar de página.
export function TransitionLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (modified) return; // abrir em nova aba etc.: navegação normal
    if (href === pathname) {
      // Já está nesta página: sobe até o topo de forma suave, em vez de pular.
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      return;
    }
    if (reduce) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(EVENT, { detail: href }));
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

// Cortina preta com linha de bronze. Cobre a tela, troca a rota e levanta.
export function Curtain() {
  const router = useRouter();
  const pathname = usePathname();
  const [covering, setCovering] = useState(false);
  const target = useRef<string | null>(null);
  const failsafe = useRef<ReturnType<typeof setTimeout> | null>(null);
  const el = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);

  useEffect(() => {
    function onGo(e: Event) {
      const href = (e as CustomEvent<string>).detail;
      target.current = href;
      setCovering(true);
      window.setTimeout(() => router.push(href), 450);
      if (failsafe.current) clearTimeout(failsafe.current);
      failsafe.current = setTimeout(() => setCovering(false), 4000);
    }
    window.addEventListener(EVENT, onGo);
    return () => window.removeEventListener(EVENT, onGo);
  }, [router]);

  // Quando a rota nova chega, volta ao topo e levanta a cortina.
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    if (!target.current) {
      // Troca de página fora dos nossos links (voltar/avançar do navegador):
      // começa escuro e clareia devagar, em vez de aparecer de repente.
      const c = el.current;
      if (!c) return;
      c.classList.add("curtain-instant");
      void c.offsetWidth; // força o navegador a registrar o estado escuro
      requestAnimationFrame(() => c.classList.remove("curtain-instant"));
      return;
    }
    window.scrollTo(0, 0);
    const t = setTimeout(() => {
      setCovering(false);
      target.current = null;
    }, 150);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div ref={el} className={`curtain ${covering ? "curtain-on" : ""}`} aria-hidden="true">
      <span className="curtain-line" />
    </div>
  );
}
