// Chamadas ao painel. Se a sessão expirar (401), volta para o login.
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
  });
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Sessão expirada");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error || "Erro inesperado");
  return json as T;
}

export type EventoAdmin = {
  id: string; titulo: string; dj: string; data: string; dia: string; hora: string; local: string;
  endereco: string; cidade: string; mapaEmbed: string; prazo: string; arteUrl: string;
  whatsappUrl: string; youtubeId: string; status: "rascunho" | "publicado";
  destaque: boolean; listaAberta: boolean; inscritos: number;
};

export type Inscrito = {
  id: string; nome: string; telefone: string; cpf: string; instagram: string; confirmacao: string; criadoEm: string;
};
