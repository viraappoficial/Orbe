// Sessão do admin: cookie assinado (HMAC-SHA256) com validade. Usa só Web Crypto,
// então roda tanto no middleware (edge) quanto nas rotas (node).

export const COOKIE = "orbe_admin";
export const TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

const enc = new TextEncoder();

function b64u(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// A chave vem do ambiente. Sem ela, nenhuma sessão é válida (admin desligado).
const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64u(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createToken(): Promise<string> {
  const payload = b64u(enc.encode(JSON.stringify({ exp: Date.now() + TTL_MS })));
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyToken(token?: string | null): Promise<boolean> {
  if (!token || !secret()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, await hmac(payload))) return false;
  try {
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}
