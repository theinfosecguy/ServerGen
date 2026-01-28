# Fastify Application

A high-performance web server built with [Fastify](https://fastify.dev/).

## Features

- Fast JSON parsing and serialization
- Built-in schema validation
- Structured logging with Pino
- Security headers via @fastify/helmet
- CORS support
- Graceful shutdown handling
- Health check endpoint

## Getting Started

### Development

```bash
npm start
```

The server will start with pretty-printed logs in development mode.

### Production

```bash
NODE_ENV=production node index.js
```

In production, logs are output as JSON for log aggregation systems.

## API Endpoints

- `GET /` - Welcome message
- `POST /` - Echo request body
- `GET /health` - Health check for container orchestration

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| HOST | 0.0.0.0 | Server host |
| NODE_ENV | development | Environment (development/production/test) |
| MONGODB_URI | mongodb://localhost:27017/servergen | MongoDB connection string |

## Production Recommendations

1. **Use a Reverse Proxy**: Deploy behind nginx or HAProxy for TLS termination, load balancing, and static file serving.

2. **Container Deployment**: The included Dockerfile is production-ready. Build with:
   ```bash
   docker build -t my-fastify-app .
   docker run -p 3000:3000 my-fastify-app
   ```

3. **Kubernetes**: The `/health` endpoint is designed for readiness/liveness probes.

## License

MIT
