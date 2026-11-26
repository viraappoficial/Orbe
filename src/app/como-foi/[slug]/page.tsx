import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ComoFoiPagina from "@/components/como-foi/ComoFoiPagina";
import { getEventoPorSlug, getMidias } from "@/lib/db";
import { midiasPadrao } from "@/data/como-foi";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getEventoPorSlug(slug);
  return { title: ev ? `Como foi a ${ev.titulo} · ORBE` : "Como foi · ORBE" };
}

export default async function ComoFoiSession({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ev = await getEventoPorSlug(slug);
  if (!ev) notFound();
  const doBanco = await getMidias(ev.id);
  return <ComoFoiPagina ev={ev} midias={doBanco ?? midiasPadrao} />;
}
