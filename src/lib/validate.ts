// Validações e máscaras usadas no formulário (client) e na API (server).

export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function validCpf(raw: string): boolean {
  const c = onlyDigits(raw);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) sum += Number(c[i]) * (t + 1 - i);
    if (((sum * 10) % 11) % 10 !== Number(c[t])) return false;
  }
  return true;
}

// Telefone brasileiro com DDD: 10 (fixo) ou 11 dígitos (celular, começa com 9).
export function normalizePhone(raw: string): string {
  let d = onlyDigits(raw);
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  return d;
}
export function validPhone(raw: string): boolean {
  const d = normalizePhone(raw);
  if (d.length !== 10 && d.length !== 11) return false;
  if (Number(d.slice(0, 2)) < 11) return false;
  if (d.length === 11 && d[2] !== "9") return false;
  return true;
}

export function formatCpf(raw: string): string {
  const d = onlyDigits(raw).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}
export function formatPhone(raw: string): string {
  const d = onlyDigits(raw).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const CONFIRMACOES = ["sim", "talvez", "nao"] as const;
export type Confirmacao = (typeof CONFIRMACOES)[number];

/**
 * Instagram: aceita "@fulano", "fulano" ou o link do perfil e devolve só o usuário.
 * "" = vazio (campo opcional); null = formato inválido.
 */
export function normalizeInstagram(raw: string): string | null {
  let h = raw.trim();
  if (!h) return "";
  h = h.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").split(/[/?#]/)[0].replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(h) ? h : null;
}
