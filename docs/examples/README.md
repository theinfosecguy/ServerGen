# ServerGen Examples

Copy-paste examples for current ServerGen flows.

These examples use `npx --yes servergen@latest` to follow the current published CLI. If you need reproducible output, replace `latest` with a pinned version. If you have ServerGen installed globally, you can replace that prefix with `servergen`.

## Examples

- [Default Express app](./express.md)
- [TypeScript Express app](./typescript.md)
- [Plain Node app](./node.md)
- [Express views with EJS, Pug, or HBS](./views.md)
- [Express app with MongoDB/Mongoose config](./mongodb.md)
- [Custom port and Docker notes](./custom-port-docker.md)

## Shared Notes

- ServerGen creates a new app directory in your current working directory.
- The default framework is Express.
- Generated apps require Node.js 20 or newer.
- Generation runs `npm install` unless you pass `--skip-install`.
- When install is not skipped, npm also creates `node_modules/` and `package-lock.json` inside the generated app.
- Express-only options: `--view ejs|pug|hbs`, `--db`, and `--typescript`.
- Generated apps include Docker support files. Express apps also include `.env.example`; Node apps do not.
