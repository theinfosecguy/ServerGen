<h1 align=center>
ServerGen - Setup Server & MVC within seconds<br>
<a href> <img src="https://user-images.githubusercontent.com/33570148/110940836-89153e00-835d-11eb-9fa7-2cc1e46834ff.png" height=350/></a>
</h1>

# Get your Node/Express Server Ready within seconds

## Table of Contents

- [Quick Start](#quick-start)
- [Install Options](#install-options)
- [CLI Usage](#cli-usage)
- [Generated App Commands](#generated-app-commands)
- [Features](#features)
- [Future Scope](#future-scope)
- [License](#license)

## Quick Start

ServerGen is a [Node.js](https://nodejs.org/en/) package available through the
[npm registry](https://www.npmjs.com/package/servergen). Make sure Node.js and
npm are installed first.

The fastest first run is with `npx`:

```bash
npx servergen@latest my-api
cd my-api
npm start
```

In another terminal, verify the default Express app:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok"}
```

## Install Options

Use `npx` when you want to create an app without adding ServerGen to another
project:

```bash
npx servergen@latest my-api
```

Install locally when you want ServerGen pinned in a project:

```bash
npm install --save-dev servergen
npx servergen my-api
```

For local installs, `servergen` is installed under `node_modules/.bin` and is
not available as a plain shell command unless your shell PATH includes local npm
bins.

Install globally when you want the `servergen` command available everywhere:

```bash
npm install -g servergen
servergen my-api
```

## CLI Usage

```bash
servergen [options] [name]
```

`name` is the app directory to create. You can also pass it with `--name`.
ServerGen creates an Express app by default and runs `npm install` in the
generated app unless `--skip-install` is used.

### Options

```text
  -V, --version           output the version number
  -n, --name <name>       name of the app to create
  -f, --framework <type>  framework: express | node (default: "express")
  -v, --view <type>       view engine (express only): ejs | pug | hbs
  --db                    add Mongoose and a MongoDB config (express only)
  -p, --port <number>     port for the generated app (1-65535) (default: "3000")
  --skip-install          skip the npm install step
  --debug                 enable debug logging
  -h, --help              display help for command
```

### Examples

```bash
npx servergen@latest my-api
npx servergen@latest my-api --framework node
npx servergen@latest my-api --view ejs
npx servergen@latest my-api --db
npx servergen@latest my-api --port 8080
npx servergen@latest my-api --skip-install
npx servergen@latest --name my-api
```

## Generated App Commands

From inside the generated app:

```bash
npm start       # run node index.js
npm run dev     # run nodemon index.js
```

Express apps also include:

```bash
npm test
curl http://localhost:3000/
curl http://localhost:3000/health
```

## Features

- Express app generation by default
- Plain Node.js HTTP server generation with `--framework node`
- MVC-style `controllers`, `model`, and `routes` directories
- Optional Express view engines: EJS, Pug, or HBS
- Optional Mongoose/MongoDB config with `--db`
- Express health check route at `/health`
- Generated `npm start`, `npm run dev`, and Express `npm test` scripts
- `.gitignore`, Dockerfile, and `.dockerignore` support

## Future Scope

- Add Swagger Documentation
- Add Passport Authentication
- Sequelize ORM for MySQL and PostgreSQL

## License

[MIT](LICENSE)
