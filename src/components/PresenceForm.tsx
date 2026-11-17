"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";

export default function PresenceForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("loading");
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao enviar");
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Erro ao enviar");
    }
  }

  if (status === "ok") {
    return (
      <p className="border border-line p-8 text-center tracking-widest uppercase text-sm">
        Você está na lista. Até a próxima session.
      </p>
    );
  }

  const input =
    "w-full bg-transparent border-b border-line py-3 outline-none focus:border-white transition-colors placeholder:text-muted";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <input name="nome" required placeholder="Nome" className={input} />
      <input name="email" type="email" required placeholder="E-mail" className={input} />
      <input name="instagram" placeholder="Instagram (@)" className={input} />
      <select name="tipo" defaultValue="publico" className={input + " bg-black"}>
        <option value="publico">Quero ir às sessions</option>
        <option value="dj">Sou DJ</option>
      </select>
      {/* honeypot anti-spam */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
      <button
        disabled={status === "loading"}
        className="w-full border border-white py-4 tracking-[0.3em] uppercase text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Enviando…" : "Entrar na lista"}
      </button>
      {status === "error" && <p className="text-sm text-red-400">{msg}</p>}
    </form>
  );
}
