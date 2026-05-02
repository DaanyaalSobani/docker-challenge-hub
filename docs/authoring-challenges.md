# Authoring New Challenges

This guide walks through adding a new challenge to DockerQuest end‑to‑end. If you've read [`project-structure.md`](./project-structure.md), you already know that the challenge catalog lives in `artifacts/api-server/src/data/challenges.ts` and that validation runs on the server by inspecting submitted file contents — no `docker build` is involved. This document zooms in on **how to add one**.

By the end of the guide you will have:

- Picked a category, id, and difficulty.
- Written the instructions, objectives, hints, and Key Learnings.
- Defined starter files (and decided which ones the learner can edit).
- Written `checks` using the helpers exposed in `challenges.ts`.
- Verified the new challenge shows up on the map and validates correctly.

A complete worked example is at the end.

---

## 1. Where everything lives

Every challenge is a single object in the `CHALLENGES` array in:

```
artifacts/api-server/src/data/challenges.ts
```

The full shape (from the top of that file) is:

```ts
type ChallengeData = {
  id: string;                         // unique slug, used in URLs
  title: string;                      // shown on the map and editor header
  description: string;                // one‑sentence summary on the map
  difficulty: "beginner" | "intermediate" | "advanced";
  category:
    | "dockerfile"
    | "compose"
    | "networking"
    | "volumes"
    | "multi-stage"
    | "security";
  order: number;                      // sort key on the map
  instructions: string;               // markdown, shown in the left pane
  hints: string[];                    // progressively revealed
  starterFiles: ChallengeFile[];      // initial editor contents
  objectives: string[];               // checklist next to the editor
  keyLearnings: KeyLearning[];        // shown on the /completed screen
  checks: ValidationCheck[];          // run server‑side on submission
};
```

A `ChallengeFile` is `{ name, content, language, readonly }`. A `ValidationCheck` is `{ name, fn, message }` where `fn(files) => boolean`.

The frontend reads this catalog over the API (`GET /api/challenges`), so **adding an entry to the array and restarting the server is enough** to make a new challenge appear in the UI. There is nothing else to register.

---

## 2. Pick a category and id

### Category

Use one of the six categories listed in the type. Pick the one that matches what the learner is exercising:

| Category      | Use it when the challenge is mainly about…                |
| ------------- | --------------------------------------------------------- |
| `dockerfile`  | Writing or refining a single `Dockerfile`.                |
| `multi-stage` | Multiple `FROM` stages and `COPY --from=...` patterns.    |
| `compose`     | Writing a `docker-compose.yml` (one or more services).    |
| `networking`  | Custom networks, service discovery, network isolation.    |
| `volumes`     | Bind mounts, named volumes, data persistence.             |
| `security`    | Non‑root users, least privilege, image hardening.         |

If your challenge straddles two areas, pick the one that drives the **checks**. A multi‑stage build that also creates a non‑root user is still a `multi-stage` challenge if the validation focuses on the staging.

### Id

The `id` is a short slug used in the URL (`/challenges/:id`) and as the localStorage key for progress. Conventions in the existing catalog:

- All lowercase, hyphenated.
- Prefixed by category: `df-` (dockerfile), `ms-` (multi‑stage), `compose-`, `net-`, `vol-`, `sec-`.
- Distinctive — `df-hello`, `df-python`, `ms-go`, `compose-env`, `vol-named`, `sec-nonroot`.

The id must be **unique across the catalog**. Double‑check by searching for it in `challenges.ts` before committing.

### Difficulty and order

- `beginner` — learner needs only the concepts they've already seen on earlier challenges.
- `intermediate` — combines two or three concepts, or introduces one less common one (multi‑stage, env files, healthchecks).
- `advanced` — non‑obvious patterns or several moving pieces (custom networks with isolation, security hardening, etc.).

`order` controls map placement. Pick a number that slots your challenge into the intended progression — it doesn't have to be unique, but lower numbers appear first.

---

## 3. Write the learner‑facing content

These four fields are what the learner actually sees. Quality here matters more than the validation cleverness.

### `instructions` (markdown)

Rendered in the left pane of the editor. Use sentence headings (`##`), code fences for snippets, and bold for the things the learner has to do. The existing challenges follow a consistent structure:

1. A short framing paragraph: what is this concept and why does it matter?
2. A `## What you need to do` section with a numbered list of concrete steps.
3. Optionally, a small "key concept" callout (e.g. `## The --no-cache-dir flag`) explaining a non‑obvious detail.

