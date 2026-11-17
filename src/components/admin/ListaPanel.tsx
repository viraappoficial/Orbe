"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type EventoAdmin, type Inscrito } from "./api";
import ImportarPanel from "./ImportarPanel";

const ROTULO: Record<string, string> = { sim: "Confirmou", talvez: "Ainda não confirma", nao: "Não vai" };
const COR: Record<string, string> = { sim: "text-accent", talvez: "text-white", nao: "text-muted" };

export default function ListaPanel({
  eventos,
  recarregar,
}: {
  eventos: EventoAdmin[];
  recarregar: () => Promise<void>;
}) {
  const inicial = eventos.find((e) => e.destaque)?.id ?? eventos[0]?.id ?? "";
  const [eventoId, setEventoId] = useState(inicial);
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [msg, setMsg] = useState("");
  const [trocando, setTrocando] = useState(false);
  const [importando, setImportando] = useState(false);

  const evento = eventos.find((e) => e.id === eventoId);

  const carregar = useCallback(async () => {
    if (!eventoId) return;
    try {
      const r = await api<{ inscricoes: Inscrito[] }>(`/api/admin/inscricoes?evento=${eventoId}`);
      setInscritos(r.inscricoes);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao carregar a lista");
    }
  }, [eventoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const contagem = useMemo(
    () => ({
      total: inscritos.length,
      sim: inscritos.filter((i) => i.confirmacao === "sim").length,
      talvez: inscritos.filter((i) => i.confirmacao === "talvez").length,
      nao: inscritos.filter((i) => i.confirmacao === "nao").length,
      entraram: inscritos.filter((i) => i.presente).length,
    }),
    [inscritos]
  );

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return inscritos.filter(
      (i) =>
        (filtro === "todos" || i.confirmacao === filtro) &&
        (!q || [i.nome, i.telefone, i.instagram].some((c) => c.toLowerCase().includes(q)))
    );
  }, [inscritos, busca, filtro]);

  async function alternarLista() {
    if (!evento) return;
    const abrir = !evento.listaAberta;
    if (!abrir && !confirm("Fechar a lista? Ninguém mais conseguirá se inscrever até você reabrir.")) return;
    setTrocando(true);
    setMsg("");
    try {
      await api(`/api/admin/eventos/${evento.id}`, { method: "PATCH", body: JSON.stringify({ listaAberta: abrir }) });
      await recarregar();
      setMsg(abrir ? "Lista aberta." : "Lista fechada.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao alterar a lista");
    } finally {
      setTrocando(false);
    }
  }

  async function remover(i: Inscrito) {
    if (!confirm(`Remover ${i.nome} da lista?`)) return;
    try {
      await api(`/api/admin/inscricoes/${i.id}`, { method: "DELETE" });
      setInscritos((l) => l.filter((x) => x.id !== i.id));
      await recarregar();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao remover");
    }
  }

  if (!eventos.length) {
    return <p className="mt-10 text-muted">Nenhum evento ainda. Crie o primeiro na aba Eventos.</p>;
  }

  const aberta = evento?.listaAberta ?? false;
  const noAr = !!evento?.destaque && evento.status === "publicado";
  const campo = "border border-line bg-black px-3 py-3 text-sm outline-none focus:border-accent";

  return (
    <section className="mt-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <label htmlFor="evento" className="mb-1 block text-xs uppercase tracking-[0.3em] text-muted">Evento</label>
          <select id="evento" value={eventoId} onChange={(e) => setEventoId(e.target.value)} className={campo + " w-full md:w-80"}>
            {eventos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.destaque ? "★ " : ""}{e.titulo} · {e.dj} ({e.inscritos})
              </option>
            ))}
          </select>
        </div>

        <div className={`flex items-center justify-between gap-5 border p-4 md:min-w-80 ${aberta ? "border-accent" : "border-line"}`}>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Lista</p>
            <p className={`mt-1 text-lg uppercase tracking-[0.15em] ${aberta ? "text-accent" : ""}`}>{aberta ? "Aberta" : "Fechada"}</p>
          </div>
          <button
            type="button"
            onClick={alternarLista}
            disabled={trocando}
            className={`border px-5 py-3 text-xs uppercase tracking-[0.25em] transition-colors disabled:opacity-50 ${
              aberta ? "border-white hover:bg-white hover:text-black" : "border-accent bg-accent text-black hover:bg-transparent hover:text-accent"
            }`}
          >
            {aberta ? "Fechar lista" : "Abrir lista"}
          </button>
        </div>
      </div>

      {evento && !noAr && (
        <p className="border border-line p-4 text-sm text-muted">
          Este evento não está anunciado como a próxima session, então o site não mostra o formulário para ele. Anuncie na aba Eventos.
        </p>
      )}
      {msg && <p role="status" className="text-sm text-accent">{msg}</p>}

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["Total", contagem.total, ""],
          ["Confirmaram", contagem.sim, "text-accent"],
          ["Ainda não confirmam", contagem.talvez, ""],
          ["Não vão", contagem.nao, "text-muted"],
          ["Entraram", contagem.entraram, "text-accent"],
        ].map(([rotulo, n, cor]) => (
          <div key={String(rotulo)} className="border border-line p-4">
            <dt className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">{rotulo}</dt>
            <dd className={`mt-2 text-3xl ${cor}`}>{n}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, WhatsApp ou Instagram"
          aria-label="Buscar na lista"
          className={campo + " md:w-80"}
        />
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar por confirmação" className={campo}>
          <option value="todos">Todos</option>
          <option value="sim">Confirmaram</option>
          <option value="talvez">Ainda não confirmam</option>
          <option value="nao">Não vão</option>
        </select>
        <div className="flex flex-col gap-3 sm:flex-row md:ml-auto">
          <button
            type="button"
            onClick={() => setImportando((v) => !v)}
            aria-expanded={importando}
            className="border border-white px-5 py-3 text-center text-xs uppercase tracking-[0.25em] transition-colors hover:bg-white hover:text-black"
          >
            Importar planilha
          </button>
          <a
            href={`/api/admin/inscricoes/export?evento=${eventoId}`}
            className="border border-white px-5 py-3 text-center text-xs uppercase tracking-[0.25em] transition-colors hover:bg-white hover:text-black"
          >
            Exportar CSV (com CPF)
          </a>
        </div>
      </div>

      {importando && evento && (
        <ImportarPanel
          eventoId={evento.id}
          eventoNome={`${evento.titulo} · ${evento.dj}`}
          aoConcluir={() => {
            carregar();
            recarregar();
          }}
        />
      )}

      {visiveis.length === 0 ? (
        <p className="py-10 text-center text-muted">{inscritos.length ? "Ninguém corresponde ao filtro." : "Ninguém se inscreveu ainda."}</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[50rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.25em] text-muted">
                {["Nome", "WhatsApp", "CPF", "Instagram", "Confirmação", "Inscrito em", "Entrada", ""].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visiveis.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3">{i.nome}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://wa.me/55${i.telefone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 hover:text-accent hover:underline"
                    >
                      {i.telefone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3")}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted">{i.cpf}</td>
                  <td className="px-4 py-3">
                    {/^[A-Za-z0-9._]{1,30}$/.test(i.instagram) ? (
                      <a
                        href={`https://www.instagram.com/${encodeURIComponent(i.instagram)}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir o Instagram de ${i.nome}`}
                        className="underline-offset-4 hover:text-accent hover:underline"
                      >
                        @{i.instagram}
                      </a>
                    ) : (
                      <span className="text-muted">{i.instagram ? i.instagram : "—"}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 ${COR[i.confirmacao] ?? ""}`}>{ROTULO[i.confirmacao] ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(i.criadoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className={`px-4 py-3 ${i.presente ? "text-accent" : "text-muted"}`}>
                    {i.presente ? `✓ ${new Date(i.checkinEm).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => remover(i)} className="text-xs uppercase tracking-[0.2em] text-muted hover:text-[#ff8a8a]">
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
