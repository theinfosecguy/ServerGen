# Project Name

A Node.js HTTP server application generated with [ServerGen](https://github.com/theinfosecguy/ServerGen).

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
npm start
```

The server will start on http://127.0.0.1:3000

### Endpoints

- `GET /` returns `{ "message": "Welcome to ServerGen!" }`
- `GET /about` returns a short about message
- `GET /contact` returns a short contact message
- `GET /health` returns `{ "status": "ok" }`

## Project Structure

```
.
├── controllers/    # Route controllers
├── model/          # Database models
├── routes/         # API routes
├── index.js        # Application entry point
└── package.json
```

## License

MIT
