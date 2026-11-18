import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql, mapApoiador, type Row } from "@/lib/db";
import { CAMPOS_APOIADOR, validarApoiador } from "@/lib/apoiadores-input";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const atualizarSite = () => { revalidatePath("/"); revalidatePath("/lista"); };

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  const v = validarApoiador(body as Record<string, unknown>, false);
  if ("erro" in v) return NextResponse.json({ error: v.erro }, { status: 400 });

  const cols = Object.keys(v.valores);
  if (!cols.length && !v.eventos) return NextResponse.json({ error: "Nada para alterar" }, { status: 400 });
  try {
    const sql = getSql();
    const ops = [];
    if (cols.length) {
      const sets = cols.map((c, i) => `${CAMPOS_APOIADOR[c]} = $${i + 1}`);
      ops.push(sql.query(`update apoiadores set ${sets.join(", ")}, updated_at = now() where id = $${cols.length + 1}::uuid`, [...cols.map((c) => v.valores[c]), id]));
    }
    if (v.eventos) {
      // Troca a lista de sessions de uma vez: apaga as antigas e grava as novas.
      ops.push(sql`delete from evento_apoiadores where apoiador_id = ${id}::uuid`);
      for (const e of v.eventos) ops.push(sql`insert into evento_apoiadores (evento_id, apoiador_id) values (${e}::uuid, ${id}::uuid) on conflict do nothing`);
    }
    await sql.transaction(ops);
    const rows = (await sql`
      select a.*, coalesce(array_agg(ea.evento_id::text) filter (where ea.evento_id is not null), '{}') as eventos
      from apoiadores a left join evento_apoiadores ea on ea.apoiador_id = a.id where a.id = ${id}::uuid group by a.id`) as Row[];
    if (!rows[0]) return NextResponse.json({ error: "Apoiador não encontrado" }, { status: 404 });
    atualizarSite();
    return NextResponse.json({ apoiador: { ...mapApoiador(rows[0]), eventos: (rows[0].eventos as string[]) ?? [] } });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  try {
    await getSql()`delete from apoiadores where id = ${id}::uuid`;
    atualizarSite();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível excluir" }, { status: 500 });
  }
}
