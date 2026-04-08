# Code Documentation

## Code Structure Overview

Medcurial AI Claims Fraud Detection is organized as a monorepo with four independently runnable services. Each service owns its source code, dependencies, and configuration.

```
gylph/
├── api/        # REST API (TypeScript, Hono.js)
├── app/        # Frontend SPA (TypeScript, React)
├── worker/     # Signature processing service (Python, FastAPI)
└── agent/      # AI fraud detection agent (Python, LangGraph)
```

---

## Key Modules and Responsibilities

### `api/src/index.ts` — HTTP Route Definitions

The entry point for the Main API. Defines all Hono.js route handlers under the `/api/v1` base path. Each handler queries the database via Drizzle ORM and returns JSON responses.

**Responsibilities:**
- Configure CORS for the frontend origin
- Define `GET`/`PUT` route handlers for `signatures`, `verifications`, and `documents`
- Delegate all persistence to Drizzle ORM queries

---

### `api/src/db.ts` — Database Client

Initializes and exports the Drizzle ORM client connected to PostgreSQL via the `DATABASE_URL` environment variable.

---

### `api/src/utils.ts` — Shared Schema Utilities

Exports two reusable constants used across all schema files:

| Export | Type | Description |
|---|---|---|
| `baseSchema` | Object | Shared columns: `id` (TEXT PK), `no` (SERIAL), `createdAt`, `updatedAt` |
| `excludedFields` | Object | Zod `.omit()` helper that removes `id`, `createdAt`, `updatedAt` from insert schemas |

---

### `api/src/schema/` — Database Schema Definitions

Each file defines Drizzle table schemas and their relations:

| File | Tables | Relations |
|---|---|---|
| `signatures.ts` | `signatures`, `signature_logs` | `signatures` → many `verifications`, `documents`, `signature_logs` |
| `verifications.ts` | `verifications` | `verifications` → one `signature`, one `document` |
| `documents.ts` | `documents` | `documents` → one `signature`, one `verification`, one `overall_scores` |
| `overall.ts` | `overall_scores` | `overall_scores` → one `document` |

---

### `worker/app/service/processor.py` — Image Preprocessing Pipeline

Handles raw image bytes and produces clean, normalized signature images ready for analysis.

**Key responsibilities:**
- Decode image bytes into NumPy arrays
- Extract the Region of Interest (ROI) containing the signature stroke
- Apply binarization, denoising, and normalization
- Return a dictionary with: `siamese` (AKAZE-ready), `roi`, `normalized`, `image_preview`
- Convert images to base64 strings for API responses (`_to_base64`)

---

### `worker/app/service/analyzer.py` — Signature Analyzer

Core computer vision logic for signature comparison and fingerprint generation.

**Key responsibilities:**

| Method | Description |
|---|---|
| `extract_features(image)` | Run AKAZE detector to find keypoints and descriptors |
| `_good_matches(des1, des2)` | Apply Lowe's ratio test (0.85) and return top 300 matches |
| `_get_coarse_translation(img, ref)` | Compute a centroid-based translation matrix for coarse alignment |
| `align_signatures(query, ref)` | Full alignment pipeline with RANSAC homography and similarity scoring |
| `get_overlap_viz(img1, img2)` | Produce a color-coded overlap visualization (green/blue/red) |
| `generate_fingerprint(image)` | Extract a 128-float biometric fingerprint from a processed image |

---

### `agent/main.py` — LangGraph Agent Pipeline

Defines the four-node LangGraph state machine for document fraud analysis.

**Agent State:**

```python
class AgentState(TypedDict):
    query: str                       # Raw document text input
    formatter_agent_response: str    # Structured/cleaned text
    fraud_agent_response: str        # Medical language scoring
    ranking_agent_response: str      # Risk level classification
    auditor_agent_response: str      # Final verdict and summary
```

**Node Execution Order:**

```
START → formatter → fraud_detector → ranking → auditor → END
```

| Node | LLM Used | Input | Output |
|---|---|---|---|
| `formatter` | DeepSeek R1 | Raw `query` | Structured claim text |
| `fraud_detector` | Medical-8B | Formatted text | JSON with `description_score` and `assessment` |
| `ranking` | DeepSeek R1 | Fraud response | Risk rank and classification |
| `auditor` | DeepSeek R1 | Ranking response | Final audit verdict and summary |

---

### `app/src/routes/` — Frontend Pages

TanStack Router file-based routing. Each file exports a React component that maps to a URL path.

| Route File | URL | Component Purpose |
|---|---|---|
| `__root.tsx` | `/` (layout) | Root layout with providers and global navigation |
| `_dashboard/index.tsx` | `/` | Dashboard overview |
| `_dashboard/signatures/index.tsx` | `/signatures` | Signature list |
| `_dashboard/signatures/$id/index.tsx` | `/signatures/:id` | Signature detail |
| `_dashboard/verifications/index.tsx` | `/verifications` | Verification list |
| `_dashboard/verifications/$id/index.tsx` | `/verifications/:id` | Verification detail |
| `_dashboard/documents/index.tsx` | `/documents` | Document list / kanban board |
| `_dashboard/documents/$id/index.tsx` | `/documents/:id` | Document analysis detail |
| `_dashboard/chatbot/index.tsx` | `/chatbot` | AI chatbot interface |
| `register/index.tsx` | `/register` | Signature registration flow |
| `verify/index.tsx` | `/verify` | Signature verification flow |
| `extract/index.tsx` | `/extract` | Document upload flow |
| `review/$id/index.tsx` | `/review/:id` | Verification review detail |

