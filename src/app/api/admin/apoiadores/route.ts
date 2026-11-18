import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql, mapApoiador, type Row } from "@/lib/db";
import { CAMPOS_APOIADOR, validarApoiador } from "@/lib/apoiadores-input";

export async function GET() {
  try {
    const rows = (await getSql()`
      select a.*, coalesce(array_agg(ea.evento_id::text) filter (where ea.evento_id is not null), '{}') as eventos
      from apoiadores a left join evento_apoiadores ea on ea.apoiador_id = a.id
      group by a.id order by a.ordem, a.nome`) as Row[];
    return NextResponse.json({ apoiadores: rows.map((r) => ({ ...mapApoiador(r), eventos: (r.eventos as string[]) ?? [] })) });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar os apoiadores" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  const v = validarApoiador(body as Record<string, unknown>, true);
  if ("erro" in v) return NextResponse.json({ error: v.erro }, { status: 400 });

  const cols = Object.keys(v.valores);
  const q = `insert into apoiadores (${cols.map((c) => CAMPOS_APOIADOR[c]).join(", ")})
             values (${cols.map((_, i) => `$${i + 1}`).join(", ")}) returning *`;
  try {
    const sql = getSql();
    const rows = (await sql.query(q, cols.map((c) => v.valores[c]))) as Row[];
    const id = String(rows[0].id);
    if (v.eventos?.length) {
      await sql.transaction(v.eventos.map((e) => sql`insert into evento_apoiadores (evento_id, apoiador_id) values (${e}::uuid, ${id}::uuid) on conflict do nothing`));
    }
    revalidatePath("/"); revalidatePath("/lista");
    return NextResponse.json({ apoiador: { ...mapApoiador(rows[0]), eventos: v.eventos ?? [] } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o apoiador" }, { status: 500 });
  }
}