Keep it focused on **this** challenge — don't re‑teach the previous one. Link forward by foreshadowing the next concept if helpful.

### `objectives` (string[])

A short, scannable checklist that mirrors the numbered steps in the instructions. The UI shows them as a side panel and ticks them off implicitly as checks pass. Keep each item to one line, imperative voice ("Set WORKDIR to /app", "Expose port 5000").

### `hints` (string[])

Progressive hints — the learner reveals them one at a time. Order matters: the first hint should be the most general nudge, later hints can be near‑complete code snippets. Three to five is the sweet spot.

### `keyLearnings` (KeyLearning[])

`{ title, body }` pairs shown on the `/completed` screen after passing. These are the takeaways you'd want a learner to remember a week later — the *why* behind the steps. Aim for two or three. Each `body` is plain text (no markdown) and should be one substantial paragraph that explains a real concept, not just restate the objective.

---

## 4. Define `starterFiles`

This is the initial state of the editor. Each entry is:

```ts
{
  name: string;       // file name shown in the editor tab
  content: string;    // initial file contents
  language: string;   // syntax highlighting hint (see below)
  readonly: boolean;  // true → learner cannot edit this file
}
```

### Language values

Use the values already in the catalog so the editor picks the right Monaco mode: `dockerfile`, `yaml`, `javascript`, `typescript`, `python`, `json`, `text`.

### Which files should be editable?

This is the most important decision. The rule is:

- **Editable (`readonly: false`)** — files the challenge is *about*. Usually one or two: a `Dockerfile`, a `docker-compose.yml`, sometimes both.
- **Read‑only (`readonly: true`)** — supporting context the learner needs to read but not change: the application source (`index.js`, `app.py`), `package.json`, `requirements.txt`, sample data files. Marking these read‑only prevents the learner from "fixing" their checks by editing the wrong file, and signals "this is given to you".

For an editable file, the `content` should be a starter scaffold with a few comments hinting at the structure — not blank, not a complete solution. Look at `df-hello` for the right level of help: comments saying "Use node:18-alpine as the base image" but no actual instructions written.

For read‑only files, ship realistic, runnable contents. The learner is more invested when the supporting code looks like real code.

---

## 5. Write `checks`

A check is:

```ts
{
  name: string;                                      // shown in the terminal output
  fn: (files: ChallengeFile[]) => boolean;           // true = pass
  message: string;                                   // shown when fn returns false
}
```

When a learner submits, the server runs every check in order and returns the pass/fail state of each one. The terminal pane shows the `name` of every check and, for failures, the `message`.

### The three helpers

`challenges.ts` defines three small helpers at the top of the file. **Use these instead of inlining string operations** — they keep checks consistent and easy to read.

#### `getFile(files, name): string`

Returns the contents of the named file, or `""` if it isn't present. Always start a check by pulling the file you care about:

```ts
fn: (files) => {
  const df = getFile(files, "Dockerfile");
  // ...check df...
}
```

#### `hasInstruction(content, instruction): boolean`

Returns true if any non‑comment line in `content` starts with the given Dockerfile instruction (case‑insensitive, leading whitespace tolerated). Use it for "does this Dockerfile contain a `WORKDIR`?" style checks where you don't care about the argument:

```ts
fn: (files) => hasInstruction(getFile(files, "Dockerfile"), "WORKDIR")
```

#### `hasPattern(content, pattern): boolean`

Just `pattern.test(content)`. Use it whenever you need to assert anything more specific than "this instruction exists":

```ts
fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^FROM\s+node:18/im),
```

The flags you'll use almost every time are `i` (case‑insensitive) and `m` (so `^` and `$` anchor to lines, not just the start of the string). `^FROM\s+...` is the canonical pattern for matching a Dockerfile instruction — anchored to the start of a line so a comment mentioning `FROM` doesn't accidentally pass.

### Check granularity

Write **one check per requirement**, not one big check that asserts everything. This is what makes the terminal output useful: a learner sees seven green check marks and one red one with a clear message, instead of "validation failed". The existing `df-hello` challenge has seven checks for seven requirements — that's the model.

If a single conceptual requirement has two parts (e.g. "set FLASK_APP and FLASK_RUN_HOST"), you can either combine them with `&&` inside one check or split them into two. Split when the failure messages would be different, combine when they're a single idea.

### Conventions for failure messages

The `message` is what the learner reads when they're stuck. Treat it as a teaching moment:

