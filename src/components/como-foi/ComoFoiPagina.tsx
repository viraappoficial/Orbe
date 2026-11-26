import { TransitionLink } from "@/components/PageTransition";
import Reveal from "@/components/Reveal";
import Wordmark from "@/components/Wordmark";
import ImagemAmpliavel from "@/components/ImagemAmpliavel";
import Carrossel from "@/components/como-foi/Carrossel";
import Apoio from "@/components/Apoio";
import Folhas from "@/components/como-foi/Folhas";
import { getApoiadores } from "@/lib/db";
import type { Evento } from "@/lib/db";
import type { Midia } from "@/data/como-foi";
import { links } from "@/data/sessions";

// Título que chega letra por letra; cada palavra fica inteira (não quebra no meio).
const letras = (txt: string, atraso: number) => {
  let n = 0;
  return txt.split(" ").map((palavra, p) => (
    <span key={p} className="inline-block whitespace-nowrap">
      {palavra.split("").map((c) => (
        <span key={n} className="cf-letra" style={{ animationDelay: `${atraso + n++ * 0.07}s` }}>
          {c}
        </span>
      ))}
      {" "}
    </span>
  ));
};

export default async function ComoFoiPagina({ ev, midias }: { ev: Evento; midias: Midia[] }) {
  const apoiadores = await getApoiadores(ev.id);
  const capa = midias.find((m) => m.tipo === "video" && m.capa) ?? midias.find((m) => m.tipo === "video");
  const videos = midias.filter((m) => m.tipo === "video" && m !== capa);
  const fotos = midias.filter((m) => m.tipo === "foto");
  const instagram = links.instagram || process.env.NEXT_PUBLIC_INSTAGRAM || "";

  return (
    <main className="relative overflow-x-clip">
      <Folhas />

      <header className="site-header fadeup fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-gradient-to-b from-black to-transparent px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] text-xs uppercase tracking-[0.35em] sm:px-8 md:px-12 md:pt-6">
        <TransitionLink href="/" className="block py-2">
          <Wordmark />
        </TransitionLink>
        <TransitionLink href="/" className="py-2 text-muted transition-colors hover:text-white">
          Voltar
        </TransitionLink>
      </header>

      {/* Abertura: vídeo de fundo + título que chega letra por letra */}
      <section className="relative flex min-h-svh items-end overflow-hidden">
        {capa && (
          <video
            src={capa.url}
            poster={capa.poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-75"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/75" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-5xl px-[max(2.5rem,12vw)] pb-[max(6rem,12vh)] md:px-12">
          <p
            className="fadeup text-[0.65rem] uppercase tracking-[0.5em] text-accent md:text-xs"
            style={{ animationDelay: "0.2s" }}
          >
            {ev.titulo}
          </p>
          <h1 className="mt-4 text-[clamp(3.2rem,15vw,9rem)] font-light uppercase leading-none tracking-[0.12em]">
            {letras("Como foi", 0.5)}
          </h1>
          <p
            className="fadeup mt-8 text-xs uppercase tracking-[0.3em] text-muted md:text-sm"
            style={{ animationDelay: "1.7s" }}
          >
            {ev.data} · {ev.local}{ev.cidade ? ` · ${ev.cidade}` : ""}
          </p>
          <span className="fadeup mt-10 block" style={{ animationDelay: "2.2s" }} aria-hidden="true">
            <span className="scroll-cue" />
          </span>
        </div>
      </section>

      {videos.length === 0 && fotos.length === 0 && (
        <section className="border-t border-line px-[max(2.5rem,12vw)] py-24 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Fotos e vídeos em breve</p>
        </section>
      )}

      {videos.length > 0 && (
        <section id="videos" className="border-t border-line py-20 md:py-32">
          <Reveal>
            <span className="line-draw mx-auto mb-8 block" />
            <h2 className="px-[max(2.5rem,12vw)] text-center text-xs uppercase tracking-[0.4em] text-muted md:px-12">Em movimento</h2>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-12">
              <Carrossel itens={videos.map((v) => ({ id: v.id, url: v.url, poster: v.poster, legenda: v.legenda || `Vídeo da ${ev.titulo}` }))} />
            </div>
          </Reveal>
        </section>
      )}

      {fotos.length > 0 && (
        <section id="fotos" className="border-t border-line px-[max(2.5rem,12vw)] py-20 sm:px-16 md:px-12 md:py-32">
          <Reveal>
            <span className="line-draw mx-auto mb-8 block" />
            <h2 className="mb-14 text-center text-xs uppercase tracking-[0.4em] text-muted">Momentos</h2>
          </Reveal>
          <div className="mx-auto max-w-5xl columns-2 gap-3 md:columns-3 md:gap-5">
            {fotos.map((f, i) => (
              <div key={f.id} className="mb-3 break-inside-avoid md:mb-5">
                <Reveal delay={(i % 3) * 110}>
                  <ImagemAmpliavel
                    src={f.url}
                    alt={f.legenda || `Foto da ${ev.titulo}`}
                    width={f.w}
                    height={f.h}
                    sizes="(min-width: 768px) 300px, 45vw"
                    frameClassName="border border-line"
                    className="reveal-img block h-auto w-full"
                    dica={false}
                  />
                </Reveal>
              </div>
            ))}
          </div>
        </section>
      )}

      {apoiadores.length > 0 && (
        <section id="apoio" className="border-t border-line px-[max(2.5rem,12vw)] py-20 sm:px-16 md:px-12 md:py-28">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <h2 className="mb-10 text-center text-xs uppercase tracking-[0.4em] text-muted">Quem apoiou</h2>
            </Reveal>
            <Reveal delay={150}>
              <Apoio apoiadores={apoiadores} variante="faixa" />
            </Reveal>
          </div>
        </section>
      )}

      <section className="border-t border-line px-[max(2.5rem,12vw)] py-24 text-center sm:px-16 md:py-40">
        <Reveal>
          <p className="text-2xl leading-snug md:text-4xl">Foi só o começo.</p>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted md:text-base">
            A próxima live session já está sendo pensada. Acompanhe por aqui e faça parte da comunidade.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-3 border border-white px-8 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:border-accent hover:bg-accent hover:text-black"
              >
                Seguir no Instagram
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
                  <path d="M2 8L8 2M3.5 2H8v4.5" />
                </svg>
              </a>
            )}
            <TransitionLink
              href="/participar"
              className="inline-flex min-h-11 items-center border border-line px-8 py-4 text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:border-white hover:text-white"
            >
              Quero fazer parte
            </TransitionLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
