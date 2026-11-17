"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";
type Fields = { nome: string; email: string; instagram: string; tipo: string };
type Errors = Partial<Record<"nome" | "email", string>>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.nome.trim()) e.nome = "Digite seu nome.";
  if (!f.email.trim()) e.email = "Digite seu e-mail.";
  else if (!emailRe.test(f.email.trim()))
    e.email = "E-mail inválido. Use o formato nome@exemplo.com.";
  return e;
}

export default function PresenceForm({ sessionLabel }: { sessionLabel?: string }) {
  const [values, setValues] = useState<Fields>({ nome: "", email: "", instagram: "", tipo: "publico" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const errors = validate(values);
  const show = (k: "nome" | "email") => touched[k] && errors[k];

  function set<K extends keyof Fields>(k: K, v: Fields[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ nome: true, email: true });
    if (Object.keys(errors).length) return;
    setStatus("loading");
    setServerError("");
    const website = (new FormData(e.currentTarget).get("website") as string) || "";
    try {
      const res = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Não foi possível enviar. Tente de novo em instantes.");
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Não foi possível enviar.");
    }
  }

  if (status === "ok") {
    return (
      <div role="status" className="border border-accent p-8 text-center">
        <p className="tracking-[0.3em] uppercase text-sm text-accent">Você está na lista</p>
        <p className="mt-3 text-muted">
          {sessionLabel ? `Nos vemos na ${sessionLabel}.` : "Avisamos você das próximas sessions."}
        </p>
      </div>
    );
  }

  const field = "w-full bg-transparent border-b border-line py-3 text-base outline-none transition-colors focus:border-accent";
  const label = "block text-xs tracking-[0.3em] uppercase text-muted mb-1";
  const err = "mt-2 text-sm text-[#ff8a8a]";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div>
        <label htmlFor="nome" className={label}>Nome</label>
        <input
          id="nome" name="nome" autoComplete="name" required
          value={values.nome}
          onChange={(e) => set("nome", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, nome: true }))}
          aria-invalid={!!show("nome")} aria-describedby={show("nome") ? "nome-erro" : undefined}
          className={field}
        />
        {show("nome") && <p id="nome-erro" className={err}>⚠ {errors.nome}</p>}
      </div>

      <div>
        <label htmlFor="email" className={label}>E-mail</label>
        <input
          id="email" name="email" type="email" autoComplete="email" inputMode="email" required
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          aria-invalid={!!show("email")} aria-describedby={show("email") ? "email-erro" : undefined}
          className={field}
        />
        {show("email") && <p id="email-erro" className={err}>⚠ {errors.email}</p>}
      </div>

      <div>
        <label htmlFor="instagram" className={label}>Instagram (opcional)</label>
        <input
          id="instagram" name="instagram" autoComplete="off" autoCapitalize="none" placeholder="@seuperfil"
          value={values.instagram}
          onChange={(e) => set("instagram", e.target.value)}
          className={field + " placeholder:text-[#555]"}
        />
      </div>

      <div>
        <label htmlFor="tipo" className={label}>Eu sou</label>
        <select
          id="tipo" name="tipo" value={values.tipo}
          onChange={(e) => set("tipo", e.target.value)}
          className={field + " bg-black"}
        >
          <option value="publico">Público</option>
          <option value="dj">DJ</option>
          <option value="parceiro">Marca ou local parceiro</option>
        </select>
      </div>

      {/* honeypot anti-spam */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <button
        type="submit" disabled={status === "loading"}
        className="w-full border border-accent bg-accent py-4 text-sm tracking-[0.3em] uppercase text-black font-medium transition-colors hover:bg-transparent hover:text-accent disabled:opacity-50"
      >
        {status === "loading" ? "Enviando…" : "Entrar na lista"}
      </button>
      {status === "error" && <p role="alert" className={err}>⚠ {serverError}</p>}
    </form>
  );
}
