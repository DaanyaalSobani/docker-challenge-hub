# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Authentication

Replit Auth (OpenID Connect with PKCE) is wired into the docker-learn frontend
so progress can sync across machines.

- Browser auth lib: `lib/replit-auth-web` (`useAuth()` hook from
  `@workspace/replit-auth-web`).
- Server auth code: `artifacts/api-server/src/{lib/auth.ts,middlewares/authMiddleware.ts,routes/auth.ts}`.
- DB tables (in `lib/db/src/schema/auth.ts`): `users`, `sessions`. Session
  cookie name is `sid`. Sessions are stored in Postgres.
- Login button lives at the bottom of the left sidebar in `Layout`.
  UI uses generic "Log in" / "Log out" labels.

## Progress sync

`useProgress()` (in `artifacts/docker-learn/src/hooks/use-progress.tsx`) is
backed by a `ProgressProvider`:

- **Logged out**: state is read/written to `localStorage` under
  `dockerquest:progress` (legacy behaviour preserved for anonymous users).
- **Logged in**: state is loaded from `GET /api/me/progress` and every
  mutation pushes to `PUT /api/me/progress`. On the first sign-in any
  non-empty local progress is merged into the server payload and then the
  local copy is cleared.
- DB shape: `user_progress` (one row per user) with a `jsonb` `data` column
  matching the `UserProgress` OpenAPI schema (`completedIds` + `submissions`).
- Endpoints `GET/PUT /api/me/progress` are mounted under `routes/me.ts` and
  return 401 when the request is not authenticated.
