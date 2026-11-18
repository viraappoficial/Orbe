-- Apoiadores do projeto e das sessions.
create table if not exists apoiadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  logo_url text,
  logo_branco boolean not null default false, -- mostra o logo todo em branco (para logos de uma cor só)
  link text,
  instagram text,
  descricao text,
  projeto boolean not null default false,     -- apoia o projeto todo: aparece em todas as sessions
  ativo boolean not null default true,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Em quais sessions o apoiador aparece (além de "projeto todo").
create table if not exists evento_apoiadores (
  evento_id uuid not null references eventos(id) on delete cascade,
  apoiador_id uuid not null references apoiadores(id) on delete cascade,
  primary key (evento_id, apoiador_id)
);
create index if not exists evento_apoiadores_apoiador on evento_apoiadores (apoiador_id);
