import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });

  // honeypot: bots preenchem, humanos não
  if (body.website) return NextResponse.json({ ok: true });

  const nome = String(body.nome ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const instagram = String(body.instagram ?? "").trim().replace(/^@/, "").slice(0, 60);
  const tipo = body.tipo === "dj" ? "dj" : body.tipo === "parceiro" ? "parceiro" : "publico";

  if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Preencha nome e e-mail válidos" }, { status: 400 });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json({ error: "Lista ainda não configurada" }, { status: 503 });
  }

  try {
    const sql = neon(url);
    await sql`
      insert into inscricoes (nome, email, instagram, tipo)
      values (${nome}, ${email}, ${instagram}, ${tipo})
      on conflict (email) do update
        set nome = excluded.nome, instagram = excluded.instagram, tipo = excluded.tipo
    `;
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
