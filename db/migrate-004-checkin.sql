-- Check-in na porta do evento.
alter table inscricoes
  add column if not exists presente boolean not null default false,
  add column if not exists checkin_em timestamptz,
  add column if not exists origem text not null default 'site' check (origem in ('site','importada','porta'));
create index if not exists inscricoes_evento_presente on inscricoes (evento_id, presente);
