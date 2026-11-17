import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { normalizePhone, validPhone } from "@/lib/validate";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Quem chega e não está na lista: entra já com a presença marcada.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const evento = String(body?.evento ?? "");
  const nome = String(body?.nome ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  const tel = normalizePhone(String(body?.telefone ?? ""));
  if (!UUID.test(evento)) return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
  if (nome.length < 2) return NextResponse.json({ error: "Digite o nome" }, { status: 400 });
  if (tel && !validPhone(tel)) return NextResponse.json({ error: "WhatsApp inválido (com DDD) ou deixe em branco" }, { status: 400 });
  try {
    const rows = (await getSql()`
      insert into inscricoes (evento_id, nome, telefone, confirmacao, tipo, origem, presente, checkin_em)
      values (${evento}::uuid, ${nome}, ${tel || null}, 'sim', 'publico', 'porta', true, now())
      returning id, nome, telefone, confirmacao, presente, checkin_em, origem`) as Record<string, unknown>[];
    const r = rows[0];
    return NextResponse.json({
      pessoa: {
        id: String(r.id), nome: String(r.nome), telefone: String(r.telefone ?? ""), cpfFinal: "", confirmacao: "sim",
        presente: true, checkinEm: r.checkin_em ? new Date(String(r.checkin_em)).toISOString() : null, origem: "porta",
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível adicionar" }, { status: 500 });
  }
}
