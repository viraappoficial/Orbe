export type Session = {
  dj: string;
  local: string;
  data: string;
  youtubeId: string; // ID do vídeo, ex: dQw4w9WgXcQ
};

// Adicione as sessions aqui. Depois migramos para o banco.
export const sessions: Session[] = [];

export const links = {
  youtube: "",
  instagram: "",
  tiktok: "",
};

export const proxima = {
  titulo: "Sessions 001",
  dj: "John Monster",
  data: "20.11",
  hora: "16h",
  local: "Estilo Livre Bar",
  endereco: "Av. Pioneiro Alício Arantes, Campolina, 608 – Jardim Real",
  arte: "/session-001.webp",
};
