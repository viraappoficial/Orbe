import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { validarInteresse } from "@/lib/participar";

const LIMITE = 5; // envios por IP em 10 minutos

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });

  // honeypot: bots preenchem, pessoas não
  if ((body as Record<string, unknown>).website) return NextResponse.json({ ok: true });

  const v = validarInteresse(body as Record<string, unknown>);
  if (!v.ok) {
    const primeiro = Object.values(v.erros)[0] ?? "Confira os campos";
    return NextResponse.json({ error: primeiro, erros: v.erros }, { status: 400 });
  }
  const d = v.valores;

  const ip = (req.headers.get("x-forwarded-for") || "desconhecido").split(",")[0].trim();
  try {
    const sql = getSql();
    const n = (await sql`
      select count(*)::int as n from limite_envios
      where ip = ${ip} and rota = 'participar' and em > now() - interval '10 minutes'`) as { n: number }[];
    if (n[0].n >= LIMITE) {
      return NextResponse.json({ error: "Muitos envios seguidos. Tente de novo em alguns minutos." }, { status: 429 });
    }
    await sql`insert into limite_envios (ip, rota) values (${ip}, 'participar')`;

    // Um contato por tipo e WhatsApp: reenviar atualiza o anterior (e reabre se estava arquivado).
    await sql`
      insert into interessados (tipo, nome, whatsapp, instagram, cidade, organizacao, categoria, link, mensagem)
      values (${d.tipo}, ${d.nome}, ${d.whatsapp}, ${d.instagram}, ${d.cidade}, ${d.organizacao}, ${d.categoria}, ${d.link}, ${d.mensagem})
      on conflict (tipo, whatsapp) do update set
        nome = excluded.nome, instagram = excluded.instagram, cidade = excluded.cidade,
        organizacao = excluded.organizacao, categoria = excluded.categoria, link = excluded.link,
        mensagem = excluded.mensagem, atualizado_em = now(),
        status = case when interessados.status = 'arquivado' then 'novo' else interessados.status end`;
  } catch {
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente de novo em instantes." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
