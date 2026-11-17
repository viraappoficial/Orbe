---
name: orbe-site
description: Contexto e convenções do site da ORBE (selo e comunidade de live sessions de DJs). Use ao editar o site, cadastrar sessions, mexer na lista de presença, no banco (Neon) ou no deploy (Vercel).
---

# ORBE: site

## O projeto
A ORBE é um selo e comunidade que grava **live sessions de DJs em lugares sempre diferentes**, edita o vídeo e publica no YouTube e nas redes para dar portfólio aos artistas. O site é a vitrine: apresenta o selo, mostra as sessions e coleta a **lista de presença**.

Lema: **Música · Atmosfera · Conexões**. Idioma do site: português (pt-BR).

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- Neon (Postgres serverless) para a lista de presença
- Vercel para hospedagem, com deploy automático a cada push na `main`

## Identidade visual
- Fundo preto puro (`#000`), texto branco e cinza. **Bronze (`--accent`, `#c9975a`) é o único destaque**, só em data, botão principal e linhas. Decisão registrada em `.claude/design/direction.md`.
- Fonte Jost (leve). Títulos em caixa alta com espaçamento largo (`tracking-[0.3em]` ou mais).
- Linhas finas, muito espaço vazio, animações lentas e sutis.
- Logo em `public/logo.png` (fundo preto, mesclado ao fundo do site).
- **"ORBE" escrito sempre com o wordmark do logo** (`public/wordmark.png`, componente `Wordmark`), nunca em texto com fonte comum: o E do logo é desenhado diferente.
- Animações: intro com o logo (1x por sessão, 2,4 s; 1,4 s em `/lista`), reveal ao rolar, cortina entre páginas. Tudo respeita `prefers-reduced-motion`. Duração da intro: script em `src/app/layout.tsx` (`--io`). Estilos em `src/app/globals.css`, seção "Animações".
- Tom da copy: curto, seguro, sem exagero.

## Onde fica cada coisa
| O quê | Onde |
|---|---|
| Home e seções | `src/app/page.tsx` |
| Dados da próxima session, sessions passadas e links das redes | `src/data/sessions.ts` |
| Página da lista (link da bio do Instagram) | `src/app/lista/page.tsx` |
| Formulário da lista | `src/components/PresenceForm.tsx` |
| API do formulário | `src/app/api/inscricao/route.ts` |
| Esquema do banco | `db/schema.sql` |
| Variáveis de ambiente (modelo) | `.env.example` |

## Tarefas comuns
**Nova próxima session:** edite `proxima` em `src/data/sessions.ts` (titulo, dj, data, hora, local, endereco) e coloque a arte em `public/`, apontando `arte` para ela.

**Publicar session passada:** adicione um item em `sessions` com `dj`, `local`, `data` e `youtubeId` (só o ID do vídeo). A seção Sessions mostra o vídeo incorporado.

**Links das redes:** preencha `links` (youtube, instagram, tiktok) em `src/data/sessions.ts`. Só aparecem no rodapé os que tiverem valor.

## Lista de presença
- O formulário envia para `POST /api/inscricao`, que valida e grava na tabela `inscricoes` (upsert por e-mail).
- Campos: nome, e-mail, instagram, tipo (`publico`, `dj` ou `parceiro`).
- Há um honeypot (`website`) contra spam. Não remova.
- Só o servidor acessa o banco, via `DATABASE_URL` (Neon). Nunca expor ao client.
- Variável necessária (Vercel e `.env.local`): `DATABASE_URL`.
- Sem essas variáveis a API responde 503 ("Lista ainda não configurada").

## Regras
- A `DATABASE_URL` nunca vai para o código, para o repo nem para o client. Só em variável de ambiente do servidor.
- Antes de subir: `npm run build` precisa passar.
- Dados pessoais dos inscritos não entram em logs, commits nem na conversa.
- Confirme com o dono do projeto antes de mudar a identidade visual (cores, fonte, logo).
