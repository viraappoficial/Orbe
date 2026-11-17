import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { interpretar } from "@/lib/importar";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LINHAS = 2000;

// Importa o CSV do Google Forms. Sem "confirmar", só confere e mostra o que aconteceria (prévia).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const evento = String(body?.evento ?? "");
  const csv = String(body?.csv ?? "");
  const confirmar = body?.confirmar === true;
  if (!UUID.test(evento)) return NextResponse.json({ error: "Escolha o evento" }, { status: 400 });
  if (!csv.trim() || csv.length > 2_000_000) return NextResponse.json({ error: "Arquivo vazio ou grande demais" }, { status: 400 });

  const r = interpretar(csv);
  if (r.erro) return NextResponse.json({ error: r.erro }, { status: 400 });
  if (r.linhas.length > MAX_LINHAS) return NextResponse.json({ error: `Mais de ${MAX_LINHAS} linhas` }, { status: 400 });

  try {
    const sql = getSql();
    const ev = (await sql`select titulo from eventos where id = ${evento}::uuid`) as { titulo: string }[];
    if (!ev[0]) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });

    // Repetidos dentro da própria planilha: vale a resposta mais recente de cada CPF.
    const porCpf = new Map<string, (typeof r.linhas)[number]>();
    for (const l of r.linhas) porCpf.set(l.cpf, l);
    const unicas = [...porCpf.values()];
    const repetidas = r.linhas.length - unicas.length;

    const existentes = new Set(
      ((await sql`select cpf from inscricoes where evento_id = ${evento}::uuid and cpf is not null`) as { cpf: string }[]).map((x) => x.cpf)
    );
    const novas = unicas.filter((l) => !existentes.has(l.cpf)).length;
    const resumo = {
      evento: ev[0].titulo,
      total: r.linhas.length + r.problemas.length,
      validas: unicas.length,
      novas,
      atualizadas: unicas.length - novas,
      repetidasNaPlanilha: repetidas,
      problemas: r.problemas,
      // Prévia sem CPF completo: só o final, como no painel.
      previa: unicas.slice(0, 50).map((l) => ({ nome: l.nome, telefone: l.telefone, cpf: `***.***.***-${l.cpf.slice(9)}`, confirmacao: l.confirmacao, novo: !existentes.has(l.cpf) })),
    };
    if (!confirmar) return NextResponse.json({ ok: true, gravado: false, ...resumo });

    await sql.transaction(
      unicas.map(
        (l) => sql`
          insert into inscricoes (evento_id, nome, telefone, cpf, confirmacao, tipo, created_at)
          values (${evento}::uuid, ${l.nome}, ${l.telefone}, ${l.cpf}, ${l.confirmacao}, 'publico', coalesce(${l.criadoEm}::timestamptz, now()))
          on conflict (evento_id, cpf) where cpf is not null do update
            set nome = excluded.nome, telefone = excluded.telefone, confirmacao = excluded.confirmacao`
      )
    );
    return NextResponse.json({ ok: true, gravado: true, ...resumo });
  } catch {
    return NextResponse.json({ error: "Não foi possível importar" }, { status: 500 });
  }
}
