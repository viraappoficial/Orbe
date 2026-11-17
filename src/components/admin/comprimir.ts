// Reduz imagens grandes no navegador antes do envio (o servidor aceita até ~3 MB).
// Mantém a proporção, limita o lado maior e baixa a qualidade só o necessário.

const LADO_MAX = 1600; // px. O flyer 1080×1350 cabe com folga
const ALVO_BYTES = 1.5 * 1024 * 1024;

function paraBlob(canvas: HTMLCanvasElement, tipo: string, q: number): Promise<Blob | null> {
  return new Promise((ok) => canvas.toBlob(ok, tipo, q));
}

export async function prepararImagem(file: File): Promise<{ arquivo: File; reduzida: boolean }> {
  // Já é pequena e de um tipo aceito: envia como está, sem perder qualidade.
  const aceito = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  if (aceito && file.size <= ALVO_BYTES) return { arquivo: file, reduzida: false };

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error("Não consegui ler essa imagem. Use JPG, PNG ou WebP.");
  }

  const escala = Math.min(1, LADO_MAX / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu reduzir a imagem.");
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();

  // WebP é o mais leve; JPEG é o plano B (navegadores sem suporte a WebP no canvas).
  for (const tipo of ["image/webp", "image/jpeg"]) {
    for (const q of [0.92, 0.85, 0.78, 0.7, 0.6]) {
      const blob = await paraBlob(canvas, tipo, q);
      if (blob && blob.type === tipo && blob.size <= ALVO_BYTES) {
        const ext = tipo === "image/webp" ? "webp" : "jpg";
        const nome = file.name.replace(/\.[^.]+$/, "") + "." + ext;
        return { arquivo: new File([blob], nome, { type: tipo }), reduzida: true };
      }
    }
  }
  throw new Error("A imagem é muito pesada mesmo reduzida. Tente uma menor.");
}
