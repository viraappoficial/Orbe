# ORBE

Selo e comunidade de live sessions de DJs. Site em Next.js + Neon (Postgres), hospedado na Vercel.

## Rodar local
```bash
npm install
cp .env.example .env.local   # preencha DATABASE_URL (Neon)
npm run dev
```

## Banco
Rode `db/schema.sql` no SQL Editor do Neon.

## Conteúdo
Sessions e links das redes: `src/data/sessions.ts`.
