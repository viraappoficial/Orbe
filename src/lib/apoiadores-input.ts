import { normalizeInstagram } from "./validate";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CAMPOS_APOIADOR: Record<string, string> = {
  nome: "nome", logoUrl: "logo_url", logoBranco: "logo_branco", link: "link", instagram: "instagram",
  descricao: "descricao", sobre: "sobre", beneficio: "beneficio", projeto: "projeto", ativo: "ativo", ordem: "ordem",
};

export type EntradaApoiador = Record<string, unknown>;
export type ResultadoApoiador = { valores: Record<string, unknown>; eventos?: string[] } | { erro: string };

/** Valida o que o painel envia para criar ou editar um apoiador. Só valida os campos que vieram. */
export function validarApoiador(b: EntradaApoiador, criando: boolean): ResultadoApoiador {
  const valores: Record<string, unknown> = {};
  const txt = (v: unknown, max: number) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

  if ("nome" in b) {
    const nome = txt(b.nome, 80);
    if (nome.length < 2) return { erro: "Digite o nome do apoiador." };
    valores.nome = nome;
  } else if (criando) return { erro: "Digite o nome do apoiador." };

  if ("link" in b) {
    let l = String(b.link ?? "").trim().slice(0, 300);
    if (l) {
      if (!/^https?:\/\//i.test(l)) l = "https://" + l;
      try {
        const u = new URL(l);
        if (!["http:", "https:"].includes(u.protocol) || !u.hostname.includes(".")) throw new Error();
        l = u.href;
      } catch {
        return { erro: "O link do apoiador parece inválido." };
      }
    }
    valores.link = l || null;
  }

  if ("instagram" in b) {
    const ig = normalizeInstagram(String(b.instagram ?? ""));
    if (ig === null) return { erro: "Instagram inválido. Use só o usuário, como @apoiador." };
    valores.instagram = ig || null;
  }

  if ("descricao" in b) valores.descricao = txt(b.descricao, 160) || null;
  if ("beneficio" in b) valores.beneficio = txt(b.beneficio, 160) || null;
  if ("sobre" in b) {
    // Texto livre com quebras de linha; só limita o tamanho. O site mostra como texto puro (nunca como HTML).
    const t = String(b.sobre ?? "").replace(/\r\n/g, "\n").trim();
    if (t.length > 600) return { erro: "O texto sobre a marca passa de 600 caracteres." };
    valores.sobre = t || null;
  }

  if ("logoUrl" in b) {
    const u = String(b.logoUrl ?? "").trim();
    // Só logos enviados pelo painel (caminho local): evita imagem de qualquer site na página.
    if (u && !/^\/api\/arte\/[0-9a-f-]{36}$/i.test(u)) return { erro: "O logo deve ser enviado pelo painel." };
    valores.logoUrl = u || null;
  }

  for (const k of ["logoBranco", "projeto", "ativo"]) {
    if (k in b) {
      if (typeof b[k] !== "boolean") return { erro: `Valor inválido em ${k}` };
      valores[k] = b[k];
    }
  }
  if ("ordem" in b) {
    const n = Number(b.ordem);
    if (!Number.isInteger(n) || n < 0 || n > 999) return { erro: "A ordem deve ser um número de 0 a 999." };
    valores.ordem = n;
  }

  let eventos: string[] | undefined;
  if ("eventos" in b) {
    if (!Array.isArray(b.eventos) || b.eventos.length > 200 || !b.eventos.every((e) => typeof e === "string" && UUID.test(e)))
      return { erro: "Lista de sessions inválida." };
    eventos = [...new Set(b.eventos as string[])];
  }
  return { valores, eventos };
}
