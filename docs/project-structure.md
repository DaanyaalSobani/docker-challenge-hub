# DockerQuest — Project Structure

This document is the starting point for understanding the DockerQuest codebase. It explains what the project is, how the monorepo is laid out, what each piece does, and how the pieces talk to each other.

## What is DockerQuest?

DockerQuest is an interactive learning platform for Docker, inspired by [learngitbranching.js.org](https://learngitbranching.js.org/). Learners pick a challenge from a map, write real Docker / Docker Compose files in an in‑browser editor, and click **Run & Validate** to get immediate, specific feedback on what their files do and don't do correctly.

There is no login — progress (which challenges you've completed and your last passing submissions) is stored in the browser's `localStorage`. Validation runs on the server, but **does not invoke Docker**: instead, the API inspects the contents of the submitted files against a hand‑authored list of semantic checks per challenge.

## Monorepo layout

DockerQuest is a [pnpm workspaces](https://pnpm.io/workspaces) monorepo. Each package manages its own dependencies; shared code is published as workspace libraries and consumed via `@workspace/*` imports.

```
.
├── artifacts/              # Deployable apps (each is its own workspace package)
│   ├── docker-learn/         # React + Vite frontend — the learning UI
│   ├── api-server/           # Express backend — challenges + validation
│   └── mockup-sandbox/       # Component / UI prototyping playground
├── lib/                    # Shared libraries (workspace packages)
│   ├── api-spec/             # OpenAPI source of truth + codegen entry point
│   ├── api-client-react/     # Generated React Query hooks (frontend client)
│   ├── api-zod/              # Generated Zod schemas (shared validation)
│   └── db/                   # Drizzle ORM setup (reserved for future features)
├── scripts/                # Repo‑level utility scripts
├── docs/                   # Project documentation (this folder)
├── pnpm-workspace.yaml     # Workspace package discovery + dependency catalog
├── tsconfig.base.json      # Shared strict TypeScript defaults
├── tsconfig.json           # Solution config — references composite libs
├── replit.md               # Workspace overview for the Replit agent
└── README.md               # Product‑level README (how DockerQuest works for users)
```

## Artifacts

Artifacts are the actual runnable applications. Each one is independently built and run via its own workflow, and exposed under a unique path by a shared reverse proxy.

### `artifacts/docker-learn` — frontend (web)

A React + Vite single‑page app. This is what learners see in the browser.

- Routes:
  - `/` — the challenge map (categories, progress badges, Reset Progress)
  - `/challenges/:id` — the 3‑pane editor (instructions, code editor, terminal output)
  - `/completed` — celebration screen with Key Learnings after passing
- Reads progress from `localStorage` via `src/hooks/use-progress.ts`.
- Talks to the backend through generated React Query hooks from `@workspace/api-client-react` — it never imports backend code directly.

### `artifacts/api-server` — backend (api)

An Express 5 server, mounted under the `/api` path by the proxy.

- Owns the challenge catalog in `src/data/challenges.ts` (each challenge has `id`, `title`, `instructions`, `starterFiles`, and a list of `checks`).
- Exposes endpoints described by the OpenAPI spec in `lib/api-spec`, notably `GET /api/challenges` and `POST /api/challenges/:id/submit`.
- Validation: when a submission comes in, the server runs each of the challenge's checks against the submitted files and returns a structured `ValidationResult` (passed / failed checks, score, terminal‑style transcript). No `docker build` is invoked.

### `artifacts/mockup-sandbox` — design (internal)

A standalone playground for prototyping UI components in isolation, without wiring them into the real app. Useful for design iteration; not part of the user‑facing product.

## Shared libraries

The `lib/` packages are how the artifacts share contracts and types. The frontend never imports from the backend (or vice versa) — they meet in the middle through these libs.

### `lib/api-spec` — the contract

Holds `openapi.yaml`, the **single source of truth** for the HTTP API. Running `pnpm --filter @workspace/api-spec run codegen` reads this file and regenerates the client hooks (`api-client-react`) and Zod schemas (`api-zod`).

Whenever the API shape changes, edit the OpenAPI spec first, then re‑run codegen. The frontend consumes the generated hooks, and the backend can adopt the generated Zod schemas to validate request/response payloads on a per‑route basis — so a contract change shows up as a typecheck error until both sides are updated.

### `lib/api-client-react` — typed client hooks

Generated React Query hooks (e.g. `useListChallenges`, `useGetChallenge`, `useSubmitChallenge`) that the frontend imports. Handles request shapes, response types, and query key conventions automatically.

### `lib/api-zod` — runtime schemas

Generated Zod schemas matching the OpenAPI types. They're available to both sides for runtime parsing — today the API server uses them on a subset of routes (e.g. the health route), and new endpoints should adopt them as they're added.

### `lib/db` — database (reserved)

A Drizzle ORM setup wired to PostgreSQL. DockerQuest currently stores all user state in the browser, so this lib is **not used at runtime today**. It's kept in place so future features (e.g. accounts, leaderboards, server‑side progress) can plug in without bootstrapping a new package.

## How things connect

### 1. The API contract flow

```
   lib/api-spec/openapi.yaml          ← edit this first
            │
            │  pnpm --filter @workspace/api-spec run codegen
            ▼
  ┌─────────────────────────┐    ┌─────────────────────────┐
  │ lib/api-client-react    │    │ lib/api-zod             │
  │  (React Query hooks)    │    │  (Zod schemas)          │
  └────────────┬────────────┘    └────────────┬────────────┘
               │                              │
               ▼                              ▼
    artifacts/docker-learn          artifacts/api-server
       (frontend consumes              (backend validates
        typed hooks)                    requests + responses)
```

The frontend and backend only know about each other through the generated artifacts of `lib/api-spec`. This keeps the two ends in lock‑step: change the spec, regenerate, and both sides surface type errors until they're updated to match.

### 2. Request flow at runtime

```
  Browser (docker-learn)
        │  fetch via React Query hook from @workspace/api-client-react
        │  POST /api/challenges/:id/submit  { files: [...] }
        ▼
  Shared reverse proxy (localhost:80)
        │  routes /api/* to the api-server service
        ▼
  Express (api-server)
        │  1. Looks up challenge by id in src/data/challenges.ts
        │  2. Runs each check function against the submitted files
        │  3. Returns a ValidationResult
        ▼
  Browser (docker-learn)
        │  Renders the terminal‑style output panel
        │  If passed → markComplete(id) writes to localStorage
        │  Navigates to /completed
```

### 3. Path‑based routing between artifacts

Each artifact's `.replit-artifact/artifact.toml` declares the paths it owns. A global reverse proxy at `localhost:80` dispatches requests to the right service based on the path prefix. In practice:

- `/` → `docker-learn` (frontend)
- `/api/*` → `api-server`
- `/__mockup/*` → `mockup-sandbox`

Application code should use relative URLs and let the proxy do the routing — there's no need (and you should not) hard‑code service ports or add custom Vite proxies. For ad‑hoc shell requests, hit `localhost:80/...`, never the service port directly.

### 4. Client‑side state (progress)

All learner progress lives in the browser under the `localStorage` key `dockerquest:progress`:

```json
{
  "completedIds": ["df-hello", "df-python"],
  "submissions": {
    "df-hello": [{ "name": "Dockerfile", "content": "FROM node:18-alpine\n..." }]
  }
}
```

The `useProgress` hook in `artifacts/docker-learn/src/hooks/use-progress.ts` reads, writes, and broadcasts changes (both cross‑tab via the `storage` event and in‑tab via a custom event) so all components stay in sync. The server never sees this data.

## TypeScript model in one paragraph

`lib/*` packages are **composite** and emit declarations via `tsc --build`; the root `tsconfig.json` lists them as references. `artifacts/*` and `scripts` are **leaf** packages, type‑checked with `tsc --noEmit` and never referenced by the root solution. The canonical full check is `pnpm run typecheck` from the repo root — trust its result over editor / LSP state when they disagree. See the `pnpm-workspace` skill for the full rationale.

## Where to look next

- `README.md` — product‑level walkthrough of how DockerQuest behaves for a learner.
- `replit.md` — workspace overview and key commands.
- `lib/api-spec/openapi.yaml` — the API contract; start here when changing endpoints.
- `artifacts/api-server/src/data/challenges.ts` — challenge catalog and check functions; start here when adding a challenge.
- `artifacts/docker-learn/src/hooks/use-progress.ts` — the localStorage‑backed progress hook.
