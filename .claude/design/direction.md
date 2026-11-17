# Design direction — site Orbe (home + lista de presença)

*Written 2026-11-17 by `/ui-design direct`. Appended to, never rewritten.*

**Status: direção definida em 2026-11-17 (ver "Decisão: dois links" no fim).** Antes disso a escolha entre A, B e C estava em espera.

## The answers, in the user's words
> "Lotar a lista da próxima session (Recomendado)" — trabalho principal da home
> "Público das sessions, vindo do Instagram, DJs querendo participar, Marcas, bares e locais parceiros" — quem usa
> "cinematografico undergroud" — sensação
> "Bronze como único destaque (Recomendado)" — cor

## Stack
- Tailwind CSS 4 puro, sem biblioteca de componentes. Lido de `package.json` (`tailwindcss`, `@tailwindcss/postcss`) e `src/app/globals.css` (`@import "tailwindcss"`).
- Next.js 15 (App Router), fonte Jost via `next/font`.
- Tokens atuais em `src/app/globals.css`: `--background #000`, `--foreground #f5f5f5`, `--muted #8a8a8a`, `--line #262626`.
- Direção herdada: identidade escrita em `SKILL.md` (autoria do próprio projeto, preto e branco, "sem outras cores por padrão"), o logo `public/logo.png` e a arte `public/session-001.webp` (bronze e dourado nas folhas e no anel).

### What this direction supersedes
| Inherited rule | Where | What it requires | What replaces it, for which surfaces |
|---|---|---|---|
| Sem cor de destaque | `SKILL.md`, seção "Identidade visual" | "Fundo preto puro, texto branco e cinza. Sem outras cores por padrão." | Bronze como único destaque, para todo o site. Preto e branco seguem como base. |

Pendente: atualizar o `SKILL.md` com a regra nova quando a direção for fechada. O valor exato do bronze será amostrado da arte na implementação.

## Screens and their situations
| Screen | Primary situation | Secondary | ERG rules that apply |
|---|---|---|---|
| `/` (hero + próxima session) | LAND | none | ERG-LAND-01, ERG-LAND-02, ERG-LAND-03, ERG-LAND-04 |
| `/#lista` (formulário de presença) | FORM | none | ERG-FORM-01, ERG-FORM-02, ERG-FORM-03, ERG-FORM-04, ERG-FORM-05 |

Alerta para a build: o formulário atual usa **placeholder sem label visível** (viola ERG-FORM-01) e não tem validação inline com mensagem (ERG-FORM-03, ERG-FORM-05). Corrigir na próxima rodada de implementação.

## Chosen references
| # | URL | Captured | Reviewed by | Source tier |
|---|---|---|---|---|
| 1 | https://contra.com/p/ok2ZQ6vN-drop-highlights-no-phone-event-landing-page | linked only — sem ferramenta de captura de tela nesta sessão | not circulated | gallery; pattern reference, not this project's stack (a página é Framer) |
| 2 | https://slist-new.pages.dev/blog/anti-fomo-design/ | linked only — sem ferramenta de captura de tela nesta sessão | not circulated | artigo de tom; não é referência de código |
| — | `public/session-001.webp` (arte da Sessions 001) | arquivo do próprio projeto | usuário | referência principal, é a identidade do evento |

Nenhuma referência foi escolhida ainda. Quatro outros links candidatos da busca (Codrops, Webflow Solomun, Webflow Eli Brown, Diynamic) deram 403 ou 404 na verificação de 2026-11-17 e não foram oferecidos.

## Review comments
(none — a rodada foi uma resposta direta; a página não foi compartilhada)

## Direções oferecidas, aguardando escolha
- **A. Flyer vivo:** arte da próxima session em destaque na primeira tela; data, local e botão da lista logo abaixo; bronze só em data, botão e linhas.
- **B. Logo primeiro:** abertura atual com símbolo e brilho; próxima session como faixa abaixo.
- **C. Híbrida:** hero curto com o logo; arte e formulário lado a lado em seguida.

Resposta do usuário: "Segurar por enquanto".

## What is borrowed, per reference
(a definir quando a direção for escolhida)

## What is deliberately NOT borrowed
- Nenhum markup, CSS ou asset das referências 1 e 2. São só de padrão e de tom.
- Nada da marca ou do texto de outros produtos.

## Licence note
Referências 1 e 2: somente leitura, nada é copiado. Logo e arte são do próprio projeto.

## Decisão: dois links (2026-11-17)
> "ent mas tbm quero mostrar a home e apresentar o trabalho acho que a ideia vai ser dois links um da lista (formulario) e outro da home"

O usuário não escolheu A, B ou C: pediu **duas páginas com trabalhos diferentes**.
- `/lista` (link da bio do Instagram): LAND + FORM focada em lotar a lista. Arte da session, data em bronze, local, "vagas limitadas" e o formulário. Pensada para o celular.
- `/` (home): apresenta o selo e o trabalho (opção B: logo primeiro, próxima session como seção, depois O Orbe e Sessions). O botão "Entrar na lista" leva a `/lista`.

| Screen | Primary situation | Secondary | ERG rules that apply |
|---|---|---|---|
| `/` | LAND | none | ERG-LAND-01, ERG-LAND-02, ERG-LAND-03, ERG-LAND-04 |
| `/lista` | FORM | LAND | ERG-FORM-01, ERG-FORM-02, ERG-FORM-03, ERG-FORM-04, ERG-FORM-05, ERG-LAND-04 |

Aplicado nesta rodada: bronze `#c9975a` como `--accent` (amostrado a olho do anel da arte), formulário com label visível, validação inline ao sair do campo, erro com ícone e texto, campo "Eu sou" com opção de parceiro. Resolve os alertas de ERG-FORM-01, 03 e 05 registrados acima.
