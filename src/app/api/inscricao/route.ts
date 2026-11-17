import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { CONFIRMACOES, normalizePhone, onlyDigits, validCpf, validPhone } from "@/lib/validate";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });

  // honeypot: bots preenchem, humanos não
  if (body.website) return NextResponse.json({ ok: true });

  const nome = String(body.nome ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
  const telefone = normalizePhone(String(body.telefone ?? ""));
  const cpf = onlyDigits(String(body.cpf ?? ""));
  const instagram = String(body.instagram ?? "").trim().replace(/^@/, "").slice(0, 60);
  const confirmacao = String(body.confirmacao ?? "");

  if (nome.split(" ").length < 2) return bad("Digite seu nome completo.");
  if (!validPhone(telefone)) return bad("Digite o WhatsApp com DDD.");
  if (!validCpf(cpf)) return bad("CPF inválido. Confira os 11 números.");
  if (!(CONFIRMACOES as readonly string[]).includes(confirmacao)) return bad("Escolha uma opção de confirmação.");

  const url = process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json({ error: "Lista ainda não configurada" }, { status: 503 });
  }

  try {
    const sql = neon(url);
    // Quem manda é o servidor: só entra se houver uma session anunciada com a lista aberta.
    const ev = (await sql`
      select id from eventos where destaque and status = 'publicado' and lista_aberta limit 1`) as { id: string }[];
    if (!ev[0]) {
      return NextResponse.json({ error: "A lista está fechada no momento." }, { status: 403 });
    }
    // Uma inscrição por CPF em cada evento: reenviar atualiza a anterior.
    await sql`
      insert into inscricoes (evento_id, nome, telefone, cpf, instagram, confirmacao, tipo)
      values (${ev[0].id}::uuid, ${nome}, ${telefone}, ${cpf}, ${instagram}, ${confirmacao}, 'publico')
      on conflict (evento_id, cpf) where cpf is not null do update
        set nome = excluded.nome, telefone = excluded.telefone,
            instagram = excluded.instagram, confirmacao = excluded.confirmacao
    `;
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

function bad(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
