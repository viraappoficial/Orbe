-- Esquema COMPLETO e atual do banco (Neon / Postgres). Idempotente: pode ser rodado de novo.
-- O histórico de mudanças está em db/migrate-*.sql (já aplicadas no banco de produção).

-- Eventos (sessions) gerenciados pelo painel.
create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  dj text not null,
  data text not null,
  dia text,
  hora text not null,
  local text not null,
  endereco text not null,
  cidade text,
  mapa_embed text,
  prazo text,
  arte_url text,
  whatsapp_url text,
  youtube_id text,
  status text not null default 'rascunho' check (status in ('rascunho','publicado')),
  destaque boolean not null default false,
  lista_aberta boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Só um evento pode ser a "próxima session" ao mesmo tempo.
create unique index if not exists eventos_um_destaque on eventos (destaque) where destaque;

-- Artes enviadas pelo painel.
create table if not exists artes (
  id uuid primary key default gen_random_uuid(),
  mime text not null,
  dados bytea not null,
  created_at timestamptz not null default now()
);

-- Lista de presença. Uma inscrição por CPF em cada evento.
create table if not exists inscricoes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references eventos(id) on delete set null,
  nome text not null,
  telefone text,
  cpf text,
  instagram text,
  confirmacao text check (confirmacao in ('sim','talvez','nao')),
  email text,
  tipo text not null default 'publico' check (tipo in ('publico','dj','parceiro')),
  presente boolean not null default false,
  checkin_em timestamptz,
  origem text not null default 'site' check (origem in ('site','importada','porta')),
  created_at timestamptz not null default now()
);
create unique index if not exists inscricoes_evento_cpf_key on inscricoes (evento_id, cpf) where cpf is not null;
create index if not exists inscricoes_evento_presente on inscricoes (evento_id, presente);

-- Pessoas que querem participar do selo (DJs e espaços/marcas), vindas de /participar.
create table if not exists interessados (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('dj','parceiro')),
  nome text not null,
  whatsapp text not null,
  instagram text,
  cidade text not null,
  organizacao text,
  categoria text,
  link text,
  mensagem text,
  status text not null default 'novo' check (status in ('novo','contatado','arquivado')),
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index if not exists interessados_tipo_whatsapp on interessados (tipo, whatsapp);

-- Tentativas de login do painel (limite por IP).
create table if not exists admin_tentativas (
  id bigserial primary key,
  ip text not null,
  ok boolean not null,
  em timestamptz not null default now()
);
create index if not exists admin_tentativas_ip_em on admin_tentativas (ip, em desc);

-- Limite de envios por IP nos formulários públicos.
create table if not exists limite_envios (
  id bigserial primary key,
  ip text not null,
  rota text not null,
  em timestamptz not null default now()
);
create index if not exists limite_envios_ip on limite_envios (ip, rota, em desc);

-- Apoiadores do projeto e das sessions.
create table if not exists apoiadores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  logo_url text,
  logo_branco boolean not null default false,
  link text,
  instagram text,
  descricao text,
  sobre text,
  beneficio text,
  projeto boolean not null default false,
  ativo boolean not null default true,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists evento_apoiadores (
  evento_id uuid not null references eventos(id) on delete cascade,
  apoiador_id uuid not null references apoiadores(id) on delete cascade,
  primary key (evento_id, apoiador_id)
);
create index if not exists evento_apoiadores_apoiador on evento_apoiadores (apoiador_id);
