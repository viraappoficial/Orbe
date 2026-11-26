import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ComoFoiPagina from "@/components/como-foi/ComoFoiPagina";
import { getEventosPassados, getMidias } from "@/lib/db";
import { midiasPadrao } from "@/data/como-foi";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Como foi · ORBE",
  description: "Vídeos e fotos das live sessions da ORBE.",
};

// A session mais recente que já aconteceu.
export default async function ComoFoi() {
  const [ev] = await getEventosPassados();
  if (!ev) notFound();
  const doBanco = await getMidias(ev.id);
  return <ComoFoiPagina ev={ev} midias={doBanco ?? midiasPadrao} />;
}
