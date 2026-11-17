-- Migração da versão com e-mail para a versão com telefone, CPF e confirmação.
alter table inscricoes
  add column if not exists telefone text,
  add column if not exists cpf text,
  add column if not exists confirmacao text check (confirmacao in ('sim','talvez','nao'));
alter table inscricoes alter column email drop not null;
alter table inscricoes drop constraint if exists inscricoes_email_key;
create unique index if not exists inscricoes_cpf_key on inscricoes (cpf) where cpf is not null;
