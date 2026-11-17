import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });

  // honeypot: bots preenchem, humanos não
  if (body.website) return NextResponse.json({ ok: true });

  const nome = String(body.nome ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const instagram = String(body.instagram ?? "").trim().replace(/^@/, "").slice(0, 60);
  const tipo = body.tipo === "dj" ? "dj" : "publico";

  if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Preencha nome e e-mail válidos" }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Lista ainda não configurada" }, { status: 503 });
  }

  const supabase = createClient(url, key);
  const { error } = await supabase
    .from("inscricoes")
    .upsert({ nome, email, instagram, tipo }, { onConflict: "email" });

  if (error) return NextResponse.json({ error: "Não foi possível salvar" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
