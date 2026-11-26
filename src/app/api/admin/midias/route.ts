import { NextResponse } from "next/server";
import { getSql, mapMidia, type Row } from "@/lib/db";
import { RE_UUID, dimensao, txt, urlMidiaValida, urlPosterValida } from "@/lib/midias-input";
import { atualizarComoFoi } from "@/lib/revalidar-como-foi";

// Lista TODAS as mídias de uma session (inclusive as escondidas), na ordem atual.
export async function GET(req: Request) {
  const evento = new URL(req.url).searchParams.get("evento") ?? "";
  if (!RE_UUID.test(evento)) return NextResponse.json({ error: "Escolha uma session" }, { status: 400 });
  try {
    const rows = (await getSql()`
      select id, tipo, url, poster, legenda, largura, altura, ordem, capa, ativo
      from midias where evento_id = ${evento}::uuid order by ordem asc, created_at asc`) as Row[];
    return NextResponse.json({ midias: rows.map((r) => ({ ...mapMidia(r), ativo: !!r.ativo })) });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar as mídias" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  const tipo = b.tipo === "video" ? "video" : b.tipo === "foto" ? "foto" : null;
  if (!tipo) return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  if (typeof b.eventoId !== "string" || !RE_UUID.test(b.eventoId)) return NextResponse.json({ error: "Escolha uma session" }, { status: 400 });
  if (!urlMidiaValida(b.url, tipo)) return NextResponse.json({ error: "Endereço do arquivo inválido" }, { status: 400 });
  const poster = b.poster ? (urlPosterValida(b.poster) ? b.poster : null) : null;
  if (b.poster && !poster) return NextResponse.json({ error: "Capa do vídeo inválida" }, { status: 400 });
  try {
    const sql = getSql();
    const rows = (await sql`
      insert into midias (evento_id, tipo, url, poster, legenda, largura, altura, ordem)
      values (${b.eventoId}::uuid, ${tipo}, ${b.url}, ${poster}, ${txt(b.legenda, 140) || null}, ${dimensao(b.largura)}, ${dimensao(b.altura)},
        coalesce((select max(ordem) + 1 from midias where evento_id = ${b.eventoId}::uuid), 1))
      returning id, tipo, url, poster, legenda, largura, altura, ordem, capa, ativo`) as Row[];
    atualizarComoFoi();
    return NextResponse.json({ midia: { ...mapMidia(rows[0]), ativo: !!rows[0].ativo } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar a mídia" }, { status: 500 });
  }
}
