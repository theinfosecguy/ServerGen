# Fastify TypeScript Application

A high-performance TypeScript web server built with [Fastify](https://fastify.dev/).

## Features

- Full TypeScript support with strict mode
- Fast JSON parsing and serialization
- Built-in schema validation with type inference
- Structured logging with Pino
- Security headers via @fastify/helmet
- CORS support
- Graceful shutdown handling
- Health check endpoint
- Multi-stage Docker build for optimized images

## Getting Started

### Development

```bash
npm run dev
```

This uses `tsx` for fast TypeScript execution with hot reload.

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Production

```bash
npm run build
NODE_ENV=production node dist/index.js
```

## API Endpoints

- `GET /` - Welcome message
- `POST /` - Echo request body
- `GET /health` - Health check for container orchestration

## Project Structure

```
src/
  index.ts         # Application entry point
  routes/
    index.ts       # Route definitions
  config/
    mongoose.ts    # Database connection (if --db)
  controllers/     # Request handlers
  model/           # Data models
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| HOST | 0.0.0.0 | Server host |
| NODE_ENV | development | Environment (development/production/test) |
| MONGODB_URI | mongodb://localhost:27017/servergen | MongoDB connection string |

## Docker

Build and run with Docker:

```bash
docker build -t my-fastify-app .
docker run -p 3000:3000 my-fastify-app
```

The Dockerfile uses multi-stage build to create an optimized production image.

## License

MIT
