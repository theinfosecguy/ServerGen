# Changelog

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
