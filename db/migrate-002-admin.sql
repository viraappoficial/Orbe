-- Eventos (sessions) gerenciados pelo admin.
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

-- Artes enviadas pelo admin.
create table if not exists artes (
  id uuid primary key default gen_random_uuid(),
  mime text not null,
  dados bytea not null,
  created_at timestamptz not null default now()
);

-- Inscrição pertence a um evento; uma por CPF em cada evento.
alter table inscricoes add column if not exists evento_id uuid references eventos(id) on delete set null;
drop index if exists inscricoes_cpf_key;
create unique index if not exists inscricoes_evento_cpf_key on inscricoes (evento_id, cpf) where cpf is not null;

-- Tentativas de login do admin (limite por IP).
create table if not exists admin_tentativas (
  id bigserial primary key,
  ip text not null,
  ok boolean not null,
  em timestamptz not null default now()
);
create index if not exists admin_tentativas_ip_em on admin_tentativas (ip, em desc);

-- Primeiro evento: a Sessions 001 que já está no ar (só se ainda não houver nenhum).
insert into eventos (titulo, dj, data, dia, hora, local, endereco, cidade, prazo, arte_url,
                     status, destaque, lista_aberta)
select 'Sessions 001', 'John Monster', '20.11', '20/11', '16h', 'Estilo Livre Bar',
       'Av. Pioneiro Alício Arantes, Campolina, 608 – Jardim Real', 'Maringá, PR', '18/11',
       '/session-001-oficial.webp', 'publicado', true, true
where not exists (select 1 from eventos);

-- Inscrições já existentes passam a pertencer a esse evento.
update inscricoes set evento_id = (select id from eventos where destaque limit 1) where evento_id is null;
