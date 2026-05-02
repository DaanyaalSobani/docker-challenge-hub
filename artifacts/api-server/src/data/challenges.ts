export type ChallengeFile = {
  name: string;
  content: string;
  language: string;
  readonly: boolean;
};

export type ValidationCheck = {
  name: string;
  fn: (files: ChallengeFile[]) => boolean;
  message: string;
};

export type ChallengeData = {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "dockerfile" | "compose" | "networking" | "volumes" | "multi-stage" | "security";
  order: number;
  instructions: string;
  hints: string[];
  starterFiles: ChallengeFile[];
  objectives: string[];
  checks: ValidationCheck[];
};

function getFile(files: ChallengeFile[], name: string): string {
  return files.find((f) => f.name === name)?.content ?? "";
}

function hasInstruction(content: string, instruction: string): boolean {
  return content
    .split("\n")
    .some((line) => line.trim().toUpperCase().startsWith(instruction.toUpperCase()));
}

function hasPattern(content: string, pattern: RegExp): boolean {
  return pattern.test(content);
}

export const CHALLENGES: ChallengeData[] = [
  // ─── DOCKERFILE BASICS ───────────────────────────────────────────────────────
  {
    id: "df-hello",
    title: "Your First Dockerfile",
    description: "Write a Dockerfile that containerizes a simple Node.js app.",
    difficulty: "beginner",
    category: "dockerfile",
    order: 1,
    instructions: `# Your First Dockerfile

Welcome to DockerQuest! Let's start with the basics.

You have a simple Node.js application that prints "Hello from Docker!". Your task is to write a \`Dockerfile\` that containerizes it.

## What you need to do

1. Use **Node.js 18** as the base image (alpine variant for smaller size)
2. Set the working directory to \`/app\`
3. Copy the \`package.json\` file first
4. Run \`npm install\` to install dependencies
5. Copy the rest of the application files
6. Expose port **3000**
7. Set the start command to \`node index.js\`

## Why this matters

A Dockerfile is a recipe for building a container image. The order of instructions matters — Docker caches each layer, so putting rarely-changing steps first (like installing dependencies) speeds up future builds.`,
    hints: [
      "Start with `FROM node:18-alpine` to use a lightweight Node.js base image",
      "Use `WORKDIR /app` to set the working directory for all subsequent instructions",
      "Copy `package.json` before other files with `COPY package.json .` then run `RUN npm install`",
      "Use `COPY . .` to copy the remaining application files after installing dependencies",
      "Use `CMD [\"node\", \"index.js\"]` (JSON array form) as the preferred command format",
    ],
    starterFiles: [
      {
        name: "Dockerfile",
        content: `# Write your Dockerfile here
# Use node:18-alpine as the base image

`,
        language: "dockerfile",
        readonly: false,
      },
      {
        name: "index.js",
        content: `const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Docker!\\n');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
`,
        language: "javascript",
        readonly: true,
      },
      {
        name: "package.json",
        content: `{
  "name": "hello-docker",
  "version": "1.0.0",
  "main": "index.js"
}
`,
        language: "json",
        readonly: true,
      },
    ],
    objectives: [
      "Use node:18-alpine as the base image",
      "Set working directory to /app",
      "Copy package.json and run npm install before copying other files",
      "Copy application files",
      "Expose port 3000",
      "Set CMD to run index.js",
    ],
    checks: [
      {
        name: "Uses Node.js 18 base image",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^FROM\s+node:18/im),
        message: "The Dockerfile must use node:18 or node:18-alpine as the base image",
      },
      {
        name: "Sets working directory",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^WORKDIR\s+\/app/im),
        message: "Use WORKDIR /app to set the working directory",
      },
      {
        name: "Copies package.json",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^COPY\s+package\.json/im),
        message: "Copy package.json to the container",
      },
      {
        name: "Runs npm install",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^RUN\s+npm\s+install/im),
        message: "Run npm install to install dependencies",
      },
      {
        name: "Copies application files",
        fn: (files) => {
          const df = getFile(files, "Dockerfile");
          return hasPattern(df, /^COPY\s+\.\s+\./im) || hasPattern(df, /^COPY\s+index\.js/im);
        },
        message: "Copy the application files into the container",
      },
      {
        name: "Exposes port 3000",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^EXPOSE\s+3000/im),
        message: "Expose port 3000 so the container can receive traffic",
      },
      {
        name: "Sets CMD to run the app",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /^CMD\s+.*node.*index\.js/im) ||
          hasPattern(getFile(files, "Dockerfile"), /^CMD\s+\["node",\s*"index\.js"\]/im),
        message: 'Set CMD to ["node", "index.js"] or equivalent',
      },
    ],
  },

  {
    id: "df-python",
    title: "Python Flask Container",
    description: "Containerize a Python Flask web application with proper dependency management.",
    difficulty: "beginner",
    category: "dockerfile",
    order: 2,
    instructions: `# Python Flask Container

Now let's containerize a Python application. Flask is a lightweight web framework, and containerizing it follows a similar pattern to Node.js but with Python-specific tools.

## What you need to do

1. Use **Python 3.11-slim** as the base image
2. Set the working directory to \`/app\`
3. Install system dependencies with \`apt-get\` (you'll need \`build-essential\`)
4. Copy \`requirements.txt\` first, then install Python dependencies with \`pip install --no-cache-dir -r requirements.txt\`
5. Copy the rest of the application
6. Set the environment variable \`FLASK_APP=app.py\` and \`FLASK_RUN_HOST=0.0.0.0\`
7. Expose port **5000**
8. Use \`CMD ["flask", "run"]\` to start the application

## The \`--no-cache-dir\` flag

Always use \`pip install --no-cache-dir\` in Docker images — it reduces the image size by not storing the pip download cache, which you don't need once the package is installed.`,
    hints: [
      "Use `FROM python:3.11-slim` for a minimal Python base image",
      "Use `RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*` to install and clean up system packages",
      "Copy requirements.txt with `COPY requirements.txt .` before copying all files",
      "Set environment variables with `ENV FLASK_APP=app.py` and `ENV FLASK_RUN_HOST=0.0.0.0`",
    ],
    starterFiles: [
      {
        name: "Dockerfile",
        content: `# Containerize this Flask application
# Remember: copy requirements.txt BEFORE other files for better caching

`,
        language: "dockerfile",
        readonly: false,
      },
      {
        name: "app.py",
        content: `from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello from Flask in Docker!'

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
`,
        language: "python",
        readonly: true,
      },
      {
        name: "requirements.txt",
        content: `flask==3.0.0
gunicorn==21.2.0
`,
        language: "text",
        readonly: true,
      },
    ],
    objectives: [
      "Use python:3.11-slim as the base image",
      "Set working directory to /app",
      "Copy requirements.txt and install dependencies before other files",
      "Set FLASK_APP and FLASK_RUN_HOST environment variables",
      "Expose port 5000",
      "Set CMD to run Flask",
    ],
    checks: [
      {
        name: "Uses Python 3.11 base image",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^FROM\s+python:3\.11/im),
        message: "Use python:3.11-slim as the base image",
      },
      {
        name: "Sets working directory",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^WORKDIR\s+\/app/im),
        message: "Set WORKDIR to /app",
      },
      {
        name: "Copies requirements.txt",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^COPY\s+requirements\.txt/im),
        message: "Copy requirements.txt before installing packages",
      },
      {
        name: "Installs Python dependencies",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /^RUN\s+pip\s+install/im) &&
          hasPattern(getFile(files, "Dockerfile"), /requirements\.txt/i),
        message: "Run pip install -r requirements.txt to install dependencies",
      },
      {
        name: "Sets FLASK_APP environment variable",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^ENV\s+FLASK_APP/im),
        message: "Set ENV FLASK_APP=app.py",
      },
      {
        name: "Sets FLASK_RUN_HOST to 0.0.0.0",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /FLASK_RUN_HOST\s*=\s*0\.0\.0\.0/i),
        message: "Set FLASK_RUN_HOST=0.0.0.0 so the server is accessible outside the container",
      },
      {
        name: "Exposes port 5000",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^EXPOSE\s+5000/im),
        message: "Expose port 5000",
      },
      {
        name: "Sets CMD to run Flask",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^CMD\s+.*flask.*run/im),
        message: 'Set CMD to ["flask", "run"]',
      },
    ],
  },

  {
    id: "df-labels-args",
    title: "Metadata & Build Args",
    description: "Use LABEL for metadata and ARG for build-time variables to create configurable, well-documented images.",
    difficulty: "beginner",
    category: "dockerfile",
    order: 3,
    instructions: `# Metadata & Build Args

Good Docker images are self-documenting and configurable. This challenge teaches you two important instructions: \`LABEL\` and \`ARG\`.

## LABEL

Labels attach metadata to your image — useful for tooling, documentation, and automation.

\`\`\`dockerfile
LABEL maintainer="you@example.com"
LABEL version="1.0"
LABEL description="My awesome app"
\`\`\`

## ARG

Build arguments let you pass values at build time with \`docker build --build-arg KEY=value\`. Unlike \`ENV\`, ARG values are NOT available in the running container.

\`\`\`dockerfile
ARG NODE_VERSION=18
FROM node:\${NODE_VERSION}-alpine
\`\`\`

## What you need to do

1. Use \`ARG APP_VERSION=1.0.0\` before the FROM instruction to define a build argument
2. Use \`FROM node:18-alpine\`
3. Add labels: \`version\` (using the ARG), \`maintainer\`, and \`description\`
4. Set WORKDIR to \`/app\`
5. Copy all files and run \`npm install\`
6. Expose port 3000
7. Set CMD to \`node server.js\``,
    hints: [
      "ARG defined before FROM can only be used in FROM. Redefine it after FROM to use it in LABEL.",
      "Use `LABEL version=$APP_VERSION` to reference a build argument in a label",
      "You can define multiple labels in one instruction: `LABEL key1=value1 key2=value2`",
    ],
    starterFiles: [
      {
        name: "Dockerfile",
        content: `# Define a build argument for the app version before FROM
# Then add LABEL instructions with metadata

`,
        language: "dockerfile",
        readonly: false,
      },
      {
        name: "server.js",
        content: `const http = require('http');
const { version } = require('./package.json');

http.createServer((req, res) => {
  res.end(\`App version: \${version}\`);
}).listen(3000);
`,
        language: "javascript",
        readonly: true,
      },
      {
        name: "package.json",
        content: `{"name":"metadata-app","version":"1.0.0","main":"server.js"}`,
        language: "json",
        readonly: true,
      },
    ],
    objectives: [
      "Define ARG APP_VERSION=1.0.0 before FROM",
      "Use node:18-alpine as base image",
      "Add version, maintainer, and description labels",
      "Set WORKDIR to /app",
      "Copy files, run npm install, expose 3000, set CMD",
    ],
    checks: [
      {
        name: "Defines ARG before FROM",
        fn: (files) => {
          const df = getFile(files, "Dockerfile");
          const lines = df.split("\n").filter((l) => l.trim().length > 0);
          const firstMeaningful = lines.find((l) => !l.trim().startsWith("#"));
          return firstMeaningful?.trim().toUpperCase().startsWith("ARG") ?? false;
        },
        message: "Define ARG APP_VERSION=1.0.0 before the FROM instruction",
      },
      {
        name: "Uses Node.js 18 alpine",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^FROM\s+node:18-alpine/im),
        message: "Use node:18-alpine as the base image",
      },
      {
        name: "Has LABEL instructions",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^LABEL/im),
        message: "Add LABEL instructions with metadata",
      },
      {
        name: "Labels include version",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /LABEL.*version/i),
        message: "Include a version label (e.g., LABEL version=$APP_VERSION)",
      },
      {
        name: "Labels include maintainer",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /LABEL.*maintainer/i),
        message: "Include a maintainer label",
      },
      {
        name: "Sets WORKDIR",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^WORKDIR\s+\/app/im),
        message: "Set WORKDIR to /app",
      },
      {
        name: "Exposes port 3000",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^EXPOSE\s+3000/im),
        message: "Expose port 3000",
      },
    ],
  },

  // ─── MULTI-STAGE BUILDS ───────────────────────────────────────────────────────
  {
    id: "ms-node",
    title: "Multi-Stage: Node.js Builder",
    description: "Use multi-stage builds to create a lean production Node.js image, separating build dependencies from the runtime.",
    difficulty: "intermediate",
    category: "multi-stage",
    order: 4,
    instructions: `# Multi-Stage Builds

Multi-stage builds are one of Docker's most powerful features. They let you use one image to build your app and another — much smaller — image to run it.

## The Problem

A Node.js app with \`devDependencies\` (TypeScript, Webpack, etc.) might have hundreds of megabytes of build tools that have no business being in a production image.

## The Solution

\`\`\`dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
CMD ["node", "dist/index.js"]
\`\`\`

## What you need to do

1. Create a **builder** stage using \`node:18-alpine\` that:
   - Installs ALL dependencies with \`npm ci\`
   - Compiles TypeScript: \`RUN npm run build\`

2. Create a **production** stage using \`node:18-alpine\` that:
   - Copies only the \`dist/\` folder from the builder stage
   - Copies \`package*.json\` from the builder
   - Installs only production deps with \`npm ci --only=production\`
   - Exposes port 3000
   - Runs \`node dist/index.js\``,
    hints: [
      "Name your stages with `AS builder` and `AS production` in the FROM instruction",
      "Use `COPY --from=builder /app/dist ./dist` to copy files between stages",
      "Use `npm ci --only=production` in the production stage to skip devDependencies",
      "The final image only contains what's in the LAST stage",
    ],
    starterFiles: [
      {
        name: "Dockerfile",
        content: `# Stage 1: Build stage
# Build the TypeScript code

# Stage 2: Production stage
# Copy only what's needed to run

`,
        language: "dockerfile",
        readonly: false,
      },
      {
        name: "src/index.ts",
        content: `import http from 'http';

const server = http.createServer((req, res) => {
  res.end('Production build running!');
});

server.listen(3000, () => console.log('Listening on port 3000'));
`,
        language: "typescript",
        readonly: true,
      },
      {
        name: "package.json",
        content: `{
  "name": "multi-stage-demo",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "@types/node": "^20.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}`,
        language: "json",
        readonly: true,
      },
    ],
    objectives: [
      "Create a named 'builder' stage",
      "Install all dependencies and build TypeScript in the builder stage",
      "Create a named 'production' stage",
      "Copy only dist/ and package.json from the builder stage",
      "Install only production dependencies",
      "Expose port 3000 and run the app",
    ],
    checks: [
      {
        name: "Has a named builder stage",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /^FROM\s+\S+\s+AS\s+builder/im),
        message: "Define a build stage with `FROM node:18-alpine AS builder`",
      },
      {
        name: "Has a production stage",
        fn: (files) => {
          const df = getFile(files, "Dockerfile");
          const fromLines = df.split("\n").filter((l) => l.trim().toUpperCase().startsWith("FROM"));
          return fromLines.length >= 2;
        },
        message: "Define a second (production) stage with another FROM instruction",
      },
      {
        name: "Runs npm build in builder stage",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /RUN\s+npm\s+run\s+build/im),
        message: "Run `npm run build` in the builder stage to compile TypeScript",
      },
      {
        name: "Copies from builder stage",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /^COPY\s+--from=builder/im),
        message: "Use `COPY --from=builder` to copy artifacts from the build stage",
      },
      {
        name: "Copies dist/ directory",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /COPY\s+--from=builder.*dist/im),
        message: "Copy the dist/ folder from the builder stage",
      },
      {
        name: "Installs only production deps",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /npm\s+ci\s+--only=production/im) ||
          hasPattern(getFile(files, "Dockerfile"), /npm\s+ci\s+--omit=dev/im),
        message: "Use `npm ci --only=production` to install only production dependencies",
      },
      {
        name: "Exposes port 3000",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^EXPOSE\s+3000/im),
        message: "Expose port 3000 in the production stage",
      },
    ],
  },

  {
    id: "ms-go",
    title: "Multi-Stage: Minimal Go Binary",
    description: "Build a Go application and produce a minimal scratch or distroless image.",
    difficulty: "intermediate",
    category: "multi-stage",
    order: 5,
    instructions: `# Minimal Go Binary with Multi-Stage Builds

Go produces self-contained static binaries — perfect for ultra-minimal Docker images. The build tools (Go compiler, source code) can be completely discarded in the final image.

## The Ultimate Minimal Image

\`\`\`dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# Final stage - just the binary!
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
\`\`\`

## What you need to do

1. **Build stage** using \`golang:1.21-alpine AS builder\`:
   - Copy \`go.mod\` and \`go.sum\`, then run \`go mod download\`
   - Copy all files and build with: \`CGO_ENABLED=0 GOOS=linux go build -o server .\`

2. **Final stage** using \`alpine:3.18\`:
   - Copy only the \`server\` binary from the builder
   - Expose port **8080**
   - Run \`./server\`

## Why CGO_ENABLED=0?

Disabling CGO produces a fully static binary that doesn't need C libraries — essential for running in minimal images like Alpine or scratch.`,
    hints: [
      "The build command is: `RUN CGO_ENABLED=0 GOOS=linux go build -o server .`",
      "Copy the binary with: `COPY --from=builder /app/server .`",
      "Use `CMD [\"./server\"]` to run the binary",
      "Download modules before copying source to maximize cache efficiency",
    ],
    starterFiles: [
      {
        name: "Dockerfile",
        content: `# Stage 1: Build the Go binary
# Use golang:1.21-alpine as builder

# Stage 2: Run the binary in Alpine
# Use alpine:3.18

`,
        language: "dockerfile",
        readonly: false,
      },
      {
        name: "main.go",
        content: `package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Go binary running in Docker!")
	})
	fmt.Println("Server starting on :8080")
	http.ListenAndServe(":8080", nil)
}
`,
        language: "go",
        readonly: true,
      },
      {
        name: "go.mod",
        content: `module docker-go-demo

go 1.21
`,
        language: "go",
        readonly: true,
      },
    ],
    objectives: [
      "Use golang:1.21-alpine as the build stage",
      "Download Go modules before copying source files",
      "Build with CGO_ENABLED=0 GOOS=linux for a static binary",
      "Use alpine:3.18 as the final stage",
      "Copy only the binary from the builder",
      "Expose port 8080",
    ],
    checks: [
      {
        name: "Uses Golang builder stage",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /^FROM\s+golang:1\.21/im),
        message: "Use golang:1.21-alpine as the build stage",
      },
      {
        name: "Downloads Go modules",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /go\s+mod\s+download/i),
        message: "Run `go mod download` to cache module downloads",
      },
      {
        name: "Builds with CGO_ENABLED=0",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /CGO_ENABLED=0/i) &&
          hasPattern(getFile(files, "Dockerfile"), /go\s+build/i),
        message: "Build with `CGO_ENABLED=0 GOOS=linux go build -o server .`",
      },
      {
        name: "Uses Alpine as final stage",
        fn: (files) => {
          const df = getFile(files, "Dockerfile");
          return (
            hasPattern(df, /^FROM\s+alpine/im) &&
            df.split("\n").filter((l) => l.trim().toUpperCase().startsWith("FROM")).length >= 2
          );
        },
        message: "Use alpine:3.18 as the final, minimal runtime stage",
      },
      {
        name: "Copies binary from builder",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /COPY\s+--from=builder.*server/im),
        message: "Copy the compiled `server` binary from the builder stage",
      },
      {
        name: "Exposes port 8080",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^EXPOSE\s+8080/im),
        message: "Expose port 8080",
      },
    ],
  },

  // ─── DOCKER COMPOSE ──────────────────────────────────────────────────────────
  {
    id: "compose-web-db",
    title: "Web App + Database",
    description: "Write a docker-compose.yml that runs a Node.js web app alongside a PostgreSQL database.",
    difficulty: "beginner",
    category: "compose",
    order: 6,
    instructions: `# Compose: Web App + PostgreSQL

Docker Compose orchestrates multiple containers that work together. This is the most common pattern: a web application backed by a database.

## What you need to do

Write a \`docker-compose.yml\` with two services:

### 1. The \`db\` service
- Image: \`postgres:16-alpine\`
- Environment variables:
  - \`POSTGRES_USER: appuser\`
  - \`POSTGRES_PASSWORD: secret\`
  - \`POSTGRES_DB: appdb\`
- A named volume \`pgdata\` mounted at \`/var/lib/postgresql/data\`

### 2. The \`web\` service
- Build from the current directory (using the provided Dockerfile)
- Port mapping: \`3000:3000\`
- Environment: \`DATABASE_URL: postgresql://appuser:secret@db:5432/appdb\`
- Depends on the \`db\` service

### 3. The \`pgdata\` volume
- Declare it at the top-level \`volumes:\` key

## Key Concept: Service Discovery

In Compose, services can reach each other by **service name**. That's why the web service connects to \`db\` (the service name) rather than an IP address.`,
    hints: [
      "The top-level structure is: `version`, `services`, `volumes`",
      "Use `build: .` for a service built from a local Dockerfile",
      "Port mapping syntax: `ports: - \"3000:3000\"` (host:container)",
      "Depends_on: `depends_on: - db`",
      "Named volumes need to be declared at the top-level `volumes:` key: `pgdata:`",
    ],
    starterFiles: [
      {
        name: "docker-compose.yml",
        content: `# Define your Compose file here
# Required services: web, db
# Required volume: pgdata

`,
        language: "yaml",
        readonly: false,
      },
      {
        name: "Dockerfile",
        content: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
`,
        language: "dockerfile",
        readonly: true,
      },
    ],
    objectives: [
      "Define a 'web' service built from the current directory",
      "Define a 'db' service using postgres:16-alpine",
      "Set PostgreSQL environment variables (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)",
      "Map port 3000:3000 for the web service",
      "Configure DATABASE_URL in the web service",
      "Add depends_on: db for the web service",
      "Declare the pgdata named volume",
    ],
    checks: [
      {
        name: "Has 'web' service",
        fn: (files) => hasPattern(getFile(files, "docker-compose.yml"), /^\s+web\s*:/m),
        message: "Define a 'web' service in your Compose file",
      },
      {
        name: "Has 'db' service",
        fn: (files) => hasPattern(getFile(files, "docker-compose.yml"), /^\s+db\s*:/m),
        message: "Define a 'db' service for PostgreSQL",
      },
      {
        name: "DB uses postgres:16-alpine",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /image:\s*postgres:16-alpine/i),
        message: "The db service should use the postgres:16-alpine image",
      },
      {
        name: "Sets POSTGRES_USER and POSTGRES_PASSWORD",
        fn: (files) => {
          const content = getFile(files, "docker-compose.yml");
          return (
            hasPattern(content, /POSTGRES_USER/i) && hasPattern(content, /POSTGRES_PASSWORD/i)
          );
        },
        message: "Set POSTGRES_USER and POSTGRES_PASSWORD environment variables for the db service",
      },
      {
        name: "Web service has port mapping 3000:3000",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /['""]?3000:3000['""]?/),
        message: "Map port 3000:3000 for the web service",
      },
      {
        name: "Web service has DATABASE_URL",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /DATABASE_URL/i),
        message: "Set DATABASE_URL in the web service environment",
      },
      {
        name: "Web depends on db",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /depends_on/i) &&
          hasPattern(getFile(files, "docker-compose.yml"), /- db/i),
        message: "Add `depends_on: - db` to the web service",
      },
      {
        name: "Declares pgdata volume",
        fn: (files) => hasPattern(getFile(files, "docker-compose.yml"), /pgdata\s*:/im),
        message: "Declare the `pgdata` named volume at the top-level `volumes:` key",
      },
    ],
  },

  {
    id: "compose-env",
    title: "Environment & Secrets",
    description: "Manage configuration and secrets in Compose using env_file and environment variables.",
    difficulty: "intermediate",
    category: "compose",
    order: 7,
    instructions: `# Managing Environment Variables in Compose

Hard-coding secrets in docker-compose.yml is dangerous. Docker Compose provides two clean ways to inject configuration:

## 1. \`env_file\`

Load variables from a file:

\`\`\`yaml
services:
  app:
    env_file:
      - .env
      - .env.local
\`\`\`

## 2. \`environment\`

Set individual variables (can reference host environment):

\`\`\`yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - SECRET_KEY=\${SECRET_KEY}  # pulled from host
\`\`\`

## What you need to do

1. Create a \`docker-compose.yml\` with an \`app\` service:
   - Use \`node:18-alpine\` image
   - Mount \`./app\` to \`/app\` as a bind mount
   - Load variables from \`.env\` using \`env_file\`
   - Set \`NODE_ENV=production\` directly via \`environment\`
   - Expose port \`3000:3000\`

2. Create a \`.env\` file with:
   - \`DB_HOST=localhost\`
   - \`DB_PORT=5432\`
   - \`APP_SECRET=mysecret\``,
    hints: [
      "Use `env_file: - .env` to load environment variables from a file",
      "Use `environment: - NODE_ENV=production` to set specific variables",
      "Bind mount syntax: `volumes: - ./app:/app`",
      "The .env file format is KEY=VALUE, one per line",
    ],
    starterFiles: [
      {
        name: "docker-compose.yml",
        content: `# Configure the app service with environment variables
# Use both env_file and environment directives

`,
        language: "yaml",
        readonly: false,
      },
      {
        name: ".env",
        content: `# Add your environment variables here

`,
        language: "text",
        readonly: false,
      },
    ],
    objectives: [
      "Define an 'app' service using node:18-alpine",
      "Load variables from .env using env_file",
      "Set NODE_ENV=production via environment",
      "Add a bind mount from ./app to /app",
      "Map port 3000:3000",
    ],
    checks: [
      {
        name: "Has 'app' service",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /^\s+app\s*:/m),
        message: "Define an 'app' service",
      },
      {
        name: "Uses env_file directive",
        fn: (files) => hasPattern(getFile(files, "docker-compose.yml"), /env_file/i),
        message: "Use the env_file directive to load variables from .env",
      },
      {
        name: ".env has DB_HOST",
        fn: (files) => hasPattern(getFile(files, ".env"), /DB_HOST\s*=/i),
        message: "Add DB_HOST= to your .env file",
      },
      {
        name: ".env has APP_SECRET",
        fn: (files) => hasPattern(getFile(files, ".env"), /APP_SECRET\s*=/i),
        message: "Add APP_SECRET= to your .env file",
      },
      {
        name: "Sets NODE_ENV=production",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /NODE_ENV\s*[=:]\s*production/i),
        message: "Set NODE_ENV=production in the environment section",
      },
      {
        name: "Has bind mount",
        fn: (files) => hasPattern(getFile(files, "docker-compose.yml"), /\.\/app\s*:\s*\/app/i),
        message: "Mount ./app to /app as a volume bind mount",
      },
      {
        name: "Maps port 3000",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /3000\s*:\s*3000/),
        message: "Map port 3000:3000",
      },
    ],
  },

  // ─── NETWORKING ──────────────────────────────────────────────────────────────
  {
    id: "net-custom",
    title: "Custom Networks",
    description: "Isolate services using custom Docker networks and control which services can communicate.",
    difficulty: "intermediate",
    category: "networking",
    order: 8,
    instructions: `# Custom Networks in Docker Compose

By default, all services in a Compose file share one network. Custom networks let you control communication between services — a key security practice.

## Network Isolation Pattern

\`\`\`yaml
networks:
  frontend:
  backend:

services:
  nginx:
    networks: [frontend]
  
  api:
    networks: [frontend, backend]
  
  db:
    networks: [backend]
\`\`\`

In this setup: nginx can reach api, api can reach db, but nginx **cannot** reach db directly.

## What you need to do

Create a \`docker-compose.yml\` with:

**3 services:**
- \`nginx\` — image \`nginx:alpine\`, port \`80:80\`, only on \`frontend\` network
- \`api\` — image \`node:18-alpine\`, on **both** \`frontend\` and \`backend\` networks
- \`db\` — image \`postgres:16-alpine\`, only on \`backend\` network

**2 custom networks:**
- \`frontend\` — driver: bridge
- \`backend\` — driver: bridge, \`internal: true\` (no external access)`,
    hints: [
      "Declare networks at the top level: `networks: frontend: backend:`",
      "Assign a service to networks with: `networks: - frontend - backend`",
      "Set `internal: true` on the backend network to block external access",
      "The driver for both networks should be `bridge`",
    ],
    starterFiles: [
      {
        name: "docker-compose.yml",
        content: `# Create an isolated network topology
# nginx -> api -> db (db is not directly reachable from nginx)

`,
        language: "yaml",
        readonly: false,
      },
    ],
    objectives: [
      "Define 'nginx', 'api', and 'db' services",
      "Create 'frontend' and 'backend' custom networks",
      "nginx is only on the frontend network",
      "api is on both frontend and backend networks",
      "db is only on the backend network",
      "backend network has internal: true",
    ],
    checks: [
      {
        name: "Has nginx, api, and db services",
        fn: (files) => {
          const content = getFile(files, "docker-compose.yml");
          return (
            hasPattern(content, /^\s+nginx\s*:/m) &&
            hasPattern(content, /^\s+api\s*:/m) &&
            hasPattern(content, /^\s+db\s*:/m)
          );
        },
        message: "Define nginx, api, and db services",
      },
      {
        name: "Declares frontend and backend networks",
        fn: (files) => {
          const content = getFile(files, "docker-compose.yml");
          return hasPattern(content, /frontend\s*:/) && hasPattern(content, /backend\s*:/);
        },
        message: "Declare both frontend and backend networks",
      },
      {
        name: "Uses bridge driver for networks",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /driver\s*:\s*bridge/i),
        message: "Set driver: bridge for your custom networks",
      },
      {
        name: "Backend network is internal",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /internal\s*:\s*true/i),
        message: "Set `internal: true` on the backend network to isolate it",
      },
      {
        name: "nginx uses nginx:alpine image",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /image\s*:\s*nginx:alpine/i),
        message: "The nginx service should use the nginx:alpine image",
      },
      {
        name: "nginx maps port 80",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /80\s*:\s*80/),
        message: "Map port 80:80 for the nginx service",
      },
      {
        name: "api is on both networks",
        fn: (files) => {
          const content = getFile(files, "docker-compose.yml");
          // Simple check: frontend and backend appear in same service block area
          return (
            hasPattern(content, /frontend/) &&
            hasPattern(content, /backend/)
          );
        },
        message: "The api service should be on both the frontend and backend networks",
      },
    ],
  },

  // ─── VOLUMES ─────────────────────────────────────────────────────────────────
  {
    id: "vol-named",
    title: "Named Volumes & Persistence",
    description: "Use named volumes to persist data across container restarts and understand volume lifecycle.",
    difficulty: "beginner",
    category: "volumes",
    order: 9,
    instructions: `# Named Volumes for Data Persistence

Containers are ephemeral — when they stop, their filesystem changes are lost. Named volumes solve this by storing data outside the container.

## Types of Docker Volumes

| Type | Syntax | Use case |
|------|--------|----------|
| Named volume | \`pgdata:/var/lib/postgresql/data\` | Production databases |
| Bind mount | \`./src:/app/src\` | Development live-reload |
| Anonymous | \`/var/lib/postgresql/data\` | Temporary data |

## What you need to do

Create a \`docker-compose.yml\` with:

1. A \`db\` service (postgres:16-alpine) with a named volume \`db_data\` mounted at \`/var/lib/postgresql/data\`
2. A \`redis\` service (redis:7-alpine) with a named volume \`redis_data\` mounted at \`/data\`
3. An \`app\` service (node:18-alpine) with:
   - A **bind mount** from \`./src\` to \`/app/src\` (for development)
   - A named volume \`node_modules\` mounted at \`/app/node_modules\` (to prevent the bind mount from overriding it)

4. Declare all three named volumes at the top level: \`db_data\`, \`redis_data\`, \`node_modules\``,
    hints: [
      "Named volumes: `volumes: - db_data:/var/lib/postgresql/data`",
      "Bind mounts: `volumes: - ./src:/app/src`",
      "Declare all named volumes at the top-level `volumes:` key",
      "The node_modules trick: mounting a named volume at node_modules prevents the host bind mount from hiding them",
    ],
    starterFiles: [
      {
        name: "docker-compose.yml",
        content: `# Configure persistent volumes for all three services
# Use named volumes for db_data, redis_data, and node_modules
# Use a bind mount for src code

`,
        language: "yaml",
        readonly: false,
      },
    ],
    objectives: [
      "Define db, redis, and app services",
      "Mount db_data named volume for PostgreSQL",
      "Mount redis_data named volume for Redis",
      "Use a bind mount for ./src:/app/src in the app service",
      "Use node_modules named volume in the app service",
      "Declare all named volumes at top level",
    ],
    checks: [
      {
        name: "Has db, redis, and app services",
        fn: (files) => {
          const content = getFile(files, "docker-compose.yml");
          return (
            hasPattern(content, /^\s+db\s*:/m) &&
            hasPattern(content, /^\s+redis\s*:/m) &&
            hasPattern(content, /^\s+app\s*:/m)
          );
        },
        message: "Define db, redis, and app services",
      },
      {
        name: "Uses postgres:16-alpine for db",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /image\s*:\s*postgres:16-alpine/i),
        message: "Use postgres:16-alpine for the db service",
      },
      {
        name: "Uses redis:7-alpine for redis",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /image\s*:\s*redis:7-alpine/i),
        message: "Use redis:7-alpine for the redis service",
      },
      {
        name: "Mounts db_data volume",
        fn: (files) =>
          hasPattern(
            getFile(files, "docker-compose.yml"),
            /db_data\s*:\s*\/var\/lib\/postgresql\/data/i
          ),
        message: "Mount the db_data volume at /var/lib/postgresql/data",
      },
      {
        name: "Mounts redis_data volume",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /redis_data\s*:\s*\/data/i),
        message: "Mount the redis_data volume at /data",
      },
      {
        name: "Has bind mount for source code",
        fn: (files) =>
          hasPattern(getFile(files, "docker-compose.yml"), /\.\/src\s*:\s*\/app\/src/i),
        message: "Add a bind mount from ./src to /app/src for the app service",
      },
      {
        name: "Declares all named volumes",
        fn: (files) => {
          const content = getFile(files, "docker-compose.yml");
          return (
            hasPattern(content, /db_data\s*:/) &&
            hasPattern(content, /redis_data\s*:/) &&
            hasPattern(content, /node_modules\s*:/)
          );
        },
        message: "Declare db_data, redis_data, and node_modules at the top-level volumes: key",
      },
    ],
  },

  // ─── SECURITY ────────────────────────────────────────────────────────────────
  {
    id: "sec-nonroot",
    title: "Non-Root User",
    description: "Run containers as a non-root user to improve security — a critical production best practice.",
    difficulty: "advanced",
    category: "security",
    order: 10,
    instructions: `# Security: Running as Non-Root

By default, processes in Docker containers run as **root**. This is a security risk — if an attacker escapes the container, they have root access to the host.

## The Fix: Create and Use a Non-Root User

\`\`\`dockerfile
FROM node:18-alpine

# Create a group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --only=production
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

## What you need to do

Write a \`Dockerfile\` that:
1. Uses \`node:18-alpine\` as the base
2. Creates a group \`appgroup\` and user \`appuser\` with \`addgroup\` and \`adduser\`
3. Sets WORKDIR to \`/app\`
4. Copies files with \`--chown=appuser:appgroup\` to give the user ownership
5. Runs \`npm ci --only=production\`
6. Switches to the \`appuser\` with the \`USER\` instruction
7. Exposes port 3000
8. Sets CMD to run \`node server.js\`

## Why --chown matters

Without \`--chown\`, copied files are owned by root. Even if you switch to a non-root user, they can't write to those files.`,
    hints: [
      "In Alpine, use `addgroup -S appgroup && adduser -S appuser -G appgroup`",
      "The -S flag creates a system user/group (no password, no home directory by default)",
      "Use `COPY --chown=appuser:appgroup . .` to set file ownership at copy time",
      "Place the USER instruction AFTER setup but BEFORE CMD",
    ],
    starterFiles: [
      {
        name: "Dockerfile",
        content: `# Write a secure Dockerfile that runs as a non-root user
# Create appgroup and appuser, then use them

`,
        language: "dockerfile",
        readonly: false,
      },
      {
        name: "server.js",
        content: `const http = require('http');
http.createServer((req, res) => {
  res.end('Running securely as non-root!');
}).listen(3000);
`,
        language: "javascript",
        readonly: true,
      },
      {
        name: "package.json",
        content: `{"name":"secure-app","version":"1.0.0"}`,
        language: "json",
        readonly: true,
      },
    ],
    objectives: [
      "Use node:18-alpine as the base image",
      "Create appgroup and appuser",
      "Copy files with --chown=appuser:appgroup",
      "Switch to appuser with USER instruction",
      "Expose port 3000 and set CMD",
    ],
    checks: [
      {
        name: "Uses node:18-alpine",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /^FROM\s+node:18-alpine/im),
        message: "Use node:18-alpine as the base image",
      },
      {
        name: "Creates a group",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /addgroup/i),
        message: "Create a group with `addgroup -S appgroup`",
      },
      {
        name: "Creates a non-root user",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /adduser/i),
        message: "Create a user with `adduser -S appuser -G appgroup`",
      },
      {
        name: "Uses --chown when copying",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /COPY\s+--chown=/im),
        message: "Use --chown=appuser:appgroup when copying files",
      },
      {
        name: "Switches to non-root user with USER",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /^USER\s+appuser/im),
        message: "Switch to the non-root user with `USER appuser`",
      },
      {
        name: "Exposes port 3000",
        fn: (files) => hasPattern(getFile(files, "Dockerfile"), /^EXPOSE\s+3000/im),
        message: "Expose port 3000",
      },
      {
        name: "Sets CMD to run the app",
        fn: (files) =>
          hasPattern(getFile(files, "Dockerfile"), /^CMD/im) &&
          hasPattern(getFile(files, "Dockerfile"), /server\.js/i),
        message: "Set CMD to run server.js",
      },
    ],
  },
];

export function getChallengeOrder(): string[] {
  return CHALLENGES.sort((a, b) => a.order - b.order).map((c) => c.id);
}
