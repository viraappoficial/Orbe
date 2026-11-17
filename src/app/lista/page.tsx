import type { Metadata } from "next";
import Image from "next/image";
import { TransitionLink } from "@/components/PageTransition";
import Wordmark from "@/components/Wordmark";
import Reveal from "@/components/Reveal";
import MapaLocal from "@/components/MapaLocal";
import PresenceForm from "@/components/PresenceForm";
import { proxima, grupoWhatsapp } from "@/data/sessions";

export const metadata: Metadata = {
  title: "Lista de presença · ORBE",
  description: `${proxima.titulo} com ${proxima.dj}, ${proxima.data} às ${proxima.hora}. Vagas limitadas. Coloque seu nome na lista.`,
  openGraph: { images: [{ url: proxima.og, width: 1080, height: 1350 }] },
};

const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  [proxima.endereco, proxima.cidade].filter(Boolean).join(", ")
)}`;

function Back() {
  return (
    <TransitionLink href="/" className="inline-flex items-center gap-3 text-muted hover:text-white transition-colors">
      <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
        <path d="M15 5H1M5 1L1 5l4 4" />
      </svg>
      <Wordmark className="h-3" />
    </TransitionLink>
  );
}

export default function Lista() {
  return (
    <main
      style={{ animationDelay: "calc(var(--io, 0s) - .2s)" }}
      className="page-in relative min-h-screen overflow-hidden px-6 py-8 md:py-12"
    >
      <div className="lista-glow" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl">
        <Back />

        <div className="mt-8 grid items-start gap-10 md:mt-14 md:grid-cols-[minmax(0,25rem)_1fr] md:gap-20">
          {/* Arte grande, só no desktop. No celular o contexto vem na miniatura abaixo. */}
          <div className="hidden md:sticky md:top-10 md:block">
            <Image
              src={proxima.arte}
              alt={`Orbe ${proxima.titulo}: ${proxima.dj}, ${proxima.data} às ${proxima.hora}, ${proxima.local}`}
              width={1080}
              height={1350}
              className="h-auto w-full border border-line shadow-[0_40px_90px_-35px_rgba(201,151,90,.45)]"
            />
          </div>

          <div>
            {/* Cabeçalho do evento: miniatura + título (celular) */}
            <div className="flex items-center gap-5 md:block">
              <Image
                src={proxima.arte}
                alt=""
                width={1080}
                height={1350}
                priority
                className="h-auto w-24 shrink-0 border border-line md:hidden"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted">
                  {proxima.titulo} · {proxima.dj}
                </p>
                <h1 className="mt-3 text-3xl uppercase leading-tight tracking-[0.12em] md:text-5xl">
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
                    <span className="text-accent">{proxima.data}</span>
                    <span className="mx-2 text-muted">|</span>
                    {proxima.hora}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="text-xs uppercase tracking-[0.3em] text-muted">Local</dt>
                  <dd className="text-right">
                    <span className="block uppercase tracking-[0.15em]">{proxima.local}</span>
                    <a
                      href={mapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm text-muted underline-offset-4 hover:text-white hover:underline"
                    >
                      {proxima.endereco}
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="mt-8">
                <MapaLocal
                  local={proxima.local}
                  endereco={proxima.endereco}
                  cidade={proxima.cidade}
                  embed={proxima.mapaEmbed || undefined}
                />
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="mt-10 border border-line bg-white/[0.02] p-6 md:p-8">
                <PresenceForm
                  sessionLabel={proxima.titulo}
                  dia={proxima.dia}
                  prazo={proxima.prazo}
                  whatsappUrl={grupoWhatsapp || undefined}
                />
              </div>
            </Reveal>

            <p className="mt-12 text-xs uppercase tracking-[0.3em] text-muted">
              Música · Atmosfera · Conexões
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
