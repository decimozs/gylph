# Testing Documentation

## Testing Strategy

Medcurial AI Claims Fraud Detection follows a pragmatic testing approach aligned with the maturity of each service:

| Service | Current State | Recommended Coverage |
|---|---|---|
| Main API (`api/`) | No tests yet | Unit tests for route handlers; integration tests against test DB |
| Worker (`worker/`) | No tests yet | Unit tests for `SignatureProcessor` and `SignatureAnalyzer`; integration tests for FastAPI routes |
| Agent (`agent/`) | No tests yet | Unit tests for each agent node function; mock LLM calls |
| Frontend (`app/`) | No tests yet | Component tests with Vitest + Testing Library; E2E with Playwright |

The sections below document the recommended strategy and provide sample test cases ready to implement.

---

## Types of Tests

### Unit Tests

- Test individual functions and classes in isolation.
- Mock all external dependencies (database, LLMs, file I/O).
- Fast to run; should cover all business logic edge cases.

### Integration Tests

- Test multiple components working together (e.g., API route + database).
- Use a real test database (isolated PostgreSQL instance or SQLite in-memory).
- Validate request/response contracts.

### End-to-End (E2E) Tests

- Simulate real user flows in a browser.
- Cover critical paths: register signature → verify → review result.
- Run against a running instance of all services.

---

## Tools Used

