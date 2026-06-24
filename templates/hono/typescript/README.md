# Project Name

A TypeScript Hono API generated with [ServerGen](https://github.com/theinfosecguy/ServerGen). The application entry point is `src/index.ts`.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

The development server will start on http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

### Test

```bash
npm test
```

### Endpoints

- `GET /` returns `{ "message": "Welcome to ServerGen!" }`
- `GET /about` returns a short about message
- `GET /contact` returns a short contact message
- `GET /health` returns `{ "status": "ok" }`

## Project Structure

```
.
├── src/
│   └── index.ts        # Hono API entry point
├── tsconfig.json
└── package.json
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

## License

MIT
