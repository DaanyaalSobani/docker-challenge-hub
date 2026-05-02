# OpenAPI + Orval Codegen

This doc explains the API contract / code‑generation setup used in DockerQuest: what each piece is, why it exists, and exactly which files in the repo read from the generated code.

If you're new to OpenAPI, Orval, or generated React Query clients, start here.

## The big idea

In a typical frontend + backend split, both sides hand‑write their own types: the backend defines a response shape, and the frontend writes a matching `interface` and hopes they stay in sync. They don't — every API change becomes a manual two‑sided edit, and bugs slip in whenever someone forgets one side.

DockerQuest replaces that with **one declarative file** (`lib/api-spec/openapi.yaml`) that describes the API, plus a generator (**Orval**) that produces TypeScript code from it.

```
        lib/api-spec/openapi.yaml       ← edit here
                  │
                  │  pnpm --filter @workspace/api-spec run codegen
                  ▼
                Orval
              ┌───┴───┐
              ▼       ▼
   @workspace/api-client-react   @workspace/api-zod
   (React Query hooks +          (Zod runtime
    TS interfaces)                schemas + types)
              │                       │
              ▼                       ▼
   artifacts/docker-learn       artifacts/api-server
        (frontend)                  (backend)
```

The frontend never imports from the backend, and vice‑versa. Both ends only know about each other through the generated artifacts of `lib/api-spec`. Change the spec → regenerate → both sides surface type errors until they match.

## The pieces

### 1. OpenAPI — the contract format

