import Image from "next/image";
import type { Apoiador } from "@/lib/db";

// Apoiadores da session e do projeto. Cada um é clicável (link do site ou Instagram).
function destino(a: Apoiador): string | null {
  if (a.link) return a.link;
  if (/^[A-Za-z0-9._]{1,30}$/.test(a.instagram)) return `https://www.instagram.com/${encodeURIComponent(a.instagram)}/`;
  return null;
}

function Marca({ a, tamanho }: { a: Apoiador; tamanho: "g" | "p" }) {
  const alt = a.nome;
  const conteudo = a.logoUrl ? (
    <Image
      src={a.logoUrl}
      alt={alt}
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
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${a.nome} (abre em nova aba)`} title={a.descricao || a.nome} className={cls}>
      {conteudo}
    </a>
  ) : (
    <span title={a.descricao || a.nome} className={cls}>{conteudo}</span>
  );
}

export default function Apoio({ apoiadores, variante }: { apoiadores: Apoiador[]; variante: "faixa" | "compacto" }) {
  if (!apoiadores.length) return null;
  if (variante === "compacto") {
    return (
      <div className="mt-8 border-t border-line pt-5">
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted">Apoio</p>
        <ul className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-3">
          {apoiadores.map((a) => (
            <li key={a.id}><Marca a={a} tamanho="p" /></li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <ul className="flex flex-wrap items-center gap-x-12 gap-y-8">
      {apoiadores.map((a) => (
        <li key={a.id} className="flex flex-col items-start gap-2">
          <Marca a={a} tamanho="g" />
          {a.descricao && <span className="max-w-[14rem] text-xs text-muted">{a.descricao}</span>}
        </li>
      ))}
    </ul>
  );
}
