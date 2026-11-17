create table if not exists public.inscricoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  instagram text,
  tipo text not null default 'publico' check (tipo in ('publico','dj','parceiro')),
  created_at timestamptz not null default now()
);

-- RLS ligado e sem policies: só o servidor (service role) escreve/lê.
alter table public.inscricoes enable row level security;
