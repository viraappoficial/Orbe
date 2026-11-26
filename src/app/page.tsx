import Image from "next/image";
import { TransitionLink } from "@/components/PageTransition";
import Reveal from "@/components/Reveal";
import Wordmark from "@/components/Wordmark";
import ImagemAmpliavel from "@/components/ImagemAmpliavel";
import MapaLocal from "@/components/MapaLocal";
import Apoio from "@/components/Apoio";
import { getApoiadores, getEventoAtual, getSessoesPublicadas } from "@/lib/db";
import LoopVideo from "@/components/como-foi/LoopVideo";
import { eventoPassou } from "@/lib/evento-data";
import { comoFoiInfo } from "@/data/como-foi";
import { links } from "@/data/sessions";

// Regenera a cada minuto; o admin força a atualização na hora ao salvar.
export const revalidate = 60;

export default async function Home() {
  const [ev, sessoes] = await Promise.all([getEventoAtual(), getSessoesPublicadas()]);
  const apoiadores = await getApoiadores(ev?.id);
  const passou = ev ? eventoPassou(ev) : false; // depois do dia do evento, entra o "Como foi" no lugar do "Próxima session"
  const outras = sessoes.filter((x) => !(passou && ev && x.id === ev.id)); // as que já têm vídeo, sem repetir a session do cartão acima
  const instagram = links.instagram || process.env.NEXT_PUBLIC_INSTAGRAM || "";

  const nav: [string, string][] = [
    ...(ev && !passou ? ([["Próxima", "#proxima"]] as [string, string][]) : []),
    ["O Orbe", "#sobre"],
    ["Sessions", "#sessions"],
    ["Participe", "#participe"],
    ...(ev?.listaAberta ? ([["Lista", "/lista"]] as [string, string][]) : []),
  ];

  return (
    <main>
      <header
        style={{ animationDelay: "calc(var(--io, 0s) + .2s)" }}
        className="site-header fadeup fixed inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black to-transparent px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] text-xs uppercase tracking-[0.35em] sm:px-8 md:px-12 md:pt-6"
      >
        <TransitionLink href="/" className="block py-2">
          <Wordmark />
        </TransitionLink>
        <nav className="flex items-center gap-6 whitespace-nowrap text-muted md:gap-10">
          {nav.map(([label, href]) =>
            href.startsWith("/") ? (
              <TransitionLink key={href} href={href} className="py-2 transition-colors hover:text-white">
                {label}
              </TransitionLink>
            ) : (
              <a key={href} href={href} className="hidden py-2 transition-colors hover:text-white md:inline">
                {label}
              </a>
            )
          )}
        </nav>
      </header>

      <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 text-center">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-parallax relative flex flex-col items-center">
          <Image
            src="/logo-transparent.png"
            alt="ORBE"
            width={909}
            height={608}
            priority
            style={{ animationDelay: "calc(var(--io, 0s) - .3s)" }}
            className="logo-glow fadeup relative h-auto w-[min(86vw,34rem)]"
          />
          <p
            style={{ animationDelay: "calc(var(--io, 0s) + .1s)" }}
            className="fadeup relative mt-8 text-[0.65rem] uppercase tracking-[0.3em] text-muted min-[380px]:text-xs min-[380px]:tracking-[0.4em] md:mt-10 md:text-sm"
          >
            Música · Atmosfera · Conexões
          </p>
          {ev?.listaAberta ? (
            <TransitionLink
              href="/lista"
              className="fadeup relative mt-10 border border-white px-8 py-4 text-xs uppercase tracking-[0.3em] transition-colors hover:border-accent hover:bg-accent hover:text-black sm:px-10"
            >
              Entrar na lista
            </TransitionLink>
          ) : (
            <a
              href={ev ? (passou ? "#sessions" : "#proxima") : "#sobre"}
              className="fadeup relative mt-10 border border-line px-8 py-4 text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:border-white hover:text-white sm:px-10"
            >
              {ev ? (passou ? "Veja como foi" : "Lista encerrada") : "Conheça o Orbe"}
            </a>
          )}
        </div>
        <span
          style={{ animationDelay: "calc(var(--io, 0s) + .9s)" }}
          className="fadeup absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <span className="scroll-cue" />
        </span>
      </section>

      {ev && !passou && (
        <section id="proxima" className="border-t border-line px-5 py-16 sm:px-8 md:px-12 md:py-32">
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-20">
            <Reveal from="left">
              <ImagemAmpliavel
                src={ev.arteUrl}
                alt={`Orbe ${ev.titulo}: ${ev.dj}`}
                width={1080}
                height={1350}
                sizes="(min-width: 768px) 480px, 92vw"
                frameClassName="border border-line"
                className="reveal-img block h-auto w-full"
              />
            </Reveal>
            <Reveal delay={200} from="right">
              <span className="line-draw mb-6" />
              <h2 className="mb-6 text-xs uppercase tracking-[0.4em] text-muted">Próxima session</h2>
              <p className="text-sm uppercase tracking-[0.35em] text-muted">{ev.titulo}</p>
              <h3 className="mt-3 break-words text-3xl uppercase leading-tight tracking-[0.1em] min-[380px]:text-4xl md:text-6xl md:tracking-[0.15em]">
                {ev.dj}
              </h3>
              <p className="mt-6 text-2xl tracking-[0.2em] md:mt-8 md:text-3xl">
                <span className="text-accent">{ev.data}</span> <span className="text-muted">|</span> {ev.hora}
              </p>
              <p className="mt-5 uppercase tracking-[0.2em] md:mt-6">{ev.local}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-muted sm:text-sm">{ev.endereco}</p>
              <p className="mt-7 inline-block border border-line px-5 py-2 text-xs uppercase tracking-[0.3em] md:mt-8">
                {ev.listaAberta ? "Vagas limitadas" : "Lista encerrada"}
              </p>
              {ev.listaAberta && (
                <div>
                  <TransitionLink
                    href="/lista"
                    className="mt-8 block w-full border border-white px-6 py-4 text-center text-xs uppercase tracking-[0.3em] transition-colors hover:border-accent hover:bg-accent hover:text-black sm:inline-block sm:w-auto sm:px-10 md:mt-10"
                  >
                    Colocar meu nome na lista
                  </TransitionLink>
                </div>
              )}
              <div className="mt-10">
                <MapaLocal local={ev.local} endereco={ev.endereco} cidade={ev.cidade} embed={ev.mapaEmbed || undefined} />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <div className="border-t border-line" aria-hidden="true" />

      <section id="sobre" className="mx-auto max-w-3xl px-5 py-24 sm:px-8 md:py-48">
        <Reveal>
          <span className="line-draw mb-10" />
          <h2 className="mb-10 text-xs uppercase tracking-[0.4em] text-muted">O Orbe</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-2xl leading-snug md:text-4xl">
            Um selo. Uma comunidade. Uma live session por vez, em um lugar diferente a cada vez.
          </p>
        </Reveal>
        <Reveal delay={350}>
          <p className="mt-10 text-base leading-relaxed text-muted md:text-lg">
            Levamos DJs para espaços inesperados, gravamos, editamos e publicamos. Cada session vira portfólio para o
            artista e memória para quem faz parte.
          </p>
        </Reveal>
      </section>

      <section id="sessions" className="border-t border-line px-5 py-20 sm:px-8 md:px-12 md:py-32">
        <Reveal>
          <span className="line-draw mb-6" />
          <h2 className="mb-12 text-xs uppercase tracking-[0.4em] text-muted md:mb-16">Sessions</h2>
        </Reveal>
        {ev && passou && (
          <div className={outras.length ? "mb-20 md:mb-28" : ""} id="como-foi">
              <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-20">
                <Reveal from="left">
                  <TransitionLink
                    href="/como-foi"
                    aria-label="Ver como foi a session"
                    className="group relative mx-auto block aspect-[4/5] w-full max-w-md overflow-hidden border border-line bg-black"
                  >
                    <LoopVideo
                      src={comoFoiInfo.hero}
                      poster={comoFoiInfo.heroPoster}
                      className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-[1600ms] ease-out group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" aria-hidden="true" />
                    <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                      <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/80 bg-black/30 text-white backdrop-blur transition-colors group-hover:border-accent group-hover:text-accent">
                        <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor"><path d="M5 3l10 6-10 6z" /></svg>
                      </span>
                    </span>
                  </TransitionLink>
                </Reveal>
                <Reveal delay={200} from="right">
                  <span className="line-draw mb-6" />
                  <h3 className="mb-6 text-xs uppercase tracking-[0.4em] text-muted">Já aconteceu</h3>
                  <p className="text-sm uppercase tracking-[0.35em] text-muted">{ev.titulo}</p>
                  <h4 className="mt-3 text-4xl uppercase leading-tight tracking-[0.1em] md:text-6xl md:tracking-[0.15em]">Ver como foi</h4>
                  <p className="mt-6 text-2xl tracking-[0.2em] md:mt-8 md:text-3xl">
                    <span className="text-accent">{ev.data}</span> <span className="text-muted">|</span> {ev.local}
                  </p>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
                    Vídeos e fotos da primeira live session da ORBE. Entre e reviva a noite.{ev.youtubeId ? "" : " A session completa chega em breve no YouTube."}
                  </p>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <TransitionLink
                      href="/como-foi"
                      className="block w-full border border-white px-6 py-4 text-center text-xs uppercase tracking-[0.3em] transition-colors hover:border-accent hover:bg-accent hover:text-black sm:inline-block sm:w-auto sm:px-10"
                    >
                      Entrar
                    </TransitionLink>
                    {instagram && (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full border border-line px-6 py-4 text-center text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:border-white hover:text-white sm:inline-block sm:w-auto sm:px-10"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </Reveal>
              </div>
          </div>
        )}
        {outras.length === 0 && !(passou && ev) ? (
          <Reveal delay={150}>
            <p className="text-2xl text-muted md:text-4xl">Em breve.</p>
          </Reveal>
        ) : outras.length === 0 ? null : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {outras.map((s, i) => (
              <Reveal key={s.id} delay={i * 120}>
                <article>
                  <div className="aspect-video border border-line">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${s.youtubeId}`}
                      title={`${s.dj} — Orbe session`}
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                  <h3 className="mt-4 text-xl uppercase tracking-widest">{s.dj}</h3>
                  <p className="text-sm text-muted">
                    {s.local} · {s.data}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {apoiadores.length > 0 && (
        <section id="apoio" className="border-t border-line px-5 py-16 sm:px-8 md:px-12 md:py-24">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <span className="line-draw mb-6" />
              <h2 className="mb-10 text-xs uppercase tracking-[0.4em] text-muted">Apoio</h2>
            </Reveal>
            <Reveal delay={150}>
              <Apoio apoiadores={apoiadores} variante="faixa" />
            </Reveal>
          </div>
        </section>
      )}

      <section id="participe" className="border-t border-line px-5 py-20 sm:px-8 md:px-12 md:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="line-draw mb-6" />
            <h2 className="mb-6 text-xs uppercase tracking-[0.4em] text-muted">Faça parte</h2>
            <p className="max-w-2xl text-2xl leading-snug md:text-4xl">Venha ser Orbe.</p>
            <p className="mt-6 max-w-xl text-base text-muted md:text-lg">
              O selo é feito por quem toca, por quem recebe e por quem vai. Escolha como você quer entrar.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
            {(
              [
                { n: "01", t: "Quero ir", d: ev?.listaAberta ? "Entre na lista da próxima session e receba os avisos no grupo." : "A lista da próxima session ainda não abriu. Acompanhe por aqui.", href: ev?.listaAberta ? "/lista" : null, cta: "Entrar na lista" },
                { n: "02", t: "Sou DJ", d: "Quer tocar numa session? Conte quem você é e mande um set para a gente ouvir.", href: "/participar?como=dj", cta: "Quero tocar" },
                { n: "03", t: "Tenho um espaço ou marca", d: "Tem um lugar para receber uma session, ou quer apoiar o selo? Fale com a gente.", href: "/participar?como=parceiro", cta: "Quero apoiar" },
              ] as const
            ).map((c, i) => (
              <Reveal key={c.n} delay={i * 130}>
                {c.href ? (
                  <TransitionLink href={c.href} className="card-participe group flex h-full flex-col border border-line p-7 transition-colors hover:border-accent sm:p-8">
                    <span className="text-xs tracking-[0.3em] text-accent">{c.n}</span>
                    <h3 className="mt-6 text-xl uppercase leading-snug tracking-[0.12em]">{c.t}</h3>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{c.d}</p>
                    <span className="mt-8 inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] transition-colors group-hover:text-accent">
                      {c.cta}
                      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1" className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                        <path d="M1 5h16M13 1l4 4-4 4" />
                      </svg>
                    </span>
                  </TransitionLink>
                ) : (
                  <div className="flex h-full flex-col border border-line p-7 opacity-70 sm:p-8">
                    <span className="text-xs tracking-[0.3em] text-muted">{c.n}</span>
                    <h3 className="mt-6 text-xl uppercase leading-snug tracking-[0.12em]">{c.t}</h3>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{c.d}</p>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="flex flex-col justify-between gap-4 border-t border-line px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 text-xs uppercase tracking-[0.3em] text-muted sm:px-8 md:flex-row md:px-12">
        <span className="flex items-center gap-3">
          © {new Date().getFullYear()} <Wordmark className="h-2.5" />
        </span>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {Object.entries(links)
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <a key={k} href={v} className="py-1 transition-colors hover:text-white">
                {k}
              </a>
            ))}
        </div>
      </footer>
    </main>
  );
}