- **Tell them what to do, not just what's wrong.** Bad: "Missing WORKDIR." Good: "Use `WORKDIR /app` to set the working directory."
- **Echo the syntax.** Show the actual instruction or snippet they should write, in backticks. Real example from the catalog: ``"Set CMD to `[\"node\", \"index.js\"]` or equivalent"``.
- **Match the wording in the instructions.** If the instructions say "Expose port 3000", the failure message should say "Expose port 3000", not "EXPOSE missing".
- **Don't reveal more than you have to.** The hints system is for progressive disclosure; messages should nudge, not solve.
- **Keep it to one sentence.** The terminal pane is narrow.

### Be lenient on equivalent answers

Learners will write valid Docker that doesn't match your first guess. Prefer permissive patterns:

- Accept either `node:18` or `node:18-alpine` if you don't strictly need alpine.
- Accept either `COPY . .` or a more specific `COPY index.js .` when both work.
- Accept both shell form (`CMD node index.js`) and exec form (`CMD ["node", "index.js"]`) unless the lesson is specifically about exec form.

The `df-hello` "Sets CMD to run the app" check is a good template — it `OR`s two regexes for the two valid forms.

---

## 6. Worked example: a healthcheck challenge

Here is a complete new challenge entry. It teaches the `HEALTHCHECK` instruction, which isn't covered elsewhere in the catalog. Drop it into the `CHALLENGES` array in `challenges.ts`, restart the API server, and it will appear on the map.

```ts
{
  id: "df-healthcheck",
  title: "Add a Healthcheck",
  description:
    "Teach Docker how to tell if your container is actually healthy, not just running.",
  difficulty: "intermediate",
  category: "dockerfile",
  order: 8,
  instructions: `# Add a Healthcheck

