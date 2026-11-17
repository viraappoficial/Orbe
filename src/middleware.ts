import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifyToken } from "@/lib/auth";

// Protege /admin e /api/admin. Só o login fica aberto.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (pathname === "/admin/login" || pathname === "/api/admin/login") return NextResponse.next();

  // Proteção CSRF: pedidos que alteram dados só valem vindos do próprio site.
  if (isApi && req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.nextUrl.host) {
      return NextResponse.json({ error: "Origem não permitida" }, { status: 403 });
    }
  }

  if (await verifyToken(req.cookies.get(COOKIE)?.value)) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  if (isApi) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