| Service | Test Framework | Additional Tools |
|---|---|---|
| Worker / Agent | [pytest](https://pytest.org) | `pytest-asyncio`, `unittest.mock` |
| Main API | [Bun test](https://bun.sh/docs/cli/test) | Built-in Bun test runner |
| Frontend | [Vitest](https://vitest.dev) | `@testing-library/react`, `@testing-library/user-event` |
| E2E | [Playwright](https://playwright.dev) | `@playwright/test` |

---

## How to Run Tests

### Worker (Python — pytest)

```bash
cd worker
uv run pytest                        # Run all tests
uv run pytest tests/ -v              # Verbose output
uv run pytest tests/test_analyzer.py # Run a single test file
uv run pytest -k "test_similarity"   # Run tests matching a name pattern
```

### Agent (Python — pytest)

```bash
cd agent
uv run pytest                        # Run all tests
uv run pytest tests/ -v
```

### Main API (Bun test)

```bash
cd api
bun test                             # Run all tests
bun test --watch                     # Watch mode
bun test src/routes.test.ts          # Run a specific test file
```

### Frontend (Vitest)

```bash
cd app
bun run test                         # Run all tests
bun run test --watch                 # Watch mode
bun run test --coverage              # With coverage report
```

### E2E Tests (Playwright)

```bash
cd app
bun run test:e2e                     # Run all E2E tests
bun run test:e2e --headed            # Run in visible browser
bun run test:e2e --project=chromium  # Run on specific browser
```

> **Note**: E2E tests require all services to be running (`make dev`).

---

## Sample Test Cases

### Worker — `SignatureAnalyzer` Unit Tests

```python
# worker/tests/test_analyzer.py
import numpy as np
import pytest
from app.service.analyzer import SignatureAnalyzer


@pytest.fixture
def analyzer():
    return SignatureAnalyzer()


@pytest.fixture
def blank_image():
    return np.zeros((128, 256), dtype=np.uint8)


@pytest.fixture
def sample_signature():
    """A minimal synthetic signature: a horizontal stroke."""
    img = np.zeros((128, 256), dtype=np.uint8)
    img[60:68, 40:220] = 255
    return img


def test_generate_fingerprint_blank_image_returns_zeros(analyzer, blank_image):
    """A blank image should return a zero-padded fingerprint."""
    fingerprint = analyzer.generate_fingerprint(blank_image)
    assert len(fingerprint) == 128
    assert all(v == 0.0 for v in fingerprint)


def test_generate_fingerprint_has_correct_length(analyzer, sample_signature):
    """Fingerprint must always be exactly 128 floats."""
    fingerprint = analyzer.generate_fingerprint(sample_signature)
    assert len(fingerprint) == 128


def test_generate_fingerprint_values_are_floats(analyzer, sample_signature):
    fingerprint = analyzer.generate_fingerprint(sample_signature)
    assert all(isinstance(v, float) for v in fingerprint)


def test_align_signatures_identical_returns_high_score(analyzer, sample_signature):
    """Aligning a signature against itself should return a high similarity score."""
    _, score = analyzer.align_signatures(sample_signature, sample_signature)
    assert score >= 0.7, f"Expected high similarity, got {score}"


def test_align_signatures_blank_query_returns_zero(analyzer, blank_image, sample_signature):
    """A blank query image aligned against a real signature should return 0.0."""
    _, score = analyzer.align_signatures(blank_image, sample_signature)
    assert score == 0.0


def test_similarity_score_is_clamped(analyzer, sample_signature):
    """Similarity score must always be in [0.0, 1.0]."""
    _, score = analyzer.align_signatures(sample_signature, sample_signature)
    assert 0.0 <= score <= 1.0


def test_get_overlap_viz_returns_correct_shape(analyzer, sample_signature):
    """Overlap visualization should match the shape of the reference image."""
    viz = analyzer.get_overlap_viz(sample_signature, sample_signature, light_mode=True)
    assert viz.shape[:2] == sample_signature.shape[:2]
    assert viz.shape[2] == 3  # RGB output
```

---

### Worker — FastAPI Route Integration Tests

```python
# worker/tests/test_routes.py
import io
import numpy as np
import cv2
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _make_image_bytes(width: int = 256, height: int = 128) -> bytes:
    """Create a minimal valid PNG image in memory."""
    img = np.zeros((height, width), dtype=np.uint8)
    img[50:78, 40:216] = 255  # horizontal stroke
    _, buf = cv2.imencode(".png", img)
    return buf.tobytes()


def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_capture_fingerprint_valid_image():
    image_bytes = _make_image_bytes()
    response = client.post(
        "/signatures/capture-fingerprint",
        files={"file": ("sig.png", io.BytesIO(image_bytes), "image/png")},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert "fingerprint" in data
    assert len(data["fingerprint"]) == 128


def test_capture_fingerprint_invalid_file_type():
    response = client.post(
        "/signatures/capture-fingerprint",
        files={"file": ("doc.pdf", io.BytesIO(b"fake"), "application/pdf")},
    )
    assert response.status_code == 400


def test_verify_identical_signatures_returns_authentic():
    image_bytes = _make_image_bytes()
    response = client.post(
        "/signatures/verify",
        files={
            "file": ("live.png", io.BytesIO(image_bytes), "image/png"),
            "reference_file": ("ref.png", io.BytesIO(image_bytes), "image/png"),
        },
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["is_authentic"] is True
    assert data["status"] == "authentic"
    assert 0.0 <= data["confidence_score"] <= 1.0
```

---

### Main API — Route Unit Tests (Bun)

```typescript
// api/src/routes.test.ts
import { describe, it, expect, mock } from "bun:test";
import app from "./index";

describe("GET /api/v1/", () => {
  it("returns 200 with health text", async () => {
    const res = await app.request("/api/v1/");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("Hello Hono!");
  });
});

describe("GET /api/v1/signatures/:id — not found", () => {
  it("returns 404 when signature does not exist", async () => {
    // Mock the db query to return undefined
    mock.module("./db", () => ({
      db: {
        query: {
          signatures: {
            findFirst: async () => undefined,
          },
        },
      },
    }));

    const res = await app.request("/api/v1/signatures/nonexistent-id");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: "Signature not found" });
  });
});
```

---

### Agent — Node Function Unit Tests

```python
# agent/tests/test_nodes.py
from unittest.mock import MagicMock, patch
from main import formatter_agent_node, fraud_agent_node, AgentState


def _base_state() -> AgentState:
    return AgentState(
        query="Patient: Jane Doe. Diagnosis: Viral rhinitis. Treatment: Antihistamines.",
        formatter_agent_response="",
        fraud_agent_response="",
        ranking_agent_response="",
        auditor_agent_response="",
    )


@patch("main.deepseek_llm")
def test_formatter_agent_node_populates_response(mock_llm):
    mock_llm.invoke.return_value = MagicMock(content="Formatted claim text")
    state = _base_state()
    result = formatter_agent_node(state)
    assert result["formatter_agent_response"] == "Formatted claim text"
    mock_llm.invoke.assert_called_once()


@patch("main.medical_llm")
def test_fraud_agent_node_populates_response(mock_llm):
    mock_llm.invoke.return_value = MagicMock(
        content='{"description_score": 0.85, "assessment": "Authentic medical language"}'
    )
    state = _base_state()
    state["formatter_agent_response"] = "Formatted claim text"
    result = fraud_agent_node(state)
    assert "description_score" in result["fraud_agent_response"]
```
