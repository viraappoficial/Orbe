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
-- Um contato por tipo e WhatsApp: reenviar atualiza o anterior.
create unique index if not exists interessados_tipo_whatsapp on interessados (tipo, whatsapp);

-- Limite de envios por IP (contra spam nos formulários públicos).
create table if not exists limite_envios (
  id bigserial primary key,
  ip text not null,
  rota text not null,
  em timestamptz not null default now()
);
create index if not exists limite_envios_ip on limite_envios (ip, rota, em desc);
