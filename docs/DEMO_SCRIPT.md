# DocuSense AI — 3-Minute Live Demonstration Script (docs/DEMO_SCRIPT.md)

## Objective
Demonstrate an end-to-end intelligent invoice auditing workflow: document upload, structured AI extraction, deterministic financial validation, duplicate detection, human-in-the-loop review, and immutable audit logging.

---

### Step 1: Sign In to Workspace (0:00 - 0:30)
1. Open the DocuSense AI login screen at `http://localhost:5173/login`.
2. Click **"Auto-fill Pre-seeded Demo Credentials"** to load Arjun Mehta's demo account (`demo@docusense.ai` / `DemoPass123!`).
3. Click **"Sign In to Workspace"**.
4. Point out the **Audit Overview**:
   - 4 KPI cards: Total Invoices, Total Spend in INR (₹), Needs Review, and Possible Duplicates.
   - Monthly Spend Trajectory and Categorical Procurement Breakdown.

---

### Step 2: Upload Scenario A — Clean Verified Invoice (0:30 - 1:15)
1. Navigate to **Upload Invoices**.
2. Switch to **Synthetic Benchmark Demo** and select **Sample A: Clean** (or upload `sample-invoices/sample_a_clean.pdf`).
3. Click **"Run Audit Pipeline"**.
4. Observe the real-time stage progression:
   - `Uploading Document` -> `Extracting Invoice Data` -> `Deterministic Validation` -> `Duplicate Ingestion Check` -> `Persisting Audit Records`.
5. Show the result:
   - Status: **Verified** (Green badge).
   - Validation checks: Arithmetic Verified (`Subtotal ₹45,000 - Discount ₹0 + Tax ₹8,100 = Total ₹53,100.00`).
   - Zero blocking findings.

---

### Step 3: Upload Scenario B — Duplicate Candidate Detection (1:15 - 1:55)
1. In **Upload Invoices**, select **Sample B: Duplicate** (or upload `sample-invoices/sample_b_duplicate.pdf`).
2. Click **"Run Audit Pipeline"**.
3. Observe the outcome:
   - Status: **Needs Review** (Amber badge).
   - High-severity finding: **Exact Duplicate Invoice Detected** (`DUPLICATE_CANDIDATE`).
   - Notice the explanation: It detected that an identical invoice (`INV-2026-1042`) from Apex Cloud Solutions for ₹53,100 was already ingested on 2026-09-15.
   - Highlight: The system flags it for review without unilaterally declaring fraud or deleting records.

---

### Step 4: Upload Scenario C — Arithmetic Mismatch & Field Correction (1:55 - 2:40)
1. Select **Sample C: Math Mismatch** (or upload `sample-invoices/sample_c_arithmetic_mismatch.pdf`).
2. Click **"Run Audit Pipeline"**.
3. Inspect the finding:
   - Finding: **Arithmetic Total Mismatch** (`ARITHMETIC_MISMATCH`).
   - Calculated total is ₹29,000.00 (`25,000 - 1,000 + 4,500 + 500`), but the stated total was **₹32,500.00**! Discrepancy of **₹3,500.00**!
4. Navigate to **Review Queue**:
   - Point out the active findings list.
   - Click **"Inspect in All Invoices"** or click into the invoice.
   - Click **"Correct Fields"**.
   - Update Stated Total to `29000` and enter correction reason: `"Corrected stated total to match verified line items and tax."`
   - Click **"Save & Re-validate"**.
   - Notice that the status changes immediately to **Verified**, and an immutable entry is recorded in the **Audit Log**!

---

### Step 5: Insights & Spend Analytics (2:40 - 3:00)
1. Click **Insights** in the sidebar.
2. Show the database-backed aggregates:
   - Top Vendors by Spend (Apex Cloud Solutions, Quantum Logistics).
   - Category spend distribution.
   - Potential Duplicate Payment Exposure calculation.
   - Automated non-binding procurement recommendations.
3. Conclude: DocuSense AI pairs modern AI document extraction with rigorous deterministic arithmetic validation and auditable human oversight.
