import { NextResponse } from "next/server";
import { getSql, mapEvento, type Row } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Tudo que a tela da porta precisa, de uma vez, para a busca funcionar no próprio celular (mesmo sem internet).
export async function GET(req: Request) {
  const pedido = new URL(req.url).searchParams.get("evento");
  try {
    const sql = getSql();
    const evs = (pedido && UUID.test(pedido)
      ? await sql`select * from eventos where id = ${pedido}::uuid`
      : await sql`select * from eventos where destaque and status = 'publicado' limit 1`) as Row[];
    if (!evs[0]) return NextResponse.json({ error: "Nenhum evento anunciado" }, { status: 404 });
    const evento = mapEvento(evs[0]);

    const rows = (await sql`
      select id, nome, telefone, cpf, confirmacao, presente, checkin_em, origem
      from inscricoes where evento_id = ${evento.id}::uuid order by nome`) as Row[];
    return NextResponse.json({
      evento: { id: evento.id, titulo: evento.titulo, dj: evento.dj, data: evento.data, hora: evento.hora, local: evento.local },
      pessoas: rows.map((r) => {
        const cpf = String(r.cpf ?? "");
        return {
          id: String(r.id),
          nome: String(r.nome ?? ""),
          telefone: String(r.telefone ?? ""),
          // Só o final do CPF vai para a tela: dá para achar a pessoa e conferir, sem expor o número todo.
          cpfFinal: cpf.slice(-5),
          confirmacao: String(r.confirmacao ?? ""),
          presente: r.presente === true,
          checkinEm: r.checkin_em ? new Date(String(r.checkin_em)).toISOString() : null,
          origem: String(r.origem ?? "site"),
        };
      }),
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar" }, { status: 500 });
  }
}

type Acao = { id: string; presente: boolean; em?: string };

// Recebe uma ou várias confirmações de entrada (várias quando a internet voltou depois de cair).
// É idempotente: confirmar quem já entrou não muda o horário da primeira entrada.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const acoes: Acao[] = Array.isArray(body?.acoes) ? body.acoes : [];
  if (!acoes.length || acoes.length > 500) return NextResponse.json({ error: "Nada para registrar" }, { status: 400 });

  const agora = Date.now();
  for (const a of acoes) {
    if (!a || !UUID.test(String(a.id)) || typeof a.presente !== "boolean") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
  }
  try {
    const sql = getSql();
    await sql.transaction(
      acoes.map((a) => {
        // O horário vem do celular quando a entrada foi guardada sem internet. Só aceito se for plausível.
        const t = a.em ? Date.parse(a.em) : NaN;
        const em = !isNaN(t) && t <= agora + 5 * 60_000 && t >= agora - 48 * 3_600_000 ? new Date(t).toISOString() : null;
        return a.presente
          ? sql`update inscricoes set presente = true, checkin_em = coalesce(checkin_em, ${em}::timestamptz, now()) where id = ${a.id}::uuid`
          : sql`update inscricoes set presente = false, checkin_em = null where id = ${a.id}::uuid`;
      })
    );
    return NextResponse.json({ ok: true, registrados: acoes.length });
  } catch {
    return NextResponse.json({ error: "Não foi possível registrar" }, { status: 500 });
  }
}
