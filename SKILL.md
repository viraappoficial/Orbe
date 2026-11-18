---
name: orbe-site
description: Contexto, convenções e mapa do código do site da ORBE (selo e comunidade de live sessions de DJs). Use ao editar o site, anunciar ou editar uma session, mexer na lista de presença, no check-in da porta, no painel /admin, no banco (Neon) ou no deploy (Vercel).
---

# ORBE: site

## O projeto
A ORBE é um selo e comunidade que grava **live sessions de DJs em lugares sempre diferentes**, edita o vídeo e publica no YouTube e nas redes para dar portfólio aos artistas.

O site faz quatro coisas: apresenta o selo e mostra as sessions (home); recebe a **lista de presença** da próxima session (`/lista`, link da bio do Instagram); recebe pedidos de **DJs e espaços** que querem participar (`/participar`); e tem um **painel de gestão** com **check-in na porta** (`/admin`).

Lema: **Música · Atmosfera · Conexões**. Idioma do site: português (pt-BR). O repositório é **público**: nada de senha, chave ou dado pessoal no código.

## Stack
- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4, fonte Jost.
- Neon (Postgres serverless, região São Paulo) via `@neondatabase/serverless`.
- Vercel: deploy automático a cada push na `main`; Vercel Analytics instalado (ligar na aba Analytics do projeto).
- Scripts: `npm run dev | build | start | lint`. Antes de subir: `npm run lint` e `npm run build` precisam passar.

## Variáveis de ambiente (Vercel e `.env.local`; modelo em `.env.example`)
| Variável | Para quê |
|---|---|
| `DATABASE_URL` | Conexão do Neon. Só o servidor lê. Sem ela a lista responde 503 e as páginas usam o plano B. |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Login do painel. Sem a senha o login responde 503 (painel desligado). |
| `SESSION_SECRET` | Opcional. Chave do cookie de login. Sem ela, usa senha + `DATABASE_URL`. |
| `NEXT_PUBLIC_SITE_URL` | Opcional. Domínio principal (prévia de link). Padrão: o domínio da Vercel. |
| `NEXT_PUBLIC_WHATSAPP_GROUP` | Opcional. Plano B do link do grupo; o normal é o campo do evento no painel. |

## Onde fica cada coisa
| O quê | Onde |
|---|---|
| Home (hero, próxima session, O Orbe, Sessions, Faça parte, rodapé) | `src/app/page.tsx` |
| Página da lista (`/lista`) | `src/app/lista/page.tsx` + `src/components/PresenceForm.tsx` |
| Página `/participar` | `src/app/participar/page.tsx` + `src/components/ParticiparForm.tsx` |
| Painel | `src/app/admin/**` e `src/components/admin/**` |
| Check-in da porta | `src/app/admin/checkin/page.tsx` + `src/components/admin/CheckinApp.tsx` |
| APIs públicas | `src/app/api/inscricao`, `src/app/api/participar`, `src/app/api/arte/[id]` |
| APIs do painel (exigem login) | `src/app/api/admin/**` |
| Leitura do evento atual (com plano B) | `src/lib/db.ts` |
| Login, cookie, proteção | `src/lib/auth.ts`, `src/middleware.ts` |
| Validações (CPF, telefone, Instagram) | `src/lib/validate.ts`, `src/lib/participar.ts`, `src/lib/eventos-input.ts` |
| Conversão do link do Google Maps | `src/lib/mapa-embed.ts` |
| Importação da planilha | `src/lib/importar.ts` |
| Plano B dos dados, links das redes, `grupoWhatsapp` | `src/data/sessions.ts` |
| Banco | `db/schema.sql` (estado atual completo) e `db/migrate-*.sql` (histórico) |
| Decisões de design | `.claude/design/direction.md` |

## Identidade visual
- Fundo preto puro (`#000`), texto branco e cinza. **Bronze (`--accent`, `#c9975a`) é o único destaque**: data, botão principal, linhas. Decisão em `.claude/design/direction.md`.
- Títulos em caixa alta com espaçamento largo. Linhas finas, muito espaço vazio, movimento lento e sutil.
- **"ORBE" escrito sempre com o wordmark do logo** (`public/wordmark.png`, componente `Wordmark`), nunca em texto comum: o E do logo é desenhado diferente.
- Logo com fundo transparente: `public/logo-transparent.png` (hero, intro, login). `public/logo.png` (fundo preto) só serve de imagem de prévia em `src/app/layout.tsx`.
- Tom da copy: curto, seguro, sem exagero.
- Confirme com o dono antes de mudar cores, fonte ou logo.

## Movimento
- **Intro com o logo:** 1x por sessão, 1,6 s (1,0 s em `/lista`); não toca no `/admin`. O script que decide isso fica em `src/app/layout.tsx` (variável CSS `--io`).
- **Home:** entrada em sequência, reveal ao rolar (`Reveal`), hero que esmaece e desce, barra de progresso, menu que ganha fundo (`ScrollFX`). **Entre páginas:** cortina (`TransitionLink` + `Curtain`); o logo na própria página sobe suave.
- Tudo respeita `prefers-reduced-motion`. Estilos na seção "Animações" de `src/app/globals.css`.

