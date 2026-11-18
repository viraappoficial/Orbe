-- Mais informações sobre o apoiador: texto sobre a marca e benefício para o público.
alter table apoiadores
  add column if not exists sobre text,
  add column if not exists beneficio text;
