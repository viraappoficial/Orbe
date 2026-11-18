"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { api, type ApoiadorAdmin, type EventoAdmin } from "./api";
import { prepararImagem } from "./comprimir";

type Form = {
  nome: string; link: string; instagram: string; descricao: string; sobre: string; beneficio: string; logoUrl: string;
  logoBranco: boolean; projeto: boolean; ativo: boolean; ordem: string; eventos: string[];
};
const VAZIO: Form = { nome: "", link: "", instagram: "", descricao: "", sobre: "", beneficio: "", logoUrl: "", logoBranco: false, projeto: false, ativo: true, ordem: "0", eventos: [] };
const paraForm = (a: ApoiadorAdmin): Form => ({
  nome: a.nome, link: a.link, instagram: a.instagram ? `@${a.instagram}` : "", descricao: a.descricao, sobre: a.sobre, beneficio: a.beneficio, logoUrl: a.logoUrl,
  logoBranco: a.logoBranco, projeto: a.projeto, ativo: a.ativo, ordem: String(a.ordem), eventos: a.eventos,
});

export default function ApoiadoresPanel({ eventos }: { eventos: EventoAdmin[] }) {
  const [lista, setLista] = useState<ApoiadorAdmin[] | null>(null);
  const [editando, setEditando] = useState<string | "novo" | null>(null);
  const [form, setForm] = useState<Form>(VAZIO);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setLista((await api<{ apoiadores: ApoiadorAdmin[] }>("/api/admin/apoiadores")).apoiadores);
    } catch (e) {
      setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao carregar" });
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const atual = lista?.find((a) => a.id === editando);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const nomeSession = (id: string) => { const e = eventos.find((x) => x.id === id); return e ? `${e.titulo} · ${e.dj}` : "Session removida"; };

  function abrir(a: ApoiadorAdmin | "novo") {
    setMsg(null);
    if (a === "novo") { setEditando("novo"); setForm({ ...VAZIO, eventos: eventos.filter((e) => e.destaque).map((e) => e.id) }); }
    else { setEditando(a.id); setForm(paraForm(a)); }
  }

  async function enviarLogo(file: File | undefined) {
    if (!file) return;
    setMsg(null);
    if (file.size > 40 * 1024 * 1024) return setMsg({ tipo: "erro", texto: "Arquivo grande demais (máximo 40 MB)." });
    setOcupado(true);
    try {
      const { arquivo } = await prepararImagem(file);
      const dados = new FormData();
      dados.append("file", arquivo);
      const r = await api<{ url: string }>("/api/admin/arte", { method: "POST", body: dados });
      set("logoUrl", r.url);
      setMsg({ tipo: "ok", texto: "Logo enviado. Clique em Salvar para aplicar." });
    } catch (e) {
      setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao enviar o logo" });
    } finally { setOcupado(false); }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setOcupado(true); setMsg(null);
    const corpo = { ...form, ordem: Number(form.ordem || 0) };
    try {
      if (editando === "novo") {
        const r = await api<{ apoiador: ApoiadorAdmin }>("/api/admin/apoiadores", { method: "POST", body: JSON.stringify(corpo) });
        setEditando(r.apoiador.id);
      } else {
        await api(`/api/admin/apoiadores/${editando}`, { method: "PATCH", body: JSON.stringify(corpo) });
      }
      await carregar();
      setMsg({ tipo: "ok", texto: "Salvo. O site já mostra a mudança." });
    } catch (err) {
      setMsg({ tipo: "erro", texto: err instanceof Error ? err.message : "Erro ao salvar" });
    } finally { setOcupado(false); }
  }

  async function excluir() {
    if (!atual || !confirm(`Excluir o apoiador "${atual.nome}"? Ele sai do site. Isso não pode ser desfeito.`)) return;
    setOcupado(true);
    try { await api(`/api/admin/apoiadores/${atual.id}`, { method: "DELETE" }); await carregar(); setEditando(null); }
    catch (err) { setMsg({ tipo: "erro", texto: err instanceof Error ? err.message : "Erro ao excluir" }); }
    finally { setOcupado(false); }
  }

  const campo = "w-full border-b border-line bg-transparent py-3 text-base outline-none transition-colors focus:border-accent";
  const rotulo = "mb-1 block text-xs uppercase tracking-[0.3em] text-muted";
  const botao = "border px-5 py-3 text-xs uppercase tracking-[0.25em] transition-colors disabled:opacity-50";
  const caixa = "flex cursor-pointer items-center gap-3 border border-line px-4 py-3 text-sm";

  if (!lista) return <p className="mt-10 text-muted">{msg ? `⚠ ${msg.texto}` : "Carregando…"}</p>;

  return (
    <section className="mt-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted">Quem apoia o Orbe aparece na home e na página da lista.</p>
        <button type="button" onClick={() => abrir("novo")} className={botao + " shrink-0 border-accent bg-accent text-black hover:bg-transparent hover:text-accent"}>Novo apoiador</button>
      </div>

      <ul className="space-y-3">
        {lista.map((a) => (
          <li key={a.id} className={`flex flex-col gap-4 border p-4 sm:flex-row sm:items-center ${editando === a.id ? "border-accent" : "border-line"} ${a.ativo ? "" : "opacity-60"}`}>
            <div className="flex h-16 w-32 shrink-0 items-center justify-center border border-line bg-[#0a0a0a] p-2">
              {a.logoUrl
                ? <Image src={a.logoUrl} alt={a.nome} width={200} height={80} className={`max-h-12 w-auto object-contain ${a.logoBranco ? "brightness-0 invert" : ""}`} />
                : <span className="text-center text-xs uppercase tracking-[0.15em] text-muted">Sem logo</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg uppercase tracking-[0.12em]">{a.nome}</p>
              <p className="mt-2 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.2em]">
                {a.projeto && <span className="border border-accent px-2 py-1 text-accent">Projeto todo</span>}
                {a.eventos.map((id) => <span key={id} className="border border-white px-2 py-1">{nomeSession(id)}</span>)}
                {!a.projeto && a.eventos.length === 0 && <span className="border border-[#ff8a8a] px-2 py-1 text-[#ff8a8a]">Não aparece em nenhuma session</span>}
                {!a.ativo && <span className="border border-line px-2 py-1 text-muted">Desativado</span>}
              </p>
            </div>
            <button type="button" onClick={() => abrir(a)} className={botao + " border-white hover:bg-white hover:text-black"}>Editar</button>
          </li>
        ))}
        {lista.length === 0 && <li className="text-muted">Nenhum apoiador ainda.</li>}
      </ul>

      {editando && (
        <form onSubmit={salvar} className="space-y-8 border border-line p-5 sm:p-8" aria-label="Editor de apoiador">
          <h2 className="text-xs uppercase tracking-[0.35em] text-muted">{editando === "novo" ? "Novo apoiador" : "Editar apoiador"}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="md:col-span-2"><label htmlFor="ap-nome" className={rotulo}>Nome</label><input id="ap-nome" required value={form.nome} onChange={(e) => set("nome", e.target.value)} className={campo} /></div>
            <div><label htmlFor="ap-link" className={rotulo}>Site ou link (opcional)</label><input id="ap-link" value={form.link} onChange={(e) => set("link", e.target.value)} placeholder="https://…" inputMode="url" className={campo} /></div>
            <div><label htmlFor="ap-ig" className={rotulo}>Instagram (opcional)</label><input id="ap-ig" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@apoiador" className={campo} /><p className="mt-1 text-xs text-muted">Se não houver site, o logo leva ao Instagram.</p></div>
            <div className="md:col-span-2"><label htmlFor="ap-desc" className={rotulo}>Frase curta (opcional)</label><input id="ap-desc" maxLength={160} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} className={campo} /><p className="mt-1 text-xs text-muted">Aparece embaixo do logo na home.</p></div>
            <div className="md:col-span-2">
              <label htmlFor="ap-sobre" className={rotulo}>Sobre a marca (opcional)</label>
              <textarea id="ap-sobre" rows={5} maxLength={600} value={form.sobre} onChange={(e) => set("sobre", e.target.value)} className={campo + " resize-y"} />
              <p className="mt-1 flex justify-between text-xs text-muted"><span>Texto que aparece na home, ao lado do logo. Só texto, sem formatação.</span><span>{form.sobre.length}/600</span></p>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="ap-ben" className={rotulo}>Benefício para quem vai (opcional)</label>
              <input id="ap-ben" maxLength={160} value={form.beneficio} onChange={(e) => set("beneficio", e.target.value)} placeholder="Ex.: 10% de desconto com o código ORBE" className={campo} />
              <p className="mt-1 text-xs text-muted">Destaque em bronze na home e na página da lista. Só preencha se o apoiador combinou isso.</p>
            </div>
          </div>

          <div>
            <p className={rotulo}>Logo</p>
            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-48 shrink-0 items-center justify-center border border-line bg-[#0a0a0a] p-3">
                {form.logoUrl
                  ? <Image src={form.logoUrl} alt="Pré-visualização do logo" width={240} height={96} className={`max-h-16 w-auto object-contain ${form.logoBranco ? "brightness-0 invert" : ""}`} unoptimized />
                  : <span className="text-xs text-muted">Sem logo (aparece o nome)</span>}
              </div>
              <div className="space-y-3">
                <label className={botao + " inline-block cursor-pointer border-white hover:bg-white hover:text-black"}>
                  {form.logoUrl ? "Trocar logo" : "Enviar logo"}
                  <input type="file" accept="image/png,image/webp,image/jpeg" className="sr-only" onChange={(e) => enviarLogo(e.target.files?.[0])} />
                </label>
                {form.logoUrl && <button type="button" onClick={() => set("logoUrl", "")} className="ml-3 text-xs uppercase tracking-[0.2em] text-muted hover:text-white">Remover</button>}
                <p className="text-xs text-muted">PNG com fundo transparente fica melhor.</p>
                <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={form.logoBranco} onChange={(e) => set("logoBranco", e.target.checked)} className="h-4 w-4 accent-[#c9975a]" />Mostrar o logo todo em branco (para logos de uma cor só)</label>
              </div>
            </div>
          </div>

          <fieldset>
            <legend className={rotulo}>Onde aparece</legend>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <label className={caixa + (form.projeto ? " border-accent" : "")}><input type="checkbox" checked={form.projeto} onChange={(e) => set("projeto", e.target.checked)} className="h-4 w-4 accent-[#c9975a]" />Apoia o projeto todo (aparece em todas as sessions)</label>
              {eventos.map((ev) => (
                <label key={ev.id} className={caixa + (form.eventos.includes(ev.id) ? " border-accent" : "")}>
                  <input type="checkbox" checked={form.eventos.includes(ev.id)} onChange={(e) => set("eventos", e.target.checked ? [...form.eventos, ev.id] : form.eventos.filter((x) => x !== ev.id))} className="h-4 w-4 accent-[#c9975a]" />
                  <span className="min-w-0 truncate">{ev.titulo} · {ev.dj}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-8 md:grid-cols-2">
            <label className={caixa}><input type="checkbox" checked={form.ativo} onChange={(e) => set("ativo", e.target.checked)} className="h-4 w-4 accent-[#c9975a]" />Ativo (aparece no site)</label>
            <div><label htmlFor="ap-ordem" className={rotulo}>Ordem (0 aparece primeiro)</label><input id="ap-ordem" type="number" min={0} max={999} value={form.ordem} onChange={(e) => set("ordem", e.target.value)} className={campo} /></div>
          </div>

          {msg && <p role={msg.tipo === "erro" ? "alert" : "status"} className={`text-sm ${msg.tipo === "erro" ? "text-[#ff8a8a]" : "text-accent"}`}>{msg.tipo === "erro" ? "⚠ " : ""}{msg.texto}</p>}
          <div className="flex flex-wrap gap-3 border-t border-line pt-6">
            <button type="submit" disabled={ocupado} className={botao + " border-accent bg-accent text-black hover:bg-transparent hover:text-accent"}>Salvar</button>
            {atual && <button type="button" disabled={ocupado} onClick={excluir} className={botao + " ml-auto border-line text-muted hover:border-[#ff8a8a] hover:text-[#ff8a8a]"}>Excluir</button>}
            <button type="button" onClick={() => setEditando(null)} className={botao + " border-transparent text-muted hover:text-white"}>Fechar</button>
          </div>
        </form>
      )}
    </section>
  );
}
