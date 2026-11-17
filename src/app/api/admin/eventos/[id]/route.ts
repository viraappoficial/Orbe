import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql, mapEvento, type Row } from "@/lib/db";
import { CAMPOS, validarEvento } from "@/lib/eventos-input";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function atualizarSite() {
  revalidatePath("/");
  revalidatePath("/lista");
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  const v = validarEvento(body as Record<string, unknown>, false);
  if ("erro" in v) return NextResponse.json({ error: v.erro }, { status: 400 });

  const valores = v.valores;
  // Regra: só o que está publicado pode ser a próxima session.
  if (valores.status === "rascunho") valores.destaque = false;
  if (valores.destaque === true && valores.status === undefined) valores.status = "publicado";
  const cols = Object.keys(valores);
  if (!cols.length) return NextResponse.json({ error: "Nada para alterar" }, { status: 400 });

  const sets = cols.map((c, i) => `${CAMPOS[c]} = $${i + 1}`);
  const q = `update eventos set ${sets.join(", ")}, updated_at = now() where id = $${cols.length + 1}::uuid returning *`;
  const params = [...cols.map((c) => valores[c]), id];

  try {
    const sql = getSql();
    let rows: Row[];
    if (valores.destaque === true) {
      // Troca de "próxima session" de forma atômica: tira o destaque do anterior e põe neste.
      const res = (await sql.transaction([
        sql`update eventos set destaque = false where destaque and id <> ${id}::uuid`,
        sql.query(q, params),
      ])) as Row[][];
      rows = res[1];
    } else {
      rows = (await sql.query(q, params)) as Row[];
    }
    if (!rows[0]) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    atualizarSite();
    return NextResponse.json({ evento: mapEvento(rows[0]) });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  try {
    const sql = getSql();
    const n = (await sql`select count(*)::int as n from inscricoes where evento_id = ${id}::uuid`) as { n: number }[];
    if (n[0].n > 0) {
      return NextResponse.json(
        { error: `Este evento tem ${n[0].n} inscrição(ões). Exporte a lista e despublique o evento em vez de excluir.` },
        { status: 409 }
      );
    }
    await sql`delete from eventos where id = ${id}::uuid`;
    atualizarSite();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível excluir" }, { status: 500 });
  }
}
