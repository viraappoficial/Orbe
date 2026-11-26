import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getSql, type Row } from "@/lib/db";
import { RE_UUID, txt } from "@/lib/midias-input";
import { atualizarComoFoi } from "@/lib/revalidar-como-foi";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!RE_UUID.test(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  try {
    const sql = getSql();
    const atual = (await sql`select evento_id, tipo from midias where id = ${id}::uuid`) as Row[];
    if (!atual[0]) return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 });
    const ops = [];
    if (typeof b.ativo === "boolean") ops.push(sql`update midias set ativo = ${b.ativo} where id = ${id}::uuid`);
    if ("legenda" in b) ops.push(sql`update midias set legenda = ${txt(b.legenda, 140) || null} where id = ${id}::uuid`);
    if (typeof b.capa === "boolean") {
      if (atual[0].tipo !== "video") return NextResponse.json({ error: "Só vídeo pode ser a capa" }, { status: 400 });
      // Só um vídeo de capa por session.
      if (b.capa) ops.push(sql`update midias set capa = false where evento_id = ${String(atual[0].evento_id)}::uuid`);
      ops.push(sql`update midias set capa = ${b.capa} where id = ${id}::uuid`);
    }
    if (!ops.length) return NextResponse.json({ error: "Nada para alterar" }, { status: 400 });
    await sql.transaction(ops);
    atualizarComoFoi();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!RE_UUID.test(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  try {
    const sql = getSql();
    const rows = (await sql`delete from midias where id = ${id}::uuid returning url, poster`) as Row[];
    if (!rows[0]) return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 });
    // Limpa o arquivo guardado (só o que foi enviado pelo painel; os arquivos do próprio site ficam).
    for (const u of [rows[0].url, rows[0].poster].map((x) => (x == null ? "" : String(x)))) {
      const arte = /^\/api\/arte\/([0-9a-f-]{36})$/i.exec(u);
      if (arte) await sql`delete from artes where id = ${arte[1]}::uuid`.catch(() => null);
      else if (u.startsWith("https://") && process.env.BLOB_READ_WRITE_TOKEN) await del(u).catch(() => null);
    }
    atualizarComoFoi();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível apagar" }, { status: 500 });
  }
}
