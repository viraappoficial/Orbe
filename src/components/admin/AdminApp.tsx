"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Wordmark from "@/components/Wordmark";
import { api, type EventoAdmin } from "./api";
import ListaPanel from "./ListaPanel";
import EventosPanel from "./EventosPanel";
import InteressadosPanel from "./InteressadosPanel";
import ApoiadoresPanel from "./ApoiadoresPanel";
import MidiasPanel from "./MidiasPanel";

export default function AdminApp() {
  const [aba, setAba] = useState<"lista" | "eventos" | "interessados" | "apoiadores" | "midias">("lista");
  const [novos, setNovos] = useState(0);
  const [eventos, setEventos] = useState<EventoAdmin[] | null>(null);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      const r = await api<{ eventos: EventoAdmin[] }>("/api/admin/eventos");
      setEventos(r.eventos);
      setErro("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar");
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function sair() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const aba_ = (id: "lista" | "eventos" | "interessados" | "apoiadores" | "midias", rotulo: string) => (
    <button
      type="button"
      onClick={() => setAba(id)}
      aria-pressed={aba === id}
      className={`border-b-2 px-1 pb-3 text-xs uppercase tracking-[0.3em] transition-colors ${
        aba === id ? "border-accent text-white" : "border-transparent text-muted hover:text-white"
      }`}
    >
      {rotulo}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-6 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Wordmark className="h-3.5" />
          <span className="text-xs uppercase tracking-[0.35em] text-muted">Gestão</span>
        </div>
        <div className="flex items-center gap-5 text-xs uppercase tracking-[0.25em]">
          <Link href="/admin/checkin" className="border border-accent bg-accent px-4 py-2 text-black transition-colors hover:bg-transparent hover:text-accent">Check-in</Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-white">Ver site</a>
          <button type="button" onClick={sair} className="text-muted hover:text-white">Sair</button>
        </div>
      </header>

      <nav className="mt-8 flex gap-6 overflow-x-auto whitespace-nowrap border-b border-line sm:gap-8">
        {aba_("lista", "Lista")}
        {aba_("eventos", "Eventos")}
        {aba_("interessados", novos > 0 ? `Interessados (${novos})` : "Interessados")}
        {aba_("apoiadores", "Apoiadores")}
        {aba_("midias", "Mídias")}
      </nav>

      {erro && <p role="alert" className="mt-6 text-sm text-[#ff8a8a]">⚠ {erro}</p>}
      {!eventos && !erro && <p className="mt-10 text-muted">Carregando…</p>}

      {eventos && aba === "lista" && <ListaPanel eventos={eventos} recarregar={carregar} />}
      {eventos && aba === "eventos" && <EventosPanel eventos={eventos} recarregar={carregar} />}
      {aba === "interessados" && <InteressadosPanel aoMudar={setNovos} />}
      {eventos && aba === "apoiadores" && <ApoiadoresPanel eventos={eventos} />}
      {eventos && aba === "midias" && <MidiasPanel eventos={eventos} />}
    </div>
  );
}
