# Hono App

Use this when you want a Hono API preset.

## Command

```bash
npx --yes servergen@latest hello-hono --framework hono
```

Hono apps are TypeScript apps. Passing `--typescript` is accepted but not
required:

```bash
npx --yes servergen@latest hello-hono --framework hono --typescript
```

## Option Compatibility

Hono supports OpenAPI output:

```bash
npx --yes servergen@latest hello-hono --framework hono --openapi
```

Hono does not support the Express-only view and database options:

```bash
npx --yes servergen@latest hello-hono --framework hono --view ejs
npx --yes servergen@latest hello-hono --framework hono --db
```

Each command fails before creating the app directory.

## Run

```bash
cd hello-hono
npm run dev
```

## Verify

```bash
npm test
npm run build
curl http://localhost:3000/health
```
