# Default Express App

Use this when you want the default ServerGen app: Express, JSON routes, a health check, Docker files, and a small Node test.

## Command

```bash
npx --yes servergen@latest hello-express
```

## What Gets Generated

ServerGen creates `hello-express/` in the current directory.

Generated files and directories include:

- `index.js` with Express, CORS, dotenv, JSON/body parsing, `/health`, graceful shutdown, and centralized error handling
- `routes/index.js` with `GET /` and `POST /`
- `controllers/`, `model/`, and `views/` directories
- `test/app.test.js`
- `package.json` with `start`, `dev`, and `test` scripts
- `.env.example`, `.gitignore`, `.dockerignore`, `Dockerfile`, and `README.md`

Because the command runs installation by default, npm also creates `node_modules/` and `package-lock.json` inside `hello-express/`.

The generated Express app depends on `express`, `cors`, and `dotenv`. It does not generate auth, ORM models, or production deployment configuration.

## Run

```bash
cd hello-express
npm start
```

The app listens on `0.0.0.0` and is reachable locally at `http://localhost:3000`.

## Verify

In another terminal:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"name":"ServerGen"}'
```

Expected responses include `{"status":"ok"}` from `/health` and `{"message":"Welcome to ServerGen!"}` from `/`.

## Cleanup

Stop the server with `Ctrl+C`, then remove the generated app:

```bash
cd ..
rm -rf hello-express
```
