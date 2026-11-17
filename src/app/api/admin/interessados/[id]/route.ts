import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUS = ["novo", "contatado", "arquivado"];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!UUID.test(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  if (!STATUS.includes(String(body?.status))) return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  try {
    await getSql()`update interessados set status = ${String(body.status)}, atualizado_em = now() where id = ${id}::uuid`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível alterar" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  try {
    await getSql()`delete from interessados where id = ${id}::uuid`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível remover" }, { status: 500 });
  }
}
