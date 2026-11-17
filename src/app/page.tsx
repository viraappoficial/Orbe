import Image from "next/image";
import { TransitionLink } from "@/components/PageTransition";
import Reveal from "@/components/Reveal";
import Wordmark from "@/components/Wordmark";
import { sessions, links, proxima } from "@/data/sessions";

const nav = [
  ["Próxima", "#proxima"],
  ["O Orbe", "#sobre"],
  ["Sessions", "#sessions"],
  ["Lista", "/lista"],
];

export default function Home() {
  return (
    <main>
      <header style={{ animationDelay: "calc(var(--io, 0s) + .2s)" }} className="fadeup fixed top-0 inset-x-0 z-10 flex justify-between items-center px-6 md:px-12 py-6 text-xs tracking-[0.35em] uppercase bg-gradient-to-b from-black to-transparent">
        <TransitionLink href="/" className="block"><Wordmark /></TransitionLink>
        <nav className="flex gap-6 md:gap-10 text-muted">
          {nav.map(([label, href]) =>
            href.startsWith("/") ? (
              <TransitionLink key={href} href={href} className="hover:text-white transition-colors">
                {label}
              </TransitionLink>
            ) : (
              <a key={href} href={href} className="hover:text-white transition-colors">
                {label}
              </a>
            )
          )}
        </nav>
      </header>

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="hero-glow" aria-hidden="true" />
        <Image
          src="/logo.png"
          alt="ORBE"
          width={1536}
          height={1024}
          priority
          style={{ animationDelay: "calc(var(--io, 0s) - .15s)" }}
          className="logo-glow fadeup relative w-full max-w-3xl h-auto -mt-10 -mb-16 md:-mb-24"
        />
        <p style={{ animationDelay: "calc(var(--io, 0s) + .35s)" }} className="fadeup relative mt-4 text-xs md:text-sm tracking-[0.4em] uppercase text-muted">
          Música · Atmosfera · Conexões
        </p>
        <TransitionLink
          href="/lista"
          className="fadeup relative mt-12 border border-white px-10 py-4 text-xs tracking-[0.3em] uppercase hover:bg-accent hover:border-accent hover:text-black transition-colors"
        >
          <span style={{ display: "contents" }}>Entrar na lista</span>
        </TransitionLink>
        <span
          style={{ animationDelay: "calc(var(--io, 0s) + 1.4s)" }}
          className="fadeup absolute bottom-8 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <span className="scroll-cue" />
        </span>
      </section>

      <section id="proxima" className="border-t border-line px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal>
            <div className="overflow-hidden border border-line">
              <Image
                src={proxima.arte}
                alt={`Orbe ${proxima.titulo} — ${proxima.dj}`}
                width={1122}
                height={1402}
                className="reveal-img w-full h-auto"
              />
            </div>
          </Reveal>
          <Reveal delay={200}>
            <span className="line-draw mb-6" />
            <h2 className="text-xs tracking-[0.4em] uppercase text-muted mb-6">
              Próxima session
            </h2>
            <p className="text-sm tracking-[0.35em] uppercase text-muted">{proxima.titulo}</p>
            <h3 className="mt-3 text-4xl md:text-6xl tracking-[0.15em] uppercase leading-tight">
              {proxima.dj}
            </h3>
            <p className="mt-8 text-2xl md:text-3xl tracking-[0.2em]">
              <span className="text-accent">{proxima.data}</span> <span className="text-muted">|</span> {proxima.hora}
            </p>
            <p className="mt-6 tracking-[0.2em] uppercase">{proxima.local}</p>
            <p className="mt-2 text-sm text-muted tracking-wider uppercase">{proxima.endereco}</p>
            <p className="mt-8 inline-block border border-line px-5 py-2 text-xs tracking-[0.3em] uppercase">
              Vagas limitadas
            </p>
            <div>
              <TransitionLink
                href="/lista"
                className="mt-10 inline-block border border-white px-10 py-4 text-xs tracking-[0.3em] uppercase hover:bg-accent hover:border-accent hover:text-black transition-colors"
              >
                Colocar meu nome na lista
              </TransitionLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="sobre" className="max-w-3xl mx-auto px-6 py-32 md:py-48">
        <Reveal>
          <span className="line-draw mb-10" />
          <h2 className="text-xs tracking-[0.4em] uppercase text-muted mb-10">O Orbe</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-2xl md:text-4xl leading-snug">
            Um selo. Uma comunidade. Uma live session por vez, em um lugar
            diferente a cada vez.
          </p>
        </Reveal>
        <Reveal delay={350}>
          <p className="mt-10 text-lg text-muted leading-relaxed">
            Levamos DJs para espaços inesperados, gravamos, editamos e
            publicamos. Cada session vira portfólio para o artista e memória
            para quem faz parte.
          </p>
        </Reveal>
      </section>

      <section id="sessions" className="border-t border-line px-6 md:px-12 py-32">
        <Reveal>
          <span className="line-draw mb-6" />
          <h2 className="text-xs tracking-[0.4em] uppercase text-muted mb-16">Sessions</h2>
        </Reveal>
        {sessions.length === 0 ? (
          <Reveal delay={150}>
            <p className="text-2xl md:text-4xl text-muted">Em breve.</p>
          </Reveal>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s, i) => (
              <Reveal key={s.youtubeId} delay={i * 120}>
              <article>
                <div className="aspect-video border border-line">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${s.youtubeId}`}
                    title={`${s.dj} — Orbe session`}
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
                <h3 className="mt-4 text-xl tracking-widest uppercase">{s.dj}</h3>
                <p className="text-sm text-muted">{s.local} · {s.data}</p>
              </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-line px-6 md:px-12 py-10 flex flex-col md:flex-row gap-4 justify-between text-xs tracking-[0.3em] uppercase text-muted">
        <span className="flex items-center gap-3">© {new Date().getFullYear()} <Wordmark className="h-2.5" /></span>
        <div className="flex gap-8">
          {Object.entries(links).filter(([, v]) => v).map(([k, v]) => (
            <a key={k} href={v} className="hover:text-white transition-colors">{k}</a>
          ))}
        </div>
      </footer>
    </main>
  );
}
