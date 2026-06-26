# Changelog

## Unreleased

- Add Express TypeScript Postgres/Prisma support with `--db postgres --orm prisma`.
- Replace the legacy bare `--db` MongoDB shortcut with explicit `--db mongodb`.
- Generate Prisma 7 config, schema, seed script, lazy Prisma client, `/users` routes/controllers, Docker Compose, OpenAPI `/users` paths, and database-aware generated tests.
- Update interactive mode, docs, package metadata, and package smoke coverage for the Postgres/Prisma path.

## 2.4.0 - 2026-06-24

- Add Hono framework support with TypeScript-first generated apps, Docker files, generated tests, and JSON routes for `/`, `/about`, `/contact`, and `/health`.
- Add OpenAPI output for Hono apps while keeping `--view` and `--db` Express-only.
- Update interactive mode, docs, examples, tarball packaging tests, and release smoke coverage for Hono.

## 2.3.0 - 2026-06-24

- Add TypeScript support for generated Express apps with `src/index.ts`, `tsconfig.json`, `tsx` development, `tsc` builds to `dist`, generated TypeScript tests, and Docker support.
- Add OpenAPI spec support with an Express-only `--openapi` option that generates `docs/openapi.yaml` and documents it in the generated README.
- Add interactive mode so new projects can be configured through prompts instead of requiring every option up front.
- Add npm create support so the recommended first-run path can use `npm create servergen@latest`.

## 2.2.3 - 2026-06-23

- Improve README trust signals with status badges, a faster quick start, generated-output details, and release integrity notes.
- Add CLI-focused issue templates, pull request guidance, contribution guidance, and security policy.
- Add release checklist docs and weekly published-package smoke testing for `servergen@latest`.
- Add copy-paste examples for Express, plain Node, view engines, MongoDB, and custom ports/Docker.

## 2.2.2 - 2026-06-22

- Improve npm package discovery metadata and README positioning.
- Polish generated Express apps with quiet dotenv output and status-before-JSON route responses.
- Use generated app names in README titles and remove unused `cors` from plain Node apps.
- Return JSON 404 responses for unknown routes in generated plain Node apps.

## 2.2.1 - 2026-06-21

- Sync generated Dockerfile `EXPOSE` ports with custom `--port` values.
- Update generated Node app custom-port README URLs and bind Node servers to `0.0.0.0` by default for container use.
- Create GitHub Releases after npm publish so npm and GitHub show the same latest version.

## 2.2.0 - 2026-06-21

- Declare Node.js `>=20` as the supported runtime for ServerGen and generated apps.
- Update CI to cover Node.js 20, 22, and 24, and run the release workflow on Node.js 22.
- Modernize the plain Node.js template with JSON responses, valid content types, and a `/health` endpoint.
- Remove stale `Make-Server` copy and invalid HTML responses from the plain Node.js template.

## 2.1.0 - 2026-06-20

- Move the active npm release line from `1.4.0` to `2.1.0` so the next publish sorts after the historical `servergen@2.0.0` from 2021.
- Treat `2.1.0` as the active successor to the 2026 `1.x` line; it intentionally supersedes the old 2021 `2.0.0` package.
- Keep publishing with the `latest` dist-tag, and deprecate `servergen@2.0.0` after `2.1.0` is available on npm.
