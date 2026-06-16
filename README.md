# Whisper

Private, short-lived clipboard for trusted devices.

Whisper is a small Next.js app for moving tokens, links, commands, environment blocks, and notes between devices without adding a database. Snippets live only in server process memory and expire automatically.

## Features

- Shared-password login
- Signed HTTP-only session cookie
- In-memory snippet store
- TTL options: 5 minutes, 15 minutes, 1 hour, 6 hours, 1 day
- Optional burn-after-read snippets
- Client-side copy button
- Docker image build for Kubernetes or any Node container host

## Security model

Whisper v1 is intentionally simple:

- Anyone with `WHISPER_PASSWORD` can access the same snippet pool.
- Snippets are not persisted to disk, SQLite, Postgres, Redis, or browser storage.
- Restarting the server or pod wipes all snippets.
- Run exactly one replica. Multiple replicas have separate memory stores.
- Rotate `WHISPER_SESSION_SECRET` to invalidate all sessions.

This is meant for trusted personal devices or a trusted private network, not untrusted multi-user sharing.

## Required environment

```bash
WHISPER_PASSWORD='change-me'
WHISPER_SESSION_SECRET='at-least-32-random-characters'
```

`WHISPER_SESSION_SECRET` must be at least 32 characters.

Generate one with:

```bash
openssl rand -base64 48
```

## Local development

```bash
npm ci
WHISPER_PASSWORD='dev-password' \
WHISPER_SESSION_SECRET='0123456789abcdef0123456789abcdef' \
npm run dev
```

Open `http://localhost:3000`.

## Test and build

```bash
npm test
npm run lint
WHISPER_PASSWORD='ci-password' \
WHISPER_SESSION_SECRET='0123456789abcdef0123456789abcdef' \
npm run build
```

## Docker

```bash
docker build \
  --build-arg WHISPER_PASSWORD='ci-password' \
  --build-arg WHISPER_SESSION_SECRET='0123456789abcdef0123456789abcdef' \
  -t whisper:local .

docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e WHISPER_PASSWORD='dev-password' \
  -e WHISPER_SESSION_SECRET='0123456789abcdef0123456789abcdef' \
  whisper:local
```

## Kubernetes notes

For the in-memory v1 deployment:

- `replicas: 1`
- `strategy.type: Recreate`
- no PVC
- no database
- expose only on a trusted private network unless you intentionally make it public

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vitest
- Node/Web Crypto APIs
