# TypeScript Express App With Postgres And Prisma

Use this when you want an Express TypeScript API with Prisma 7, a local
Postgres service, a generated `User` model, `/users` routes, tests, Docker
files, and OpenAPI docs.

## Generate

```sh
npx --yes servergen@latest users-api --typescript --db postgres --orm prisma --openapi
```

ServerGen creates `users-api/` in the current directory.

## Generated Files

```text
users-api/
├── docker-compose.yml
├── prisma.config.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── controllers/usersController.ts
│   ├── lib/prisma.ts
│   ├── routes/index.ts
│   ├── routes/users.ts
│   └── index.ts
├── test/
│   ├── app.test.ts
│   └── users.test.ts
├── .env.example
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Run Locally

```sh
cd users-api
npm install
cp .env.example .env
docker compose up -d
npm run db:migrate
npm test
npm run dev
```

In another terminal:

```sh
curl http://localhost:3000/health
curl http://localhost:3000/users
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","name":"Ada Lovelace"}'
```

## Prisma Commands

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Notes

Postgres/Prisma currently requires Express TypeScript:

```sh
npx --yes servergen@latest users-api --framework express --typescript --db postgres --orm prisma
```

The generated user-route tests run when `DATABASE_URL` is configured. Without a
database URL, those tests are skipped while the generated app health and root
route tests still run.
