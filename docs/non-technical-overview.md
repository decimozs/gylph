# Non-Technical Overview

## What Is Medcurial AI Claims Fraud Detection?

**Medcurial AI Claims Fraud Detection** is a software platform that automatically checks whether a medical insurance claim is genuine. It does two things at once:

1. **Checks the signature** on a medical document to confirm it was signed by the right person.
2. **Reads the medical description** in the claim and uses artificial intelligence to spot signs of fraud — such as fake diagnoses, unusual billing language, or inconsistent medical terminology.

Think of it as a smart assistant that flags suspicious claims for human reviewers, so auditors can focus their attention where it matters most.

---

## Business Value

| Benefit | Description |
|---|---|
| **Reduced Fraud Losses** | Automated detection catches fraudulent claims before they are paid out |
| **Faster Claim Processing** | Low-risk claims can be cleared automatically, reducing manual workload |
| **Consistent Auditing** | Every claim is evaluated using the same criteria — no human bias or fatigue |
| **Audit Trail** | Every analysis result is stored with full scores and visuals for compliance and review |
| **Scalable Review** | The platform can process hundreds of claims without adding headcount |

---

## How the System Works — In Plain English

### Step 1: A Claim Arrives

A medical claim form — such as a PhilHealth or insurance reimbursement form — is uploaded into the system. This could be a PDF or a scanned image.

### Step 2: The Document Is Read

The system automatically reads the text on the document, extracts the medical description, and identifies the doctor's signature. No manual data entry is needed.

### Step 3: The Signature Is Checked

The system compares the signature on the claim against the known, verified signature of the doctor or patient on file. It produces a **confidence score** (e.g., "87% match") and a clear verdict:

- ✅ **Authentic** — The signature matches.
- ⚠️ **Needs Review** — The match is borderline; a human should look at it.
- ❌ **Forged** — The signature does not match the reference.

### Step 4: The Medical Description Is Analyzed

An AI reads the medical description written by the doctor. It checks whether:
- The language sounds like it was written by a trained medical professional.
- The diagnosis and treatment make sense together.
- The billing amounts are consistent with the described services.
- There are any red flags suggesting copy-pasted, fabricated, or over-inflated claims.

### Step 5: A Fraud Score Is Produced

The system combines the signature check result and the AI analysis into a single **overall fraud score** and assigns a risk level:

| Risk Level | Meaning |
|---|---|
| 🟢 LOW | The claim appears genuine. Safe to process. |
| 🟡 MEDIUM | Minor concerns detected. Recommend a quick review. |
| 🔴 HIGH | Significant fraud indicators. Escalate for full audit. |

### Step 6: Reviewers Are Notified

High-risk and borderline claims appear on the **Review Dashboard**, where auditors can inspect the full analysis, view the signature comparison, and make a final decision.

---

## Key Workflows

### Workflow 1: Registering a Doctor's Signature

A claims officer uploads a known, verified signature for a doctor or patient. This becomes the "reference" used in all future checks. This only needs to be done once per person.

### Workflow 2: Processing a New Claim

1. Upload the claim document.
2. The system automatically extracts the signature and the medical text.
3. Within seconds, a verification result and fraud score are ready.
4. High-risk claims are flagged and sent to the audit queue.

### Workflow 3: Reviewing a Flagged Claim

1. An auditor opens the flagged claim in the dashboard.
2. They see:
   - A side-by-side signature comparison with a color overlay showing where the signatures match or differ.
   - An AI-generated summary of why the claim was flagged.
   - Specific scores for medical language quality, protocol adherence, and writing consistency.
3. The auditor marks the claim as **Cleared**, **Rejected**, or **Escalated**.

---

## Who Uses This System?

| Role | How They Use It |
|---|---|
| **Claims Processor** | Uploads documents and submits them for analysis |
| **Medical Auditor** | Reviews flagged claims and makes final decisions |
| **Department Manager** | Monitors the overall queue and tracks team workload |
| **System Administrator** | Configures integrations, manages reference signatures, and oversees the platform |

---

## What the System Does Not Do

- It **does not** make final decisions on claims — a human auditor always reviews flagged items.
- It **does not** access or process payment information.
- It **does not** replace doctors or medical professionals in the claims process.
- It **does not** require any special hardware — it runs on standard computers and servers.
