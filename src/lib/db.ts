import { neon } from "@neondatabase/serverless";
import { grupoWhatsapp, proxima } from "@/data/sessions";

export type Row = Record<string, unknown>;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  return neon(url);
}

export type Evento = {
  id: string;
  titulo: string;
  dj: string;
  data: string;
  dia: string;
  hora: string;
  local: string;
  endereco: string;
  cidade: string;
  mapaEmbed: string;
  prazo: string;
  arteUrl: string;
  whatsappUrl: string;
  youtubeId: string;
  status: "rascunho" | "publicado";
  destaque: boolean;
  listaAberta: boolean;
  createdAt: string;
};

export function mapEvento(r: Row): Evento {
  const s = (k: string) => (r[k] == null ? "" : String(r[k]));
  return {
    id: s("id"),
    titulo: s("titulo"),
    dj: s("dj"),
    data: s("data"),
    dia: s("dia"),
    hora: s("hora"),
    local: s("local"),
    endereco: s("endereco"),
    cidade: s("cidade"),
    mapaEmbed: s("mapa_embed"),
    prazo: s("prazo"),
    arteUrl: s("arte_url"),
    whatsappUrl: s("whatsapp_url"),
    youtubeId: s("youtube_id"),
    status: s("status") === "publicado" ? "publicado" : "rascunho",
    destaque: r["destaque"] === true,
    listaAberta: r["lista_aberta"] === true,
    createdAt: s("created_at"),
  };
}

// Plano B se o banco estiver fora do ar: o site continua mostrando a session de src/data/sessions.ts.
const fallback: Evento = {
  id: "fallback",
  titulo: proxima.titulo,
  dj: proxima.dj,
  data: proxima.data,
  dia: proxima.dia,
  hora: proxima.hora,
  local: proxima.local,
  endereco: proxima.endereco,
  cidade: proxima.cidade,
  mapaEmbed: proxima.mapaEmbed,
  prazo: proxima.prazo,
  arteUrl: proxima.arte,
  whatsappUrl: grupoWhatsapp,
  youtubeId: "",
  status: "publicado",
  destaque: true,
  listaAberta: true,
  createdAt: "",
};

/** A "próxima session": o evento publicado marcado como destaque. null = nenhum anunciado. */
export async function getEventoAtual(): Promise<Evento | null> {
  try {
    const sql = getSql();
    const rows = (await sql`select * from eventos where destaque and status = 'publicado' limit 1`) as Row[];
    return rows[0] ? mapEvento(rows[0]) : null;
  } catch {
    return fallback;
  }
}

/** Sessions já realizadas, com vídeo, para a seção Sessions da home. */
export async function getSessoesPublicadas(): Promise<Evento[]> {
  try {
    const sql = getSql();
    const rows = (await sql`
      select * from eventos
      where status = 'publicado' and coalesce(youtube_id, '') <> ''
      order by created_at desc`) as Row[];
    return rows.map(mapEvento);
  } catch {
    return [];
  }
}
