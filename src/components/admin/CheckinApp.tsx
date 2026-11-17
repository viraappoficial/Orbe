"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Pessoa = {
  id: string; nome: string; telefone: string; cpfFinal: string; confirmacao: string;
  presente: boolean; checkinEm: string | null; origem: string;
};
type EventoInfo = { id: string; titulo: string; dj: string; data: string; hora: string; local: string };
type Acao = { id: string; presente: boolean; em: string };

const FILA = "orbe-checkin-fila";
const sem = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const hora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }) : "";
const ROTULO: Record<string, string> = { sim: "Confirmou", talvez: "Ainda não confirmou", nao: "Disse que não vai" };

function lerFila(): Acao[] {
  try {
    const v = JSON.parse(localStorage.getItem(FILA) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default function CheckinApp() {
  const [evento, setEvento] = useState<EventoInfo | null>(null);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "faltam" | "entraram">("todos");
  const [fila, setFila] = useState<Acao[]>([]);
  const [online, setOnline] = useState(true);
  const [erro, setErro] = useState("");
  const [carregado, setCarregado] = useState(false);
  const [toast, setToast] = useState<{ texto: string; id: string } | null>(null);
  const [porta, setPorta] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTel, setNovoTel] = useState("");
  const [portaErro, setPortaErro] = useState("");
  const [salvandoPorta, setSalvandoPorta] = useState(false);
  const enviando = useRef(false);
  const filaRef = useRef<Acao[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gravarFila = (f: Acao[]) => {
    filaRef.current = f;
    setFila(f);
    try {
      localStorage.setItem(FILA, JSON.stringify(f));
    } catch {}
  };

  const carregar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/checkin");
      if (res.status === 401) return void (window.location.href = "/admin/login");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao carregar");
      setEvento(json.evento);
      // Entradas ainda não enviadas continuam valendo na tela.
      const pend = new Map(filaRef.current.map((a) => [a.id, a]));
      setPessoas((json.pessoas as Pessoa[]).map((p) => (pend.has(p.id) ? { ...p, presente: pend.get(p.id)!.presente, checkinEm: pend.get(p.id)!.presente ? pend.get(p.id)!.em : null } : p)));
      setErro("");
      setOnline(true);
      setCarregado(true);
    } catch (e) {
      if (e instanceof TypeError) setOnline(false);
      else setErro(e instanceof Error ? e.message : "Erro ao carregar");
    }
  }, []);

  // Envia as entradas guardadas. Se a internet cair, elas ficam na fila (e no celular) até voltar.
  const enviar = useCallback(async () => {
    if (enviando.current || filaRef.current.length === 0) return;
    enviando.current = true;
    const lote = [...filaRef.current];
    try {
      const res = await fetch("/api/admin/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acoes: lote }) });
      if (res.status === 401) return void (window.location.href = "/admin/login");
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        // 2xx: gravado. 4xx: dado inválido, não adianta tentar de novo.
        gravarFila(filaRef.current.filter((a) => !lote.some((l) => l.id === a.id && l.em === a.em && l.presente === a.presente)));
        setOnline(true);
      } else {
        setOnline(false);
      }
    } catch {
      setOnline(false);
    } finally {
      enviando.current = false;
    }
  }, []);

  useEffect(() => {
    gravarFila(lerFila());
    carregar();
    setOnline(navigator.onLine);
    const volta = () => { setOnline(true); enviar(); carregar(); };
    const cai = () => setOnline(false);
    window.addEventListener("online", volta);
    window.addEventListener("offline", cai);
    const t = setInterval(() => {
      if (filaRef.current.length) enviar();
      else carregar(); // vê o que outros porteiros marcaram
    }, 8000);
    enviar();
    return () => {
      window.removeEventListener("online", volta);
      window.removeEventListener("offline", cai);
      clearInterval(t);
    };
  }, [carregar, enviar]);

  function marcar(p: Pessoa, presente: boolean) {
    const em = new Date().toISOString();
    setPessoas((l) => l.map((x) => (x.id === p.id ? { ...x, presente, checkinEm: presente ? em : null } : x)));
    // uma ação por pessoa: a última vale
    gravarFila([...filaRef.current.filter((a) => a.id !== p.id), { id: p.id, presente, em }]);
    enviar();
    if (presente) navigator.vibrate?.(25);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ texto: presente ? `${p.nome} entrou ✓` : `Entrada de ${p.nome} desfeita`, id: presente ? p.id : "" });
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }

  const lista = useMemo(() => {
    const tokens = sem(busca).split(/\s+/).filter(Boolean);
    return pessoas.filter((p) => {
      if (filtro === "faltam" && (p.presente || p.confirmacao === "nao")) return false;
      if (filtro === "entraram" && !p.presente) return false;
      return tokens.every((t) => (/^\d+$/.test(t) ? p.telefone.includes(t) || p.cpfFinal.includes(t) : sem(p.nome).includes(t)));
    });
  }, [pessoas, busca, filtro]);

  const entraram = pessoas.filter((p) => p.presente).length;
  const naLista = pessoas.filter((p) => p.confirmacao !== "nao" || p.presente).length;
  const faltam = pessoas.filter((p) => !p.presente && p.confirmacao !== "nao").length;
  const pct = naLista ? Math.min(100, Math.round((entraram / naLista) * 100)) : 0;

  async function adicionarNaPorta(e: React.FormEvent) {
    e.preventDefault();
    if (!evento) return;
    setSalvandoPorta(true);
    setPortaErro("");
    try {
      const res = await fetch("/api/admin/checkin/porta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ evento: evento.id, nome: novoNome, telefone: novoTel }) });
      if (res.status === 401) return void (window.location.href = "/admin/login");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Não foi possível adicionar");
      setPessoas((l) => [...l, json.pessoa].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      setToast({ texto: `${json.pessoa.nome} entrou ✓ (na porta)`, id: json.pessoa.id });
      setNovoNome(""); setNovoTel(""); setPorta(false); setBusca("");
      navigator.vibrate?.(25);
    } catch (err) {
      setPortaErro(err instanceof TypeError ? "Sem internet. Para adicionar alguém na porta é preciso conexão." : err instanceof Error ? err.message : "Erro");
    } finally {
      setSalvandoPorta(false);
    }
  }

  const campo = "w-full border border-line bg-black px-4 py-4 text-base outline-none transition-colors focus:border-accent";
  const chip = (id: typeof filtro, rot: string) => (
    <button type="button" onClick={() => setFiltro(id)} aria-pressed={filtro === id}
      className={`flex-1 border px-3 py-3 text-xs uppercase tracking-[0.2em] transition-colors ${filtro === id ? "border-accent bg-accent text-black" : "border-line text-muted"}`}>
      {rot}
    </button>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-3 py-3">
        <Link href="/admin" className="flex min-h-11 items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted hover:text-white">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path d="M15 5H1M5 1L1 5l4 4" /></svg>
          Painel
        </Link>
        <span className="text-xs uppercase tracking-[0.35em] text-accent">Check-in</span>
      </header>

      {evento && (
        <p className="mt-2 text-sm text-muted">
          {evento.titulo} · {evento.dj} · {evento.data} {evento.hora} · {evento.local}
        </p>
      )}

      {(!online || fila.length > 0) && (
        <p role="status" className="mt-4 border border-accent p-3 text-sm text-accent">
          {!online ? "Sem conexão. " : ""}
          {fila.length > 0 ? `${fila.length} entrada(s) guardada(s) no celular, enviando quando a internet voltar.` : "As entradas ficam guardadas e são enviadas quando voltar."}
        </p>
      )}
      {erro && <p role="alert" className="mt-4 text-sm text-[#ff8a8a]">⚠ {erro}</p>}

      <section aria-label="Contagem" className="mt-6">
        <dl className="grid grid-cols-3 gap-3">
          {[["Entraram", entraram, "text-accent"], ["Faltam", faltam, ""], ["Na lista", naLista, "text-muted"]].map(([r, n, c]) => (
            <div key={String(r)} className="border border-line p-3 sm:p-4">
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-muted sm:text-[0.65rem]">{r}</dt>
              <dd className={`mt-1 text-3xl sm:text-4xl ${c}`} aria-live="polite">{n}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 h-1 w-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Quem já entrou">
          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <div className="sticky top-0 z-20 -mx-4 mt-6 space-y-3 bg-black px-4 pb-3 pt-3">
        <div className="relative">
          <input
            type="search" value={busca} onChange={(e) => setBusca(e.target.value)} autoFocus autoComplete="off" enterKeyHint="done"
            placeholder="Nome, final do CPF ou WhatsApp" aria-label="Buscar pessoa" className={campo}
            onKeyDown={(e) => {
              if (e.key === "Enter" && lista.length === 1 && !lista[0].presente) marcar(lista[0], true);
            }}
          />
          {busca && (
            <button type="button" onClick={() => setBusca("")} aria-label="Limpar busca" className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted hover:text-white">✕</button>
          )}
        </div>
        <div className="flex gap-2">{chip("todos", "Todos")}{chip("faltam", "Faltam")}{chip("entraram", "Entraram")}</div>
      </div>

      <ul className="mt-2 space-y-3">
        {lista.map((p) => (
          <li key={p.id} className={`border p-4 ${p.presente ? "border-accent/60 bg-accent/5" : "border-line"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-lg uppercase leading-snug tracking-[0.08em]">{p.nome}</p>
                <p className="mt-1 text-sm text-muted">
                  {p.cpfFinal && <>CPF ···{p.cpfFinal}</>}
                  {p.cpfFinal && p.telefone && " · "}
                  {p.telefone && <>WhatsApp ···{p.telefone.slice(-4)}</>}
                  {!p.cpfFinal && !p.telefone && "Sem CPF nem WhatsApp"}
                </p>
              </div>
              <p className="flex shrink-0 flex-col items-end gap-1 text-[0.6rem] uppercase tracking-[0.15em]">
                <span className={p.confirmacao === "sim" ? "text-accent" : "text-muted"}>{p.origem === "porta" ? "Na porta" : ROTULO[p.confirmacao] ?? ""}</span>
              </p>
            </div>
            {p.presente ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.2em] text-accent">✓ Entrou {hora(p.checkinEm)}</p>
                <button type="button" onClick={() => { if (confirm(`Desfazer a entrada de ${p.nome}?`)) marcar(p, false); }} className="min-h-11 px-3 text-xs uppercase tracking-[0.2em] text-muted hover:text-white">
                  Desfazer
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => marcar(p, true)}
                className="mt-4 min-h-14 w-full border border-accent bg-accent text-sm font-medium uppercase tracking-[0.25em] text-black transition-colors active:bg-transparent active:text-accent">
                Confirmar entrada
              </button>
            )}
            {!p.presente && p.confirmacao === "nao" && <p className="mt-2 text-xs text-muted">Esta pessoa respondeu que não viria.</p>}
          </li>
        ))}
        {lista.length === 0 && (
          <li className="py-10 text-center text-muted">
            {!carregado
              ? "Carregando a lista…"
              : pessoas.length
                ? "Ninguém encontrado. Confira a grafia ou use o botão abaixo."
                : "Nenhuma pessoa na lista deste evento."}
          </li>
        )}
      </ul>

      {toast && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-2xl items-center justify-between gap-3 border border-accent bg-black p-4 text-sm shadow-[0_10px_40px_rgba(0,0,0,.8)]">
          <span className="min-w-0 break-words">{toast.texto}</span>
          {toast.id && (
            <button type="button" onClick={() => { const p = pessoas.find((x) => x.id === toast.id); if (p) marcar(p, false); }} className="shrink-0 px-2 py-2 text-xs uppercase tracking-[0.2em] text-accent">
              Desfazer
            </button>
          )}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-black px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto max-w-2xl">
          <button type="button" onClick={() => setPorta(true)} className="min-h-14 w-full border border-white text-xs uppercase tracking-[0.25em] transition-colors hover:bg-white hover:text-black">
            Não está na lista? Adicionar na porta
          </button>
        </div>
      </div>

      {porta && (
        <div role="dialog" aria-modal="true" aria-labelledby="porta-t" onClick={() => setPorta(false)} className="fixed inset-0 z-40 flex items-end justify-center bg-black/85 sm:items-center sm:p-4">
          <form onSubmit={adicionarNaPorta} onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-5 border border-accent bg-black p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <h2 id="porta-t" className="text-xs uppercase tracking-[0.35em] text-accent">Adicionar na porta</h2>
            <div>
              <label htmlFor="n-nome" className="mb-1 block text-xs uppercase tracking-[0.3em] text-muted">Nome</label>
              <input id="n-nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} autoFocus required autoComplete="off" className={campo} />
            </div>
            <div>
              <label htmlFor="n-tel" className="mb-1 block text-xs uppercase tracking-[0.3em] text-muted">WhatsApp com DDD (opcional)</label>
              <input id="n-tel" value={novoTel} onChange={(e) => setNovoTel(e.target.value)} type="tel" inputMode="tel" autoComplete="off" className={campo} />
            </div>
            {portaErro && <p role="alert" className="text-sm text-[#ff8a8a]">⚠ {portaErro}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={salvandoPorta} className="min-h-14 flex-1 border border-accent bg-accent text-sm font-medium uppercase tracking-[0.2em] text-black disabled:opacity-50">
                {salvandoPorta ? "Salvando…" : "Adicionar e confirmar"}
              </button>
              <button type="button" onClick={() => setPorta(false)} className="min-h-14 px-4 text-xs uppercase tracking-[0.2em] text-muted hover:text-white">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
