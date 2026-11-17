import { getSql } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Serve as artes enviadas pelo admin. O ID é único, então o cache pode ser longo.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return new Response("Não encontrado", { status: 404 });
  try {
    const rows = (await getSql()`select mime, dados from artes where id = ${id}::uuid`) as { mime: string; dados: Uint8Array | Buffer }[];
    if (!rows[0]) return new Response("Não encontrado", { status: 404 });
    return new Response(new Uint8Array(rows[0].dados), {
      headers: {
        "Content-Type": rows[0].mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Erro", { status: 500 });
  }
}
