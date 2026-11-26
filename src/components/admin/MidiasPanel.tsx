"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { api, type EventoAdmin } from "./api";
import { prepararImagem } from "./comprimir";
import type { Midia } from "@/data/como-foi";

type MidiaAdmin = Midia & { ativo: boolean };
type Envio = { id: number; nome: string; etapa: string; pct: number; erro?: string };

const MAX_VIDEO = 300 * 1024 * 1024;

// Capa do vídeo: um quadro do próprio arquivo, tirado no navegador.
async function capaDoVideo(file: File): Promise<{ capa: File; w: number; h: number }> {
  const url = URL.createObjectURL(file);
  try {
    const v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
    await new Promise<void>((ok, falha) => { v.onloadeddata = () => ok(); v.onerror = () => falha(new Error("Não consegui ler esse vídeo")); });
    v.currentTime = Math.min(1.2, (v.duration || 2) / 2);
    await new Promise<void>((ok) => { v.onseeked = () => ok(); });
    const w = v.videoWidth, h = v.videoHeight;
    const esc = Math.min(1, 720 / Math.max(w, h));
    const c = document.createElement("canvas");
    c.width = Math.round(w * esc); c.height = Math.round(h * esc);
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((ok) => c.toBlob(ok, "image/webp", 0.8));
    if (!blob) throw new Error("Não consegui gerar a capa do vídeo");
    return { capa: new File([blob], "capa.webp", { type: "image/webp" }), w, h };
  } finally { URL.revokeObjectURL(url); }
}

