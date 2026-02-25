.PHONY: dev-api dev-app dev-worker dev-all install clean

install:
	cd api && bun install
	cd app && bun install
	cd worker && uv sync

dev-api:
	cd api && bun run dev

dev-app:
	cd app && bun run dev

dev-worker:
	cd worker && uv run fastapi dev

dev:
	bunx concurrently -n "API,APP,WORKER" -c "magenta,cyan,green" \
		"make dev-api" \
		"make dev-app" \
		"make dev-worker"

dev-without-worker:
	bunx concurrently -n "API,APP" -c "magenta,cyan" \
		"make dev-api" \
		"make dev-app" a

dev-infra:
	bunx concurrently -n "API,WORKER" -c "cyan,green" \
		"make dev-api" \
		"make dev-worker"
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name "node_modules" -exec rm -rf {} +
	rm -rf worker/.venv
