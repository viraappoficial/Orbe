import type { Metadata } from "next";
import { TransitionLink } from "@/components/PageTransition";
import Wordmark from "@/components/Wordmark";
import ParticiparForm from "@/components/ParticiparForm";
import { getEventoAtual } from "@/lib/db";

export const metadata: Metadata = {
  title: "Faça parte · ORBE",
  description: "Toque numa session, ceda um espaço ou apoie o selo. O Orbe é feito por quem toca, por quem recebe e por quem vai.",
};

export default async function Participar({ searchParams }: { searchParams: Promise<{ como?: string }> }) {
  const { como } = await searchParams;
  const ev = await getEventoAtual();

  return (
    <main
      style={{ animationDelay: "calc(var(--io, 0s) - .2s)" }}
      className="page-in relative min-h-svh overflow-hidden px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 md:py-12"
    >
      <div className="lista-glow" aria-hidden="true" />
      <div className="relative mx-auto max-w-xl">
        <TransitionLink href="/" className="inline-flex items-center gap-3 py-2 text-muted transition-colors hover:text-white">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
            <path d="M15 5H1M5 1L1 5l4 4" />
          </svg>
          <Wordmark className="h-3" />
        </TransitionLink>

        <p className="mt-10 text-xs uppercase tracking-[0.4em] text-accent">Faça parte</p>
        <h1 className="mt-3 text-3xl uppercase leading-tight tracking-[0.1em] md:text-5xl">Venha ser Orbe</h1>
        <p className="mt-5 text-muted">O Orbe é feito por quem toca, por quem recebe e por quem vai.</p>

        <div className="mt-10 border border-line bg-white/[0.02] p-5 sm:p-8">
          <ParticiparForm inicial={como === "parceiro" ? "parceiro" : "dj"} listaAberta={!!ev?.listaAberta} />
        </div>
      </div>
    </main>
  );
}
