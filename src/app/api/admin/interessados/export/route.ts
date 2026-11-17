import { getSql, type Row } from "@/lib/db";

// CSV para Excel brasileiro. Células que começam com = + - @ ganham um apóstrofo (anti-fórmula).
const cel = (v: unknown) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET() {
  try {
    const rows = (await getSql()`
      select tipo, nome, organizacao, whatsapp, instagram, cidade, categoria, link, mensagem, status, created_at
      from interessados order by created_at desc`) as Row[];
    const linhas = [
      ["Tipo", "Nome", "Espaço ou marca", "WhatsApp", "Instagram (sem @)", "Cidade", "Estilo ou tipo de espaço", "Link", "Mensagem", "Situação", "Recebido em"],
      ...rows.map((r) => [
        r.tipo === "dj" ? "DJ" : "Espaço ou marca", r.nome, r.organizacao, r.whatsapp, r.instagram, r.cidade, r.categoria,
        r.link, r.mensagem, r.status, new Date(String(r.created_at)).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      ]),
    ];
    return new Response("﻿" + linhas.map((l) => l.map(cel).join(";")).join("\r\n"), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="interessados-orbe.csv"', "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Erro ao exportar", { status: 500 });
  }
}
