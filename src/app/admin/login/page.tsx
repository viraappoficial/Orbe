"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Wordmark from "@/components/Wordmark";

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

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
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível entrar");
      setEnviando(false);
    }
  }

  const campo = "w-full border-b border-line bg-transparent py-3 text-base outline-none transition-colors focus:border-accent";
  const rotulo = "mb-1 block text-xs uppercase tracking-[0.3em] text-muted";

  return (
    <main className="flex min-h-svh items-center justify-center px-5">
      <form onSubmit={entrar} className="w-full max-w-sm space-y-8 border border-line p-8">
        <div className="flex justify-center">
          <Wordmark className="h-4" />
        </div>
        <p className="text-center text-xs uppercase tracking-[0.35em] text-muted">Gestão</p>
        <div>
          <label htmlFor="user" className={rotulo}>Usuário</label>
          <input id="user" autoComplete="username" autoCapitalize="none" required value={user} onChange={(e) => setUser(e.target.value)} className={campo} />
        </div>
        <div>
          <label htmlFor="senha" className={rotulo}>Senha</label>
          <input id="senha" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={campo} />
        </div>
        {erro && <p role="alert" className="text-sm text-[#ff8a8a]">⚠ {erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="w-full border border-accent bg-accent py-4 text-sm font-medium uppercase tracking-[0.3em] text-black transition-colors hover:bg-transparent hover:text-accent disabled:opacity-50"
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
