"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOverlayAberto } from "@/lib/overlay";
import {
  CONFIRMACOES,
  formatCpf,
  normalizeInstagram,
  formatPhone,
  validCpf,
  validPhone,
  type Confirmacao,
} from "@/lib/validate";

type Status = "idle" | "loading" | "ok" | "error";
type Fields = { nome: string; telefone: string; cpf: string; instagram: string; confirmacao: "" | Confirmacao };
type Errors = Partial<Record<"nome" | "telefone" | "cpf" | "instagram" | "confirmacao", string>>;

const OPCOES: Record<Confirmacao, string> = {
  sim: "Sim, confirmo",
  talvez: "Ainda não consigo",
  nao: "Não poderei",
};

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.nome.trim().split(/\s+/).filter(Boolean).length < 2)
    e.nome = "Digite seu nome completo.";
  if (!validPhone(f.telefone)) e.telefone = "Digite o WhatsApp com DDD, como (00) 90000-0000.";
  if (!validCpf(f.cpf)) e.cpf = "CPF inválido. Confira os 11 números.";
  if (normalizeInstagram(f.instagram) === null) e.instagram = "Use só o nome de usuário, como @seuperfil.";
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
  const [modal, setModal] = useState(false);
  useOverlayAberto(modal);
  const botaoGrupo = useRef<HTMLAnchorElement>(null);
  const botaoFechar = useRef<HTMLButtonElement>(null);

  // Depois de entrar na lista, abre o aviso com o botão do grupo (um toque real, sem bloqueio do navegador).
  useEffect(() => {
    if (status === "ok") setModal(true);
  }, [status]);

  // Modal: trava a rolagem, fecha com ESC e põe o foco no botão principal.
  useEffect(() => {
    if (!modal) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(false);
    window.addEventListener("keydown", onKey);
    (botaoGrupo.current ?? botaoFechar.current)?.focus();
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKey);
    };
  }, [modal]);

  const errors = validate(values);
  const show = (k: keyof Errors) => touched[k] && errors[k];
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => setValues((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ nome: true, telefone: true, cpf: true, instagram: true, confirmacao: true });
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
    const comGrupo = vai && !!whatsappUrl;
    const titulo = vai ? "Você está na lista" : "Recebemos sua resposta";
    const Icone = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5Z" />
        <path d="M9 9.2c.3 2.6 2.6 4.9 5.8 5.8l1.3-1.5-2-1-1 .7c-.8-.4-1.6-1.2-2-2l.7-1-1-2L9 9.2Z" />
      </svg>
    );
    return (
      <>
        <div role="status" className="p-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">{titulo}</p>
          {comGrupo ? (
            <>
              <p className="mt-4 text-lg leading-snug">Falta um passo: entre no grupo do WhatsApp para receber as informações do rolê.</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-3 bg-accent py-4 text-sm font-medium uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-90"
              >
                {Icone} Participar do grupo
              </a>
            </>
          ) : (
            <p className="mt-3 text-muted">
              {vai
                ? sessionLabel ? `Nos vemos na ${sessionLabel}.` : "Avisamos você das próximas sessions."
                : "Obrigado por avisar. Fica de olho nas próximas sessions."}
            </p>
          )}
        </div>

        {modal &&
          createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
            onClick={() => setModal(false)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 px-5 py-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-sm"
          >
            <div onClick={(e) => e.stopPropagation()} className="page-in w-full max-w-md border border-accent bg-black p-7 text-center sm:p-10">
              <p className="text-xs uppercase tracking-[0.35em] text-accent">{titulo}</p>
              <h2 id="modal-titulo" className="mt-4 text-2xl uppercase leading-tight tracking-[0.12em]">
                {comGrupo ? "Falta um passo" : vai ? "Tudo certo" : "Obrigado"}
              </h2>
              <p className="mt-4 text-muted">
                {comGrupo
                  ? "Entre no grupo do WhatsApp para receber as informações do rolê e os avisos da session."
                  : vai
                    ? sessionLabel ? `Seu nome está na lista da ${sessionLabel}. Nos vemos lá.` : "Seu nome está na lista."
                    : "Obrigado por avisar. Fica de olho nas próximas sessions."}
              </p>
              {comGrupo && (
                <a
                  ref={botaoGrupo}
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setModal(false)}
                  className="mt-8 flex w-full items-center justify-center gap-3 bg-accent py-4 text-sm font-medium uppercase tracking-[0.25em] text-black transition-opacity hover:opacity-90"
                >
                  {Icone} Participar do grupo
                </a>
              )}
              <button
                ref={botaoFechar}
                type="button"
                onClick={() => setModal(false)}
                className={`${comGrupo ? "mt-3 border-transparent text-muted hover:text-white" : "mt-8 border-white hover:bg-white hover:text-black"} w-full border py-4 text-xs uppercase tracking-[0.25em] transition-colors`}
              >
                {comGrupo ? "Agora não" : "Fechar"}
              </button>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  const field =
    "w-full bg-transparent border-b border-line py-3 text-base outline-none transition-colors focus:border-accent";
  const label = "block text-xs tracking-[0.3em] uppercase text-muted mb-1";
  const err = "mt-2 text-sm text-[#ff8a8a]";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 md:space-y-6">
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
          placeholder="(00) 90000-0000"
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
          onBlur={() => touch("instagram")}
          aria-invalid={!!show("instagram")} aria-describedby={show("instagram") ? "instagram-erro" : undefined}
          className={field + " placeholder:text-[#555]"}
        />
        {show("instagram") && <p id="instagram-erro" className={err}>⚠ {errors.instagram}</p>}
      </div>

      <fieldset aria-describedby={show("confirmacao") ? "confirmacao-erro" : undefined}>
        <legend className={label}>
          Você confirma sua presença{dia ? ` no dia ${dia}` : ""}?
        </legend>
        <div className="mt-3 grid grid-cols-3 border border-line">
          {CONFIRMACOES.map((v) => (
            <label key={v} className="relative cursor-pointer border-r border-line last:border-r-0">
              <input
                type="radio" name="confirmacao" value={v} required className="peer sr-only"
                checked={values.confirmacao === v}
                onChange={() => { set("confirmacao", v); touch("confirmacao"); }}
              />
              <span className="flex min-h-12 items-center justify-center px-2 py-3 text-center text-xs leading-snug tracking-[0.04em] text-[#bbb] transition-colors hover:text-white peer-checked:bg-accent peer-checked:font-medium peer-checked:text-black peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-accent sm:text-sm">
                {OPCOES[v]}
              </span>
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