## Tarefas comuns (quase tudo é pelo painel `/admin`)
- **Anunciar uma session:** Eventos → Novo evento → preencher → **Anunciar evento** (publica, vira a "próxima session" e abre a lista). A home e a `/lista` mudam na hora.
- **Trocar a arte:** Eventos → Editar → **Enviar imagem** → Salvar. Imagens grandes são reduzidas sozinhas no navegador.
- **Mapa:** Eventos → Editar → **Mapa do Google**: colar o link do local no Maps (ou link curto, ou o código `<iframe>`).
- **Link do grupo do WhatsApp:** campo do evento. O painel avisa "Sem link do grupo" se o evento anunciado estiver sem.
- **Fechar ou abrir a lista:** aba Lista → botão ao lado do evento.
- **Publicar o vídeo depois da session:** Eventos → Editar → ID do YouTube (11 caracteres). Ele aparece na seção Sessions da home.
- **Links das redes no rodapé:** `links` em `src/data/sessions.ts` (só aparecem os preenchidos).

## Lista de presença
- `/lista` envia para `POST /api/inscricao`, que valida e grava em `inscricoes`: **uma inscrição por CPF em cada evento** (reenviar atualiza a anterior).
- Campos (espelham o Google Forms antigo): nome completo, WhatsApp com DDD, CPF, Instagram (opcional), confirmação (`sim`, `talvez`, `nao`). As validações ficam em `src/lib/validate.ts` e valem no formulário e no servidor. O Instagram aceita `@usuario` ou o link do perfil e guarda só o usuário.
- Prazo e dia da confirmação são campos do evento (painel). O texto de uso dos dados fica abaixo do botão.
- **Lista aberta/fechada é decidida no servidor:** a API recusa (403) se não houver evento anunciado com a lista aberta.
- Proteção contra robô: campo oculto `website` (honeypot). Não remover.
- Ao concluir, abre um **aviso** com o botão **Participar do grupo** (link do evento). Não há redirecionamento automático: navegadores internos do Instagram bloqueiam. Sem link, mostra só a confirmação.

## Layout da `/lista` (escolhido pelo dono)
- **Computador:** tela dividida. Esquerda: a arte inteira, fixa na altura da tela, ampliável, com uma barra de endereço + **Ver mapa ↗** (abre `MapaModal`). Direita: voltar, título, etiquetas (data, local, vagas), formulário, aviso legal. Cabe em 1280×860.
- **Celular:** miniatura da arte ao lado do título, etiquetas, formulário (botão visível sem rolar em 390×844) e o mapa recolhido em **Como chegar +** (`<details>`).
- A confirmação são **três botões lado a lado** com rádios reais por baixo (teclado e leitor de tela funcionam).

## Gestão (admin)
- `/admin` (login em `/admin/login`). Abas: **Lista** (inscritos, filtros, importar planilha, exportar CSV, abrir/fechar), **Eventos** (criar, editar, anunciar, despublicar, excluir, arte, mapa) e **Interessados**. Botão **Check-in** no cabeçalho.
- **Credenciais só em variáveis de ambiente**, nunca no repo. Proteção: `src/middleware.ts` barra `/admin` e `/api/admin` sem cookie assinado (12 h, httpOnly, sameSite strict), bloqueia pedidos de outra origem (CSRF), e o login limita 5 erros por IP a cada 15 min (`admin_tentativas`).
- **Evento anunciado** = `status = publicado` + `destaque = true` (só um por vez). Evento com inscritos não pode ser excluído, só despublicado.
- As páginas públicas são geradas no build e renovam a cada 60 s; ao salvar, o painel chama `revalidatePath`, então a mudança aparece na hora. Num build local, a primeira renovação traz os dados reais (antes aparece o plano B).
- **CPF:** na tela do painel aparece mascarado; no check-in vai só o final (5 dígitos); o CSV exportado traz completo. Nunca em páginas públicas, logs, mensagens de erro ou respostas de API.
- Artes enviadas ficam em `artes` (servidor aceita até 3 MB, tipo conferido pelo conteúdo; o painel reduz antes de enviar) e saem em `/api/arte/<id>`.

## Check-in na porta
- `/admin/checkin`: tela para o celular do porteiro. Contadores (Entraram / Faltam / Na lista), busca por **nome, final do CPF ou WhatsApp** (feita no aparelho), **Confirmar entrada**, **Desfazer** e **Adicionar na porta** (entra já presente, `origem = porta`; exige internet).
- **Funciona sem internet:** cada entrada vai para uma fila no celular (`localStorage` `orbe-checkin-fila`) e é enviada quando a conexão volta, com o horário do toque.
- API: `GET /api/admin/checkin`, `POST /api/admin/checkin` (lote; idempotente, não muda o horário da primeira entrada), `POST /api/admin/checkin/porta`. Banco: `inscricoes.presente`, `checkin_em`, `origem`.