Docker can tell whether your container *process* is running, but not whether your *app* is responding. The \`HEALTHCHECK\` instruction closes that gap: Docker periodically runs a command inside the container and marks it \`healthy\` or \`unhealthy\` based on the exit code.

The provided Express app exposes \`GET /health\` and returns 200 when it's ready.

## What you need to do

1. Use \`node:18-alpine\` as the base image.
2. Set the working directory to \`/app\`.
3. Copy \`package.json\`, run \`npm install\`, then copy the rest of the app.
4. Expose port **3000**.
5. Add a \`HEALTHCHECK\` that:
   - Runs every **30 seconds** (\`--interval=30s\`).
   - Times out after **3 seconds** (\`--timeout=3s\`).
   - Calls \`wget --spider -q http://localhost:3000/health\` (alpine ships \`wget\`, not \`curl\`).
6. Set \`CMD ["node", "server.js"]\`.

## Why this matters

Orchestrators (Compose, Swarm, Kubernetes via similar probes) use the health status to decide when to send traffic to a container, when to restart it, and when a rolling deploy can proceed. Without a healthcheck, "running" is the only signal — and a process can be running while completely wedged.`,
  hints: [
    "The full syntax is `HEALTHCHECK [OPTIONS] CMD <command>`.",
    "Use `--interval=30s --timeout=3s` before the `CMD` keyword.",
    "On alpine, prefer `wget --spider -q <url>` — it exits 0 on 2xx and non‑zero otherwise.",
    "The `CMD` inside `HEALTHCHECK` is separate from the top‑level `CMD` that starts the app.",
  ],
  starterFiles: [
    {
      name: "Dockerfile",
      content: `# Containerize this Express app and add a HEALTHCHECK
# that hits GET /health every 30s.

`,
      language: "dockerfile",
      readonly: false,
    },
    {
      name: "server.js",
      content: `const express = require('express');
const app = express();

app.get('/', (_req, res) => res.send('Hello!'));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('Listening on 3000'));
`,
      language: "javascript",
      readonly: true,
    },
    {
      name: "package.json",
      content: `{
  "name": "healthcheck-demo",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": { "express": "^4.19.2" }
}
`,
      language: "json",
      readonly: true,
    },
  ],
  objectives: [
    "Use node:18-alpine as the base image",
    "Set WORKDIR to /app and install dependencies",
    "Expose port 3000",
    "Add a HEALTHCHECK with --interval=30s and --timeout=3s",
    "Healthcheck calls GET /health using wget",
    "Set CMD to run server.js",
  ],
  keyLearnings: [
    {
      title: "Running ≠ healthy",
      body: "Without HEALTHCHECK, Docker only knows whether your PID 1 is alive. A Node process can be running while the event loop is blocked or the DB connection has died — from the outside it looks fine, but real requests fail. A healthcheck that exercises a real endpoint turns 'is this thing actually working?' into a signal Docker (and your orchestrator) can act on.",
    },
    {
      title: "Pick a tool the base image already has",
      body: "Alpine images ship with `wget` but not `curl`. Debian‑based images often ship neither and you'd need an apt-get install. The cheapest healthcheck is one that uses what's already there — `wget --spider -q` is the alpine idiom; `curl -f` is the Debian one. Reach for a node script only when the check needs real logic.",
    },
    {
      title: "Tune --interval, --timeout, and --start-period",
      body: "The defaults (30s interval, 30s timeout, 0s start period) are usually wrong. Slow‑starting apps need `--start-period=60s` so failures during warmup don't count against them. Latency‑sensitive services want a shorter interval. The healthcheck command runs *inside* the container on every interval, so keep it cheap.",
    },
  ],
  checks: [
    {
      name: "Uses Node.js 18 alpine base image",
      fn: (files) =>
        hasPattern(getFile(files, "Dockerfile"), /^FROM\s+node:18-alpine/im),
      message: "Use `node:18-alpine` as the base image",
    },
    {
      name: "Sets working directory",
      fn: (files) =>
        hasPattern(getFile(files, "Dockerfile"), /^WORKDIR\s+\/app/im),
      message: "Set `WORKDIR /app` so subsequent instructions run there",
    },
    {
      name: "Installs dependencies",
      fn: (files) =>
        hasPattern(getFile(files, "Dockerfile"), /^RUN\s+npm\s+(install|ci)/im),
      message: "Run `npm install` (or `npm ci`) to install dependencies",
    },
    {
      name: "Exposes port 3000",
      fn: (files) =>
        hasPattern(getFile(files, "Dockerfile"), /^EXPOSE\s+3000/im),
      message: "Expose port 3000 so traffic can reach the container",
    },
    {
      name: "Has a HEALTHCHECK instruction",
      fn: (files) =>
        hasInstruction(getFile(files, "Dockerfile"), "HEALTHCHECK"),
      message: "Add a `HEALTHCHECK` instruction to the Dockerfile",
    },
    {
      name: "Healthcheck sets a 30s interval",
      fn: (files) =>
        hasPattern(getFile(files, "Dockerfile"), /HEALTHCHECK[^\n]*--interval=30s/i),
      message: "Pass `--interval=30s` to HEALTHCHECK",
    },
    {
      name: "Healthcheck sets a 3s timeout",
      fn: (files) =>
        hasPattern(getFile(files, "Dockerfile"), /HEALTHCHECK[^\n]*--timeout=3s/i),
      message: "Pass `--timeout=3s` to HEALTHCHECK",
    },
    {
      name: "Healthcheck probes /health",
      fn: (files) => {
        const df = getFile(files, "Dockerfile");
        return (
          hasPattern(df, /HEALTHCHECK[\s\S]*\/health/i) &&
          hasPattern(df, /wget|curl/i)
        );
      },
      message:
        "The HEALTHCHECK CMD should call `wget --spider -q http://localhost:3000/health`",
    },
    {
      name: "Sets CMD to run the app",
      fn: (files) =>
        hasPattern(getFile(files, "Dockerfile"), /^CMD\s+\["node",\s*"server\.js"\]/im) ||
        hasPattern(getFile(files, "Dockerfile"), /^CMD\s+.*node\s+server\.js/im),
      message: 'Set `CMD ["node", "server.js"]` to start the app',
    },
  ],
},
```

Things to notice in the example:

- Every requirement in the instructions has at least one matching check, in the same order.
- The two HEALTHCHECK option checks are split (different failure messages, different things to fix).
- The "probes /health" check combines two patterns with `&&` because they're a single conceptual requirement ("call wget against /health").
- The final CMD check accepts both exec and shell form, because the lesson isn't about CMD form.
- Read‑only files (`server.js`, `package.json`) are realistic — `server.js` actually defines the `/health` endpoint the check is asking the learner to probe.

---

## 7. Verify your new challenge

After editing `challenges.ts`:

1. Restart the API server workflow (`artifacts/api-server: API Server`) so it picks up the new entry.
2. Open the frontend — the new challenge should appear on the map under its category.
3. Open the challenge and submit the **starter file as‑is**: every check that has any requirement should fail with its `message`. This confirms the messages read well.
4. Paste in a known‑good solution and submit: every check should pass.
5. Try one or two near‑miss solutions (wrong base image tag, missing flag) and confirm the failing check points exactly at the problem.
6. Run `pnpm run typecheck` from the repo root to make sure the new entry still satisfies `ChallengeData`.

Once those four pass, your challenge is ready.
