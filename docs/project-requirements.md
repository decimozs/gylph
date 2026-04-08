# Project Requirements

## Project Overview

**Medcurial AI Claims Fraud Detection** is an intelligent medical document fraud detection and signature verification platform. It combines Siamese Neural Network (SNN)-based signature analysis with a multi-agent AI pipeline to detect fraudulent medical claims and forged signatures. The system processes uploaded documents, extracts and verifies signatures using computer vision, and scores medical claim documents for authenticity using large language models (LLMs).

---

## Objectives

- Provide a reliable, automated mechanism for verifying the authenticity of handwritten signatures on medical documents.
- Detect potential fraud in medical claim forms through linguistic and semantic analysis powered by AI agents.
- Present a unified dashboard for reviewing, managing, and auditing verification results.
- Enable downstream workflow automation through integration with orchestration tools.

---

## Scope

### In-Scope

| Area | Description |
|---|---|
| Signature Capture | Upload a signature image and generate a biometric fingerprint |
| Signature Verification | Compare a query signature against a stored reference signature |
| Document Upload & Analysis | Upload medical documents for automated fraud analysis |
| AI Agent Pipeline | Multi-stage LLM pipeline for fraud scoring and auditing |
| Dashboard UI | View and manage signatures, verifications, and documents |
| REST API | Programmatic access to all platform resources |
| Infrastructure | Docker Compose-based local deployment with PostgreSQL, n8n, Qdrant, Ollama |

### Out-of-Scope

| Area | Notes |
|---|---|
| Authentication & Authorization | No user login or role-based access control in current scope |
| Mobile Application | Web-only; no native iOS/Android app |
| Real-time Streaming | Agent responses are batch; streaming UI is not implemented |
| Multi-tenancy | Single-tenant deployment only |
| Payment Processing | Not applicable |

---

## Functional Requirements

### Signature Management

- **FR-01** — Users can register a reference signature by uploading an image.
- **FR-02** — The system generates a 128-dimension biometric fingerprint for each registered signature.
- **FR-03** — Users can view all registered signatures and their associated verifications and documents.

### Signature Verification

- **FR-04** — Users can upload a live (query) signature image for comparison against a registered reference.
- **FR-05** — The system returns an authenticity verdict (`authentic`, `needs-review`, `forged`) with a confidence percentage.
- **FR-06** — Overlapping visualizations of the query and reference signatures are generated for manual review.

### Document Analysis

- **FR-07** — Users can upload a medical claim document (image or PDF) for analysis.
- **FR-08** — The system extracts text, signatures, and structured data from the document.
- **FR-09** — The AI agent pipeline evaluates the document and assigns fraud-risk scores.
- **FR-10** — Users can view analysis summaries, scores, and flags in the dashboard.

### AI Agent Pipeline

- **FR-11** — The Formatter Agent normalizes and structures raw document text.
- **FR-12** — The Fraud Detector Agent scores claims based on non-medical jargon and suspicious language patterns.
- **FR-13** — The Ranking Agent classifies the document risk level.
- **FR-14** — The Auditor Agent produces a final audit summary with a verdict and suspicion type.

### Dashboard

- **FR-15** — Users can view paginated lists of signatures, verifications, and documents.
- **FR-16** — Users can view detailed records with associated scores and visual outputs.
- **FR-17** — Users can update verification status and trigger reviews.

---

## Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | Signature verification response time < 5 seconds under normal load |
| NFR-02 | Accuracy | Similarity scoring should achieve > 85% precision on genuine/forged discrimination |
| NFR-03 | Scalability | Worker service must be horizontally scalable via container orchestration |
| NFR-04 | Availability | Core API and worker services must target 99.5% uptime in production |
| NFR-05 | Security | All API traffic must be served over HTTPS in production |
| NFR-06 | Maintainability | All services must be containerized and configurable via environment variables |
| NFR-07 | Portability | The system must run on any machine with Docker and Docker Compose installed |
| NFR-08 | Observability | Logs and error states must be surfaced per service |

---

## Assumptions and Constraints

### Assumptions

- All uploaded signature images are in a standard image format (PNG, JPEG, WEBP).
- Medical documents contain legible text and a handwritten signature.
- The reference signature used for verification is a clean, isolated image of the signer's hand.
- External LLM APIs (via HuggingFace-compatible endpoints) are available and accessible.
- PostgreSQL is the only supported relational database.

### Constraints

- The worker service requires OpenCV and scikit-image, meaning it needs a Python 3.12+ environment.
- LLM inference for the agent pipeline requires valid `HF_TOKEN` and `HF_BASE_URL` environment variables.
- Document processing via Docling may take up to 10 minutes for large files (`DOCLING_SERVE_MAX_SYNC_WAIT=600`).
- The CORS configuration in the API is currently locked to `http://localhost:5173` for development.
