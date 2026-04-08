# Developer Onboarding

## Project Overview

Welcome to **Medcurial AI Claims Fraud Detection**. This guide will help you get the project running locally and understand the conventions you need to follow as a contributor.

---

## Environment Requirements

| Tool | Minimum Version | Purpose |
|---|---|---|
| [Bun](https://bun.sh) | 1.1+ | JavaScript runtime and package manager |
| [Python](https://python.org) | 3.12+ | Worker and Agent services |
| [uv](https://docs.astral.sh/uv/) | 0.4+ | Python dependency management |
| [Docker](https://docker.com) | 24+ | Container runtime |
| [Docker Compose](https://docs.docker.com/compose/) | 2.20+ | Multi-service orchestration |
| Node.js | 20+ (optional) | Only needed if not using Bun for tooling |

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/decimozs/gylph.git
cd gylph
```

### 2. Configure Environment Variables

Create a `.env` file in the project root. Use the template below:

```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
APP_POSTGRES_DB=gylph
N8N_POSTGRES_DB=n8n

# n8n
N8N_ENCRYPTION_KEY=your_encryption_key
N8N_USER_MANAGEMENT_JWT_SECRET=your_jwt_secret

# AI Agent (required for agent service)
HF_TOKEN=your_huggingface_token
HF_BASE_URL=https://api-inference.huggingface.co/v1
```

For the **Agent** service specifically, create `agent/.env`:

```bash
HF_TOKEN=your_huggingface_token
HF_BASE_URL=https://api-inference.huggingface.co/v1
```

### 3. Install All Dependencies

```bash
make install
```

This runs:
- `cd api && bun install`
- `cd app && bun install`
- `cd worker && uv sync`

### 4. Start the Infrastructure (Docker)

```bash
docker compose up -d postgres qdrant static-files
```

To also start n8n, Docling, and Ollama:

```bash
# CPU-only
docker compose --profile cpu up -d

# NVIDIA GPU
docker compose --profile gpu-nvidia up -d

# AMD GPU
docker compose --profile gpu-amd up -d
```

### 5. Run Database Migrations

```bash
cd api && bun run db:migrate
```

### 6. Start Development Servers

Start all services in parallel:

```bash
make dev
```

Or start individual services:

```bash
make dev-api      # Main API on :3000
make dev-app      # Frontend on :5173
make dev-worker   # Worker on :8000
```

Start only API + Worker (without frontend):

```bash
make dev-infra
```

---

## Folder Structure Explanation

```
gylph/
├── api/                        # Main API (Hono.js + Bun)
│   ├── src/
│   │   ├── index.ts            # HTTP route definitions
│   │   ├── db.ts               # Drizzle ORM database client
│   │   ├── utils.ts            # Shared schema utilities
│   │   └── schema/             # Drizzle table definitions
│   │       ├── signatures.ts
│   │       ├── verifications.ts
│   │       ├── documents.ts
│   │       └── overall.ts
│   ├── drizzle.config.ts       # Drizzle migration config
│   └── package.json
│
├── app/                        # Frontend (React + Vite)
│   ├── src/
│   │   ├── main.tsx            # Application entry point
│   │   ├── routes/             # TanStack Router file-based routes
│   │   │   ├── __root.tsx      # Root layout
│   │   │   ├── _dashboard/     # Authenticated dashboard routes
│   │   │   ├── register/       # Signature registration page
│   │   │   ├── verify/         # Signature verification page
│   │   │   ├── extract/        # Document upload page
│   │   │   └── review/         # Verification review page
│   │   ├── api/                # HTTP client functions
│   │   ├── components/         # Reusable UI components
│   │   └── lib/                # Shared utilities and helpers
│   └── package.json
│
├── worker/                     # Signature processing service (FastAPI)
│   ├── app/
│   │   ├── main.py             # FastAPI app and route definitions
│   │   └── service/
│   │       ├── processor.py    # Image preprocessing pipeline
│   │       └── analyzer.py     # AKAZE feature extraction & scoring
│   ├── pyproject.toml
│   └── requirements.txt
│
├── agent/                      # AI fraud detection agent (LangGraph)
│   ├── main.py                 # Agent state machine and entry point
│   ├── prompt_loader.py        # Loads prompt templates
│   ├── prompt/                 # LLM system prompt files
│   ├── cli.py                  # CLI interface for the agent
│   └── pyproject.toml
│
├── docker-compose.yml          # Full infrastructure definition
├── init.sh                     # PostgreSQL initialization script
├── Makefile                    # Developer task shortcuts
└── package.json                # Root workspace config
```

---

## Coding Standards

### TypeScript (API + Frontend)

- **Formatter**: No formatter configured; follow project style (2-space indent, single quotes).
- **Type Safety**: Always define explicit types; avoid `any`.
- **Imports**: Use path alias `@/` for imports within `api/src/` and `app/src/`.
- **Schema Validation**: Use `drizzle-zod` to derive Zod types from Drizzle schemas — do not write manual Zod schemas for database models.
- **Route Style**: Keep route handlers concise; extract complex logic to service modules.

### Python (Worker + Agent)

- **Formatter**: Black (line length: 88).
- **Linter**: Ruff.
- **Type Hints**: Use explicit type annotations on all function signatures.
- **Naming**:
  - Functions and variables: `snake_case`
  - Classes: `PascalCase`
  - Constants: `SCREAMING_SNAKE_CASE`
- **Import Order**: stdlib → third-party → local (separated by blank lines).
- **Error Handling**: Use explicit exception types with descriptive messages.

```python
# Good
def process_image(image_bytes: bytes) -> np.ndarray:
    ...

# Bad
def processImage(imageBytes):
    ...
```

---

## Contribution Guidelines

### Branching

- Use feature branches: `feat/<short-description>`
- Use fix branches: `fix/<short-description>`
- Branch from and target `main`.

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add signature pagination to dashboard
fix: handle empty descriptor array in AKAZE extraction
docs: update developer onboarding environment variables
refactor: extract similarity score logic into helper
```

### Pull Requests

1. Ensure all services start without errors before submitting.
2. Include a clear description of what changed and why.
3. Reference any related issues in the PR description.
4. Keep PRs small and focused — one concern per PR.

### Running Linters

```bash
# Python (worker or agent)
cd worker && uv run ruff check . && uv run black --check .
cd agent  && uv run ruff check . && uv run black --check .

# Auto-fix Python
cd worker && uv run ruff check . --fix && uv run black .
```
