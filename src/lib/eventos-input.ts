// Validação do que o admin envia para criar/editar um evento.

export const CAMPOS: Record<string, string> = {
  titulo: "titulo", dj: "dj", data: "data", dia: "dia", hora: "hora", local: "local",
  endereco: "endereco", cidade: "cidade", mapaEmbed: "mapa_embed", prazo: "prazo",
  arteUrl: "arte_url", whatsappUrl: "whatsapp_url", youtubeId: "youtube_id",
  status: "status", listaAberta: "lista_aberta", destaque: "destaque",
};

const MAX: Record<string, number> = {
  titulo: 80, dj: 80, data: 20, dia: 20, hora: 20, local: 120, endereco: 200, cidade: 80,
  prazo: 20, mapaEmbed: 2000, arteUrl: 300, whatsappUrl: 200, youtubeId: 11,
};

/** Devolve os valores limpos por campo, ou { erro } se algo for inválido. Só valida o que veio. */
export function validarEvento(body: Record<string, unknown>, criando: boolean): { valores: Record<string, unknown> } | { erro: string } {
  const valores: Record<string, unknown> = {};

  for (const k of Object.keys(CAMPOS)) {
    if (!(k in body)) continue;
    const v = body[k];
    if (k === "listaAberta" || k === "destaque") {
      if (typeof v !== "boolean") return { erro: `Valor inválido em ${k}` };
      valores[k] = v;
      continue;
    }
    let s = String(v ?? "").trim();
    // O Google entrega o mapa como um <iframe ...>: aceita o código inteiro e guarda só o endereço (src).
    if (k === "mapaEmbed" && /<iframe/i.test(s)) {
      const m = s.match(/\ssrc\s*=\s*["']([^"']+)["']/i);
      if (!m) return { erro: "Não encontrei o endereço (src) dentro do código do mapa" };
      s = m[1].replace(/&amp;/g, "&").trim();
    }
    if (k === "status") {
      if (s !== "rascunho" && s !== "publicado") return { erro: "Status inválido" };
      valores[k] = s;
      continue;
    }
    if (s.length > MAX[k]) return { erro: `${k} muito longo` };
    if (s && k === "whatsappUrl" && !/^https:\/\/(chat\.whatsapp\.com|wa\.me)\//.test(s))
      return { erro: "O link do grupo deve começar com https://chat.whatsapp.com/" };
    if (s && k === "mapaEmbed" && !/^https:\/\/www\.google\.com\/maps\/embed\?/.test(s))
      return { erro: "Cole o código de Compartilhar > Incorporar um mapa, do Google Maps" };
    if (s && k === "arteUrl" && !/^(\/|https:\/\/)/.test(s))
      return { erro: "A arte deve ser um caminho (/...) ou um link https://" };
    if (s && k === "youtubeId" && !/^[\w-]{11}$/.test(s))
      return { erro: "ID do YouTube inválido (são 11 caracteres)" };
    valores[k] = s === "" && !["titulo", "dj", "data", "hora", "local", "endereco"].includes(k) ? null : s;
  }

  if (criando) {
    for (const k of ["titulo", "dj", "data", "hora", "local", "endereco"]) {
      if (!valores[k]) return { erro: `Preencha o campo ${k}` };
    }
  } else {
    for (const k of ["titulo", "dj", "data", "hora", "local", "endereco"]) {
      if (k in valores && !valores[k]) return { erro: `O campo ${k} não pode ficar vazio` };
    }
  }
  return { valores };
}
