import { normalizePhone, onlyDigits, validCpf, validPhone } from "./validate";

// Importa a planilha do Google Forms (CSV) para a lista de presença.

/** Lê CSV com aspas, vírgula ou ponto e vírgula, e quebras de linha do Windows. */
export function lerCsv(texto: string): string[][] {
  const t = texto.replace(/^﻿/, "");
  const cab = t.split(/\r?\n/, 1)[0] ?? "";
  const sep = (cab.match(/;/g)?.length ?? 0) > (cab.match(/,/g)?.length ?? 0) ? ";" : ",";
  const linhas: string[][] = [];
  let linha: string[] = [];
  let cel = "";
  let aspas = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (aspas) {
      if (c === '"' && t[i + 1] === '"') { cel += '"'; i++; }
      else if (c === '"') aspas = false;
      else cel += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { linha.push(cel); cel = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      linha.push(cel); cel = "";
      if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
      linha = [];
    } else cel += c;
  }
  linha.push(cel);
  if (linha.some((x) => x.trim() !== "")) linhas.push(linha);
  return linhas;
}

const sem = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export type Linha = {
  linha: number; // número da linha na planilha (cabeçalho = 1)
  nome: string;
  telefone: string;
  cpf: string;
  confirmacao: "sim" | "talvez" | "nao";
  criadoEm: string | null; // ISO
};
export type Problema = { linha: number; nome: string; motivo: string };

function confirmacaoDe(texto: string): Linha["confirmacao"] | null {
  const t = sem(texto);
  if (/^sim|confirmo/.test(t) && !/nao/.test(t)) return "sim";
  if (/ainda nao|talvez|nao consigo confirmar/.test(t)) return "talvez";
  if (/nao poderei|nao vou|nao irei/.test(t)) return "nao";
  return null;
}

// "17/11/2026 13:46:05" (horário de Brasília, UTC-3 o ano todo desde 2019)
function dataDe(texto: string): string | null {
  const m = texto.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const [, d, mo, a, h, mi, s] = m;
  const iso = `${a}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T${h.padStart(2, "0")}:${mi}:${(s ?? "00").padStart(2, "0")}-03:00`;
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

export function interpretar(csv: string): { linhas: Linha[]; problemas: Problema[]; erro?: string } {
  const tabela = lerCsv(csv);
  if (tabela.length < 2) return { linhas: [], problemas: [], erro: "A planilha está vazia." };
  const cab = tabela[0].map(sem);
  const col = (...nomes: string[]) => cab.findIndex((c) => nomes.some((n) => c.includes(n)));
  const iNome = col("nome");
  const iTel = col("telefone", "whatsapp", "celular");
  const iCpf = col("cpf");
  const iConf = col("confirma", "presenca");
  const iData = col("carimbo", "data");
  const faltando = [["Nome", iNome], ["Telefone/WhatsApp", iTel], ["CPF", iCpf], ["Confirmação", iConf]].filter(([, i]) => i === -1).map(([n]) => n);
  if (faltando.length) return { linhas: [], problemas: [], erro: `Não encontrei a(s) coluna(s): ${faltando.join(", ")}.` };

  const linhas: Linha[] = [];
  const problemas: Problema[] = [];
  tabela.slice(1).forEach((r, k) => {
    const n = k + 2;
    const nome = (r[iNome] ?? "").trim().replace(/\s+/g, " ");
    const falha = (motivo: string) => problemas.push({ linha: n, nome: nome || "(sem nome)", motivo });

    if (nome.split(" ").length < 2) return falha("Nome incompleto");
    const telefone = normalizePhone(r[iTel] ?? "");
    if (!validPhone(telefone)) return falha("WhatsApp inválido");
    // A planilha guarda o CPF como número e perde o zero da frente: devolve os zeros que faltam.
    let cpf = onlyDigits(r[iCpf] ?? "");
    if (cpf.length >= 9 && cpf.length < 11) cpf = cpf.padStart(11, "0");
    if (!validCpf(cpf)) return falha("CPF inválido");
    const confirmacao = confirmacaoDe(r[iConf] ?? "");
    if (!confirmacao) return falha("Resposta de confirmação não reconhecida");
    linhas.push({ linha: n, nome, telefone, cpf, confirmacao, criadoEm: iData >= 0 ? dataDe(r[iData] ?? "") : null });
  });
  return { linhas, problemas };
}
