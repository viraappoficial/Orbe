import Image from "next/image";
import { TransitionLink } from "@/components/PageTransition";
import Reveal from "@/components/Reveal";
import Wordmark from "@/components/Wordmark";
import ImagemAmpliavel from "@/components/ImagemAmpliavel";
import MapaLocal from "@/components/MapaLocal";
import { getEventoAtual, getSessoesPublicadas } from "@/lib/db";
import { links } from "@/data/sessions";

// Regenera a cada minuto; o admin força a atualização na hora ao salvar.
export const revalidate = 60;

export default async function Home() {
  const [ev, sessoes] = await Promise.all([getEventoAtual(), getSessoesPublicadas()]);

  const nav: [string, string][] = [
    ...(ev ? ([["Próxima", "#proxima"]] as [string, string][]) : []),
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
              href={ev ? "#proxima" : "#sobre"}
              className="fadeup relative mt-10 border border-line px-8 py-4 text-xs uppercase tracking-[0.3em] text-muted transition-colors hover:border-white hover:text-white sm:px-10"
            >
              {ev ? "Lista encerrada" : "Conheça o Orbe"}
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

      {ev && (
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
        {sessoes.length === 0 ? (
          <Reveal delay={150}>
            <p className="text-2xl text-muted md:text-4xl">Em breve.</p>
          </Reveal>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {sessoes.map((s, i) => (
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
