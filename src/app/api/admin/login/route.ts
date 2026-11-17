import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { COOKIE, TTL_MS, createToken } from "@/lib/auth";
import { getSql } from "@/lib/db";

const hash = (s: string) => createHash("sha256").update(s).digest();
const same = (a: string, b: string) => timingSafeEqual(hash(a), hash(b));

const MAX_FALHAS = 5; // por IP, em 15 minutos

export async function POST(req: Request) {
  const esperadoUser = process.env.ADMIN_USER || "admin";
  const esperadaSenha = process.env.ADMIN_PASSWORD;
  if (!esperadaSenha) {
    return NextResponse.json({ error: "Admin ainda não configurado" }, { status: 503 });
  }

  const ip = (req.headers.get("x-forwarded-for") || "desconhecido").split(",")[0].trim();
  let sql: ReturnType<typeof getSql> | null = null;
  try {
    sql = getSql();
    const r = (await sql`
      select count(*)::int as n from admin_tentativas
      where ip = ${ip} and ok = false and em > now() - interval '15 minutes'`) as { n: number }[];
    if (r[0].n >= MAX_FALHAS) {
      return NextResponse.json({ error: "Muitas tentativas. Tente de novo em 15 minutos." }, { status: 429 });
    }
  } catch {
    sql = null; // sem banco, o limite não se aplica, mas a senha continua obrigatória
  }

  const body = await req.json().catch(() => ({}));
  const user = String(body.user ?? "");
  const pass = String(body.password ?? "");
  // avalia os dois antes de decidir, para não vazar qual campo errou pelo tempo
  const okUser = same(user, esperadoUser);
  const okPass = same(pass, esperadaSenha);
  const ok = okUser && okPass;

  if (sql) {
    try {
      await sql`insert into admin_tentativas (ip, ok) values (${ip}, ${ok})`;
    } catch {}
  }
  if (!ok) return NextResponse.json({ error: "Usuário ou senha incorretos" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE,
    value: await createToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
  return res;
}
