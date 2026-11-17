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
