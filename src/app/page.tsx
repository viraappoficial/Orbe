import Image from "next/image";
import PresenceForm from "@/components/PresenceForm";
import { sessions, links, proxima } from "@/data/sessions";

const nav = [
  ["Próxima", "#proxima"],
  ["O Orbe", "#sobre"],
  ["Sessions", "#sessions"],
  ["Lista", "#lista"],
];

export default function Home() {
  return (
    <main>
      <header className="fixed top-0 inset-x-0 z-10 flex justify-between items-center px-6 md:px-12 py-6 text-xs tracking-[0.35em] uppercase bg-gradient-to-b from-black to-transparent">
        <span>Orbe</span>
        <nav className="flex gap-6 md:gap-10 text-muted">
          {nav.map(([label, href]) => (
            <a key={href} href={href} className="hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Image
          src="/logo.png"
          alt="ORBE"
          width={1536}
          height={1024}
          priority
          className="logo-glow fadeup w-full max-w-3xl h-auto -mt-10 -mb-16 md:-mb-24"
        />
        <p className="fadeup mt-4 text-xs md:text-sm tracking-[0.4em] uppercase text-muted [animation-delay:.6s]">
          Música · Atmosfera · Conexões
        </p>
        <a
          href="#lista"
          className="fadeup mt-12 border border-white px-10 py-4 text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-colors [animation-delay:1s]"
        >
          Entrar na lista
        </a>
      </section>

      <section id="proxima" className="border-t border-line px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Image
            src={proxima.arte}
            alt={`Orbe ${proxima.titulo} — ${proxima.dj}`}
            width={1122}
            height={1402}
            className="w-full h-auto border border-line"
          />
          <div>
            <h2 className="text-xs tracking-[0.4em] uppercase text-muted mb-6">
              Próxima session
            </h2>
            <p className="text-sm tracking-[0.35em] uppercase text-muted">{proxima.titulo}</p>
            <h3 className="mt-3 text-4xl md:text-6xl tracking-[0.15em] uppercase leading-tight">
              {proxima.dj}
            </h3>
            <p className="mt-8 text-2xl md:text-3xl tracking-[0.2em]">
              {proxima.data} <span className="text-muted">|</span> {proxima.hora}
            </p>
            <p className="mt-6 tracking-[0.2em] uppercase">{proxima.local}</p>
            <p className="mt-2 text-sm text-muted tracking-wider uppercase">{proxima.endereco}</p>
            <p className="mt-8 inline-block border border-line px-5 py-2 text-xs tracking-[0.3em] uppercase">
              Vagas limitadas
            </p>
            <div>
              <a
                href="#lista"
                className="mt-10 inline-block border border-white px-10 py-4 text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-colors"
              >
                Colocar meu nome na lista
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="sobre" className="max-w-3xl mx-auto px-6 py-32 md:py-48">
        <h2 className="text-xs tracking-[0.4em] uppercase text-muted mb-10">O Orbe</h2>
        <p className="text-2xl md:text-4xl leading-snug">
          Um selo. Uma comunidade. Uma live session por vez, em um lugar
          diferente a cada vez.
        </p>
        <p className="mt-10 text-lg text-muted leading-relaxed">
          Levamos DJs para espaços inesperados, gravamos, editamos e
          publicamos. Cada session vira portfólio para o artista e memória
          para quem faz parte.
        </p>
      </section>

      <section id="sessions" className="border-t border-line px-6 md:px-12 py-32">
        <h2 className="text-xs tracking-[0.4em] uppercase text-muted mb-16">Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-2xl md:text-4xl text-muted">Em breve.</p>
        ) : (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s) => (
              <article key={s.youtubeId}>
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
            ))}
          </div>
        )}
      </section>

      <section id="lista" className="border-t border-line px-6 py-32">
        <div className="max-w-md mx-auto">
          <h2 className="text-xs tracking-[0.4em] uppercase text-muted mb-4">Lista de presença</h2>
          <p className="text-2xl mb-12">Seja avisado das próximas sessions.</p>
          <PresenceForm />
        </div>
      </section>

      <footer className="border-t border-line px-6 md:px-12 py-10 flex flex-col md:flex-row gap-4 justify-between text-xs tracking-[0.3em] uppercase text-muted">
        <span>© {new Date().getFullYear()} Orbe</span>
        <div className="flex gap-8">
          {Object.entries(links).filter(([, v]) => v).map(([k, v]) => (
            <a key={k} href={v} className="hover:text-white transition-colors">{k}</a>
          ))}
        </div>
      </footer>
    </main>
  );
}