export default function MidiasPanel({ eventos }: { eventos: EventoAdmin[] }) {
  const publicados = eventos;
  const [eventoId, setEventoId] = useState(publicados.find((e) => e.destaque)?.id ?? publicados[0]?.id ?? "");
  const [midias, setMidias] = useState<MidiaAdmin[] | null>(null);
  const [blob, setBlob] = useState<boolean | null>(null);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const contador = useRef(0);

  const carregar = useCallback(async () => {
    if (!eventoId) return;
    try { setMidias((await api<{ midias: MidiaAdmin[] }>(`/api/admin/midias?evento=${eventoId}`)).midias); }
    catch (e) { setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao carregar" }); }
  }, [eventoId]);
  useEffect(() => { setMidias(null); carregar(); }, [carregar]);
  useEffect(() => { api<{ blob: boolean }>("/api/admin/midias/config").then((r) => setBlob(r.blob)).catch(() => setBlob(false)); }, []);

  const marcar = (id: number, p: Partial<Envio>) => setEnvios((l) => l.map((x) => (x.id === id ? { ...x, ...p } : x)));

  async function enviarArquivo(file: File) {
    const id = ++contador.current;
    setEnvios((l) => [...l, { id, nome: file.name, etapa: "Preparando", pct: 0 }]);
    try {
      if (file.type.startsWith("image/")) {
        const { arquivo } = await prepararImagem(file);
        marcar(id, { etapa: "Enviando foto", pct: 30 });
        const dados = new FormData(); dados.append("file", arquivo);
        const r = await api<{ url: string }>("/api/admin/arte", { method: "POST", body: dados });
        const bmp = await createImageBitmap(arquivo); const w = bmp.width, h = bmp.height; bmp.close();
        await api("/api/admin/midias", { method: "POST", body: JSON.stringify({ eventoId, tipo: "foto", url: r.url, largura: w, altura: h }) });
      } else if (file.type.startsWith("video/")) {
        if (!blob) throw new Error("Falta ligar o armazenamento de vídeos (veja o aviso acima).");
        if (file.size > MAX_VIDEO) throw new Error("Vídeo grande demais (máximo 300 MB). Reduza ou corte antes.");
        marcar(id, { etapa: "Gerando capa", pct: 5 });
        const { capa, w, h } = await capaDoVideo(file);
        const dados = new FormData(); dados.append("file", capa);
        const rc = await api<{ url: string }>("/api/admin/arte", { method: "POST", body: dados });
        marcar(id, { etapa: "Enviando vídeo", pct: 10 });
        const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
        const r = await upload(`como-foi/${Date.now()}.${ext}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/midias/upload",
          multipart: file.size > 20 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => marcar(id, { pct: 10 + Math.round(percentage * 0.88) }),
        });
        await api("/api/admin/midias", { method: "POST", body: JSON.stringify({ eventoId, tipo: "video", url: r.url, poster: rc.url, largura: w, altura: h }) });
      } else {
        throw new Error("Use foto (JPG, PNG, WebP) ou vídeo (MP4, MOV, WebM).");
      }
      marcar(id, { etapa: "Pronto", pct: 100 });
    } catch (e) {
      marcar(id, { etapa: "Falhou", erro: e instanceof Error ? e.message : "Erro ao enviar" });
    }
  }

  async function enviarTodos(arquivos: FileList | File[]) {
    if (!eventoId) return setMsg({ tipo: "erro", texto: "Escolha a session primeiro." });
    setMsg(null);
    for (const f of Array.from(arquivos)) await enviarArquivo(f); // um por vez, para não pesar no celular
    await carregar();
  }

  async function mudar(m: MidiaAdmin, dados: Record<string, unknown>) {
    try { await api(`/api/admin/midias/${m.id}`, { method: "PATCH", body: JSON.stringify(dados) }); await carregar(); }
    catch (e) { setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao salvar" }); }
  }
  async function apagar(m: MidiaAdmin) {
    if (!confirm("Apagar esta mídia? Não dá para desfazer.")) return;
    try { await api(`/api/admin/midias/${m.id}`, { method: "DELETE" }); await carregar(); }
    catch (e) { setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao apagar" }); }
  }
  // Ordem completa que vai para o servidor: capa, vídeos do carrossel, fotos, ocultas.
  const montar = (v: MidiaAdmin[], f: MidiaAdmin[]) => [...(capa ? [capa] : []), ...v, ...f, ...ocultas];
  async function salvarOrdem(lista: MidiaAdmin[]) {
    setMidias(lista);
    try { await api("/api/admin/midias/ordem", { method: "POST", body: JSON.stringify({ eventoId, ids: lista.map((x) => x.id) }) }); }
    catch (e) { setMsg({ tipo: "erro", texto: e instanceof Error ? e.message : "Erro ao reordenar" }); carregar(); }
  }
  async function mover(sec: "videos" | "fotos", i: number, para: number) {
    const lista = sec === "videos" ? [...videos] : [...fotos];
    if (para < 0 || para >= lista.length || para === i) return;
    const [m] = lista.splice(i, 1); lista.splice(para, 0, m);
    await salvarOrdem(sec === "videos" ? montar(lista, fotos) : montar(videos, lista));
  }

  const todas = midias ?? [];
  const capa = todas.find((m) => m.tipo === "video" && m.capa && m.ativo) ?? null;
  const videos = todas.filter((m) => m.tipo === "video" && m.ativo && m !== capa);
  const fotos = todas.filter((m) => m.tipo === "foto" && m.ativo);
  const ocultas = todas.filter((m) => !m.ativo);
  const capaOculta = todas.find((m) => m.tipo === "video" && m.capa && !m.ativo);
  const botao = "border border-line px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted transition-colors hover:border-white hover:text-white disabled:opacity-40";
  const sessao = publicados.find((e) => e.id === eventoId);
  const ocupado = envios.some((x) => !x.erro && x.etapa !== "Pronto");

  return (
    <section aria-label="Mídias do Como foi" className="space-y-8">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="md-sessao" className="mb-1 block text-xs uppercase tracking-[0.3em] text-muted">Session</label>
          <select id="md-sessao" value={eventoId} onChange={(e) => setEventoId(e.target.value)} className="border-b border-line bg-black py-2 pr-6 text-base outline-none focus:border-accent">
            {publicados.map((e) => <option key={e.id} value={e.id}>{e.titulo} · {e.dj}</option>)}
          </select>
        </div>
        {sessao && (
          <a href={`/como-foi/${sessao.titulo.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`} target="_blank" rel="noopener noreferrer" className={botao}>
            Ver página ↗
          </a>
        )}
      </div>

      {blob === false && (
        <div className="border border-accent px-5 py-4 text-sm leading-relaxed">
          <p className="mb-1 text-xs uppercase tracking-[0.3em] text-accent">Vídeos: falta ligar o armazenamento</p>
          Fotos já podem ser enviadas. Para enviar vídeos, na Vercel abra o projeto, vá em <b>Storage</b>, clique em <b>Create</b>, escolha <b>Blob</b> e conecte ao projeto. Depois faça um <b>Redeploy</b>.
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastando(false); if (e.dataTransfer.files.length) enviarTodos(e.dataTransfer.files); }}
        className={`border border-dashed px-5 py-10 text-center transition-colors ${arrastando ? "border-accent bg-white/5" : "border-line"}`}
      >
        <p className="text-sm text-muted">Arraste fotos e vídeos para cá, ou</p>
        <button type="button" onClick={() => entrada.current?.click()} className="mt-4 border border-white px-6 py-3 text-xs uppercase tracking-[0.3em] transition-colors hover:border-accent hover:bg-accent hover:text-black">
          Escolher arquivos
        </button>
        <input ref={entrada} type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" className="sr-only"
          onChange={(e) => { if (e.target.files?.length) enviarTodos(e.target.files); e.target.value = ""; }} aria-label="Escolher fotos e vídeos" />
        <p className="mt-4 text-xs text-muted">Fotos: JPG, PNG ou WebP (o painel reduz sozinho). Vídeos: MP4, MOV ou WebM, até 300 MB. Quanto mais leve, mais rápido abre no celular de quem vê.</p>
      </div>

      {envios.length > 0 && (
        <ul className="space-y-2" aria-live="polite">
          {envios.map((x) => (
            <li key={x.id} className="border border-line px-4 py-3 text-sm">
              <div className="flex justify-between gap-4"><span className="truncate">{x.nome}</span><span className={x.erro ? "text-red-400" : "text-muted"}>{x.erro ?? x.etapa}</span></div>
              {!x.erro && x.etapa !== "Pronto" && <div className="mt-2 h-px bg-line"><div className="h-px bg-accent transition-all" style={{ width: `${x.pct}%` }} /></div>}
            </li>
          ))}
          {!ocupado && <li><button type="button" onClick={() => setEnvios([])} className={botao}>Limpar lista</button></li>}
        </ul>
      )}

      {msg && <p role="status" className={msg.tipo === "erro" ? "text-red-400" : "text-accent"}>{msg.texto}</p>}

      {midias === null ? (
        <p className="text-sm text-muted">Carregando…</p>
      ) : (
        <div className="space-y-12">
          <p className="text-sm text-muted">
            <b className="text-white">{videos.length}</b> vídeo{videos.length === 1 ? "" : "s"} no carrossel · <b className="text-white">{fotos.length}</b> foto{fotos.length === 1 ? "" : "s"} no mosaico ·{" "}
            <b className="text-white">{capa ? 1 : 0}</b> capa · <b className="text-white">{ocultas.length}</b> oculta{ocultas.length === 1 ? "" : "s"} (fora do site). Os números mostram a ordem em que aparecem na página.
          </p>

          <div>
            <h3 className="text-xs uppercase tracking-[0.3em] text-accent">Capa da abertura</h3>
            <p className="mb-4 mt-1 text-xs text-muted">O vídeo que toca no fundo, quando a pessoa abre a página. Ele não aparece no carrossel.</p>
            {capa ? (
              <div className="flex max-w-md items-center gap-4 border border-accent p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capa.poster} alt="" className="h-28 w-16 shrink-0 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">Esta é a capa agora</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <button type="button" className={botao} onClick={() => mudar(capa, { capa: false })}>Tirar capa</button>
                    <button type="button" className={botao} onClick={() => mudar(capa, { ativo: false })}>Ocultar</button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="max-w-md border border-line px-4 py-3 text-sm text-muted">
                {capaOculta ? "A capa escolhida está oculta. " : "Nenhuma capa escolhida. "}
                Enquanto isso, a página usa o <b className="text-white">primeiro vídeo</b> da lista. Para escolher, clique em <b className="text-white">Usar de capa</b> num vídeo abaixo.
              </p>
            )}
          </div>

          {[
            { sec: "videos" as const, titulo: "Vídeos do carrossel", ajuda: "Seção “Em movimento”. Aparecem nesta ordem.", lista: videos },
            { sec: "fotos" as const, titulo: "Fotos do mosaico", ajuda: "Seção “Momentos”. Aparecem nesta ordem.", lista: fotos },
          ].map(({ sec, titulo, ajuda, lista }) => (
            <div key={sec}>
              <h3 className="text-xs uppercase tracking-[0.3em] text-accent">{titulo} <span className="text-muted">({lista.length})</span></h3>
              <p className="mb-4 mt-1 text-xs text-muted">{ajuda}</p>
              {lista.length === 0 ? (
                <p className="text-sm text-muted">Nada aqui ainda. Envie acima.</p>
              ) : (
                <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {lista.map((m, i) => (
                    <li key={m.id} className="border border-line">
                      <div className="relative aspect-[3/4] overflow-hidden bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.tipo === "video" ? m.poster : m.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                        <span className="absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center bg-accent px-2 text-xs font-medium text-black" aria-label={`Posição ${i + 1}`}>{i + 1}</span>
                        <span className="absolute right-2 top-2 bg-black/70 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em]">{m.tipo === "video" ? "Vídeo" : "Foto"}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 p-2">
                        <button type="button" className={botao} onClick={() => mover(sec, i, 0)} disabled={i === 0} aria-label="Mover para o início" title="Para o início">⇤</button>
                        <button type="button" className={botao} onClick={() => mover(sec, i, i - 1)} disabled={i === 0} aria-label="Mover para antes">←</button>
                        <button type="button" className={botao} onClick={() => mover(sec, i, i + 1)} disabled={i === lista.length - 1} aria-label="Mover para depois">→</button>
                        <button type="button" className={botao} onClick={() => mover(sec, i, lista.length - 1)} disabled={i === lista.length - 1} aria-label="Mover para o fim" title="Para o fim">⇥</button>
                        <button type="button" className={botao} onClick={() => mudar(m, { ativo: false })}>Ocultar</button>
                        {m.tipo === "video" && <button type="button" className={botao} onClick={() => mudar(m, { capa: true })}>Usar de capa</button>}
                        <button type="button" className={`${botao} hover:!border-red-400 hover:!text-red-400`} onClick={() => apagar(m)}>Apagar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {ocultas.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-accent">Ocultas <span className="text-muted">({ocultas.length})</span></h3>
              <p className="mb-4 mt-1 text-xs text-muted">Não aparecem no site. Clique em Mostrar para voltarem.</p>
              <ul className="grid grid-cols-3 gap-3 md:grid-cols-6">
                {ocultas.map((m) => (
                  <li key={m.id} className="border border-line opacity-60 transition-opacity hover:opacity-100">
                    <div className="relative aspect-[3/4] overflow-hidden bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.tipo === "video" ? m.poster : m.url} alt="" className="h-full w-full object-cover grayscale" loading="lazy" />
                      <span className="absolute right-1 top-1 bg-black/70 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-[0.2em]">{m.tipo === "video" ? "Vídeo" : "Foto"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 p-1.5">
                      <button type="button" className={botao} onClick={() => mudar(m, { ativo: true })}>Mostrar</button>
                      <button type="button" className={`${botao} hover:!border-red-400 hover:!text-red-400`} onClick={() => apagar(m)}>Apagar</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
