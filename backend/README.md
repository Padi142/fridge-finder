# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Development
To start the development server run:
```bash
bun run dev
```

Set `PORT` in `backend/.env` if you want to change the server port. The default is `3000`.

Open `http://localhost:3000/` with your browser to see the result.

## OpenRouter attribution
To have requests show up with the correct project name in OpenRouter, set these env vars in `backend/.env`:

```bash
PORT=3000
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=FridgeFinder Backend
```

The backend sends:
- `HTTP-Referer` from `OPENROUTER_SITE_URL`
- `X-OpenRouter-Title` from `OPENROUTER_APP_NAME`

Those are the headers OpenRouter uses for app attribution in its dashboard.
