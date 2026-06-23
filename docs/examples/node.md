# Plain Node App

Use this when you want a small HTTP server without Express.

## Command

```bash
npx --yes servergen@latest hello-node --framework node
```

Short form:

```bash
npx --yes servergen@latest hello-node -f node
```

## What Gets Generated

ServerGen creates `hello-node/` in the current directory.

Generated files and directories include:

- `index.js` using Node's built-in `http` module
- `controllers/`, `model/`, and `routes/` directories
- `package.json` with `start` and `dev` scripts
- `.gitignore`, `.dockerignore`, `Dockerfile`, and `README.md`

Because the command runs installation by default, npm also creates `node_modules/` and `package-lock.json` inside `hello-node/`.

The generated Node app has no Express, CORS, dotenv, test scaffold, view engine, or MongoDB config. Its only generated dev dependency is `nodemon`.

## Run

```bash
cd hello-node
npm start
```

The app listens on `0.0.0.0` and is reachable locally at `http://127.0.0.1:3000`.

## Verify

In another terminal:

```bash
curl http://127.0.0.1:3000/
curl http://127.0.0.1:3000/about
curl http://127.0.0.1:3000/contact
curl http://127.0.0.1:3000/health
```

Expected responses are JSON. `/health` returns `{"status":"ok"}`.

## Cleanup

Stop the server with `Ctrl+C`, then remove the generated app:

```bash
cd ..
rm -rf hello-node
```