## Importar respostas do Google Forms
- Painel → Lista → **Importar planilha** (CSV baixado do Google Planilhas). Mostra uma **prévia** (novas, já na lista, linhas com problema) e só grava ao confirmar. Repetir é seguro: mesmo CPF no mesmo evento é atualizado, não duplicado.
- Colunas reconhecidas pelo cabeçalho: nome, telefone/WhatsApp, CPF, confirmação, carimbo de data/hora. A planilha perde o zero da frente do CPF; a importação devolve.
- O CSV tem CPF: não commitar, não deixar em pastas do projeto, apagar depois. Planilha compartilhada "com qualquer pessoa que tenha o link" expõe os CPFs.

## Faça parte do Orbe
- Home: seção `#participe` com **Quero ir** (`/lista`, só com a lista aberta), **Sou DJ** e **Espaço ou marca** (`/participar?como=dj|parceiro`).
- `/participar`: formulário com abas, **sem CPF**. Validação em `src/lib/participar.ts`. `POST /api/participar` grava em `interessados` (um contato por tipo + WhatsApp; reenviar atualiza e reabre se estava arquivado), com honeypot e limite de 5 envios por IP a cada 10 min (`limite_envios`).
- Painel → **Interessados**: filtros, marcar contatado, arquivar, remover, chamar no WhatsApp, links do Instagram e do set, exportar CSV. O contador de novos aparece na aba.

## Mapa e janelas
- O Google **não deixa** a página comum de um local (`/maps/place/...`) aparecer dentro de outro site ("conexão recusada"); só `https://www.google.com/maps/embed?pb=...`. `src/lib/mapa-embed.ts` converte o link colado usando as coordenadas e o ID do próprio local (o pin cai no estabelecimento certo). **Não geocodificar o endereço:** pode errar o trecho de uma avenida por quilômetros.
- Sem mapa configurado, `MapaLocal` mostra um cartão com o endereço e os botões "Abrir no Google Maps" e "Como chegar".
- Foto ampliada, aviso do WhatsApp e mapa em janela usam `createPortal` (raiz do `body`). Enquanto a foto ou o aviso está aberto, `useOverlayAberto` (`src/lib/overlay.ts`) esconde os iframes, porque alguns navegadores desenham iframes de outro site por cima de qualquer `z-index`. `MapaModal` **não** usa isso (esconderia o próprio mapa).
- Listas de opções (`<select>`) são escuras em todo o site (`src/app/globals.css`): sem isso o navegador desenha fundo branco com texto claro.

## Apoiadores
- Painel → aba **Apoiadores**: cadastra nome, logo (enviado pelo painel), site e/ou Instagram, frase curta, ordem, **ativo**, e **onde aparece**: "Apoia o projeto todo" (todas as sessions) e/ou em quais sessions (`evento_apoiadores`). Um apoiador sem projeto e sem session ligada não aparece em lugar nenhum (o painel avisa).
- No site: faixa **Apoio** na home (`#apoio`, antes do "Faça parte") e linha **Apoio** no fim da coluna do formulário da `/lista`. Só aparecem os **ativos** que apoiam o projeto ou a session anunciada (`getApoiadores` em `src/lib/db.ts`; componente `src/components/Apoio.tsx`).
- O logo leva ao site; sem site, ao Instagram; sem logo, aparece o nome em texto. "Logo em branco" pinta o logo todo de branco (só para logos de uma cor, com fundo transparente).
- Segurança: o logo só pode ser um arquivo enviado pelo painel (`/api/arte/<id>`), nunca uma imagem de outro site. Links são normalizados e validados.
- API: `/api/admin/apoiadores` e `/api/admin/apoiadores/[id]` (PATCH troca a lista de sessions de uma vez). Validação em `src/lib/apoiadores-input.ts`.

## Banco e migrações
- `db/schema.sql` é o estado **completo e atual** (idempotente). `db/migrate-001-campos-lista.sql` a `db/migrate-005-apoiadores.sql` são o histórico, já aplicadas em produção. Mudança de esquema: criar `migrate-00N-*.sql`, aplicar, e atualizar `db/schema.sql` na mesma entrega.
- Tabelas: `eventos`, `artes`, `inscricoes`, `interessados`, `apoiadores`, `evento_apoiadores`, `admin_tentativas`, `limite_envios`.

## Regras e cuidados
- Dados pessoais (CPF, telefone, nome de inscritos) nunca em log, commit, mensagem de erro, conversa ou arquivo do projeto. Testes com dados reais: usar linhas fictícias e **apagar no fim**.
- Segredos (`DATABASE_URL`, `ADMIN_PASSWORD`) só em variável de ambiente; nunca no repo nem no client.
- Ao testar localmente com o banco real, **não tocar nas inscrições reais**; conferir no fim que a contagem voltou ao que era.
- Se o `npm run build` falhar logo depois de derrubar um servidor de teste, é uma corrida de arquivos passageira: esperar uns segundos e rodar de novo. Confirme sempre o código de saída antes de commitar.

## Ferramentas do projeto
- Skill de revisão de design instalada em `.claude/skills/ui-design` (`/ui-design review` avalia hierarquia, contraste, responsividade em 320 px). Ainda não foi usada no site.
