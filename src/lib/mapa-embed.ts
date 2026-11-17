// Converte o que a pessoa cola no painel em um endereço de mapa que o Google permite incorporar.
// O Google NÃO deixa a página comum de um local (/maps/place/...) aparecer dentro de outro site;
// só o formato /maps/embed?pb=... . Aqui montamos esse formato a partir do próprio link do local,
// então o pin cai exatamente no estabelecimento escolhido, sem geocodificar endereço.

const EMBED = /^https:\/\/www\.google\.com\/maps\/embed\?/;
const HOST_MAPS = /^(www\.)?google\.com(\.br)?$/i;
const HOST_CURTO = /^(maps\.app\.goo\.gl|goo\.gl)$/i;

export type Resultado = { ok: string } | { erro: string };

function montarEmbed(lat: string, lng: string, nome: string, fid: string | null): string {
  const limpo = nome.replace(/[!*']/g, "").trim();
  const bloco = fid
    ? `!3m3!1m2!1s${encodeURIComponent(fid)}!2s${encodeURIComponent(limpo)}`
    : `!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(limpo)}`;
  const pb = `!1m18!1m12!1m3!1d1500!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1${bloco}!5e0!3m2!1spt-BR!2sbr`;
  return `https://www.google.com/maps/embed?pb=${pb}`;
}

export async function resolverMapa(entrada: string): Promise<Resultado> {
  let s = entrada.trim();
  if (!s) return { ok: "" };

  // Código <iframe ...> de Compartilhar > Incorporar: usa só o src.
  if (/<iframe/i.test(s)) {
    const m = s.match(/\ssrc\s*=\s*["']([^"']+)["']/i);
    if (!m) return { erro: "Não encontrei o endereço (src) dentro do código do mapa" };
    s = m[1].replace(/&amp;/g, "&").trim();
  }

  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return { erro: "Cole o link do local no Google Maps (ou o código de Compartilhar > Incorporar)" };
  }
  if (url.protocol !== "https:") return { erro: "O link do mapa precisa começar com https://" };

  // Já é um mapa incorporável.
  if (HOST_MAPS.test(url.hostname) && EMBED.test(url.href)) return { ok: url.href };

  // Link curto (maps.app.goo.gl): segue o redirecionamento para descobrir o endereço completo.
  if (HOST_CURTO.test(url.hostname)) {
    try {
      const r = await fetch(url.href, { redirect: "follow", signal: AbortSignal.timeout(6000), headers: { "User-Agent": "Mozilla/5.0" } });
      url = new URL(r.url);
    } catch {
      return { erro: "Não consegui abrir esse link curto. Abra o local no Google Maps e copie o link da barra de endereço." };
    }
  }

  if (!HOST_MAPS.test(url.hostname) || !url.pathname.startsWith("/maps")) {
    return { erro: "O link precisa ser do Google Maps (google.com/maps)" };
  }

  // Página de um local: /maps/place/<nome>/@lat,lng,17z/data=...!1s0x...:0x...
  const dec = (() => { try { return decodeURIComponent(url.pathname + url.search); } catch { return url.pathname + url.search; } })();
  const coord = dec.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!coord) {
    return { erro: "Não achei a localização nesse link. Abra o local no Google Maps e copie o link da barra de endereço." };
  }
  const nome = (dec.match(/\/place\/([^/@]+)/)?.[1] ?? "").replace(/\+/g, " ");
  const fid = dec.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i)?.[1] ?? null;
  return { ok: montarEmbed(coord[1], coord[2], nome, fid) };
}
