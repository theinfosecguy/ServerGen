# Project Name

A TypeScript Node.js/Express application generated with [ServerGen](https://github.com/theinfosecguy/ServerGen).

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- TypeScript

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Running Production

```bash
npm start
```

The server will start on http://localhost:3000

## Project Structure

```
.
├── controllers/    # Route controllers
├── model/          # Database models
├── routes/         # API routes
├── views/          # View templates
├── config/         # Configuration files
├── dist/           # Compiled JavaScript output
├── index.ts        # Application entry point
├── tsconfig.json   # TypeScript configuration
└── package.json
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled application

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

## License

MIT
