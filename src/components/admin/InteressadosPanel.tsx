"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type Interessado } from "./api";

const STATUS: Record<string, string> = { novo: "Novo", contatado: "Contatado", arquivado: "Arquivado" };

export default function InteressadosPanel({ aoMudar }: { aoMudar: (novos: number) => void }) {
  const [lista, setLista] = useState<Interessado[] | null>(null);
  const [tipo, setTipo] = useState("todos");
  const [situacao, setSituacao] = useState("ativos");
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      const r = await api<{ interessados: Interessado[] }>("/api/admin/interessados");
      setLista(r.interessados);
      aoMudar(r.interessados.filter((i) => i.status === "novo").length);
      setErro("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar");
    }
  }, [aoMudar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return (lista ?? []).filter(
      (i) =>
        (tipo === "todos" || i.tipo === tipo) &&
        (situacao === "todos" ? true : situacao === "ativos" ? i.status !== "arquivado" : i.status === situacao) &&
        (!q || [i.nome, i.organizacao, i.cidade, i.instagram, i.whatsapp, i.categoria].some((c) => c.toLowerCase().includes(q)))
    );
  }, [lista, tipo, situacao, busca]);

  async function mudar(i: Interessado, status: string) {
    try {
      await api(`/api/admin/interessados/${i.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao alterar");
    }
  }
  async function remover(i: Interessado) {
    if (!confirm(`Remover ${i.nome} de vez? Isso não pode ser desfeito.`)) return;
    try {
      await api(`/api/admin/interessados/${i.id}`, { method: "DELETE" });
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao remover");
    }
  }

  const campo = "border border-line bg-black px-3 py-3 text-sm outline-none focus:border-accent";
  const cont = (f: (i: Interessado) => boolean) => (lista ?? []).filter(f).length;

  if (!lista) return <p className="mt-10 text-muted">{erro ? `⚠ ${erro}` : "Carregando…"}</p>;

  return (
    <section className="mt-8 space-y-8">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Novos", cont((i) => i.status === "novo"), "text-accent"],
          ["DJs", cont((i) => i.tipo === "dj" && i.status !== "arquivado"), ""],
          ["Espaços e marcas", cont((i) => i.tipo === "parceiro" && i.status !== "arquivado"), ""],
          ["Contatados", cont((i) => i.status === "contatado"), "text-muted"],
        ].map(([rot, n, cor]) => (
          <div key={String(rot)} className="border border-line p-4">
            <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">{rot}</dt>
            <dd className={`mt-2 text-3xl ${cor}`}>{n}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, cidade, Instagram…" aria-label="Buscar" className={campo + " md:w-80"} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Filtrar por tipo" className={campo}>
          <option value="todos">DJs e espaços</option>
          <option value="dj">Só DJs</option>
          <option value="parceiro">Só espaços e marcas</option>
        </select>
        <select value={situacao} onChange={(e) => setSituacao(e.target.value)} aria-label="Filtrar por situação" className={campo}>
          <option value="ativos">Sem os arquivados</option>
          <option value="novo">Novos</option>
          <option value="contatado">Contatados</option>
          <option value="arquivado">Arquivados</option>
          <option value="todos">Todos</option>
        </select>
        {/* download de arquivo (API), não é uma página do site */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/admin/interessados/export" className="border border-white px-5 py-3 text-center text-xs uppercase tracking-[0.25em] transition-colors hover:bg-white hover:text-black md:ml-auto">
          Exportar CSV
        </a>
      </div>
      {erro && <p role="alert" className="text-sm text-[#ff8a8a]">⚠ {erro}</p>}

      {visiveis.length === 0 ? (
        <p className="py-10 text-center text-muted">{lista.length ? "Ninguém corresponde ao filtro." : "Ninguém mandou contato ainda."}</p>
      ) : (
        <ul className="space-y-4">
          {visiveis.map((i) => (
            <li key={i.id} className={`border p-5 sm:p-6 ${i.status === "novo" ? "border-accent" : "border-line"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg uppercase tracking-[0.12em]">{i.nome}</p>
                  {i.organizacao && <p className="mt-1 text-sm text-muted">{i.organizacao}</p>}
                </div>
                <p className="flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.2em]">
                  <span className="border border-white px-2 py-1">{i.tipo === "dj" ? "DJ" : "Espaço ou marca"}</span>
                  <span className={`border px-2 py-1 ${i.status === "novo" ? "border-accent text-accent" : "border-line text-muted"}`}>{STATUS[i.status]}</span>
                </p>
              </div>

              <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div><dt className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">Cidade</dt><dd>{i.cidade}</dd></div>
                <div><dt className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">{i.tipo === "dj" ? "Estilo" : "O que tem"}</dt><dd>{i.categoria || "—"}</dd></div>
                <div>
                  <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">WhatsApp</dt>
                  <dd>{i.whatsapp.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3")}</dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">Instagram</dt>
                  <dd>
                    {/^[A-Za-z0-9._]{1,30}$/.test(i.instagram) ? (
                      <a href={`https://www.instagram.com/${encodeURIComponent(i.instagram)}/`} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-accent hover:underline">@{i.instagram}</a>
                    ) : "—"}
                  </dd>
                </div>
                {i.link && (
                  <div className="sm:col-span-2">
                    <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">Link</dt>
                    <dd className="truncate">
                      {/^https?:\/\//.test(i.link) ? (
                        <a href={i.link} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-accent hover:underline">{i.link}</a>
                      ) : i.link}
                    </dd>
                  </div>
                )}
              </dl>

              {i.mensagem && <p className="mt-5 whitespace-pre-wrap border-l border-line pl-4 text-sm text-muted">{i.mensagem}</p>}

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5 text-xs uppercase tracking-[0.2em]">
                <a href={`https://wa.me/55${i.whatsapp}`} target="_blank" rel="noopener noreferrer" className="border border-accent bg-accent px-4 py-3 text-black transition-colors hover:bg-transparent hover:text-accent">
                  Chamar no WhatsApp
                </a>
                {i.status !== "contatado" && <button type="button" onClick={() => mudar(i, "contatado")} className="border border-white px-4 py-3 transition-colors hover:bg-white hover:text-black">Marcar contatado</button>}
                {i.status === "arquivado" ? (
                  <button type="button" onClick={() => mudar(i, "novo")} className="px-2 py-3 text-muted hover:text-white">Reabrir</button>
                ) : (
                  <button type="button" onClick={() => mudar(i, "arquivado")} className="px-2 py-3 text-muted hover:text-white">Arquivar</button>
                )}
                <span className="text-muted">{new Date(i.criadoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</span>
                <button type="button" onClick={() => remover(i)} className="ml-auto px-2 py-3 text-muted hover:text-[#ff8a8a]">Remover</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
