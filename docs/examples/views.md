# Express Views

Use this when you want an Express app with one generated view engine template. Current ServerGen supports `ejs`, `pug`, and `hbs`.

## Command

Choose one view engine:

```bash
npx --yes servergen@latest hello-ejs --view ejs
npx --yes servergen@latest hello-pug --view pug
npx --yes servergen@latest hello-hbs --view hbs
```

Short form:

```bash
npx --yes servergen@latest hello-ejs -v ejs
```

`--view` is Express-only. ServerGen rejects `--framework node --view ...`.

## What Gets Generated

For `--view ejs`, ServerGen creates `hello-ejs/` in the current directory.

Generated view-specific changes include:

- `package.json` adds the selected view dependency: `ejs`, `pug`, or `hbs`
- `index.js` sets the selected view engine and `views` directory
- `routes/index.js` renders the selected template from `GET /`
- `views/ve_ejs.ejs`, `views/ve_pug.pug`, or `views/ve_hbs.hbs`

The rest of the app is the default Express scaffold: `index.js`, `routes/`, empty `controllers/` and `model/` directories, `test/app.test.js`, `.env.example`, `.gitignore`, `.dockerignore`, `Dockerfile`, and `README.md`.

Because the command runs installation by default, npm also creates `node_modules/` and `package-lock.json` inside the generated app.

## Run

```bash
cd hello-ejs
npm start
```

Use the directory name that matches the command you ran.

## Verify

Open the root URL in a browser:

```text
http://localhost:3000/
```

Or check it with curl:

```bash
curl -i http://localhost:3000/
curl http://localhost:3000/health
```

The root route renders HTML with `Welcome to ServerGen!`. `/health` still returns JSON.

## Cleanup

Stop the server with `Ctrl+C`, then remove the generated app:

```bash
cd ..
rm -rf hello-ejs
```

Adjust the directory name if you generated `hello-pug` or `hello-hbs`.
