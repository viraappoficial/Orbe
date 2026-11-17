import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PresenceForm from "@/components/PresenceForm";
import { proxima } from "@/data/sessions";

export const metadata: Metadata = {
  title: "Lista de presença · ORBE",
  description: `${proxima.titulo} com ${proxima.dj}, ${proxima.data} às ${proxima.hora}. Vagas limitadas. Coloque seu nome na lista.`,
  openGraph: { images: [proxima.arte] },
};

export default function Lista() {
  return (
    <main className="min-h-screen px-6 py-10 md:py-16">
      <div className="max-w-md mx-auto">
        <Link href="/" className="block text-xs tracking-[0.4em] uppercase text-muted hover:text-white transition-colors">
          ← Orbe
        </Link>

        <Image
          src={proxima.arte}
          alt={`Orbe ${proxima.titulo}: ${proxima.dj}, ${proxima.data} às ${proxima.hora}, ${proxima.local}`}
          width={1122}
          height={1402}
          priority
          className="mt-8 w-full h-auto border border-line"
        />

        <div className="mt-10 text-center">
          <p className="text-xs tracking-[0.35em] uppercase text-muted">{proxima.titulo}</p>
          <h1 className="mt-2 text-3xl tracking-[0.15em] uppercase">{proxima.dj}</h1>
          <p className="mt-4 text-xl tracking-[0.2em]">
            <span className="text-accent">{proxima.data}</span> <span className="text-muted">|</span> {proxima.hora}
          </p>
          <p className="mt-3 tracking-[0.15em] uppercase">{proxima.local}</p>
          <p className="mt-1 text-sm text-muted uppercase tracking-wider">{proxima.endereco}</p>
          <p className="mt-6 inline-block border border-line px-4 py-2 text-xs tracking-[0.3em] uppercase">
            Vagas limitadas
          </p>
        </div>

        <div className="mt-14">
          <h2 className="text-xs tracking-[0.4em] uppercase text-muted mb-8">Seu nome na lista</h2>
          <PresenceForm sessionLabel={proxima.titulo} />
        </div>

        <p className="mt-16 text-center text-xs tracking-[0.3em] uppercase text-muted">
          Música · Atmosfera · Conexões
        </p>
      </div>
    </main>
  );
}
