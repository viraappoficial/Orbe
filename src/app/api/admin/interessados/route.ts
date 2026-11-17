import { NextResponse } from "next/server";
import { getSql, type Row } from "@/lib/db";

export async function GET() {
  try {
    const rows = (await getSql()`
      select id, tipo, nome, whatsapp, instagram, cidade, organizacao, categoria, link, mensagem, status, created_at
      from interessados order by (status = 'novo') desc, created_at desc`) as Row[];
    const t = (v: unknown) => (v == null ? "" : String(v));
    return NextResponse.json({
      interessados: rows.map((r) => ({
        id: t(r.id), tipo: t(r.tipo), nome: t(r.nome), whatsapp: t(r.whatsapp), instagram: t(r.instagram),
        cidade: t(r.cidade), organizacao: t(r.organizacao), categoria: t(r.categoria), link: t(r.link),
        mensagem: t(r.mensagem), status: t(r.status), criadoEm: r.created_at ? new Date(String(r.created_at)).toISOString() : "",
      })),
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar" }, { status: 500 });
  }
}
