"use client";

import { useState } from "react";
import { api } from "./api";

type Previa = { nome: string; telefone: string; cpf: string; confirmacao: string; novo: boolean };
type Resumo = {
  gravado: boolean; evento: string; total: number; validas: number; novas: number; atualizadas: number;
  repetidasNaPlanilha: number; problemas: { linha: number; nome: string; motivo: string }[]; previa: Previa[];
};
const ROTULO: Record<string, string> = { sim: "Confirmou", talvez: "Ainda não confirma", nao: "Não vai" };

// Importa o CSV baixado do Google Forms/Planilhas. Primeiro mostra a prévia; só grava ao confirmar.
export default function ImportarPanel({
  eventoId,
  eventoNome,
  aoConcluir,
}: {
  eventoId: string;
  eventoNome: string;
  aoConcluir: () => void;
}) {
  const [csv, setCsv] = useState("");
  const [arquivo, setArquivo] = useState("");
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function escolher(file: File | undefined) {
    if (!file) return;
    setMsg(null);
    setResumo(null);
    if (file.size > 2_000_000) return setMsg({ tipo: "erro", texto: "Arquivo grande demais (máximo 2 MB)." });
    const texto = await file.text();
    setCsv(texto);
    setArquivo(file.name);
    setOcupado(true);
    try {
      setResumo(await api<Resumo>("/api/admin/importar", { method: "POST", body: JSON.stringify({ evento: eventoId, csv: texto, confirmar: false }) }));
    } catch (e) {
      setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao ler o arquivo" });
    } finally {
      setOcupado(false);
    }
  }

  async function importar() {
    setOcupado(true);
    setMsg(null);
    try {
      const r = await api<Resumo>("/api/admin/importar", { method: "POST", body: JSON.stringify({ evento: eventoId, csv, confirmar: true }) });
      setMsg({ tipo: "ok", texto: `Importado: ${r.novas} nova(s) e ${r.atualizadas} atualizada(s).` });
      setResumo(null);
      setCsv("");
      setArquivo("");
      aoConcluir();
    } catch (e) {
      setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao importar" });
    } finally {
      setOcupado(false);
    }
  }

  const botao = "border px-5 py-3 text-xs uppercase tracking-[0.25em] transition-colors disabled:opacity-50";

  return (
    <div className="space-y-6 border border-line p-5 sm:p-6" aria-label="Importar planilha">
      <div>
        <h3 className="text-xs uppercase tracking-[0.35em] text-muted">Importar planilha</h3>
        <p className="mt-2 text-sm text-muted">
          No Google Planilhas: Arquivo → Fazer download → Valores separados por vírgula (.csv). Depois escolha o arquivo aqui.
          Vai para <span className="text-white">{eventoNome}</span>. Quem já está na lista (mesmo CPF) é atualizado, não duplicado.
        </p>
        <label className={botao + " mt-4 inline-block cursor-pointer border-white hover:bg-white hover:text-black"}>
          {arquivo ? "Trocar arquivo" : "Escolher arquivo .csv"}
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => escolher(e.target.files?.[0])} />
        </label>
        {arquivo && <span className="ml-4 text-sm text-muted">{arquivo}</span>}
      </div>

      {ocupado && !resumo && <p className="text-sm text-muted">Conferindo…</p>}
      {msg && (
        <p role={msg.tipo === "erro" ? "alert" : "status"} className={`text-sm ${msg.tipo === "erro" ? "text-[#ff8a8a]" : "text-accent"}`}>
          {msg.tipo === "erro" ? "⚠ " : ""}{msg.texto}
        </p>
      )}

      {resumo && (
        <div className="space-y-5">
          <p className="text-lg">
            <span className="text-accent">{resumo.validas}</span> pessoa(s) prontas para importar
            <span className="text-muted"> · {resumo.novas} nova(s), {resumo.atualizadas} já na lista</span>
            {resumo.repetidasNaPlanilha > 0 && <span className="text-muted"> · {resumo.repetidasNaPlanilha} repetida(s) na planilha</span>}
          </p>

          {resumo.problemas.length > 0 && (
            <div className="border border-[#ff8a8a]/50 p-4 text-sm">
              <p className="text-[#ff8a8a]">⚠ {resumo.problemas.length} linha(s) serão ignoradas:</p>
              <ul className="mt-2 space-y-1 text-muted">
                {resumo.problemas.map((p) => (
                  <li key={p.linha}>Linha {p.linha} · {p.nome}: {p.motivo}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="max-h-72 overflow-auto border border-line">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="sticky top-0 bg-black">
                <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.25em] text-muted">
                  {["Nome", "WhatsApp", "CPF", "Confirmação", ""].map((h) => <th key={h} scope="col" className="px-4 py-2 font-normal">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {resumo.previa.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{p.nome}</td>
                    <td className="px-4 py-2 text-muted">{p.telefone}</td>
                    <td className="px-4 py-2 text-muted">{p.cpf}</td>
                    <td className="px-4 py-2">{ROTULO[p.confirmacao] ?? "—"}</td>
                    <td className="px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted">{p.novo ? "Nova" : "Já existe"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {resumo.validas > resumo.previa.length && <p className="text-xs text-muted">Mostrando as {resumo.previa.length} primeiras.</p>}

          <button
            type="button"
            disabled={ocupado || resumo.validas === 0}
            onClick={importar}
            className={botao + " border-accent bg-accent text-black hover:bg-transparent hover:text-accent"}
          >
            {ocupado ? "Importando…" : `Importar ${resumo.validas} pessoa(s)`}
          </button>
        </div>
      )}
    </div>
  );
}
