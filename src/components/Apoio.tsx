import Image from "next/image";
import type { Apoiador } from "@/lib/db";

// Apoiadores da session e do projeto. Tudo aqui é texto puro (nunca HTML): o conteúdo vem do painel.
const IG = /^[A-Za-z0-9._]{1,30}$/;
const instagramUrl = (a: Apoiador) => (IG.test(a.instagram) ? `https://www.instagram.com/${encodeURIComponent(a.instagram)}/` : null);
// O logo leva ao site; sem site, ao Instagram.
const destino = (a: Apoiador) => a.link || instagramUrl(a);

function Marca({ a, tamanho }: { a: Apoiador; tamanho: "g" | "p" }) {
  const conteudo = a.logoUrl ? (
    <Image
      src={a.logoUrl}
      alt={a.nome}
      width={320}
      height={120}
      className={`${tamanho === "g" ? "h-12 max-w-[12rem] md:h-14" : "h-9 max-w-[8.5rem]"} w-auto object-contain ${a.logoBranco ? "brightness-0 invert" : ""}`}
    />
  ) : (
    <span className={`uppercase tracking-[0.2em] ${tamanho === "g" ? "text-lg" : "text-sm"}`}>{a.nome}</span>
  );
  const href = destino(a);
  const cls = "inline-flex items-center opacity-90 transition-opacity hover:opacity-100 focus-visible:opacity-100";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${a.nome} (abre em nova aba)`} className={cls}>
      {conteudo}
    </a>
  ) : (
    <span className={cls}>{conteudo}</span>
  );
}

const botao =
  "inline-flex min-h-11 items-center gap-2 border border-line px-5 py-3 text-xs uppercase tracking-[0.25em] transition-colors hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent";

function Seta() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
      <path d="M2 8L8 2M3.5 2H8v4.5" />
    </svg>
  );
}

export default function Apoio({ apoiadores, variante }: { apoiadores: Apoiador[]; variante: "faixa" | "compacto" }) {
  if (!apoiadores.length) return null;

  if (variante === "compacto") {
    return (
      <div className="mt-8 border-t border-line pt-5">
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted">Apoio</p>
        <ul className="mt-3 space-y-4">
          {apoiadores.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Marca a={a} tamanho="p" />
              {a.beneficio && (
                <p className="text-xs leading-snug text-muted">
                  <span className="uppercase tracking-[0.2em] text-accent">Para quem vai</span> · {a.beneficio}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {apoiadores.map((a) => {
        const ig = instagramUrl(a);
        const detalhe = !!(a.sobre || a.beneficio || a.link || ig);
        return (
          <li key={a.id} className={`grid gap-8 py-10 ${detalhe ? "md:grid-cols-[14rem_1fr] md:gap-14" : ""}`}>
            <div className="flex flex-col items-start gap-3">
              <Marca a={a} tamanho="g" />
              <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">{a.nome}</span>
              {a.descricao && <span className="max-w-[14rem] text-xs text-muted">{a.descricao}</span>}
            </div>
            {detalhe && (
              <div className="max-w-xl space-y-6">
                {a.sobre && <p className="whitespace-pre-line text-base leading-relaxed text-muted md:text-lg">{a.sobre}</p>}
                {a.beneficio && (
                  <p className="border border-accent px-5 py-4 text-sm leading-relaxed">
                    <span className="mb-1 block text-[0.65rem] uppercase tracking-[0.3em] text-accent">Para quem vai</span>
                    {a.beneficio}
                  </p>
                )}
                {(a.link || ig) && (
                  <div className="flex flex-wrap gap-3">
                    {a.link && (
                      <a href={a.link} target="_blank" rel="noopener noreferrer" className={botao}>
                        Visitar o site <Seta />
                      </a>
                    )}
                    {ig && (
                      <a href={ig} target="_blank" rel="noopener noreferrer" className={botao}>
                        Instagram <Seta />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
