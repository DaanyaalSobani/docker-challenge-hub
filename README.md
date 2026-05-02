# DockerQuest

An interactive learning platform for Docker, inspired by [learngitbranching.js.org](https://learngitbranching.js.org/). Learn by writing real Docker and Docker Compose configurations and getting instant, specific feedback on what's right and what's missing.

## Documentation

Deeper documentation lives in the [`docs/`](./docs) folder. Start with [`docs/project-structure.md`](./docs/project-structure.md) for a guided tour of the codebase — what each package does and how the pieces fit together. New docs about the project belong in `docs/` too.

## How it works

DockerQuest is a guided sequence of challenges. Each challenge gives you:

- A real-world scenario (containerize a Node app, set up a multi-stage Go build, wire two services together with Compose, etc.)
- A working starter project with some files read-only (the app code) and one or more Docker files for you to write
- A project file tree on the left so you can see how the source is organized
- A list of objectives, markdown instructions, and progressively-revealed hints
- An IDE-like editor with file tabs and Docker/YAML syntax highlighting
- A "Run & Validate" button that submits your files for evaluation and prints the results in a terminal-style output panel
- A **Key Learnings** panel that appears after you pass — short explanations of *why* the approach you used works (e.g. copying `package.json` first to leverage layer caching) and what the tempting alternative (e.g. `COPY . .` then install) would have cost you. Available both on the celebration screen and in the editor's left panel when revisiting a completed challenge.

All challenges are unlocked from the start — pick any one in any order. Challenges are grouped into 6 categories: Dockerfile Basics, Multi-Stage Builds, Docker Compose, Networking, Volumes, and Security.

## Pages

- **`/`** — The challenge map. Categories are stacked, each with its own progress badge. Completed challenges are highlighted, and an overall progress bar sits at the top of the page next to a Reset Progress button. Every challenge is openable from the start.
- **`/challenges/:id`** — The editor. A 3-pane resizable layout with instructions on the left, the code editor with file tabs on the top right, and a terminal-style output console at the bottom right.
- **`/completed`** — A celebration screen that appears after passing a challenge, with the challenge's Key Learnings explained and a one-click jump to the next challenge.

## Progress tracking

Progress is stored entirely in your browser's `localStorage` under the key `dockerquest:progress`. There is no login, no account, no server-side session.

The shape of what's stored is intentionally small:

```json
{
  "completedIds": ["df-hello", "df-python"],
  "submissions": {
    "df-hello": [
      { "name": "Dockerfile", "content": "FROM node:18-alpine\n..." }
    ]
  }
}
```

From this state the app derives everything else:

- Which challenges have a green checkmark on the map
- The category-level progress badges and the overall progress bar
- Which challenge to suggest next on the completion screen (the next-by-`order` one you haven't finished yet)
- The starting contents of each file when you re-open a previously-passed challenge (your last passing solution is restored from `submissions[challengeId]`; if there is no saved submission the original starter files are used)

### Submission persistence

When you click **Run & Validate** and all checks pass, the editor's current files are saved into `submissions[challengeId]` (just `name` + `content` per file — no other metadata). The next time you open that challenge, your saved solution loads instead of the starter files, so you can review or iterate on it. Failed attempts are not saved.

If you want a clean slate for a single challenge while keeping your other progress, click the **Reset** button in the challenge header — it restores that challenge's editor to the starter files for the current session. To wipe everything (completed list and all saved submissions), use **Reset Progress** on the homepage.

### Why localStorage and not cookies?

`localStorage` is the right tool for this kind of small, client-only state:

- It isn't sent on every HTTP request (cookies are), so it doesn't add latency or request size to API calls
- It survives across browser sessions automatically, with no server involvement
- It's scoped to the origin, so two users on the same machine but in different browsers get independent progress

The trade-off is that progress is **per-browser**: clearing your site data, or opening the app in a different browser/incognito window, gives you a fresh state. That's the right behavior for a no-account learning tool.

### Reset Progress

The "Reset Progress" button on the homepage opens a confirmation dialog and, on confirm, clears the entire `completedIds` list. It's effectively a one-click `localStorage.removeItem("dockerquest:progress")`. The button is disabled when you have no progress to reset.

You can also reset manually from your browser's DevTools console:

```js
localStorage.removeItem("dockerquest:progress")
```

### Implementation

The implementation lives in `artifacts/docker-learn/src/hooks/use-progress.ts` as a small `useProgress` hook that:

- Reads from `localStorage` on mount
- Listens for both the cross-tab `storage` event and an in-tab custom event so multiple components stay in sync when one of them marks a challenge complete or resets
- Exposes `completedIds`, `totalCompleted`, `isCompleted(id)`, `markComplete(id)`, `saveSubmission(id, files)`, `getSubmission(id)`, and `reset()`

## How validation works

Validation is **server-side, but does not run Docker**. Instead, the API server inspects the contents of the files you submit and runs a list of explicit checks for that specific challenge.

### Submission flow

1. You click **Run & Validate** in the editor
2. The frontend POSTs `{ files: [{ name, content, language, readonly }, ...] }` to `POST /api/challenges/:id/submit`
3. The server looks up the challenge by `id`, runs each of its checks against the submitted files, and returns a `ValidationResult`
4. The frontend renders the result in the terminal output panel; if all checks passed, it calls `markComplete(id)` (which writes to `localStorage`) and then navigates to the celebration screen

### What a check looks like

Each challenge defines its own list of checks in `artifacts/api-server/src/data/challenges.ts`. A check is just a function that gets the submitted files and returns `true` (pass) or `false` (fail), plus a human-readable name and a failure message:

```ts
{
  name: "Uses Node.js 18 base image",
  fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^FROM\s+node:18/im),
  message: "The Dockerfile must use node:18 or node:18-alpine as the base image",
}
```

The check functions use small helpers — `getFile(files, name)` to look up a file by name and `hasInstruction` / `hasPattern` to look for Docker instructions or regex matches. This keeps the validator simple, deterministic, and easy to extend.

### What a `ValidationResult` looks like

```ts
{
  passed: boolean,           // true only if every check passed
  score: number,             // count of checks that passed
  maxScore: number,          // total number of checks
  checks: [
    { name: string, passed: boolean, message: string },
    ...
  ],
  feedback: string,          // overall summary
  output: string             // a terminal-style multi-line transcript
}
```

The `output` field is what's shown in the bottom panel of the editor. It's pre-formatted to look like a `docker build` run, with `✓` next to passing checks and `✗ <name>: <message>` next to failing ones, so each failure tells you exactly what to fix.

### Why this approach instead of actually running Docker?

Running real `docker build` per submission would require a privileged Docker daemon, image cleanup, sandboxing, rate-limiting, and significant resources per request. For a learning tool, the goal is to give you fast, specific, repeatable feedback on whether you've used the right Docker concepts and instructions — and that's exactly what semantic checks do. Each challenge's check list is hand-authored so the feedback maps directly onto the lesson.

### Adding a new challenge

1. Append a new entry to the `CHALLENGES` array in `artifacts/api-server/src/data/challenges.ts`
2. Set `id`, `title`, `category`, `difficulty`, and the next available `order`
3. Provide `instructions` (markdown), `objectives`, `hints`, and `starterFiles`
4. Write the `checks` — one function per thing the user needs to do correctly
5. Restart the API server workflow

The frontend will automatically pick up the new challenge and slot it into the right category.

## Project structure

```
artifacts/
  docker-learn/        # React + Vite frontend (the learning UI)
  api-server/          # Express backend (challenges + validation)
lib/
  api-spec/            # OpenAPI source of truth + codegen
  api-client-react/    # Generated React Query hooks (consumed by the frontend)
  api-zod/             # Generated Zod schemas
  db/                  # Drizzle schema (currently unused; kept for future features)
```

The frontend never imports from the backend directly. The contract between them is `lib/api-spec/openapi.yaml`; the typed React Query hooks the frontend uses are generated from it via `pnpm --filter @workspace/api-spec run codegen`.
