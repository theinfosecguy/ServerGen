# ServerGen

[![CI](https://github.com/theinfosecguy/ServerGen/actions/workflows/ci.yml/badge.svg)](https://github.com/theinfosecguy/ServerGen/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/servergen.svg)](https://www.npmjs.com/package/servergen)
[![npm downloads](https://img.shields.io/npm/dm/servergen.svg)](https://www.npmjs.com/package/servergen)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node >=20](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](package.json)
[![GitHub release](https://img.shields.io/github/v/release/theinfosecguy/ServerGen?display_name=tag)](https://github.com/theinfosecguy/ServerGen/releases/latest)

ServerGen is an npm CLI for scaffolding Node.js and Express API projects with
practical defaults: MVC-style folders, health checks, Docker files, ready-to-run
npm scripts, optional Express views, and optional Mongoose/MongoDB config.

## 30-Second Quick Start

Requires Node.js 20 or higher.

```bash
npx servergen@latest my-api
cd my-api
npm start
```

In another terminal:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok"}
```

ServerGen creates an Express app by default and runs `npm install` in the
generated app unless `--skip-install` is used.

## What Gets Generated

| Choice | Output |
| --- | --- |
| Default Express app | `index.js`, `routes/index.js`, `controllers/`, `model/`, `views/`, `.env.example`, `Dockerfile`, `.dockerignore`, `.gitignore`, generated `README.md`, `package.json`, and `test/app.test.js`. |
| `--typescript` | Express app with `src/index.ts`, `src/routes/index.ts`, `tsconfig.json`, `test/app.test.ts`, `tsx` for development, and `dist/` output for production start. |
| `--framework node` | Plain Node.js HTTP server with `/`, `/about`, `/contact`, and `/health`, plus MVC folders, Docker files, `.gitignore`, generated `README.md`, and `package.json`. |
| `--view ejs`, `pug`, or `hbs` | Adds the selected Express view template and renders it from `/`. |
| `--db` | Adds Mongoose, `config/mongoose.js`, and `MONGODB_URI` in `.env.example` for Express apps. |
| `--openapi` | Adds `docs/openapi.yaml`, a static OpenAPI 3.0 spec for the generated Express routes. |

Generated apps include `npm start` and `npm run dev`. Express apps also include
`npm test`. TypeScript Express apps also include `npm run build`.

## CLI Usage

```bash
servergen [options] [name]
```

`name` is the app directory to create. You can also pass it with `--name`.

### Options

```text
  -V, --version           output the version number
  -n, --name <name>       name of the app to create
  -f, --framework <type>  framework: express | node (default: "express")
  -v, --view <type>       view engine (express only): ejs | pug | hbs
  --db                    add Mongoose and a MongoDB config (express only)
  --openapi               generate an OpenAPI spec file (express only)
  --typescript            generate an Express TypeScript app
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
npx servergen@latest my-api --openapi
npx servergen@latest my-api --typescript
npx servergen@latest my-api --port 8080
npx servergen@latest my-api --skip-install
npx servergen@latest --name my-api
```

For command-by-command walkthroughs, generated file lists, and verification
steps, see the [scaffold examples](https://github.com/theinfosecguy/ServerGen/tree/main/docs/examples).

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

## Release Integrity

Tagged releases are published from GitHub Actions with npm trusted publishing
and provenance, using OIDC instead of a long-lived npm token. Before publishing,
the release workflow packs the package, installs that tarball in a throwaway
project, scaffolds Express and Node apps, starts them, and verifies live HTTP
responses.

The same workflow creates or updates the matching GitHub Release as `latest`
after npm publish succeeds, so GitHub releases track the npm `latest` package.

## License

[MIT](LICENSE)
