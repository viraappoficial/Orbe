"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Wordmark from "@/components/Wordmark";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [ver, setVer] = useState(false);
  const [caps, setCaps] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const cartao = useRef<HTMLFormElement>(null);

  function tremer() {
    const el = cartao.current;
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth; // reinicia a animação
    el.classList.add("shake");
  }

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Não foi possível entrar");
      // Entrada no painel com a mesma cortina do resto do site.
      setSaindo(true);
      setTimeout(() => window.dispatchEvent(new CustomEvent("orbe:go", { detail: "/admin" })), 250);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível entrar");
      setEnviando(false);
      tremer();
    }
  }

  const rotulo = "mb-1 block text-xs uppercase tracking-[0.3em] text-muted";
  const entrada = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-10">
      <div className="hero-glow" aria-hidden="true" />

      <div className={`relative w-full max-w-sm transition-all duration-300 ${saindo ? "translate-y-3 opacity-0" : ""}`}>
        <div className="flex flex-col items-center">
          <Image
            src="/logo-transparent.png"
            alt="ORBE"
            width={909}
            height={608}
            priority
            className="logo-glow fadeup h-auto w-[min(62vw,15rem)]"
          />
          <p style={entrada(350)} className="fadeup mt-2 text-xs uppercase tracking-[0.5em] text-muted">
            Gestão
          </p>
        </div>

        <form
          ref={cartao}
          onSubmit={entrar}
          style={entrada(500)}
          className="login-form fadeup relative mt-8 space-y-7 border border-line bg-black/55 p-7 backdrop-blur-md sm:p-8"
        >
          <span className="login-topo" aria-hidden="true" />

          <div className="campo-anim fadeup" style={entrada(650)}>
            <label htmlFor="user" className={rotulo}>Usuário</label>
            <input
              id="user" autoComplete="username" autoCapitalize="none" spellCheck={false} required
              value={user} onChange={(e) => setUser(e.target.value)}
              className="w-full bg-transparent py-3 text-base outline-none"
            />
          </div>

          <div className="campo-anim fadeup" style={entrada(780)}>
            <label htmlFor="senha" className={rotulo}>Senha</label>
            <div className="relative">
              <input
                id="senha" type={ver ? "text" : "password"} autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))}
                onBlur={() => setCaps(false)}
                className="w-full bg-transparent py-3 pr-10 text-base outline-none"
              />
              <button
                type="button"
                onClick={() => setVer((v) => !v)}
                aria-label={ver ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={ver}
                className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted transition-colors hover:text-accent"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {ver && <path d="M4 4l16 16" />}
                </svg>
              </button>
            </div>
            {caps && <p className="mt-2 text-xs uppercase tracking-[0.2em] text-accent">Caps Lock ligado</p>}
          </div>

          {erro && (
            <p role="alert" className="text-sm text-[#ff8a8a]">⚠ {erro}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            style={entrada(920)}
            className="btn-shine fadeup flex w-full items-center justify-center gap-3 border border-accent bg-accent py-4 text-sm font-medium uppercase tracking-[0.3em] text-black transition-colors hover:bg-transparent hover:text-accent disabled:opacity-60"
          >
            {enviando && <span className="spinner" aria-hidden="true" />}
            {enviando ? "Entrando" : "Entrar"}
          </button>
        </form>

        <p style={entrada(1100)} className="fadeup mt-8 flex items-center justify-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-muted">
          <Wordmark className="h-2" /> Área restrita
        </p>
      </div>
    </main>
  );
}
