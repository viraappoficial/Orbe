import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB (o painel já reduz antes de enviar; a Vercel aceita até 4,5 MB)

// Confere o tipo real pelo conteúdo do arquivo, não pelo nome ou pelo que o navegador diz.
function tipoReal(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return "image/webp";
  return null;
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Envie uma imagem" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "A imagem passa de 3 MB" }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = tipoReal(bytes);
  if (!mime) return NextResponse.json({ error: "Use uma imagem JPG, PNG ou WebP" }, { status: 415 });

  try {
    const rows = (await getSql()`
      insert into artes (mime, dados) values (${mime}, ${Buffer.from(bytes)}) returning id`) as { id: string }[];
    return NextResponse.json({ url: `/api/arte/${rows[0].id}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar a imagem" }, { status: 500 });
  }
}
