# MongoDB/Mongoose Config

Use this when you want an Express app with Mongoose installed and a MongoDB connection helper.

## Command

```bash
npx --yes servergen@latest mongo-api --db
```

`--db` is Express-only. ServerGen rejects `--framework node --db`.

## What Gets Generated

ServerGen creates `mongo-api/` in the current directory.

MongoDB-specific changes include:

- `package.json` adds `mongoose`
- `index.js` imports `connectDatabase` from `./config/mongoose`
- `index.js` calls `connectDatabase()` only when the server starts
- `config/mongoose.js` reads `process.env.MONGODB_URI`
- `.env.example` includes `MONGODB_URI=mongodb://localhost/your_database_name`

The rest of the app is the default Express scaffold: JSON routes, `/health`, empty `controllers/`, `model/`, and `views/` directories, `test/app.test.js`, `.gitignore`, `.dockerignore`, `Dockerfile`, and `README.md`.

Because the command runs installation by default, npm also creates `node_modules/` and `package-lock.json` inside `mongo-api/`.

This option adds connection configuration only. It does not generate schemas, models, migrations, CRUD routes, auth, or an ORM layer.

## Configure

```bash
cd mongo-api
cp .env.example .env
```

Update `.env` with a reachable MongoDB URI:

```text
MONGODB_URI=mongodb://localhost/your_database_name
PORT=3000
NODE_ENV=development
```

If `MONGODB_URI` is not set, the generated connector falls back to `mongodb://localhost/demo_db`.

## Run

Start MongoDB separately, then run:

```bash
npm start
```

The server starts on `http://localhost:3000`. When MongoDB is reachable, the server logs `Connected to MongoDB`.

## Verify

In another terminal:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/
```

`/health` returns `{"status":"ok"}`. The root route returns the default JSON welcome response.

## Cleanup

Stop the server with `Ctrl+C`, then remove the generated app:

```bash
cd ..
rm -rf mongo-api
```
