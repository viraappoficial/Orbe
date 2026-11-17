import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSql, mapEvento, type Row } from "@/lib/db";
import { CAMPOS, validarEvento } from "@/lib/eventos-input";

export async function GET() {
  try {
    const rows = (await getSql()`
      select e.*, (select count(*)::int from inscricoes i where i.evento_id = e.id) as inscritos
      from eventos e order by e.destaque desc, e.created_at desc`) as Row[];
    return NextResponse.json({
      eventos: rows.map((r) => ({ ...mapEvento(r), inscritos: Number(r.inscritos ?? 0) })),
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar os eventos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  const v = validarEvento(body as Record<string, unknown>, true);
  if ("erro" in v) return NextResponse.json({ error: v.erro }, { status: 400 });

  // Novo evento sempre nasce como rascunho, fora do destaque e com a lista fechada.
  const valores: Record<string, unknown> = { ...v.valores, status: "rascunho", destaque: false, listaAberta: false };
  const cols = Object.keys(valores);
  const q = `insert into eventos (${cols.map((c) => CAMPOS[c]).join(", ")})
             values (${cols.map((_, i) => `$${i + 1}`).join(", ")}) returning *`;
  try {
    const rows = (await getSql().query(q, cols.map((c) => valores[c]))) as Row[];
    revalidatePath("/");
    return NextResponse.json({ evento: mapEvento(rows[0]) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o evento" }, { status: 500 });
  }
}
