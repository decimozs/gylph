# User Documentation

## Target Users

| User Type | Description |
|---|---|
| **Medical Auditor** | Reviews flagged documents and signature verification results for fraud investigation |
| **Claims Processor** | Submits medical documents for analysis and tracks processing status |
| **Department Manager** | Monitors the kanban board of documents and assigns review tasks |
| **System Administrator** | Manages infrastructure, configures integrations, and registers new reference signatures |

---

## Key Features

| Feature | Description |
|---|---|
| Signature Registration | Upload and store a reference signature with a biometric fingerprint |
| Signature Verification | Compare a submitted signature against a stored reference |
| Document Upload & Analysis | Submit medical claim forms for automated AI fraud analysis |
| Verification Dashboard | Browse all verification results with confidence scores and visual overlays |
| Document Review Board | Kanban-style board to manage document review workflows |
| AI Fraud Scoring | Multi-factor fraud score with medical language, protocol, and linguistic sub-scores |
| Manual Review Flagging | Flag documents and verifications for human follow-up |
| Chatbot Interface | Conversational AI assistant available within the dashboard |

---

## How to Use the System

### Step 1: Register a Reference Signature

1. Navigate to the **Register** page (`/register`).
2. Upload a clear, high-quality image of the signer's handwritten signature.
3. Fill in the signer's name and optional email address.
4. Click **Register**. The system captures and stores the biometric fingerprint.
5. The new signature appears in the **Signatures** list.

---

### Step 2: Verify a Signature

1. Navigate to the **Verify** page (`/verify`).
2. Select the reference signature from the registered list.
3. Upload the live (query) signature image to be verified.
4. Click **Verify**. The Worker processes both images and returns a result within a few seconds.
5. The result displays:
   - **Verdict**: `Authentic`, `Needs Review`, or `Forged`
   - **Confidence Score**: e.g., `87.43%`
   - **Visual Overlay**: Color-coded overlap of the query vs. reference signature

---

### Step 3: Submit a Document for Analysis

1. Navigate to the **Extract** page (`/extract`).
2. Upload the medical claim document (PDF or image format).
3. Select or confirm the associated reference signature.
4. Submit the document. The system:
   - Parses the document via Docling
   - Runs signature verification on extracted signatures
   - Runs the AI agent pipeline for fraud scoring
5. Track the document's status on the **Documents** board.

---

### Step 4: Review Analysis Results

1. Navigate to **Documents** in the dashboard sidebar.
2. Click any document to open its detail view.
3. Review the following sections:
   - **Extracted Text**: The raw text pulled from the document
   - **Fraud Score Summary**: Scores for medical language, protocol adherence, linguistic quality, and severity
   - **Verdict & Suspicion Type**: AI-generated final verdict (e.g., `HIGH RISK — Description Mismatch`)
   - **Signature Verification**: The associated verification result with visuals
   - **Overall Score**: Combined weighted fraud score

---

### Step 5: Manage the Review Workflow

1. Navigate to **Documents** → select the **Review** view or Kanban board.
2. Documents are grouped by status (e.g., `Pending`, `Flagged`, `Reviewed`, `Cleared`).
3. Drag and drop cards to update status, or use the **Actions** menu on each card.
4. Use **Send for Review** to notify the auditing team.
5. Approved or cleared documents can be marked as **Resolved**.

---

### Step 6: Review a Verification

1. Navigate to the **Review** page (`/review/:id`) for a specific verification.
2. View side-by-side normalized signature images.
3. Review the overlap visualization showing where the signatures match (green), diverge (blue), or conflict (red).
4. Use the action buttons to approve, flag, or mark for re-verification.

---

## Screens / Flows Explanation

| Screen / Route | Purpose |
|---|---|
| `/register` | Register a new reference signature |
| `/verify` | Submit and run a live signature verification |
| `/extract` | Upload a document for analysis |
| `/review/:id` | Inspect and action a specific verification result |
| Dashboard `/` | Overview statistics and recent activity |
| `/signatures` | List of all registered reference signatures |
| `/signatures/:id` | Detail view of a signature with its verifications and documents |
| `/verifications` | List of all verification records |
| `/verifications/:id` | Detail view of a specific verification |
| `/documents` | Document list with status and scores |
| `/documents/:id` | Full document analysis detail |
| `/chatbot` | AI chatbot interface for querying the system |

---

## FAQs / Common Issues

### Q: The verification says "Needs Review" — what does that mean?

A confidence score between 0.70 and 0.80 places the result in the `needs-review` zone. This means the system cannot definitively confirm or deny authenticity. A human auditor should visually inspect the overlap visualization and make a final determination.

---

### Q: The Worker API returned a 500 error during verification. What should I check?

- Ensure both the live and reference signature images are valid image files (JPEG, PNG, WEBP).
- Ensure the images are not blank or extremely low resolution (minimum 50×50 pixels recommended).
- Check the Worker service logs via `docker compose logs worker` or `make dev-worker`.

---

### Q: Document analysis is taking very long. Is that normal?

Yes. Docling's OCR and parsing pipeline can take up to 10 minutes for complex multi-page documents. The `DOCLING_SERVE_MAX_SYNC_WAIT` is set to 600 seconds. Monitor progress in the n8n workflow execution view at `http://localhost:5678`.

---

### Q: Can I re-run the analysis on a document?

Currently, re-triggering analysis requires re-uploading the document through the Extract page or manually triggering the n8n workflow with the document's stored URL.

---

### Q: The fingerprint capture returns `[0.0, 0.0, ..., 0.0]`. What went wrong?

This means the image processing found no visible signature pixels. Ensure:
- The signature image has a white or light background with dark ink.
- The image is not entirely blank or has excessive noise.
- The image is in a supported format and is not corrupted.

---

### Q: How is the fraud score calculated?

The overall fraud score is a weighted combination of:
- **Signature Fraud Score** (from biometric verification)
- **Description Fraud Score** (from the AI agent's medical language analysis)

Each sub-score feeds into a final rank (`LOW`, `MEDIUM`, `HIGH`) and a suspicion type classification.
