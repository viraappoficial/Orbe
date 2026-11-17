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
- Animações: intro com o logo (1x por sessão, 1,6 s; 1,0 s em `/lista`), reveal ao rolar, cortina entre páginas. Tudo respeita `prefers-reduced-motion`. Duração da intro: script em `src/app/layout.tsx` (`--io`). Estilos em `src/app/globals.css`, seção "Animações".
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
- O formulário envia para `POST /api/inscricao`, que valida e grava na tabela `inscricoes` (uma inscrição por CPF; reenviar atualiza a anterior).
- Campos: nome completo, WhatsApp com DDD, CPF, instagram (opcional) e confirmação (`sim`, `talvez`, `nao`). Espelha o Google Forms provisório. Validações em `src/lib/validate.ts`, usadas no client e no server.
- **CPF é dado pessoal sensível (LGPD):** nunca em log, commit, mensagem de erro nem resposta da API. Só o servidor lê o banco. O texto de uso dos dados aparece abaixo do botão do formulário.
- Prazo e dia da confirmação: `proxima.prazo` e `proxima.dia` em `src/data/sessions.ts`. Atualizar a cada session.
- Ao concluir, a pessoa é levada ao grupo do WhatsApp (`grupoWhatsapp` em `src/data/sessions.ts` ou a variável `NEXT_PUBLIC_WHATSAPP_GROUP`). Sem o link, mostra só a confirmação.
- Migrações do banco em `db/migrate-*.sql`; o `db/schema.sql` é o estado atual.
- Há um honeypot (`website`) contra spam. Não remova.
- Só o servidor acessa o banco, via `DATABASE_URL` (Neon). Nunca expor ao client.
- Variável necessária (Vercel e `.env.local`): `DATABASE_URL`.
- Sem essas variáveis a API responde 503 ("Lista ainda não configurada").

## Regras
- A `DATABASE_URL` nunca vai para o código, para o repo nem para o client. Só em variável de ambiente do servidor.
- Antes de subir: `npm run build` precisa passar.
- Dados pessoais dos inscritos não entram em logs, commits nem na conversa.
- Confirme com o dono do projeto antes de mudar a identidade visual (cores, fonte, logo).

## Gestão (admin)
- Painel em `/admin` (login em `/admin/login`), com duas abas: **Lista** (inscritos, filtros, exportar CSV, abrir/fechar a lista) e **Eventos** (criar, editar, anunciar, despublicar, excluir, enviar a arte).
- **Credenciais só em variáveis de ambiente na Vercel**, nunca no repo (ele é público): `ADMIN_USER` e `ADMIN_PASSWORD`. `SESSION_SECRET` é opcional (se ausente, usa a senha para assinar a sessão). Sem `ADMIN_PASSWORD` o login responde 503.
- Proteção: `src/middleware.ts` barra `/admin` e `/api/admin` sem cookie assinado (`src/lib/auth.ts`, 12 h, httpOnly, sameSite strict); bloqueia pedidos de outra origem (CSRF); o login limita 5 erros por IP a cada 15 min (tabela `admin_tentativas`).
- **Evento anunciado** = `status = publicado` + `destaque = true` (só um por vez). A home e a `/lista` leem esse evento do banco (`src/lib/db.ts`); se o banco falhar, usam o plano B de `src/data/sessions.ts`.
- **Lista aberta/fechada** é decidida no servidor: `POST /api/inscricao` recusa com 403 se não houver evento anunciado com `lista_aberta`.
- Inscrição é por evento e CPF (`inscricoes_evento_cpf_key`). Evento com inscritos não pode ser excluído, só despublicado.
- O CPF aparece mascarado na tela do admin; o CSV traz o CPF completo. Nunca expor CPF em páginas públicas, logs ou erros.
- Artes enviadas ficam na tabela `artes` (até 2 MB, tipo conferido pelo conteúdo) e saem em `/api/arte/<id>`.
- As páginas públicas são estáticas com `revalidate = 60`; o admin chama `revalidatePath` ao salvar, então a mudança aparece na hora.
- Migrações: `db/migrate-001-campos-lista.sql`, `db/migrate-002-admin.sql`.

## Mapa do evento
- O Google **não deixa** a página comum de um local (`/maps/place/...`) aparecer dentro de outro site (erro "a conexão foi recusada"). Só o formato `https://www.google.com/maps/embed?pb=...` pode ser incorporado.
- No painel (Eventos → Mapa do Google) pode-se colar o **link do local** (barra de endereço do Maps), um **link curto** (maps.app.goo.gl) ou o **código `<iframe>`**; `src/lib/mapa-embed.ts` converte para o formato incorporável usando as coordenadas e o ID do local do próprio link (o pin cai no estabelecimento certo).
- Não geocodificar o endereço para pôr um pin: o resultado pode errar o trecho de uma avenida por quilômetros.
- Sem mapa configurado, `MapaLocal` mostra um cartão com o endereço e os botões "Abrir no Google Maps" e "Como chegar".
- Modais e a foto ampliada usam `createPortal` (na raiz do `body`) para ficarem acima de iframes e de qualquer coluna com transformação.

