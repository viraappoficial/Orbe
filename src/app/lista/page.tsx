import type { Metadata } from "next";
import { TransitionLink } from "@/components/PageTransition";
import Wordmark from "@/components/Wordmark";
import ImagemAmpliavel from "@/components/ImagemAmpliavel";
import MapaLocal from "@/components/MapaLocal";
import MapaModal from "@/components/MapaModal";
import PresenceForm from "@/components/PresenceForm";
import Apoio from "@/components/Apoio";
import { getApoiadores, getEventoAtual } from "@/lib/db";
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

const pin = (
  <svg className="h-[18px] w-3.5 shrink-0 text-accent" viewBox="0 0 22 28" fill="currentColor" aria-hidden="true">
    <path d="M11 0C4.9 0 0 4.8 0 10.8 0 18.4 11 28 11 28s11-9.6 11-17.2C22 4.8 17.1 0 11 0Zm0 15a4.2 4.2 0 1 1 0-8.4A4.2 4.2 0 0 1 11 15Z" />
  </svg>
);

export default async function Lista() {
  const ev = await getEventoAtual();
  const estilo = { animationDelay: "calc(var(--io, 0s) - .2s)" };
  const safe = "pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]";

  // Sem session anunciada, ou lista fechada pelo admin.
  if (!ev || !ev.listaAberta) {
    return (
      <main style={estilo} className={`page-in relative min-h-svh overflow-hidden px-5 sm:px-8 md:py-12 ${safe}`}>
        <div className="lista-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-xl">
          <Back />
          <div className="mt-16 border border-line p-8 text-center md:p-12">
            <p className="text-xs uppercase tracking-[0.35em] text-accent">{ev ? `${ev.titulo} · ${ev.dj}` : "Orbe"}</p>
            <h1 className="mt-4 text-3xl uppercase leading-tight tracking-[0.12em]">Lista encerrada</h1>
            <p className="mt-5 text-muted">
              {ev ? "As vagas desta session foram preenchidas ou o prazo acabou." : "No momento não há nenhuma lista aberta."} Fique de olho
              nas próximas sessions.
            </p>
            <TransitionLink href="/" className="mt-8 inline-block border border-white px-8 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:border-accent hover:bg-accent hover:text-black">
              Conhecer o Orbe
            </TransitionLink>
          </div>
        </div>
      </main>
    );
  }

  const apoiadores = await getApoiadores(ev.id);
  const alt = `Orbe ${ev.titulo}: ${ev.dj}, ${ev.data} às ${ev.hora}, ${ev.local}`;
  const enderecoCurto = `${ev.endereco}${ev.cidade ? ` · ${ev.cidade.split(",")[0]}` : ""}`;
  const mapaProps = { local: ev.local, endereco: ev.endereco, cidade: ev.cidade, embed: ev.mapaEmbed || undefined };

  return (
    <main style={estilo} className="page-in relative min-h-svh overflow-x-clip md:grid md:grid-cols-2">
      {/* Esquerda (computador): a arte inteira, fixa na altura da tela, com o endereço embaixo */}
      <aside className="relative hidden border-r border-line md:sticky md:top-0 md:block md:h-svh">
        <ImagemAmpliavel
          src={ev.arteUrl}
          alt={alt}
          width={1080}
          height={1350}
          sizes="50vw"
          priority
          frameClassName="h-full"
          className="h-full w-full object-cover object-[50%_18%]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-black via-black/90 to-transparent px-9 pb-5 pt-14 pr-20">
          <p className="flex min-w-0 items-center gap-3 text-[0.75rem] uppercase tracking-[0.12em]">
            {pin}
            <span className="leading-snug">{enderecoCurto}</span>
          </p>
          <MapaModal {...mapaProps} className="pointer-events-auto shrink-0 text-[0.7rem] uppercase tracking-[0.22em] text-accent underline-offset-4 hover:underline" />
        </div>
      </aside>

      {/* Direita: tudo o que a pessoa precisa para entrar na lista */}
      <section className={`relative px-5 sm:px-8 md:px-14 lg:px-20 md:py-10 ${safe}`}>
        <div className="lista-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-md md:max-w-lg">
          <Back />

          <div className="mt-5 flex items-center gap-4 md:mt-12 md:block">
            <div className="w-16 shrink-0 md:hidden">
              <ImagemAmpliavel
                src={ev.arteUrl}
                alt={alt}
                width={1080}
                height={1350}
                priority
                sizes="64px"
                dica={false}
                frameClassName="border border-line"
                className="block h-auto w-full"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted sm:text-xs sm:tracking-[0.35em]">
                {ev.titulo} · {ev.dj}
              </p>
              <h1 className="mt-2 text-xl uppercase leading-tight tracking-[0.1em] min-[420px]:text-2xl md:mt-3 md:text-4xl">Seu nome na lista</h1>
            </div>
          </div>

          <ul className="mt-4 flex flex-wrap gap-2 md:mt-5 text-[0.7rem] uppercase tracking-[0.14em] sm:text-xs" aria-label="Sobre o evento">
            <li className="border border-line px-3 py-2">
              <span className="text-accent">{ev.data}</span> <span className="text-muted">|</span> {ev.hora}
            </li>
            <li className="flex items-center gap-2 border border-line px-3 py-2">
              {pin}
              {ev.local}
            </li>
            <li className="border border-accent px-3 py-2 text-accent">Vagas limitadas</li>
          </ul>

          <div className="mt-5 md:mt-7">
            <PresenceForm sessionLabel={ev.titulo} dia={ev.dia} prazo={ev.prazo} whatsappUrl={ev.whatsappUrl || grupoWhatsapp || undefined} />
          </div>

          {/* Celular: o mapa fica recolhido; abre ao tocar */}
          <details className="group mt-8 border-t border-line pt-4 md:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-xs uppercase tracking-[0.22em] [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-3">
                {pin} Como chegar
              </span>
              <span className="text-lg text-accent group-open:hidden" aria-hidden="true">+</span>
              <span className="hidden text-lg text-accent group-open:inline" aria-hidden="true">−</span>
            </summary>
            <p className="mt-1 text-sm text-muted">{enderecoCurto}</p>
            <div className="mt-4">
              <MapaLocal {...mapaProps} />
            </div>
          </details>

          <Apoio apoiadores={apoiadores} variante="compacto" />

          <p className="mt-10 text-[0.62rem] uppercase tracking-[0.3em] text-muted md:mt-14">Música · Atmosfera · Conexões</p>
        </div>
      </section>
    </main>
  );
}
