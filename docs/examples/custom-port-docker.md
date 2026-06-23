# Custom Port And Docker

Use this when you want the generated app and Dockerfile to use a port other than `3000`.

## Command

```bash
npx --yes servergen@latest port-api --port 8080
```

Short form:

```bash
npx --yes servergen@latest port-api -p 8080
```

Ports must be integers from `1` to `65535`.

## What Gets Generated

ServerGen creates `port-api/` in the current directory.

Port-specific changes include:

- `index.js` uses `process.env.PORT || 8080`
- `.env.example` uses `PORT=8080`
- `Dockerfile` uses `EXPOSE 8080`
- `README.md` local URLs are rewritten to port `8080`

Because the command runs installation by default, npm also creates `node_modules/` and `package-lock.json` inside `port-api/`.

The generated Dockerfile is a basic Node 20 Alpine image. It installs production dependencies and runs `node index.js`; it does not add orchestration, TLS, reverse proxy, secrets management, or production auth.

## Run Locally

```bash
cd port-api
npm start
```

## Verify Locally

In another terminal:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/
```

## Run With Docker

From inside `port-api/`:

```bash
docker build -t port-api .
docker run --rm -p 8080:8080 --env PORT=8080 port-api
```

The generated Express app binds to `0.0.0.0`, so it is reachable through the published container port.

## Verify Docker

In another terminal:

```bash
curl http://localhost:8080/health
```

## Cleanup

Stop the local server with `Ctrl+C`. If you started Docker in the foreground, stop it with `Ctrl+C` too.

Then remove the generated app and optional image:

```bash
cd ..
rm -rf port-api
docker rmi port-api
```
