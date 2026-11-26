import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { RE_UUID } from "@/lib/midias-input";
import { atualizarComoFoi } from "@/lib/revalidar-como-foi";

// Recebe os ids na nova ordem e grava 1, 2, 3...
export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as { eventoId?: unknown; ids?: unknown } | null;
  if (!b || typeof b.eventoId !== "string" || !RE_UUID.test(b.eventoId) || !Array.isArray(b.ids) || b.ids.length > 500 || !b.ids.every((i) => typeof i === "string" && RE_UUID.test(i)))
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  try {
    const sql = getSql();
    await sql.transaction((b.ids as string[]).map((id, i) => sql`update midias set ordem = ${i + 1} where id = ${id}::uuid and evento_id = ${b.eventoId as string}::uuid`));
    atualizarComoFoi();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível reordenar" }, { status: 500 });
  }
}
