create table if not exists inscricoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  cpf text,
  instagram text,
  confirmacao text check (confirmacao in ('sim','talvez','nao')),
  email text,
  tipo text not null default 'publico' check (tipo in ('publico','dj','parceiro')),
  created_at timestamptz not null default now()
);

-- Uma inscrição por CPF.
create unique index if not exists inscricoes_cpf_key on inscricoes (cpf) where cpf is not null;
