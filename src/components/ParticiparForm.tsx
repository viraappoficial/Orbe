"use client";

import { useState } from "react";
import { TransitionLink } from "@/components/PageTransition";
import { formatPhone } from "@/lib/validate";
import { CATEGORIAS_ESPACO, validarInteresse, type TipoInteresse } from "@/lib/participar";

type Campos = {
  nome: string; whatsapp: string; instagram: string; cidade: string;
  organizacao: string; categoria: string; link: string; mensagem: string;
};
const VAZIO: Campos = { nome: "", whatsapp: "", instagram: "", cidade: "", organizacao: "", categoria: "", link: "", mensagem: "" };

export default function ParticiparForm({ inicial, listaAberta }: { inicial: TipoInteresse; listaAberta: boolean }) {
  const [tipo, setTipo] = useState<TipoInteresse>(inicial);
  const [v, setV] = useState<Campos>(VAZIO);
  const [tocou, setTocou] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "enviando" | "ok" | "erro">("idle");
  const [erroServidor, setErroServidor] = useState("");

  const r = validarInteresse({ tipo, ...v });
  const erros = r.ok ? {} : r.erros;
  const mostra = (k: keyof Campos) => (tocou[k] ? erros[k] : undefined);
  const set = (k: keyof Campos, valor: string) => setV((p) => ({ ...p, [k]: valor }));
  const toca = (k: string) => setTocou((t) => ({ ...t, [k]: true }));

  function trocar(novo: TipoInteresse) {
    if (novo === tipo) return;
    setTipo(novo);
    // estilo (DJ) e tipo de espaço têm sentidos diferentes: não carrega de um para o outro
    setV((p) => ({ ...p, categoria: "", organizacao: "", link: "" }));
    setTocou({});
  }

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTocou({ nome: true, whatsapp: true, instagram: true, cidade: true, organizacao: true, categoria: true, link: true });
    if (!r.ok) return;
    setStatus("enviando");
    setErroServidor("");
    const website = (new FormData(e.currentTarget).get("website") as string) || "";
    try {
      const res = await fetch("/api/participar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, ...v, website }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Não foi possível enviar.");
      setStatus("ok");
    } catch (err) {
      setStatus("erro");
      setErroServidor(err instanceof Error ? err.message : "Não foi possível enviar.");
    }
  }

  if (status === "ok") {
    return (
      <div role="status" className="border border-accent p-8 text-center sm:p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Recebemos seu contato</p>
        <h2 className="mt-4 text-2xl uppercase leading-tight tracking-[0.12em]">Obrigado, {v.nome.split(" ")[0]}</h2>
        <p className="mt-4 text-muted">A gente vai falar com você pelo WhatsApp.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <TransitionLink href="/" className="border border-white px-8 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:border-accent hover:bg-accent hover:text-black">
            Voltar ao início
          </TransitionLink>
          {listaAberta && (
            <TransitionLink href="/lista" className="border border-line px-8 py-4 text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:border-white hover:text-white">
              Entrar na lista da session
            </TransitionLink>
          )}
        </div>
      </div>
    );
  }

  const campo = "w-full border-b border-line bg-transparent py-3 text-base outline-none transition-colors focus:border-accent";
  const rotulo = "mb-1 block text-xs uppercase tracking-[0.3em] text-muted";
  const erroCls = "mt-2 text-sm text-[#ff8a8a]";
  const dj = tipo === "dj";

  const Texto = (k: keyof Campos, label: string, extra: { placeholder?: string; tipo?: string; mode?: "tel" | "url"; auto?: string; mascara?: (s: string) => string } = {}) => (
    <div>
      <label htmlFor={`p-${k}`} className={rotulo}>{label}</label>
      <input
        id={`p-${k}`} name={k} type={extra.tipo ?? "text"} inputMode={extra.mode} autoComplete={extra.auto ?? "off"}
        placeholder={extra.placeholder} value={v[k]}
        onChange={(e) => set(k, extra.mascara ? extra.mascara(e.target.value) : e.target.value)}
        onBlur={() => toca(k)}
        aria-invalid={!!mostra(k)} aria-describedby={mostra(k) ? `p-${k}-erro` : undefined}
        className={campo + " placeholder:text-[#555]"}
      />
      {mostra(k) && <p id={`p-${k}-erro`} className={erroCls}>⚠ {mostra(k)}</p>}
    </div>
  );

  return (
    <form onSubmit={enviar} noValidate className="space-y-8">
      <div role="tablist" aria-label="Como você quer participar" className="grid grid-cols-2 border border-line">
        {([["dj", "Sou DJ"], ["parceiro", "Espaço ou marca"]] as const).map(([id, rot]) => (
          <button
            key={id} type="button" role="tab" aria-selected={tipo === id} onClick={() => trocar(id)}
            className={`py-4 text-xs uppercase tracking-[0.25em] transition-colors ${tipo === id ? "bg-accent text-black" : "text-muted hover:text-white"}`}
          >
            {rot}
          </button>
        ))}
      </div>

      <p className="text-muted">
        {dj
          ? "Quer tocar numa session do Orbe? Conte quem você é e, se puder, mande um set para a gente ouvir."
          : "Tem um espaço para receber uma session, ou quer apoiar o selo? Conte sobre você."}
      </p>

      {Texto("nome", dj ? "Nome artístico" : "Seu nome", { auto: "name" })}
      {!dj && Texto("organizacao", "Nome do espaço ou da marca")}
      {Texto("whatsapp", "WhatsApp com DDD", { tipo: "tel", mode: "tel", auto: "tel-national", placeholder: "(00) 90000-0000", mascara: formatPhone })}
      {Texto("instagram", dj ? "Instagram" : "Instagram do espaço ou da marca (opcional)", { placeholder: "@seuperfil" })}
      {Texto("cidade", "Cidade", { auto: "address-level2" })}

      {dj ? (
        <>
          {Texto("categoria", "Seu estilo", { placeholder: "House, Techno, Afro…" })}
          {Texto("link", "Link de um set (opcional)", { mode: "url", placeholder: "SoundCloud, YouTube, Mixcloud…" })}
        </>
      ) : (
        <div>
          <label htmlFor="p-categoria" className={rotulo}>O que você tem</label>
          <select
            id="p-categoria" value={v.categoria} onChange={(e) => set("categoria", e.target.value)} onBlur={() => toca("categoria")}
            aria-invalid={!!mostra("categoria")} aria-describedby={mostra("categoria") ? "p-categoria-erro" : undefined}
            className={campo + " bg-black"}
          >
            <option value="">Escolha uma opção</option>
            {CATEGORIAS_ESPACO.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {mostra("categoria") && <p id="p-categoria-erro" className={erroCls}>⚠ {mostra("categoria")}</p>}
        </div>
      )}

      <div>
        <label htmlFor="p-mensagem" className={rotulo}>Quer contar mais? (opcional)</label>
        <textarea
          id="p-mensagem" rows={4} maxLength={600} value={v.mensagem} onChange={(e) => set("mensagem", e.target.value)}
          className={campo + " resize-none"}
        />
        <p className="mt-1 text-right text-xs text-muted">{v.mensagem.length}/600</p>
      </div>

      {/* honeypot anti-spam */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div>
        <button
          type="submit" disabled={status === "enviando"}
          className="w-full border border-accent bg-accent py-4 text-sm font-medium uppercase tracking-[0.3em] text-black transition-colors hover:bg-transparent hover:text-accent disabled:opacity-50"
        >
          {status === "enviando" ? "Enviando…" : "Enviar"}
        </button>
        {status === "erro" && <p role="alert" className={erroCls}>⚠ {erroServidor}</p>}
        <p className="mt-4 text-xs leading-relaxed text-muted">Usamos esses dados só para falar com você sobre o Orbe.</p>
      </div>
    </form>
  );
}
