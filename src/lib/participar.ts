import { normalizeInstagram, normalizePhone, validPhone } from "./validate";

export const TIPOS = ["dj", "parceiro"] as const;
export type TipoInteresse = (typeof TIPOS)[number];

export const CATEGORIAS_ESPACO = [
  "Bar ou restaurante",
  "Casa de shows",
  "Marca ou patrocinador",
  "Produtora ou coletivo",
  "Outro",
] as const;

export type Interesse = {
  tipo: TipoInteresse;
  nome: string;
  whatsapp: string;
  instagram: string;
  cidade: string;
  organizacao: string;
  categoria: string;
  link: string;
  mensagem: string;
};

export type Entrada = Partial<Record<keyof Interesse, unknown>>;
export type Resultado = { ok: true; valores: Interesse } | { ok: false; erros: Partial<Record<keyof Interesse, string>> };

const txt = (v: unknown, max: number) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, max);

/** Valida e limpa um pedido de participação. Mesma regra no formulário e no servidor. */
export function validarInteresse(b: Entrada): Resultado {
  const tipo = b.tipo === "parceiro" ? "parceiro" : b.tipo === "dj" ? "dj" : null;
  const erros: Partial<Record<keyof Interesse, string>> = {};
  if (!tipo) return { ok: false, erros: { tipo: "Escolha DJ ou espaço/marca." } };

  const nome = txt(b.nome, 100);
  const whatsapp = normalizePhone(String(b.whatsapp ?? ""));
  const cidade = txt(b.cidade, 80);
  const organizacao = txt(b.organizacao, 100);
  const categoria = txt(b.categoria, 80);
  const mensagem = String(b.mensagem ?? "").trim().slice(0, 600);
  const ig = normalizeInstagram(String(b.instagram ?? ""));
  let link = String(b.link ?? "").trim().slice(0, 300);

  if (nome.length < 2) erros.nome = tipo === "dj" ? "Digite seu nome artístico." : "Digite seu nome.";
  if (!validPhone(whatsapp)) erros.whatsapp = "Digite o WhatsApp com DDD.";
  if (cidade.length < 2) erros.cidade = "Digite a cidade.";
  if (ig === null) erros.instagram = "Use só o nome de usuário, como @seuperfil.";
  else if (tipo === "dj" && !ig) erros.instagram = "Informe seu Instagram.";
  if (tipo === "parceiro" && organizacao.length < 2) erros.organizacao = "Digite o nome do espaço ou da marca.";
  if (tipo === "parceiro" && !(CATEGORIAS_ESPACO as readonly string[]).includes(categoria)) erros.categoria = "Escolha uma opção.";
  if (tipo === "dj" && categoria.length < 2) erros.categoria = "Conte seu estilo, como House ou Techno.";

  if (link) {
    if (!/^https?:\/\//i.test(link)) link = "https://" + link;
    try {
      const u = new URL(link);
      if (!["http:", "https:"].includes(u.protocol) || !u.hostname.includes(".")) throw new Error();
      link = u.href;
    } catch {
      erros.link = "Esse link parece inválido.";
    }
  }

  if (Object.keys(erros).length) return { ok: false, erros };
  return {
    ok: true,
    valores: {
      tipo: tipo!,
      nome,
      whatsapp,
      instagram: ig ?? "",
      cidade,
      organizacao: tipo === "parceiro" ? organizacao : "",
      categoria,
      link,
      mensagem,
    },
  };
}
