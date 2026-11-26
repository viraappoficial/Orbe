import type { Evento } from "@/lib/db";

// O evento já aconteceu? Usa o dia e o mês (ex.: "20/11"); o ano vem da data de criação do evento.
// Vale até o fim do dia do evento, no horário de Brasília (UTC-3).
export function eventoPassou(ev: Pick<Evento, "dia" | "data" | "createdAt">, agora: Date = new Date()): boolean {
  const m = /(\d{1,2})\s*[\/.]\s*(\d{1,2})/.exec(ev.dia || ev.data || "");
  if (!m) return false;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return false;
  const criado = ev.createdAt ? new Date(ev.createdAt) : null;
  const base = criado && !Number.isNaN(criado.getTime()) ? criado : agora;
  const fim = (ano: number) => Date.UTC(ano, mes - 1, dia, 23 + 3, 59, 59); // 23:59:59 em Brasília
  let ano = base.getUTCFullYear();
  // Se o dia já tinha passado quando o evento foi criado, ele é do ano seguinte.
  if (fim(ano) < base.getTime() - 45 * 86400000) ano += 1;
  return agora.getTime() > fim(ano);
}

// "Sessions 001" -> "sessions-001"
export function slugEvento(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
