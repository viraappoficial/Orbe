"use client";

import Image from "next/image";
import { useState } from "react";
import { api, type EventoAdmin } from "./api";

type Form = {
  titulo: string; dj: string; data: string; dia: string; hora: string; local: string; endereco: string;
  cidade: string; prazo: string; whatsappUrl: string; mapaEmbed: string; youtubeId: string; arteUrl: string;
};

const VAZIO: Form = {
  titulo: "", dj: "", data: "", dia: "", hora: "", local: "", endereco: "", cidade: "",
  prazo: "", whatsappUrl: "", mapaEmbed: "", youtubeId: "", arteUrl: "",
};

const paraForm = (e: EventoAdmin): Form => ({
  titulo: e.titulo, dj: e.dj, data: e.data, dia: e.dia, hora: e.hora, local: e.local, endereco: e.endereco,
  cidade: e.cidade, prazo: e.prazo, whatsappUrl: e.whatsappUrl, mapaEmbed: e.mapaEmbed,
  youtubeId: e.youtubeId, arteUrl: e.arteUrl,
});

export default function EventosPanel({
  eventos,
  recarregar,
}: {
  eventos: EventoAdmin[];
  recarregar: () => Promise<void>;
}) {
  // "novo" = criando; um id = editando; null = só a lista
  const [editando, setEditando] = useState<string | "novo" | null>(null);
  const [form, setForm] = useState<Form>(VAZIO);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const atual = eventos.find((e) => e.id === editando);
  const set = <K extends keyof Form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function abrir(e: EventoAdmin | "novo") {
    setMsg(null);
    if (e === "novo") {
      setEditando("novo");
      setForm(VAZIO);
    } else {
      setEditando(e.id);
      setForm(paraForm(e));
    }
  }

  // Salva os campos (cria se for novo) e, se pedido, aplica também o estado (publicar, anunciar...).
  async function salvar(extra?: Record<string, unknown>, texto = "Salvo.") {
    setOcupado(true);
    setMsg(null);
    try {
      let id = editando;
      if (editando === "novo") {
        const r = await api<{ evento: EventoAdmin }>("/api/admin/eventos", { method: "POST", body: JSON.stringify(form) });
        id = r.evento.id;
        setEditando(id);
        if (extra) await api(`/api/admin/eventos/${id}`, { method: "PATCH", body: JSON.stringify(extra) });
      } else {
        await api(`/api/admin/eventos/${id}`, { method: "PATCH", body: JSON.stringify({ ...form, ...extra }) });
      }
      await recarregar();
      setMsg({ tipo: "ok", texto });
    } catch (e) {
      setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao salvar" });
    } finally {
      setOcupado(false);
    }
  }

  async function mudarEstado(id: string, corpo: Record<string, unknown>, texto: string) {
    setOcupado(true);
    setMsg(null);
    try {
      await api(`/api/admin/eventos/${id}`, { method: "PATCH", body: JSON.stringify(corpo) });
      await recarregar();
      setMsg({ tipo: "ok", texto });
    } catch (e) {
      setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro" });
    } finally {
      setOcupado(false);
    }
  }

  async function excluir() {
    if (!atual || !confirm(`Excluir "${atual.titulo} · ${atual.dj}"? Isso não pode ser desfeito.`)) return;
    setOcupado(true);
    try {
      await api(`/api/admin/eventos/${atual.id}`, { method: "DELETE" });
      await recarregar();
      setEditando(null);
    } catch (e) {
      setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao excluir" });
    } finally {
      setOcupado(false);
    }
  }

  async function enviarArte(file: File | undefined) {
    if (!file) return;
    setMsg(null);
    if (file.size > 2 * 1024 * 1024) return setMsg({ tipo: "erro", texto: "A imagem passa de 2 MB. Reduza e tente de novo." });
    const dados = new FormData();
    dados.append("file", file);
    setOcupado(true);
    try {
      const r = await api<{ url: string }>("/api/admin/arte", { method: "POST", body: dados });
      set("arteUrl", r.url);
      setMsg({ tipo: "ok", texto: "Arte enviada. Clique em Salvar para aplicar." });
    } catch (e) {
      setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao enviar a imagem" });
    } finally {
      setOcupado(false);
    }
  }

  const campo = "w-full border-b border-line bg-transparent py-3 text-base outline-none transition-colors focus:border-accent";
  const rotulo = "mb-1 block text-xs uppercase tracking-[0.3em] text-muted";
  const Campo = ({ k, label, dica, className = "" }: { k: keyof Form; label: string; dica?: string; className?: string }) => (
    <div className={className}>
      <label htmlFor={`f-${k}`} className={rotulo}>{label}</label>
      <input id={`f-${k}`} value={form[k]} onChange={(e) => set(k, e.target.value)} className={campo} />
      {dica && <p className="mt-1 text-xs text-muted">{dica}</p>}
    </div>
  );
  const botao = "border px-5 py-3 text-xs uppercase tracking-[0.25em] transition-colors disabled:opacity-50";

  return (
    <section className="mt-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted">Anuncie a próxima session e gerencie as anteriores.</p>
        <button type="button" onClick={() => abrir("novo")} className={botao + " border-accent bg-accent text-black hover:bg-transparent hover:text-accent"}>
          Novo evento
        </button>
      </div>

      <ul className="space-y-3">
        {eventos.map((e) => (
          <li key={e.id} className={`flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between ${editando === e.id ? "border-accent" : "border-line"}`}>
            <div className="min-w-0">
              <p className="truncate text-lg uppercase tracking-[0.12em]">{e.titulo} · {e.dj}</p>
              <p className="mt-1 text-sm text-muted">{e.data} · {e.hora} · {e.local} · {e.inscritos} inscrito(s)</p>
              <p className="mt-2 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-[0.2em]">
                <span className={`border px-2 py-1 ${e.status === "publicado" ? "border-white" : "border-line text-muted"}`}>{e.status === "publicado" ? "Publicado" : "Rascunho"}</span>
                {e.destaque && <span className="border border-accent px-2 py-1 text-accent">Próxima session</span>}
                {e.destaque && !e.whatsappUrl && <span className="border border-[#ff8a8a] px-2 py-1 text-[#ff8a8a]">Sem link do grupo</span>}
                {e.destaque && <span className={`border px-2 py-1 ${e.listaAberta ? "border-accent text-accent" : "border-line text-muted"}`}>Lista {e.listaAberta ? "aberta" : "fechada"}</span>}
              </p>
            </div>
            <button type="button" onClick={() => abrir(e)} className={botao + " border-white hover:bg-white hover:text-black"}>Editar</button>
          </li>
        ))}
        {eventos.length === 0 && <li className="text-muted">Nenhum evento ainda.</li>}
      </ul>

      {editando && (
        <form onSubmit={(e) => { e.preventDefault(); salvar(); }} className="space-y-8 border border-line p-5 sm:p-8" aria-label="Editor de evento">
          <h2 className="text-xs uppercase tracking-[0.35em] text-muted">{editando === "novo" ? "Novo evento" : "Editar evento"}</h2>

          <div className="grid gap-8 md:grid-cols-2">
            <Campo k="titulo" label="Título" dica='Ex.: Sessions 002' />
            <Campo k="dj" label="DJ" />
            <Campo k="data" label="Data (como aparece)" dica="Ex.: 20.11" />
            <Campo k="hora" label="Hora" dica="Ex.: 16h" />
            <Campo k="dia" label="Dia para a confirmação" dica="Ex.: 20/11 (aparece em “Você confirma sua presença no dia…”)" />
            <Campo k="prazo" label="Prazo para confirmar" dica="Ex.: 18/11" />
            <Campo k="local" label="Local" className="md:col-span-2" />
            <Campo k="endereco" label="Endereço" className="md:col-span-2" />
            <Campo k="cidade" label="Cidade" dica="Ex.: Maringá, PR. Usada para o pin do mapa." />
            <Campo k="mapaEmbed" label="Link do mapa (opcional)" dica="Maps > Compartilhar > Incorporar. Cole só o endereço do src do iframe." />
            <Campo k="whatsappUrl" label="Link do grupo do WhatsApp" dica="https://chat.whatsapp.com/… Quem entra na lista é levado para cá." className="md:col-span-2" />
            <Campo k="youtubeId" label="ID do vídeo no YouTube (depois da session)" dica="Os 11 caracteres após v= no link. Aparece na seção Sessions." className="md:col-span-2" />
          </div>

          <div>
            <p className={rotulo}>Arte do evento</p>
            <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start">
              {form.arteUrl ? (
                <Image src={form.arteUrl} alt="Pré-visualização da arte" width={1080} height={1350} className="h-auto w-32 border border-line" unoptimized />
              ) : (
                <div className="flex h-40 w-32 items-center justify-center border border-dashed border-line text-xs text-muted">Sem arte</div>
              )}
              <div className="min-w-0 flex-1 space-y-4">
                <label className={botao + " inline-block cursor-pointer border-white hover:bg-white hover:text-black"}>
                  Enviar imagem
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => enviarArte(e.target.files?.[0])} />
                </label>
                <p className="text-xs text-muted">JPG, PNG ou WebP, até 2 MB. Proporção 4:5 (ex.: 1080×1350) fica melhor.</p>
                <Campo k="arteUrl" label="Ou o endereço da imagem" dica="Preenchido sozinho ao enviar." />
              </div>
            </div>
          </div>

          {msg && (
            <p role={msg.tipo === "erro" ? "alert" : "status"} className={`text-sm ${msg.tipo === "erro" ? "text-[#ff8a8a]" : "text-accent"}`}>
              {msg.tipo === "erro" ? "⚠ " : ""}{msg.texto}
            </p>
          )}

          <div className="flex flex-wrap gap-3 border-t border-line pt-6">
            <button type="submit" disabled={ocupado} className={botao + " border-white hover:bg-white hover:text-black"}>Salvar</button>

            {!(atual?.destaque && atual.status === "publicado") && (
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  if (confirm("Anunciar este evento como a próxima session? Ele aparece na home, vira o evento da /lista e a lista abre.")) {
                    salvar({ status: "publicado", destaque: true, listaAberta: true }, "Evento anunciado. A lista está aberta.");
                  }
                }}
                className={botao + " border-accent bg-accent text-black hover:bg-transparent hover:text-accent"}
              >
                Anunciar evento
              </button>
            )}

            {atual && atual.status === "publicado" && !atual.destaque && (
              <button type="button" disabled={ocupado} onClick={() => mudarEstado(atual.id, { destaque: true }, "Agora é a próxima session.")} className={botao + " border-accent text-accent hover:bg-accent hover:text-black"}>
                Definir como próxima session
              </button>
            )}

            {atual && atual.status === "publicado" && (
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  if (confirm("Despublicar? O evento sai do site e a lista deixa de aceitar inscrições.")) {
                    mudarEstado(atual.id, { status: "rascunho", listaAberta: false }, "Despublicado.");
                  }
                }}
                className={botao + " border-line text-muted hover:border-white hover:text-white"}
              >
                Despublicar
              </button>
            )}

            {atual && (
              <button type="button" disabled={ocupado} onClick={excluir} className={botao + " ml-auto border-line text-muted hover:border-[#ff8a8a] hover:text-[#ff8a8a]"}>
                Excluir
              </button>
            )}
            <button type="button" onClick={() => setEditando(null)} className={botao + " border-transparent text-muted hover:text-white"}>Fechar</button>
          </div>
        </form>
      )}
    </section>
  );
}
