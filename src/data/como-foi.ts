// Mídias padrão da página "Como foi" (Sessions 001). Quando houver mídias cadastradas no painel
// (aba Mídias), elas passam a valer no lugar destas.
export type Midia = {
  id: string;
  tipo: "foto" | "video";
  url: string;
  poster: string; // vídeo: imagem de capa
  legenda: string;
  w: number;
  h: number;
  ordem: number;
  capa: boolean; // vídeo usado no fundo da abertura (não aparece na lista de vídeos)
};

const foto = (n: number): Midia => ({
  id: `padrao-foto-${n}`,
  tipo: "foto",
  url: `/como-foi/f/foto${String(n).padStart(2, "0")}.webp`,
  poster: "",
  legenda: "Sessions 001",
  w: 900,
  h: n % 3 === 0 ? 1125 : 1600,
  ordem: n,
  capa: false,
});
const clipe = (n: number): Midia => ({
  id: `padrao-video-${n}`,
  tipo: "video",
  url: `/como-foi/v/clip${n}.mp4`,
  poster: `/como-foi/v/clip${n}.webp`,
  legenda: "Sessions 001",
  w: 720,
  h: 1280,
  ordem: 100 + n,
  capa: false,
});

export const midiasPadrao: Midia[] = [
  { id: "padrao-capa", tipo: "video", url: "/como-foi/v/hero.mp4", poster: "/como-foi/v/hero.webp", legenda: "", w: 720, h: 1280, ordem: 0, capa: true },
  ...[1, 2, 3, 4, 5, 6, 7].map(clipe),
  ...Array.from({ length: 14 }, (_, i) => foto(i + 1)),
];

export const comoFoiInfo = {
  titulo: "Sessions 001",
  data: "20.11",
  local: "Estilo Livre Bar",
  cidade: "Maringá, PR",
  hero: "/como-foi/v/hero.mp4",
  heroPoster: "/como-foi/v/hero.webp",
};
