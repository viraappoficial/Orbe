// Regras das mídias da página "Como foi". Só aceita endereços de lugares conhecidos.
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
export const RE_UUID = new RegExp(`^${UUID}$`, "i");
const RE_ARTE = new RegExp(`^/api/arte/${UUID}$`, "i");
const RE_BLOB = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[A-Za-z0-9._\-/%]+$/i;
const RE_ESTATICO = /^\/como-foi\/[A-Za-z0-9._\-/]+$/;

export const urlMidiaValida = (u: unknown, tipo: "foto" | "video"): u is string => {
  if (typeof u !== "string" || u.length > 600) return false;
  if (tipo === "foto") return RE_ARTE.test(u) || RE_BLOB.test(u) || RE_ESTATICO.test(u);
  return RE_BLOB.test(u) || RE_ESTATICO.test(u);
};
export const urlPosterValida = (u: unknown): u is string =>
  typeof u === "string" && u.length <= 600 && (RE_ARTE.test(u) || RE_BLOB.test(u) || RE_ESTATICO.test(u));

export const txt = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
export const dimensao = (v: unknown) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 16 && n <= 10000 ? n : null;
};
