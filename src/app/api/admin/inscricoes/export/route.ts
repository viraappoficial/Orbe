import { getSql, type Row } from "@/lib/db";

// CSV para Excel brasileiro (separador ";", BOM para acentos). Inclui o CPF completo.
// Células que começam com = + - @ ganham um apóstrofo, para não virarem fórmula na planilha.
const cel = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};
const ROT: Record<string, string> = { sim: "Confirmou", talvez: "Ainda não confirma", nao: "Não vai" };

export async function GET(req: Request) {
  const evento = new URL(req.url).searchParams.get("evento");
  try {
    const rows = (await getSql()`
      select nome, telefone, cpf, instagram, confirmacao, created_at, presente, checkin_em, origem from inscricoes
      where (${evento}::uuid is null or evento_id = ${evento}::uuid)
      order by nome`) as Row[];
    const linhas = [
      ["Nome", "WhatsApp", "CPF", "Instagram (sem @)", "Confirmação", "Inscrito em", "Entrou", "Entrada em", "Origem"],
      ...rows.map((r) => [
        r.nome,
        r.telefone,
        r.cpf,
        r.instagram ?? "", // sem o @, que a planilha trataria como fórmula
        ROT[String(r.confirmacao)] ?? "",
        new Date(String(r.created_at)).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        r.presente ? "Sim" : "Não",
        r.checkin_em ? new Date(String(r.checkin_em)).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "",
        r.origem === "porta" ? "Na porta" : r.origem === "importada" ? "Importada" : "Site",
      ]),
    ];
    const csv = "﻿" + linhas.map((l) => l.map(cel).join(";")).join("\r\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="lista-orbe.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Erro ao exportar", { status: 500 });
  }
}
