import type { Metadata } from "next";
import { TransitionLink } from "@/components/PageTransition";
import Wordmark from "@/components/Wordmark";
import Reveal from "@/components/Reveal";
import ImagemAmpliavel from "@/components/ImagemAmpliavel";
import MapaLocal from "@/components/MapaLocal";
import PresenceForm from "@/components/PresenceForm";
import { getEventoAtual } from "@/lib/db";
import { grupoWhatsapp, proxima } from "@/data/sessions";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ev = await getEventoAtual();
  if (!ev) return { title: "Lista de presença · ORBE" };
  const og = ev.arteUrl === proxima.arte ? proxima.og : ev.arteUrl; // JPG para a prévia do WhatsApp
  return {
    title: "Lista de presença · ORBE",
    description: `${ev.titulo} com ${ev.dj}, ${ev.data} às ${ev.hora}. Vagas limitadas. Coloque seu nome na lista.`,
    openGraph: { images: [{ url: og, width: 1080, height: 1350 }] },
  };
}

function Back() {
  return (
    <TransitionLink href="/" className="inline-flex items-center gap-3 py-2 text-muted transition-colors hover:text-white">
      <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
        <path d="M15 5H1M5 1L1 5l4 4" />
      </svg>
      <Wordmark className="h-3" />
    </TransitionLink>
  );
}

export default async function Lista() {
  const ev = await getEventoAtual();
  const moldura =
    "page-in relative min-h-svh overflow-hidden px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 md:py-12";
  const estilo = { animationDelay: "calc(var(--io, 0s) - .2s)" };

  // Sem session anunciada, ou lista fechada pelo admin.
  if (!ev || !ev.listaAberta) {
    return (
      <main style={estilo} className={moldura}>
        <div className="lista-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-xl">
          <Back />
          <div className="mt-16 border border-line p-8 text-center md:p-12">
            <p className="text-xs uppercase tracking-[0.35em] text-accent">
              {ev ? `${ev.titulo} · ${ev.dj}` : "Orbe"}
            </p>
            <h1 className="mt-4 text-3xl uppercase leading-tight tracking-[0.12em]">Lista encerrada</h1>
            <p className="mt-5 text-muted">
              {ev
                ? "As vagas desta session foram preenchidas ou o prazo acabou."
                : "No momento não há nenhuma lista aberta."}{" "}
              Fique de olho nas próximas sessions.
            </p>
            <TransitionLink
              href="/"
              className="mt-8 inline-block border border-white px-8 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:border-accent hover:bg-accent hover:text-black"
            >
              Conhecer o Orbe
            </TransitionLink>
          </div>
        </div>
      </main>
    );
  }

  const consulta = [ev.endereco, ev.cidade].filter(Boolean).join(", ");
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;

  return (
    <main style={estilo} className={moldura}>
      <div className="lista-glow" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl">
        <Back />

        <div className="mt-6 grid items-start gap-8 md:mt-14 md:grid-cols-[minmax(0,25rem)_1fr] md:gap-20">
          {/* Arte grande, só no desktop. No celular o contexto vem na miniatura abaixo. */}
          <div className="hidden md:sticky md:top-10 md:block">
            <ImagemAmpliavel
              src={ev.arteUrl}
              alt={`Orbe ${ev.titulo}: ${ev.dj}, ${ev.data} às ${ev.hora}, ${ev.local}`}
              width={1080}
              height={1350}
              sizes="400px"
              frameClassName="border border-line shadow-[0_40px_90px_-35px_rgba(201,151,90,.45)]"
              className="block h-auto w-full"
            />
          </div>

          <div className="min-w-0">
            {/* Cabeçalho do evento: miniatura que amplia + título (celular) */}
            <div className="flex items-center gap-4 sm:gap-5 md:block">
              <div className="w-24 shrink-0 md:hidden">
                <ImagemAmpliavel
                  src={ev.arteUrl}
                  alt={`Orbe ${ev.titulo}: ${ev.dj}, ${ev.data} às ${ev.hora}, ${ev.local}`}
                  width={1080}
                  height={1350}
                  priority
                  sizes="96px"
                  dica={false}
                  frameClassName="border border-line"
                  className="block h-auto w-full"
                />
                <span className="mt-1 block text-center text-[0.6rem] uppercase tracking-[0.2em] text-muted">Toque p/ ampliar</span>
              </div>
              <div className="min-w-0">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted sm:text-xs sm:tracking-[0.35em]">
                  {ev.titulo} · {ev.dj}
                </p>
                <h1 className="mt-3 text-3xl uppercase leading-tight tracking-[0.1em] min-[380px]:tracking-[0.12em] md:text-5xl">
                  Seu nome na lista
                </h1>
              </div>
            </div>

            <Reveal>
              <p className="mt-6 max-w-md text-muted">
                As vagas são limitadas. Deixe seu nome para entrar na lista da session.
              </p>

              <dl className="mt-8 divide-y divide-line border-y border-line">
                <div className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="text-xs uppercase tracking-[0.3em] text-muted">Data</dt>
                  <dd className="text-lg tracking-[0.15em]">
                    <span className="text-accent">{ev.data}</span>
                    <span className="mx-2 text-muted">|</span>
                    {ev.hora}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-xs uppercase tracking-[0.3em] text-muted">Local</dt>
                  <dd className="min-w-0 text-right">
                    <span className="block uppercase tracking-[0.15em]">{ev.local}</span>
                    <a
                      href={mapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm text-muted underline-offset-4 hover:text-white hover:underline"
                    >
                      {ev.endereco}
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="mt-8">
                <MapaLocal local={ev.local} endereco={ev.endereco} cidade={ev.cidade} embed={ev.mapaEmbed || undefined} />
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="mt-10 border border-line bg-white/[0.02] p-5 sm:p-6 md:p-8">
                <PresenceForm
                  sessionLabel={ev.titulo}
                  dia={ev.dia}
                  prazo={ev.prazo}
                  whatsappUrl={ev.whatsappUrl || grupoWhatsapp || undefined}
                />
              </div>
            </Reveal>

            <p className="mt-12 text-xs uppercase tracking-[0.3em] text-muted">Música · Atmosfera · Conexões</p>
          </div>
        </div>
      </div>
    </main>
  );
}
