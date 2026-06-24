# TypeScript Express App

Use this when you want the Express preset with TypeScript source, `tsx` for development, and compiled JavaScript in `dist/` for production start.

## Command

```bash
npx --yes servergen@latest hello-ts --typescript
```

## What Gets Generated

ServerGen creates `hello-ts/` in the current directory.

Generated files and directories include:

- `src/index.ts` with Express, CORS, dotenv, JSON/body parsing, `/health`, graceful shutdown, and centralized error handling
- `src/routes/index.ts` with `GET /` and `POST /`
- `src/controllers/`, `src/model/`, and `views/` directories
- `test/app.test.ts`
- `tsconfig.json`
- `package.json` with `dev`, `build`, `start`, and `test` scripts
- `.env.example`, `.gitignore`, `.dockerignore`, `Dockerfile`, and `README.md`

The generated app uses `tsx` for development and `tsc` for production builds.

## Run

```bash
cd hello-ts
npm run dev
```

For a production-style run:

```bash
npm run build
npm start
```

## Verify

```bash
npm test
curl http://localhost:3000/health
```

Expected response from `/health`:

```json
{"status":"ok"}
```
