"use client";

import { useEffect, useState } from "react";
import {
  CONFIRMACOES,
  formatCpf,
  formatPhone,
  validCpf,
  validPhone,
  type Confirmacao,
} from "@/lib/validate";

type Status = "idle" | "loading" | "ok" | "error";
type Fields = { nome: string; telefone: string; cpf: string; instagram: string; confirmacao: "" | Confirmacao };
type Errors = Partial<Record<"nome" | "telefone" | "cpf" | "confirmacao", string>>;

const WA_DELAY = 5;

const OPCOES: Record<Confirmacao, string> = {
  sim: "Sim, confirmo minha presença",
  talvez: "Ainda não consigo confirmar",
  nao: "Não poderei participar",
};

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.nome.trim().split(/\s+/).filter(Boolean).length < 2)
    e.nome = "Digite seu nome completo.";
  if (!validPhone(f.telefone)) e.telefone = "Digite o WhatsApp com DDD, como (67) 99999-9999.";
  if (!validCpf(f.cpf)) e.cpf = "CPF inválido. Confira os 11 números.";
  if (!f.confirmacao) e.confirmacao = "Escolha uma opção.";
  return e;
}

export default function PresenceForm({
  sessionLabel,
  dia,
  prazo,
  whatsappUrl,
}: {
  sessionLabel?: string;
  dia?: string;
  prazo?: string;
  whatsappUrl?: string;
}) {
  const [values, setValues] = useState<Fields>({ nome: "", telefone: "", cpf: "", instagram: "", confirmacao: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const [count, setCount] = useState(WA_DELAY);
  const [auto, setAuto] = useState(true);

  // Depois de entrar na lista, leva a pessoa ao grupo do WhatsApp.
  useEffect(() => {
    if (status !== "ok" || !whatsappUrl || !auto) return;
    if (count <= 0) {
      window.location.href = whatsappUrl;
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, whatsappUrl, auto, count]);

  const errors = validate(values);
  const show = (k: keyof Errors) => touched[k] && errors[k];
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => setValues((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ nome: true, telefone: true, cpf: true, confirmacao: true });
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
    const vai = values.confirmacao !== "nao";
    return (
      <div role="status" className="p-2 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          {vai ? "Você está na lista" : "Recebemos sua resposta"}
        </p>
        {whatsappUrl ? (
          <>
            <p className="mt-4 text-lg leading-snug">
              Falta um passo: entre no grupo do WhatsApp para receber as informações do rolê.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block w-full bg-accent py-4 text-sm font-medium uppercase tracking-[0.3em] text-black transition-opacity hover:opacity-90"
            >
              Entrar no grupo do WhatsApp
            </a>
            {auto && (
              <p className="mt-5 text-sm text-muted">
                Abrindo o grupo em {count}s…{" "}
                <button type="button" onClick={() => setAuto(false)} className="underline underline-offset-4 hover:text-white">
                  Ficar aqui
                </button>
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-muted">
            {vai
              ? sessionLabel ? `Nos vemos na ${sessionLabel}.` : "Avisamos você das próximas sessions."
              : "Obrigado por avisar. Fica de olho nas próximas sessions."}
          </p>
        )}
      </div>
    );
  }

  const field =
    "w-full bg-transparent border-b border-line py-3 text-base outline-none transition-colors focus:border-accent";
  const label = "block text-xs tracking-[0.3em] uppercase text-muted mb-1";
  const err = "mt-2 text-sm text-[#ff8a8a]";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div>
        <label htmlFor="nome" className={label}>Nome completo</label>
        <input
          id="nome" name="nome" autoComplete="name" required
          value={values.nome}
          onChange={(e) => set("nome", e.target.value)}
          onBlur={() => touch("nome")}
          aria-invalid={!!show("nome")} aria-describedby={show("nome") ? "nome-erro" : undefined}
          className={field}
        />
        {show("nome") && <p id="nome-erro" className={err}>⚠ {errors.nome}</p>}
      </div>

      <div>
        <label htmlFor="telefone" className={label}>WhatsApp com DDD</label>
        <input
          id="telefone" name="telefone" type="tel" autoComplete="tel-national" inputMode="tel" required
          placeholder="(67) 99999-9999"
          value={values.telefone}
          onChange={(e) => set("telefone", formatPhone(e.target.value))}
          onBlur={() => touch("telefone")}
          aria-invalid={!!show("telefone")} aria-describedby={show("telefone") ? "telefone-erro" : undefined}
          className={field + " placeholder:text-[#555]"}
        />
        {show("telefone") && <p id="telefone-erro" className={err}>⚠ {errors.telefone}</p>}
      </div>

      <div>
        <label htmlFor="cpf" className={label}>CPF</label>
        <input
          id="cpf" name="cpf" inputMode="numeric" autoComplete="off" required
          placeholder="000.000.000-00"
          value={values.cpf}
          onChange={(e) => set("cpf", formatCpf(e.target.value))}
          onBlur={() => touch("cpf")}
          aria-invalid={!!show("cpf")} aria-describedby={show("cpf") ? "cpf-erro" : undefined}
          className={field + " placeholder:text-[#555]"}
        />
        {show("cpf") && <p id="cpf-erro" className={err}>⚠ {errors.cpf}</p>}
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

      <fieldset aria-describedby={show("confirmacao") ? "confirmacao-erro" : undefined}>
        <legend className={label}>
          Você confirma sua presença{dia ? ` no dia ${dia}` : ""}?
        </legend>
        <div className="mt-3 space-y-2">
          {CONFIRMACOES.map((v) => (
            <label
              key={v}
              className={`flex cursor-pointer items-center gap-3 border px-4 py-3 transition-colors ${
                values.confirmacao === v ? "border-accent" : "border-line hover:border-[#444]"
              }`}
            >
              <input
                type="radio" name="confirmacao" value={v} required
                checked={values.confirmacao === v}
                onChange={() => { set("confirmacao", v); touch("confirmacao"); }}
                className="h-4 w-4 shrink-0 accent-[#c9975a]"
              />
              <span>{OPCOES[v]}</span>
            </label>
          ))}
        </div>
        {show("confirmacao") && <p id="confirmacao-erro" className={err}>⚠ {errors.confirmacao}</p>}
      </fieldset>

      {/* honeypot anti-spam */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div>
        <button
          type="submit" disabled={status === "loading"}
          className="w-full border border-accent bg-accent py-4 text-sm font-medium uppercase tracking-[0.3em] text-black transition-colors hover:bg-transparent hover:text-accent disabled:opacity-50"
        >
          {status === "loading" ? "Enviando…" : "Entrar na lista"}
        </button>
        {status === "error" && <p role="alert" className={err}>⚠ {serverError}</p>}
        <p className="mt-4 text-xs leading-relaxed text-muted">
          {prazo ? `Confirme sua presença até ${prazo}. ` : ""}A organização usará os dados do cadastro
          para gerenciar a lista de convidados e enviar avisos sobre o evento.
        </p>
      </div>
    </form>
  );
}