---

### `app/src/api/` — HTTP Client Functions

Thin wrappers around `fetch` that handle request construction and response parsing.

| File | Functions |
|---|---|
| `signature-api.ts` | `getSignatures()`, `getSignatureById(id)` |
| `verification-api.ts` | `getVerifications()`, `getVerificationById(id)`, `updateVerification(id, body)` |
| `document-api.ts` | `getDocuments()`, `getDocumentById(id)` |

---

## Naming Conventions

### TypeScript

| Construct | Convention | Example |
|---|---|---|
| Variables | `camelCase` | `similarityScore`, `queryImageUrl` |
| Functions | `camelCase` | `getSignatures`, `handleSubmit` |
| React Components | `PascalCase` | `VerificationBadge`, `DocumentKanbanBoard` |
| Types / Interfaces | `PascalCase` | `InsertVerification`, `UpdateVerification` |
| Constants (module-level) | `SCREAMING_SNAKE_CASE` | `BASE_URL`, `MAX_RETRIES` |
| Files | `kebab-case` | `signature-api.ts`, `verification-badge.tsx` |
| Database columns | `snake_case` (Drizzle) | `image_url`, `created_at` |
| TypeScript properties | `camelCase` | `imageUrl`, `createdAt` |

### Python

| Construct | Convention | Example |
|---|---|---|
| Variables | `snake_case` | `similarity_score`, `image_bytes` |
| Functions | `snake_case` | `align_signatures`, `generate_fingerprint` |
| Classes | `PascalCase` | `SignatureAnalyzer`, `SignatureProcessor` |
| Constants | `SCREAMING_SNAKE_CASE` | `HF_TOKEN`, `MEDICAL_MODEL` |
| Files | `snake_case` | `analyzer.py`, `prompt_loader.py` |

---

## Example Code Snippets

### 1. Adding a New API Endpoint (Hono.js)

```typescript
// api/src/index.ts — chained route pattern
const app = new Hono({ strict: false })
  .basePath("/api/v1")
  // ... existing routes ...
  .get("/overall-scores", async (c) => {
    const data = await db.query.overallScores.findMany({
      orderBy: (score, { desc }) => [desc(score.createdAt)],
    });
    return c.json(data);
  });
```

Key rules:
- Chain routes directly on the `app` object.
- Always `await` Drizzle queries.
- Return `c.json(data)` for success and `c.json({ error: "..." }, statusCode)` for errors.

---

### 2. Defining a New Drizzle Schema Table

```typescript
// api/src/schema/example.ts
import { pgTable, text, doublePrecision } from "drizzle-orm/pg-core";
import { baseSchema } from "@/utils";

export const exampleTable = pgTable("example_table", {
  ...baseSchema,                              // Always spread baseSchema first
  label: text("label").notNull(),
  score: doublePrecision("score").notNull(),
});
```

---

### 3. Running the AI Agent Pipeline (LangGraph)

```python
# agent/main.py
from main import agent, AgentState

state = AgentState(
    query="HEALTH CLAIM FORM\nPatient: John Doe\nDiagnosis: ...",
    formatter_agent_response="",
    fraud_agent_response="",
    ranking_agent_response="",
    auditor_agent_response="",
)

# Stream updates node by node
for chunk in agent.stream(state, stream_mode="updates"):
    node_name, update = next(iter(chunk.items()))
    print(f"[{node_name}]: {update}")
```

---

### 4. Scoring Two Signatures (Worker)

```python
from app.service.processor import SignatureProcessor
from app.service.analyzer import SignatureAnalyzer

# Load image bytes
with open("live_sig.png", "rb") as f:
    live_bytes = f.read()
with open("ref_sig.png", "rb") as f:
    ref_bytes = f.read()

# Process both images
live_data = SignatureProcessor(live_bytes).process()
ref_data  = SignatureProcessor(ref_bytes).process()

# Align and score
analyzer = SignatureAnalyzer()
aligned, score = analyzer.align_signatures(
    query_img=live_data["siamese"],
    ref_img=ref_data["siamese"]
)

print(f"Similarity Score: {score:.4f}")
print(f"Verdict: {'authentic' if score >= 0.80 else 'needs-review' if score >= 0.70 else 'forged'}")
```

---

### 5. Similarity Score Formula

The final similarity score is computed as a weighted combination of three signals:

```python
# From worker/app/service/analyzer.py
overlap_score = np.sum(intersection > 0) / max(np.sum(dil_ref > 0), 1)   # pixel overlap
shape_score   = ssim(aligned_img, ref_img, data_range=255)                 # structural similarity
feature_score = min((len(good) / 40.0), 1.0)                               # AKAZE match quality

final_score = (overlap_score * 0.5) + (shape_score * 0.3) + (feature_score * 0.2)
final_score += 0.15                          # base confidence boost
final_score *= 1.05 if is_stable else 0.95  # stability adjustment
final_score = float(np.clip(final_score, 0.0, 1.0))
```

| Signal | Weight | Description |
|---|---|---|
| Pixel Overlap | 50% | Ratio of overlapping ink pixels after alignment |
| Structural Similarity (SSIM) | 30% | Perceptual shape and texture similarity |
| Feature Match Quality | 20% | Ratio of good AKAZE keypoint matches (capped at 40) |
| Base Boost | +0.15 | Constant added before clamping |
| Stability Multiplier | ×1.05 / ×0.95 | Applied based on RANSAC homography stability |