## Importar respostas do Google Forms
- Painel → Lista → **Importar planilha**: aceita o CSV baixado do Google Planilhas (`Arquivo > Fazer download > .csv`). Mostra uma **prévia** (novas, já na lista, linhas com problema) e só grava ao confirmar. API: `POST /api/admin/importar` (`confirmar: false` = prévia). Lógica em `src/lib/importar.ts`.
- Colunas reconhecidas pelo nome do cabeçalho: nome, telefone/WhatsApp, CPF, confirmação, carimbo de data/hora. A planilha perde o zero da frente do CPF, e a importação devolve os zeros.
- Mesmas regras do formulário (CPF válido, WhatsApp com DDD, nome completo). Quem já está na lista (mesmo CPF e evento) é atualizado, não duplicado, então repetir a importação é seguro.
- O CSV tem CPF: não commitar, não deixar em pastas do projeto, apagar depois de importar. A planilha do Google compartilhada por link expõe os CPFs; restringir o compartilhamento depois.

## Janelas sobre iframes
- Enquanto a foto ampliada ou o aviso do WhatsApp está aberto, `useOverlayAberto` (`src/lib/overlay.ts`) esconde os iframes (mapa, vídeos) com a classe `overlay-aberto` em `<html>`. Alguns navegadores desenham iframes de outro site por cima de qualquer `z-index`.
- As páginas públicas são geradas no build e renovam a cada 60 s; num build local sem banco aparece o plano B (cartão de local) até a primeira renovação.

## Faça parte do Orbe
- Home: seção `#participe` com três caminhos: **Quero ir** (`/lista`, só se a lista estiver aberta), **Sou DJ** (`/participar?como=dj`) e **Espaço ou marca** (`/participar?como=parceiro`).
- `/participar` (`src/components/ParticiparForm.tsx`): formulário com abas DJ / Espaço ou marca. **Sem CPF.** DJ: nome artístico, WhatsApp, Instagram, cidade, estilo, link de um set (opcional), mensagem. Espaço/marca: nome, nome do espaço, WhatsApp, Instagram (opcional), cidade, tipo de espaço, mensagem.
- Validação compartilhada em `src/lib/participar.ts` (formulário e servidor). `POST /api/participar` grava em `interessados` (uma linha por tipo + WhatsApp; reenviar atualiza e reabre se estava arquivado), tem honeypot e limite de 5 envios por IP a cada 10 min (`limite_envios`).
- Admin → aba **Interessados**: filtros, marcar contatado, arquivar/reabrir, remover, chamar no WhatsApp, links de Instagram e do set, exportar CSV. O contador de novos aparece na aba.
- Migração: `db/migrate-003-interessados.sql`.

## Check-in na porta
- `/admin/checkin` (botão **Check-in** no cabeçalho do painel): tela pensada para o celular do porteiro. Contadores (Entraram / Faltam / Na lista), busca por **nome, final do CPF ou WhatsApp** (feita no próprio aparelho, não depende de internet), botão grande **Confirmar entrada**, **Desfazer** e **Adicionar na porta** (quem não está na lista entra já presente, `origem = porta`).
- **Funciona sem internet:** cada entrada vai para uma fila guardada no celular (`localStorage` `orbe-checkin-fila`) e é enviada quando a conexão volta; o horário gravado é o do toque. Adicionar na porta exige internet.
- API: `GET /api/admin/checkin` (só o **final** do CPF vai para a tela), `POST /api/admin/checkin` (lote de ações, idempotente: confirmar quem já entrou não muda o horário da primeira entrada; horário do celular só vale se for plausível), `POST /api/admin/checkin/porta`.
- Banco: `inscricoes.presente`, `checkin_em`, `origem` (`site`, `importada`, `porta`), em `db/migrate-004-checkin.sql`. O painel (aba Lista) mostra "Entraram" e a coluna Entrada; o CSV exportado inclui presença, horário e origem.

## Layout da `/lista` (proposta B, escolhida pelo dono)
- **Computador:** tela dividida. Esquerda: a arte inteira, fixa na altura da tela, ampliável, com uma barra embaixo (endereço + **Ver mapa ↗**, que abre `MapaModal`). Direita: voltar, título, etiquetas (data, local, vagas), formulário e aviso legal. Cabe numa tela de 1280×860.
- **Celular:** miniatura da arte ao lado do título, etiquetas, formulário (botão visível sem rolar em 390×844) e o mapa recolhido numa linha **Como chegar +** (`<details>`), que abre ao tocar.
- A confirmação de presença são **três botões lado a lado** (`Sim, confirmo` / `Ainda não consigo` / `Não poderei`), com rádios reais por baixo (teclado e leitor de tela funcionam).
- O mapa só aparece sob demanda: `MapaModal` não usa `useOverlayAberto` porque ele esconderia o próprio iframe do mapa.