[OpenAPI](https://www.openapis.org/) (formerly "Swagger") is an industry‑standard schema for describing HTTP APIs in YAML or JSON. It says:

- which paths exist (`/challenges`, `/challenges/{id}/submit`)
- which HTTP methods each supports
- what parameters / request bodies they take
- what response shapes they return
- the data types in `components.schemas` (reusable across endpoints via `$ref`)

DockerQuest's full API is described in `lib/api-spec/openapi.yaml` — about 270 lines.

Two details worth knowing:

- **`operationId`** on each operation (`listChallenges`, `getChallenge`, `submitChallenge`) becomes the function/hook name in generated code. Pick these names carefully — they're the public surface of the client.
- **`$ref: "#/components/schemas/ChallengeSummary"`** references a reusable schema instead of inlining it. Define a type once in `components.schemas`, reference it from every operation that needs it.

### 2. Orval — the code generator

[Orval](https://orval.dev/) reads an OpenAPI spec and emits TypeScript. The DockerQuest config (`lib/api-spec/orval.config.ts`) defines **two outputs from the same spec**:

#### Output 1: React Query hooks (`@workspace/api-client-react`)

```ts
"api-client-react": {
  input:  { target: "./openapi.yaml", ... },
  output: {
    workspace: ".../lib/api-client-react/src",
    target: "generated",
    client: "react-query",     // emit TanStack Query hooks
    mode: "split",              // separate api.ts + api.schemas.ts
    baseUrl: "/api",
    clean: true,                // wipe the generated dir each run
    override: {
      mutator: {                // route every fetch through customFetch
        path: ".../custom-fetch.ts",
        name: "customFetch",
      },
    },
  },
},
```

The result lives in `lib/api-client-react/src/generated/`:

- `api.ts` — for every operation in the spec, Orval emits a plain async function (`listChallenges()`), query‑key + query‑options helpers, and a React Query hook (`useListChallenges()`). Mutations (POST/PUT/DELETE) become `useMutation`‑based hooks like `useSubmitChallenge`.
- `api.schemas.ts` — TypeScript interfaces generated straight from `components.schemas` (`Challenge`, `ChallengeSubmission`, `ValidationResult`, ...).

The `mutator` option is a key piece: instead of letting Orval call `fetch` directly, every generated function delegates to the hand‑written `customFetch` wrapper in `lib/api-client-react/src/custom-fetch.ts`. That's where cross‑cutting concerns live (base URL, auth headers, JSON parsing, structured error shape) — set them once and every endpoint inherits them.

#### Output 2: Zod runtime schemas (`@workspace/api-zod`)

```ts
zod: {
  output: {
    client: "zod",
    schemas: { path: "generated/types", type: "typescript" },
    ...
  },
}
```

This produces **Zod schemas** matching the OpenAPI types. TypeScript types are erased at runtime — they only catch errors during compilation. Zod schemas are real JS objects you can call `.parse()` on at runtime to validate that data actually matches the shape. Useful for:

- validating incoming request bodies on the server before trusting them
- validating outgoing responses against the contract before sending them
- sharing a single validator between client and server

## Where the generated code is read

### Frontend — consumes `@workspace/api-client-react`

| File | Imports | Purpose |
|---|---|---|
| `artifacts/docker-learn/src/pages/home.tsx:2` | `useListChallenges` | Fetches the list for the challenge map |
| `artifacts/docker-learn/src/pages/challenge.tsx:3-8` | `useGetChallenge`, `useSubmitChallenge`, `ChallengeFile`, `ValidationResult` | Loads one challenge and POSTs the submission |
| `artifacts/docker-learn/src/pages/completed.tsx:5-9` | `useGetChallenge`, `useListChallenges`, `getGetChallengeQueryKey` | Reads the completed challenge and suggests the next one |
| `artifacts/docker-learn/src/components/terminal.tsx:3` | `type { ValidationResult }` | Types the validation result rendered in the terminal panel |

Example (`artifacts/docker-learn/src/pages/home.tsx`):

```ts
import { useListChallenges } from "@workspace/api-client-react";

export function Home() {
  const { data: challenges, isLoading } = useListChallenges();
  // ...
}
```

That single hook gives full typing, caching, refetching, and loading state — all inferred from the YAML.

For mutations (`artifacts/docker-learn/src/pages/challenge.tsx`):

```ts
import { useSubmitChallenge } from "@workspace/api-client-react";

const submitChallenge = useSubmitChallenge();

submitChallenge.mutate(
  { id, data: { files } },
  { onSuccess: (result) => { /* result is ValidationResult */ } },
);
```

### Backend — consumes `@workspace/api-zod`

| File | Imports | Purpose |
|---|---|---|
| `artifacts/api-server/src/routes/health.ts:2` | `HealthCheckResponse` | `.parse()` the response body before sending — runtime guarantee that the shape matches the contract |

Example (`artifacts/api-server/src/routes/health.ts`):

```ts
import { HealthCheckResponse } from "@workspace/api-zod";

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});
```

> **Note:** the challenges route (`artifacts/api-server/src/routes/challenges.ts`) does not use the Zod schemas yet. The natural next step is to adopt them there too — `.parse()` the incoming `ChallengeSubmission` body, and `.parse()` outgoing `ValidationResult` and `Challenge` responses.

## The workflow when you change the API

1. **Edit `lib/api-spec/openapi.yaml`** — add an operation, change a schema, rename a field.
2. **Run codegen:**
   ```sh
   pnpm --filter @workspace/api-spec run codegen
   ```
   Orval wipes `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/` (because of `clean: true`) and re‑emits them. The script also runs `pnpm -w run typecheck:libs` to verify the regenerated libs still compile.
3. **Run the full typecheck:**
   ```sh
   pnpm run typecheck
   ```
   Both `docker-learn` and `api-server` will fail to compile until they're updated to match the new contract. Fix the consumer code (the files listed above) until typecheck is clean.
4. **Commit the spec *and* the generated files together.** The generated code is checked in (look at `lib/api-client-react/src/generated/api.ts` — 363 lines, all committed) so other developers don't need to run codegen themselves; they just `pnpm install` and import.

## File map

| File | Role |
|---|---|
| `lib/api-spec/openapi.yaml` | Single source of truth — the API contract |
| `lib/api-spec/orval.config.ts` | Tells Orval *what to generate and where* (two outputs) |
| `lib/api-spec/package.json` | Defines the `codegen` script |
| `lib/api-client-react/src/generated/api.ts` | Auto‑generated React Query hooks |
| `lib/api-client-react/src/generated/api.schemas.ts` | Auto‑generated TS interfaces |
| `lib/api-client-react/src/custom-fetch.ts` | Hand‑written fetch wrapper Orval routes through |
| `lib/api-client-react/src/index.ts` | Barrel re‑export — what consumers actually import |
| `lib/api-zod/src/generated/api.ts` | Auto‑generated Zod schemas (per operation) |
| `lib/api-zod/src/generated/types/*.ts` | Auto‑generated Zod schemas (per data type) |
| `lib/api-zod/src/index.ts` | Barrel re‑export |

## Why this is worth the setup

- **One contract, zero drift.** No more copy‑pasting types between frontend and backend.
- **Free hooks.** No `useEffect` + `fetch` boilerplate — every endpoint comes with caching, `isLoading`, retries, and mutations out of the box.
- **Cross‑boundary validation.** Zod schemas double as runtime parsers, so the backend can validate incoming requests before trusting them.
- **Standard format.** OpenAPI is portable — the same `openapi.yaml` could generate a Python client, a Go server, a Postman collection, or rendered API docs.
- **Compiler‑enforced sync.** A breaking change to the spec lights up TypeScript errors on both sides until the change is fully propagated.
