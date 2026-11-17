import { NextResponse } from "next/server";
import { getSql, type Row } from "@/lib/db";

const mascara = (cpf: string) => (cpf.length === 11 ? `***.***.***-${cpf.slice(9)}` : "");

export async function GET(req: Request) {
  const evento = new URL(req.url).searchParams.get("evento");
  try {
    const sql = getSql();
    const rows = (await sql`
      select id, nome, telefone, cpf, instagram, confirmacao, created_at
      from inscricoes
      where (${evento}::uuid is null or evento_id = ${evento}::uuid)
      order by created_at desc`) as Row[];
    return NextResponse.json({
      inscricoes: rows.map((r) => ({
        id: String(r.id),
        nome: String(r.nome ?? ""),
        telefone: String(r.telefone ?? ""),
        cpf: mascara(String(r.cpf ?? "")), // o CPF completo só sai no CSV
        instagram: String(r.instagram ?? ""),
        confirmacao: String(r.confirmacao ?? ""),
        criadoEm: r.created_at ? new Date(String(r.created_at)).toISOString() : "",
      })),
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar a lista" }, { status: 500 });
  }
}
