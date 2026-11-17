"use client";

import Image from "next/image";
import { useEffect } from "react";

// Animação de entrada com o logo. Roda uma vez por sessão (ver script no layout).
// A duração total vem da variável CSS --io, definida antes da pintura.
export default function Intro() {
  useEffect(() => {
    try {
      sessionStorage.setItem("orbe-intro", "1");
    } catch {}
  }, []);

  function skip() {
    document.documentElement.dataset.intro = "skip";
  }

  return (
    <div className="intro" aria-hidden="true" onClick={skip}>
      <div className="intro-inner">
        <Image
          src="/logo.png"
          alt=""
          width={1536}
          height={1024}
          priority
          className="intro-logo"
        />
        <span className="intro-line" />
      </div>
    </div>
  );
}
