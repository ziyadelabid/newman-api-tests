# Mini User Service (API regression testing demo)

This repo is intentionally designed for demos around:

- API regression testing (Postman + Newman)
- CI pipelines (Jenkins)
- Flakiness, data dependencies, and CI-only failures

## API (5 endpoints)

- `POST /auth/login` → returns `accessToken`
- `POST /users` → creates user (`email` must be unique, `createdAt = Date.now()`)
- `GET /users/:id`
- `GET /me` (requires `Authorization: Bearer <token>`)
- `DELETE /users/:id` (requires `Authorization: Bearer <token>`)

## Intentional “bad behaviors” (teaching tools)

- **Startup delay**: for the first ~1–2 seconds after boot, every request returns `503`.
- **Time-based fields**: `createdAt` is a raw timestamp; a naive test like “equals `Date.now()`” flakes.
- **Debugging pain**: error responses are intentionally generic (`{"message":"Something went wrong"}`).

## Quickstart

```bash
pnpm install
pnpm start:dev
```

Default port is `4444`.

Seeded login (for the collection):

- `demo@example.com`
- `password`

## Postman / Newman

Collection + env live in `postman/`.

```bash
pnpm run newman:run
```

There are two Create User requests:

- **Create user (bad createdAt assertion)** (intentionally flaky/failing)
- **Create user (good createdAt assertion)** (fixed version)

### Flaky example (time-based data)

If you want a test that **passes or fails randomly** due to time-based data, run:

```bash
pnpm run ci:newman:flaky-data
```

It runs `postman/flaky-data.postman_collection.json`, which hits the real endpoints:

- `POST /auth/login`
- `POST /users`
- `DELETE /users/:id`

And includes an intentionally flaky assertion on `createdAt` (millisecond timestamp parity).

### Data dependency example (login token → downstream request)

If you want an example of **data dependency** (a failed login means the token isn’t set, so `/me` fails), run:

```bash
pnpm run ci:newman:data-dependency
```

It runs `postman/data-dependency.postman_collection.json`, which contains:

- **Bad (dependency failure)**: Login uses `{{password}}` (not set) and still tries to set `token`, then `/me` fails.
- **Fixed (guard dependency)**: Login asserts `200`, checks `accessToken`, and aborts the run on failure.

## Jenkins

`Jenkinsfile` runs a “flaky on purpose” Newman stage and publishes `reports/newman.xml`.

If you want to “fix CI” for the demo, run the stable script locally:

```bash
pnpm run ci:newman:stable
```

## Env vars

- `PORT` (default `4444`)
- `TOKEN_SECRET` (default `dev-secret`)
- `STARTUP_DELAY_MS` (force exact delay)
- `STARTUP_DELAY_MIN_MS` / `STARTUP_DELAY_MAX_MS` (defaults `1000` / `2000`)
