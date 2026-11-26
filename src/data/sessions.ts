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
  instagram: "https://www.instagram.com/orbe.rec/",
  tiktok: "",
};

export const proxima = {
  titulo: "Sessions 001",
  dj: "Johnm",
  data: "20.11",
  hora: "16h",
  local: "Estilo Livre Bar",
  endereco: "Av. Pioneiro Alício Arantes, Campolina, 608 – Jardim Real",
  arte: "/session-001-johnm.webp",
  og: "/session-001-johnm-og.jpg", // previa ao compartilhar o link
  cidade: "Maringá, PR", // usada no mapa; sem ela o pin pode cair no lugar errado
  mapaEmbed: "", // opcional: URL do iframe copiada em Maps > Compartilhar > Incorporar um mapa
  dia: "20/11",
  prazo: "18/11", // prazo para confirmar presença
};

// Link de convite do grupo do WhatsApp. A pessoa é levada para cá ao entrar na lista.
// Pode ser preenchido aqui ou pela variável NEXT_PUBLIC_WHATSAPP_GROUP na Vercel.
export const grupoWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_GROUP || "";
