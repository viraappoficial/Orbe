import { NextResponse } from "next/server";

// O painel pergunta se o armazenamento de vídeos (Vercel Blob) já está ligado.
export async function GET() {
  return NextResponse.json({ blob: !!process.env.BLOB_READ_WRITE_TOKEN });
}
