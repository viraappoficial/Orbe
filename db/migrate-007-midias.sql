-- Mídias (fotos e vídeos) da página "Como foi", ligadas a uma session (evento).
create table if not exists midias (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos(id) on delete cascade,
  tipo text not null check (tipo in ('foto', 'video')),
  url text not null,          -- foto: /api/arte/<id> ou arquivo do site; vídeo: endereço do arquivo
  poster text,                -- vídeo: imagem de capa
  legenda text,
  largura int,
  altura int,
  ordem int not null default 0,
  capa boolean not null default false,   -- vídeo de fundo da abertura
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists midias_evento_ordem on midias (evento_id, ordem);
